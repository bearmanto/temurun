

import { getSupabase } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import { getAllProducts, getProductBySlug, type ProductDetail } from "@/lib/data";

/**
 * DB schema expectations (for later):
 * - table: products { id uuid/text, slug text, name text, price int, description text }
 * - table: product_images { product_id fk, url text, sort int }
 * We'll keep queries minimal and tolerant.
 */

export async function listProducts(): Promise<Product[]> {
  const sb = getSupabase();
  if (!sb) {
    // Fallback to local data (static)
    return getAllProducts().map(({ id, slug, name, price, images }) => ({
      id,
      slug,
      name,
      price,
      image: images?.[0],
    }));
  }

  const { data, error } = await sb
    .from("products")
    .select("id, slug, name, price")
    .order("name", { ascending: true });

  if (error || !data) {
    // graceful fallback
    return getAllProducts().map(({ id, slug, name, price, images }) => ({
      id,
      slug,
      name,
      price,
      image: images?.[0],
    }));
  }

  // Map to our Product type
  return data.map((row: any) => ({
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    price: Number(row.price) || 0,
  })) as Product[];
}

export async function fetchProductBySlug(slug: string): Promise<ProductDetail | undefined> {
  const sb = getSupabase();
  if (!sb) return getProductBySlug(slug);

  const { data, error } = await sb
    .from("products")
    .select("id, slug, name, price, description")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return getProductBySlug(slug);

  // fetch images (optional)
  const { data: imgs } = await sb
    .from("product_images")
    .select("url, sort")
    .eq("product_id", data.id)
    .order("sort", { ascending: true });

  return {
    id: String(data.id),
    slug: String(data.slug),
    name: String(data.name),
    price: Number(data.price) || 0,
    description: String(data.description || ""),
    images: (imgs || []).map((i: any) => String(i.url)),
  };
}

export async function listSlugs(): Promise<string[]> {
  const sb = getSupabase();
  if (!sb) return getAllProducts().map((p) => p.slug);

  const { data, error } = await sb.from("products").select("slug");
  if (error || !data) return getAllProducts().map((p) => p.slug);
  return data.map((r: any) => String(r.slug));
}