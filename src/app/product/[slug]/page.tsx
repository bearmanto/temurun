import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listSlugs, fetchProductBySlug } from "@/lib/queries/products";
import { formatIDR } from "@/lib/types";
import ProductGallery from "@/app/components/ProductGallery";
import AddToCart from "@/app/components/AddToCart";
import { productJsonLd, absoluteUrl, SITE_NAME, breadcrumbJsonLd, DEFAULT_DESCRIPTION } from "@/lib/seo";

type Params = { slug: string };

export async function generateStaticParams() {
  const slugs = await listSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  const title = product ? `${product.name} — ${SITE_NAME}` : `Product — ${SITE_NAME}`;
  const description = product?.description || DEFAULT_DESCRIPTION;
  const url = absoluteUrl(`/product/${slug}`);
  const images = (product?.images || []).map(absoluteUrl);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      url,
      title,
      description,
      images: images.length ? images : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) return notFound();

  const jsonLd = productJsonLd({
    name: product.name,
    description: product.description,
    slug: product.slug,
    price: product.price,
    currency: "IDR",
    images: product.images,
  });

  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", item: "/" },
    { name: product.name, item: `/product/${product.slug}` },
  ]);

  return (
    <section className="py-6">
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: breadcrumbLd }} />
      <div className="mx-auto max-w-screen-md px-4">
        <div className="grid gap-6 sm:grid-cols-2">
          <ProductGallery images={product.images} name={product.name} />
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              {product.name}
            </h1>
            <p className="text-xl font-medium">{formatIDR(product.price)}</p>
            <p className="text-neutral-700">{product.description}</p>

            <div className="pt-2">
              {/* Client button to add this product to cart */}
              {/* @ts-expect-error - product detail has extra fields; we pass only what's needed */}
              <AddToCart
                product={{
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: product.price,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
