

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { HAS_SUPABASE, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";

/**
 * Returns a Supabase client if env vars exist; otherwise null.
 * We use anon key for read-only public tables.
 */
export function getSupabase(): SupabaseClient | null {
  if (!HAS_SUPABASE) return null;
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}