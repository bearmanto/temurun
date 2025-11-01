


import { cookies } from "next/headers";
import crypto from "crypto";
import {
  ADMIN_PASSCODE,
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  ADMIN_SESSION_SECRET,
} from "@/lib/env";

function b64url(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function sign(data: string) {
  const h = crypto.createHmac("sha256", ADMIN_SESSION_SECRET);
  h.update(data);
  // Node 18 supports base64url, but we normalise for safety
  return b64url(h.digest());
}

export function verifyPasscode(input: string): boolean {
  if (!ADMIN_PASSCODE) return false;
  try {
    const a = Buffer.from(String(input));
    const b = Buffer.from(String(ADMIN_PASSCODE));
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function createSessionValue(): string {
  const now = Math.floor(Date.now() / 1000);
  const payload = { sub: "admin", iat: now, exp: now + ADMIN_SESSION_MAX_AGE };
  const body = b64url(JSON.stringify(payload));
  const sig = sign(body);
  return `${body}.${sig}`;
}

export async function setAdminSession() {
  const value = createSessionValue();
  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV !== "development",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV !== "development",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}

export function verifyAdminSessionCookie(cookieValue: string | undefined): boolean {
  if (!cookieValue) return false;
  const [body, sig] = String(cookieValue).split(".");
  if (!body || !sig) return false;
  const expected = sign(body);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    if (!crypto.timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }
  // check exp
  try {
    const json = JSON.parse(Buffer.from(body.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
    if (!json?.exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return now < Number(json.exp);
  } catch {
    return false;
  }
}