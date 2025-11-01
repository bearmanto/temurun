import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = process.env.ADMIN_SESSION_COOKIE || "temurun_admin";
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "";

function toBase64Url(input: ArrayBuffer) {
  const bytes = new Uint8Array(input);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function fromBase64UrlToUint8(data: string) {
  const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4 ? 4 - (base64.length % 4) : 0;
  const padded = base64 + "=".repeat(pad);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

let keyPromise: Promise<CryptoKey> | null = null;
function getKey() {
  if (!keyPromise) {
    keyPromise = crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(SESSION_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );
  }
  return keyPromise;
}

async function verifyCookie(value: string | undefined) {
  if (!value || !SESSION_SECRET) return false;
  const [body, sig] = value.split(".");
  if (!body || !sig) return false;

  const key = await getKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(body)
  );
  const expected = toBase64Url(signature);
  if (expected !== sig) return false;

  try {
    const payloadBytes = fromBase64UrlToUint8(body);
    const json = JSON.parse(new TextDecoder().decode(payloadBytes));
    if (json?.sub !== "admin") return false;
    const now = Math.floor(Date.now() / 1000);
    if (!json?.exp || now >= Number(json.exp)) return false;
    return true;
  } catch {
    return false;
  }
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow the sign-in page without a session and proactively clear any lingering cookie
  if (pathname === "/admin/sign-in") {
    const res = NextResponse.next();
    res.cookies.set({
      name: COOKIE_NAME,
      value: "",
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV !== "development",
      maxAge: 0,
      expires: new Date(0),
    });
    return res;
  }

  // Guard everything else under /admin/**
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  const ok = await verifyCookie(cookie);

  if (!ok) {
    const url = new URL("/admin/sign-in", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};