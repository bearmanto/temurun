import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { listSlugs } from "@/lib/queries/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const slugs = await listSlugs();

  const entries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now },
  ];

  for (const slug of slugs) {
    entries.push({ url: absoluteUrl(`/product/${slug}`), lastModified: now });
  }

  return entries;
}
