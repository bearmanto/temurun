import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabase } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/supabase/admin";

export const metadata = { title: "Admin — Settings" };

export default async function AdminSettingsPage() {
  const sb = getAdminSupabase() || getSupabase();

  // Detect schema & load current values into a flat map
  const current: Record<string, string> = {};

  if (sb) {
    // Try KV first
    const kv = await sb.from("settings").select("key, value");
    if (
      !kv.error &&
      Array.isArray(kv.data) &&
      kv.data.length &&
      Object.prototype.hasOwnProperty.call(kv.data[0] || {}, "key")
    ) {
      for (const r of kv.data) current[String((r as any).key)] = String((r as any).value ?? "");
    } else {
      // Fallback: single row
      const one = await sb.from("settings").select("*").limit(1).maybeSingle();
      if (!one.error && one.data && typeof one.data === "object") {
        const r: Record<string, any> = one.data as any;
        current["wa_number"] = String(r.wa_number ?? r.whatsapp_number ?? r.phone ?? "");
        current["hero_title"] = String(r.hero_title ?? r.title ?? "");
        current["hero_subtitle"] = String(r.hero_subtitle ?? r.subtitle ?? "");
        current["usp_fresh_text"] = String(r.usp_fresh_text ?? r.usp_1 ?? "");
        current["usp_delivery_text"] = String(r.usp_delivery_text ?? r.usp_2 ?? "");
        current["usp_whatsapp_text"] = String(r.usp_whatsapp_text ?? r.usp_3 ?? "");
        current["usp_preorder_text"] = String(r.usp_preorder_text ?? r.usp_4 ?? "");
      }
    }
  }

  async function saveSettings(formData: FormData) {
    "use server";
    const admin = getAdminSupabase();
    if (!admin) return;

    const values = {
      wa_number: String(formData.get("wa_number") || "").trim(),
      hero_title: String(formData.get("hero_title") || "").trim(),
      hero_subtitle: String(formData.get("hero_subtitle") || "").trim(),
      usp_fresh_text: String(formData.get("usp_fresh_text") || "").trim(),
      usp_delivery_text: String(formData.get("usp_delivery_text") || "").trim(),
      usp_whatsapp_text: String(formData.get("usp_whatsapp_text") || "").trim(),
      usp_preorder_text: String(formData.get("usp_preorder_text") || "").trim(),
    };

    // Attempt KV upsert first
    const kvRows = Object.entries(values).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString(),
    }));
    const kvAttempt = await admin.from("settings").upsert(kvRows as any, { onConflict: "key" });

    if (kvAttempt.error) {
      // Fallback: single-row update — only set columns that actually exist
      const one = await admin.from("settings").select("*").limit(1).maybeSingle();
      const cols = one.data ? Object.keys(one.data as any) : [];
      const update: Record<string, any> = {};

      if (cols.includes("id")) update.id = (one.data as any)?.id || "core";

      if (cols.includes("whatsapp_number")) update.whatsapp_number = values.wa_number;
      if (cols.includes("wa_number")) update.wa_number = values.wa_number;
      if (cols.includes("phone")) update.phone = values.wa_number;

      if (cols.includes("hero_title")) update.hero_title = values.hero_title;
      if (cols.includes("title")) update.title = values.hero_title;
      if (cols.includes("hero_subtitle")) update.hero_subtitle = values.hero_subtitle;
      if (cols.includes("subtitle")) update.subtitle = values.hero_subtitle;

      if (cols.includes("usp_fresh_text")) update.usp_fresh_text = values.usp_fresh_text;
      if (cols.includes("usp_1")) update.usp_1 = values.usp_fresh_text;
      if (cols.includes("usp_delivery_text")) update.usp_delivery_text = values.usp_delivery_text;
      if (cols.includes("usp_2")) update.usp_2 = values.usp_delivery_text;
      if (cols.includes("usp_whatsapp_text")) update.usp_whatsapp_text = values.usp_whatsapp_text;
      if (cols.includes("usp_3")) update.usp_3 = values.usp_whatsapp_text;
      if (cols.includes("usp_preorder_text")) update.usp_preorder_text = values.usp_preorder_text;
      if (cols.includes("usp_4")) update.usp_4 = values.usp_preorder_text;

      if (Object.keys(update).length > 0) {
        await admin.from("settings").upsert(update as any);
      }
    }

    revalidatePath("/");
    revalidatePath("/admin/settings");
    redirect("/admin/settings?saved=1");
  }

  return (
    <section className="space-y-6">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <Link href="/admin" className="text-sm underline">Back to Admin</Link>
      </header>

      <form action={saveSettings} className="space-y-6 max-w-xl rounded border bg-card p-4">
        {/* WhatsApp */}
        <div className="space-y-1">
          <label className="block text-sm font-medium">WhatsApp business number</label>
          <input
            type="tel"
            name="wa_number"
            defaultValue={current.wa_number || ""}
            placeholder="+6281111111"
            className="mt-1 w-full rounded border px-3 py-2"
          />
          <p className="mt-1 text-xs text-neutral-600">
            Example: +6281111111. Used for the “Confirm via WhatsApp” link after checkout.
          </p>
        </div>

        {/* Hero copy */}
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Hero copy</legend>
          <div>
            <label className="block text-sm">Title</label>
            <input
              type="text"
              name="hero_title"
              defaultValue={current.hero_title || ""}
              placeholder="Baked fresh. Boldly simple."
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm">Subtitle</label>
            <textarea
              name="hero_subtitle"
              defaultValue={current.hero_subtitle || ""}
              placeholder="Small-batch, made-to-order bakes…"
              className="mt-1 w-full rounded border px-3 py-2"
              rows={3}
            />
          </div>
        </fieldset>

        {/* USP texts */}
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">USP texts</legend>
          <div>
            <label className="block text-sm">Fresh</label>
            <input
              type="text"
              name="usp_fresh_text"
              defaultValue={current.usp_fresh_text || ""}
              placeholder="Made to order, never shelf‑worn."
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm">Delivery</label>
            <input
              type="text"
              name="usp_delivery_text"
              defaultValue={current.usp_delivery_text || ""}
              placeholder="Straight to your door."
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm">WhatsApp</label>
            <input
              type="text"
              name="usp_whatsapp_text"
              defaultValue={current.usp_whatsapp_text || ""}
              placeholder="Order via WhatsApp."
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm">Pre‑order window</label>
            <input
              type="text"
              name="usp_preorder_text"
              defaultValue={current.usp_preorder_text || ""}
              placeholder="Choose your date (14 days)."
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>
        </fieldset>

        <button
          type="submit"
          className="inline-flex items-center rounded border border-brand px-3 py-1 text-sm text-brand hover:bg-brand hover:text-white"
        >
          Save
        </button>
      </form>
    </section>
  );
}
