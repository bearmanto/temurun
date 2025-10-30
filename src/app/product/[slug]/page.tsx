import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listSlugs, fetchProductBySlug } from "@/lib/queries/products";
import { formatIDR } from "@/lib/types";
import ProductGallery from "@/app/components/ProductGallery";
import AddToCart from "@/app/components/AddToCart";

type Params = { slug: string };

export async function generateStaticParams() {
  const slugs = await listSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) return { title: "Product — Temurun" };
  return {
    title: `${product.name} — Temurun`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) return notFound();

  return (
    <section className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {product.name}
          </h1>
          <p className="text-lg">{formatIDR(product.price)}</p>
          <p className="text-neutral-600">{product.description}</p>

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
    </section>
  );
}
