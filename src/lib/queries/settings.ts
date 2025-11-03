import { unstable_noStore as noStore } from "next/cache";
import { getSupabase } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { WA_NUMBER } from "@/lib/env";

/**
 * Read settings from DB supporting two schemas:
 *  A) Key/Value table:   settings(key text primary key, value text, updated_at timestamptz)
 *  B) Single-row table:  settings(id text pk, whatsapp_number text, hero_title text, ...)
 */
async function readSettingsAsMap(): Promise<Record<string, string>> {
  noStore();
  const sb = getAdminSupabase() || getSupabase();
  const map: Record<string, string> = {};
  if (!sb) return map;

  // Try key/value first
  try {
    const { data, error } = await sb.from("settings").select("key, value");
    if (
      !error &&
      Array.isArray(data) &&
      data.length &&
      Object.prototype.hasOwnProperty.call(data[0] || {}, "key")
    ) {
      for (const row of data) {
        if (row?.key != null) map[String((row as any).key)] = String((row as any).value ?? "");
      }
      return map;
    }
  } catch {
    // ignore and try single-row shape
  }

  // Fallback: single-row shape
  try {
    const { data: row } = await sb.from("settings").select("*").limit(1).maybeSingle();
    if (row && typeof row === "object") {
      const r: Record<string, any> = row as any;
      // Normalize to a common key set used by callers
      map["wa_number"] = String(r.wa_number ?? r.whatsapp_number ?? r.phone ?? "");
      map["hero_title"] = String(r.hero_title ?? r.title ?? "");
      map["hero_subtitle"] = String(r.hero_subtitle ?? r.subtitle ?? "");
      map["usp_fresh_text"] = String(r.usp_fresh_text ?? r.usp_1 ?? "");
      map["usp_delivery_text"] = String(r.usp_delivery_text ?? r.usp_2 ?? "");
      map["usp_whatsapp_text"] = String(r.usp_whatsapp_text ?? r.usp_3 ?? "");
      map["usp_preorder_text"] = String(r.usp_preorder_text ?? r.usp_4 ?? "");
    }
  } catch {
    // ignore
  }

  return map;
}

export async function getSetting(key: string): Promise<string | null> {
  const m = await readSettingsAsMap();
  return (m[key] ?? null) as string | null;
}

/** Get WhatsApp business number: DB setting first, then env fallback, then default. */
export async function getWaNumber(): Promise<string> {
  const fromDb = await getSetting("wa_number");
  if (fromDb && fromDb.trim()) return fromDb.trim();
  return WA_NUMBER || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+6281111111";
}

/** Get hero copy (title + subtitle) with defaults. */
export async function getHeroCopy(): Promise<{ title: string; subtitle: string }> {
  const m = await readSettingsAsMap();
  return {
    title: (m["hero_title"] || "Baked fresh. Boldly simple.").trim(),
    subtitle:
      (m["hero_subtitle"] ||
        "Small-batch, made-to-order bakes. Choose your favorites, pick a date, and confirm in one tap via WhatsApp.").trim(),
  };
}

/** Get USP texts (4 lines) with sane defaults. */
export async function getUspTexts(): Promise<{
  fresh: string;
  delivery: string;
  whatsapp: string;
  preorder: string;
}> {
  const m = await readSettingsAsMap();
  return {
    fresh: (m["usp_fresh_text"] || "Made to order, never shelf‑worn.").trim(),
    delivery: (m["usp_delivery_text"] || "Straight to your door.").trim(),
    whatsapp: (m["usp_whatsapp_text"] || "Order via WhatsApp.").trim(),
    preorder: (m["usp_preorder_text"] || "Choose your date (14 days).").trim(),
  };
}
