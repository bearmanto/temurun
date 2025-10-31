import Link from "next/link";
import { revalidatePath } from "next/cache";
import { listProducts } from "@/lib/queries/products";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { formatIDR } from "@/lib/types";

export const metadata = {
  title: "Admin — Products",
};

async function toggleIsNew(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  const next = String(formData.get("next") || "").toLowerCase() === "true";
  if (!id) return;

  const sb = getAdminSupabase();
  if (!sb) return;

  await sb.from("products").update({ is_new: next }).eq("id", id);
  revalidatePath("/admin/products");
}

async function updatePrice(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  const raw = String(formData.get("price") || "").trim();
  if (!id || !raw) return;

  // Parse as integer IDR
  const parsed = parseInt(raw.replace(/[^\d]/g, ""), 10);
  const price = Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;

  const sb = getAdminSupabase();
  if (!sb) return;

  await sb.from("products").update({ price }).eq("id", id);
  revalidatePath("/admin/products");
}

export default async function AdminProductsPage() {
  const products = await listProducts();

  return (
    <section className="space-y-4">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Link href="/admin" className="text-sm underline">Back to Admin</Link>
      </header>

      {products.length === 0 ? (
        <p className="text-neutral-600">No products found.</p>
      ) : (
        <div className="overflow-x-auto rounded border">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-700">
              <tr>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Slug</th>
                <th className="px-3 py-2 text-right">Price</th>
                <th className="px-3 py-2 text-left">Badge</th>
                <th className="px-3 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const next = !p.is_new;
                return (
                  <tr key={p.id} className="border-t">
                    <td className="px-3 py-2">{p.name}</td>
                    <td className="px-3 py-2">{p.slug}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="inline-flex items-center gap-2">
                        <span className="whitespace-nowrap">{formatIDR(p.price)}</span>
                        <form action={updatePrice} className="inline-flex items-center gap-1">
                          <input type="hidden" name="id" value={p.id} />
                          <input
                            type="number"
                            name="price"
                            min={0}
                            step={1000}
                            defaultValue={p.price}
                            className="w-28 rounded border px-2 py-1 text-right"
                            aria-label={`Set price for ${p.name}`}
                          />
                          <button
                            type="submit"
                            className="rounded border px-2 py-1 text-xs hover:text-brand"
                            aria-label={`Save price for ${p.name}`}
                            title="Save"
                          >
                            Save
                          </button>
                        </form>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {p.is_new ? (
                        <span className="inline-block rounded-full bg-brand/90 px-2 py-0.5 text-xs text-white">New</span>
                      ) : (
                        <span className="text-xs text-neutral-500">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <form action={toggleIsNew}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="next" value={String(next)} />
                        <button
                          type="submit"
                          className="rounded border border-brand px-3 py-1 text-xs text-brand hover:bg-brand hover:text-white"
                        >
                          {p.is_new ? "Remove New badge" : "Mark as New"}
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
