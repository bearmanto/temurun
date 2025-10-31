import Link from "next/link";
import { revalidatePath } from "next/cache";
import { getSupabase } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/supabase/admin";

export const metadata = {
  title: "Admin — Settings",
};

export default async function AdminSettingsPage() {
  // Read current WA number (if Supabase is configured)
  let current = "";
  const sb = getSupabase();
  if (sb) {
    const { data } = await sb.from("settings").select("value").eq("key", "wa_number").maybeSingle();
    current = data?.value ?? "";
  }

  async function saveSettings(formData: FormData) {
    "use server";
    const admin = getAdminSupabase();
    if (!admin) return;

    const wa = String(formData.get("wa_number") || "").trim();

    await admin
      .from("settings")
      .upsert(
        { key: "wa_number", value: wa, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );

    revalidatePath("/admin/settings");
  }

  return (
    <section className="space-y-4">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <Link href="/admin" className="text-sm underline">
          Back to Admin
        </Link>
      </header>

      <form action={saveSettings} className="space-y-3 max-w-lg rounded border bg-card p-4">
        <div>
          <label className="block text-sm font-medium">WhatsApp business number</label>
          <input
            type="tel"
            name="wa_number"
            defaultValue={current}
            placeholder="+6281111111"
            className="mt-1 w-full rounded border px-3 py-2"
          />
          <p className="mt-1 text-xs text-neutral-600">
            Example: +6281111111. We’ll use this for the “Confirm via WhatsApp” link.
          </p>
        </div>

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
