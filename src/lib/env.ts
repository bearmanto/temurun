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

export const SUPABASE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "product-images";