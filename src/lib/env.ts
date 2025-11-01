/**
 * Centralized env access with safe fallbacks.
 * We only read the public Supabase vars for read-only client (server-side).
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const HAS_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER || "+6281111111";

export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
export const HAS_SERVICE_ROLE = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

export const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "product-images";
// Admin auth (passcode gate)
export const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "";
export const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "";
export const ADMIN_SESSION_COOKIE = process.env.ADMIN_SESSION_COOKIE || "temurun_admin";
export const ADMIN_SESSION_MAX_AGE = Number(process.env.ADMIN_SESSION_MAX_AGE || 60 * 60 * 24 * 14); // 14 days