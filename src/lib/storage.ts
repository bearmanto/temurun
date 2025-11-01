import { getSupabase } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/supabase/admin";
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

/** Upload a File to Supabase Storage. Returns the storage key on success. */
export async function uploadProductImage(productId: string, file: File): Promise<string> {
  const sb = getAdminSupabase();
  if (!sb) throw new Error("Supabase admin client unavailable");
  if (!SUPABASE_BUCKET) throw new Error("SUPABASE_BUCKET not configured");

  const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
  const key = `products/${productId}/${Date.now()}-${safeName}`;

  const { error } = await sb.storage
    .from(SUPABASE_BUCKET)
    .upload(key, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: (file as any).type || "application/octet-stream",
    });
  if (error) throw error;
  return key;
}

/** Delete an object from Supabase Storage. */
export async function deleteStorageObject(key: string): Promise<boolean> {
  const sb = getAdminSupabase();
  if (!sb) throw new Error("Supabase admin client unavailable");
  if (!SUPABASE_BUCKET) return false;

  const { error } = await sb.storage.from(SUPABASE_BUCKET).remove([key]);
  if (error) return false;
  return true;
}
