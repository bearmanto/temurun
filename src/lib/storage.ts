import { getSupabase } from "@/lib/supabase/server";
import { SUPABASE_BUCKET } from "@/lib/env";

function isHttpUrl(input: string) {
  return /^https?:\/\//i.test(input);
}

/**
 * Resolve a storage key (e.g. "breads/sourdough.jpg") to a public URL.
 * - If input is already an http(s) URL, returns it unchanged.
 * - If no Supabase or bucket is configured, returns the input.
 */
export function resolveStorageUrl(input?: string | null): string | undefined {
  if (!input) return undefined;
  const key = String(input).trim();
  if (!key) return undefined;
  if (isHttpUrl(key)) return key;

  const sb = getSupabase();
  if (!sb || !SUPABASE_BUCKET) return key;

  const { data } = sb.storage.from(SUPABASE_BUCKET).getPublicUrl(key);
  return data?.publicUrl || key;
}
