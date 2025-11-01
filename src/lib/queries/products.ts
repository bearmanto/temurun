import { getSupabase } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import { getAllProducts, getProductBySlug, type ProductDetail } from "@/lib/data";
import { resolveStorageUrl } from "@/lib/storage";

export type AdminProductRow = {
  id: string;
  slug: string;
  name: string;
  price: number;
  is_new: boolean;
  image?: string;
  imagesCount: number;
};

/**
 * DB schema expectations:
 * - table: products { id uuid/text, slug text, name text, price int, description text, is_new bool }
 * - table: product_images { product_id fk, url text, sort int }
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
      is_new: false,
    }));
  }

  const { data, error } = await sb
    .from("products")
    .select("id, slug, name, price, is_new, product_images(url, sort)")
    .order("name", { ascending: true });

  if (error || !data) {
    // graceful fallback
    return getAllProducts().map(({ id, slug, name, price, images }) => ({
      id,
      slug,
      name,
      price,
      image: images?.[0],
      is_new: false,
    }));
  }

  return data.map((row: any) => {
    const imgs = Array.isArray(row.product_images) ? row.product_images.slice() : [];
    imgs.sort((a: any, b: any) => (a?.sort ?? 0) - (b?.sort ?? 0));
    const first = imgs.length ? String(imgs[0].url) : undefined;
    const resolved = resolveStorageUrl(first);

    return {
      id: String(row.id),
      slug: String(row.slug),
      name: String(row.name),
      price: Number(row.price) || 0,
      is_new: Boolean(row.is_new),
      image: resolved,
    } as Product;
  });
}

export async function fetchProductBySlug(slug: string): Promise<ProductDetail | undefined> {
  const sb = getSupabase();
  if (!sb) return getProductBySlug(slug);

  const { data, error } = await sb
    .from("products")
    .select("id, slug, name, price, description, is_new")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return getProductBySlug(slug);

  // fetch images (optional)
  const { data: imgs } = await sb
    .from("product_images")
    .select("url, sort")
    .eq("product_id", data.id)
    .order("sort", { ascending: true });

  const resolvedImages = (imgs || [])
    .map((i: any) => resolveStorageUrl(String(i.url)))
    .filter((u: string | undefined): u is string => Boolean(u));

  return {
    id: String(data.id),
    slug: String(data.slug),
    name: String(data.name),
    price: Number(data.price) || 0,
    description: String(data.description || ""),
    images: resolvedImages,
  };
}

export async function listSlugs(): Promise<string[]> {
  const sb = getSupabase();
  if (!sb) return getAllProducts().map((p) => p.slug);

  const { data, error } = await sb.from("products").select("slug");
  if (error || !data) return getAllProducts().map((p) => p.slug);
  return data.map((r: any) => String(r.slug));
}

export async function listProductsAdmin(): Promise<AdminProductRow[]> {
  const sb = getSupabase();
  if (!sb) {
    // Fallback to local data (static)
    return getAllProducts().map(({ id, slug, name, price, images }) => ({
      id,
      slug,
      name,
      price,
      is_new: false,
      image: images?.[0],
      imagesCount: images?.length || 0,
    }));
  }

  const { data, error } = await sb
    .from("products")
    .select("id, slug, name, price, is_new, product_images(url, sort)")
    .order("name", { ascending: true });

  if (error || !data) {
    return getAllProducts().map(({ id, slug, name, price, images }) => ({
      id,
      slug,
      name,
      price,
      is_new: false,
      image: images?.[0],
      imagesCount: images?.length || 0,
    }));
  }

  return data.map((row: any) => {
    const imgs = Array.isArray(row.product_images) ? row.product_images.slice() : [];
    imgs.sort((a: any, b: any) => (a?.sort ?? 0) - (b?.sort ?? 0));
    const first = imgs.length ? String(imgs[0].url) : undefined;
    const resolved = resolveStorageUrl(first);
    return {
      id: String(row.id),
      slug: String(row.slug),
      name: String(row.name),
      price: Number(row.price) || 0,
      is_new: Boolean(row.is_new),
      image: resolved,
      imagesCount: imgs.length,
    } as AdminProductRow;
  });
}