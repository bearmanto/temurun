import type { Metadata } from "next";

export const SITE_NAME = "Temurun";
export const DEFAULT_DESCRIPTION =
  "Simple personal commerce site — products, cart, checkout, and admin.";

/** Read base URL from env (preferred) or fall back to localhost in dev. */
export function getBaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (env) return env.replace(/\/$/, "");
  return "http://localhost:3000";
}

/** Ensure an absolute URL for metadata/JSON-LD. */
export function absoluteUrl(path: string): string {
  if (!path) return getBaseUrl();
  if (/^https?:\/\//i.test(path)) return path;
  return `${getBaseUrl()}${path.startsWith("/") ? path : "/" + path}`;
}

/** Build sitewide defaults for the Metadata API. */
export function baseMetadata(): Metadata {
  const base = getBaseUrl();
  return {
    metadataBase: new URL(base),
    title: {
      default: SITE_NAME,
      template: `%s — ${SITE_NAME}`,
    },
    description: DEFAULT_DESCRIPTION,
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      url: base,
    },
    twitter: {
      card: "summary_large_image",
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: "/",
    },
  } satisfies Metadata;
}

/** Minimal input to build Product JSON-LD. */
export type ProductSeoInput = {
  name: string;
  description?: string | null;
  slug: string;
  price: number;
  currency?: string; // default: IDR
  images?: string[]; // absolute or relative
};

/** JSON-LD for a Product with a single active Offer. */
export function productJsonLd(p: ProductSeoInput): string {
  const url = absoluteUrl(`/product/${p.slug}`);
  const images = (p.images || []).map(absoluteUrl);
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description || undefined,
    image: images.length ? images : undefined,
    url,
    offers: {
      "@type": "Offer",
      price: p.price,
      priceCurrency: p.currency || "IDR",
      url,
      availability: "http://schema.org/InStock",
      itemCondition: "http://schema.org/NewCondition",
    },
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
  };
  return JSON.stringify(data);
}

export type BreadcrumbItem = { name: string; item: string };

export function breadcrumbJsonLd(crumbs: BreadcrumbItem[]): string {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.item),
    })),
  };
  return JSON.stringify(data);
}
