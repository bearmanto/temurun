import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import ImageUploader from "@/app/admin/components/ImageUploader";
import ImageListClient from "@/app/admin/components/ImageListClient";
import { getSupabase } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { deleteStorageObject, resolveStorageUrl, uploadProductImage } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function actionUpload(formData: FormData) {
  "use server";
  const productId = String(formData.get("product_id") || "").trim();
  if (!productId) return;

  const files = formData.getAll("files").filter(Boolean) as File[];
  if (!files.length) return;

  const sb = getAdminSupabase();
  // Get current max sort to append new images at the end
  const { data: existing } = await sb
    .from("product_images")
    .select("id, sort")
    .eq("product_id", productId)
    .order("sort", { ascending: true });
  const start = existing?.length ? existing.length : 0;

  let index = 0;
  for (const file of files) {
    const key = await uploadProductImage(productId, file);
    await sb.from("product_images").insert({ product_id: productId, url: key, sort: start + index });
    index++;
  }

  revalidatePath(`/admin/products/${productId}/images`);
  revalidatePath(`/admin/products`);
}

async function actionDelete(formData: FormData) {
  "use server";
  const productId = String(formData.get("product_id") || "").trim();
  const imageId = String(formData.get("image_id") || "").trim();
  const key = String(formData.get("key") || "").trim();
  if (!productId || !imageId) return;

  const sb = getAdminSupabase();
  if (key) {
    try { await deleteStorageObject(key); } catch {}
  }
  await sb.from("product_images").delete().eq("id", imageId);
  revalidatePath(`/admin/products/${productId}/images`);
  revalidatePath(`/admin/products`);
}

async function actionReorder(formData: FormData) {
  "use server";
  const productId = String(formData.get("product_id") || "").trim();
  const imageId = String(formData.get("image_id") || "").trim();
  const dir = String(formData.get("dir") || "").trim();
  if (!productId || !imageId || !dir) return;

  const sb = getAdminSupabase();
  // Fetch raw list without relying on existing sort order
  const { data: imgs } = await sb
    .from("product_images")
    .select("id, sort")
    .eq("product_id", productId);
  if (!imgs || !imgs.length) return;

  // Normalize: coerce sort to number (nulls → +Infinity) and create a stable order
  const normalized = imgs.map((r: any) => ({
    id: String(r.id),
    sort: Number.isFinite(Number(r.sort)) ? Number(r.sort) : Number.POSITIVE_INFINITY,
  }));
  normalized.sort((a, b) => (a.sort - b.sort) || a.id.localeCompare(b.id));

  const idx = normalized.findIndex((x) => x.id === imageId);
  if (idx < 0) return;

  const swapWith = dir === "up" ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= normalized.length) return;

  // Reorder in-memory
  const reordered = normalized.slice();
  const [moved] = reordered.splice(idx, 1);
  reordered.splice(swapWith, 0, moved);

  // Persist sequential sorts 0..n-1
  for (let i = 0; i < reordered.length; i++) {
    await sb.from("product_images").update({ sort: i }).eq("id", reordered[i].id);
  }

  revalidatePath(`/admin/products/${productId}/images`);
  revalidatePath(`/admin/products`);
}

async function actionReorderAll(payload: { productId: string; ids: string[] }) {
  "use server";
  const { productId, ids } = payload || { productId: "", ids: [] };
  if (!productId || !ids?.length) return;
  const sb = getAdminSupabase();
  // Persist sequential sorts based on provided order
  for (let i = 0; i < ids.length; i++) {
    await sb.from("product_images").update({ sort: i }).eq("id", ids[i]);
  }
  revalidatePath(`/admin/products/${productId}/images`);
  revalidatePath(`/admin/products`);
}

async function actionSetCover(payload: { productId: string; imageId: string }) {
  "use server";
  const { productId, imageId } = payload || { productId: "", imageId: "" };
  if (!productId || !imageId) return;
  const sb = getAdminSupabase();
  const { data: imgs } = await sb
    .from("product_images")
    .select("id, sort")
    .eq("product_id", productId);
  if (!imgs || !imgs.length) return;

  // Move the chosen image to index 0, keep others in relative order
  const rest = imgs
    .filter((r: any) => String(r.id) !== imageId)
    .sort((a: any, b: any) => (Number(a.sort) || 0) - (Number(b.sort) || 0));
  const ordered = [imageId, ...rest.map((r: any) => String(r.id))];
  for (let i = 0; i < ordered.length; i++) {
    await sb.from("product_images").update({ sort: i }).eq("id", ordered[i]);
  }

  revalidatePath(`/admin/products/${productId}/images`);
  revalidatePath(`/admin/products`);
}

export default async function ProductImagesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: productId } = await params; // Next 16: params is a Promise
  const sb = getAdminSupabase() || getSupabase();

  // Fetch product and images
  const { data: product } = await sb
    .from("products")
    .select("id, name")
    .eq("id", productId)
    .single();
  if (!product) redirect("/admin/products");

  const { data: images } = await sb
    .from("product_images")
    .select("id, url, sort")
    .eq("product_id", productId)
    .order("sort", { ascending: true });

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold">Images — {product.name}</h2>
        <p className="text-neutral-600 text-sm">Upload, delete, and reorder images for this product.</p>
      </header>

      {/* Drag & drop reorder (first = cover) */}
      <ImageListClient
        productId={productId}
        items={(images || []).map((img) => ({
          id: String(img.id),
          url: String(img.url),
          sort: Number(img.sort) || 0,
          src: resolveStorageUrl(img.url) || "",
        }))}
        onReorder={actionReorderAll}
        onSetCover={actionSetCover}
      />

      <form action={actionUpload} className="space-y-3 rounded border bg-card p-4">
        <input type="hidden" name="product_id" value={productId} />
        <ImageUploader name="files" />
        <div>
          <button type="submit" className="rounded border border-brand px-4 py-2 text-brand hover:bg-brand hover:text-white">Upload</button>
        </div>
      </form>

      <div className="grid gap-4 sm:grid-cols-2">
        {images?.map((img) => {
          const src = resolveStorageUrl(img.url) || "";
          return (
            <div key={img.id} className="rounded border bg-card p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="aspect-square w-full rounded border object-cover" />
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="text-xs text-neutral-600 truncate" title={img.url}>{img.url}</div>
                <div className="flex items-center gap-2">
                  <form action={actionReorder}>
                    <input type="hidden" name="product_id" value={productId} />
                    <input type="hidden" name="image_id" value={img.id} />
                    <input type="hidden" name="dir" value="up" />
                    <button type="submit" className="rounded border px-2 py-1 text-xs" aria-label="Move up">↑</button>
                  </form>
                  <form action={actionReorder}>
                    <input type="hidden" name="product_id" value={productId} />
                    <input type="hidden" name="image_id" value={img.id} />
                    <input type="hidden" name="dir" value="down" />
                    <button type="submit" className="rounded border px-2 py-1 text-xs" aria-label="Move down">↓</button>
                  </form>
                  <form action={actionDelete}>
                    <input type="hidden" name="product_id" value={productId} />
                    <input type="hidden" name="image_id" value={img.id} />
                    <input type="hidden" name="key" value={img.url} />
                    <button className="rounded border px-2 py-1 text-xs text-red-700 hover:bg-red-600 hover:text-white" aria-label="Delete">Delete</button>
                  </form>
                </div>
              </div>
            </div>
          );
        })}
        {!images?.length && (
          <div className="rounded border bg-card p-4 text-sm text-neutral-600">No images yet.</div>
        )}
      </div>
    </section>
  );
}
