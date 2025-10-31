import { getSupabase } from "@/lib/supabase/server";
import { WA_NUMBER } from "@/lib/env";

/** Get a single setting value by key (null if not configured or on error). */
export async function getSetting(key: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const { data, error } = await sb
    .from("settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (error || !data) return null;
  return String(data.value);
}

/** Get WhatsApp business number: DB setting first, then env fallback, then default. */
export async function getWaNumber(): Promise<string> {
  const fromDb = await getSetting("wa_number");
  if (fromDb && fromDb.trim()) return fromDb.trim();
  return WA_NUMBER || "+6281111111";
}
