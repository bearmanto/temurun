"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const COOKIE_NAME = "temurun_admin";
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours
const IS_PROD = process.env.NODE_ENV === "production";

export async function signIn(formData: FormData) {
  const passcode = String(formData.get("passcode") || "").trim();

  // 1) Rate limit: 5 attempts / 10 minutes per IP (OWASP login throttling)
  const ip = await getClientIp();
  const { allowed, retryAfterSeconds } = await checkRateLimit({
    action: "admin_signin",
    ip,
    limit: 5,
    windowSeconds: 10 * 60,
  });
  if (!allowed) {
    const secs = retryAfterSeconds ?? 10 * 60;
    const msg = `Too many attempts. Please try again in ~${Math.ceil(secs / 60)} minute(s).`;
    // include both legacy (?err=) and new (?error=1&msg=) params for compatibility and add retry ETA
    redirect(`/admin/sign-in?error=1&msg=${encodeURIComponent(msg)}&err=${encodeURIComponent(msg)}&retry=${secs}`);
  }

  // 2) Validate passcode against env (server-only)
  const expected = (process.env.ADMIN_PASSCODE || "").trim();
  if (!expected || passcode !== expected) {
    const msg = "Invalid passcode";
    redirect(`/admin/sign-in?error=1&msg=${encodeURIComponent(msg)}&err=${encodeURIComponent(msg)}`);
  }

  // 3) Set hardened cookie — use Secure only in production; use root path for reliable clear
  const jar = await cookies();
  jar.set(COOKIE_NAME, "1", {
    httpOnly: true,
    secure: IS_PROD, // browsers drop Secure cookies on plain HTTP (LAN IP). OK to omit in dev.
    sameSite: "strict",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });

  redirect("/admin");
}

export async function signOut() {
  // Clear cookie — remove any variants and expire by path
  const jar = await cookies();
  try { jar.delete(COOKIE_NAME); } catch {}
  jar.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
  jar.set(COOKIE_NAME, "", { path: "/admin", maxAge: 0 });
  redirect("/admin/sign-in");
}
