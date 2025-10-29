import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllSlugs, getProductBySlug } from "@/lib/data";
import { formatIDR } from "@/lib/types";
import ProductGallery from "@/app/components/ProductGallery";

type Params = { slug: string };

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) {
    return { title: "Product — Temurun" };
  }
  return {
    title: `${product.name} — Temurun`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
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
            <button
              type="button"
              className="rounded px-4 py-2 bg-brand text-white border border-brand"
            >
              Add to cart (next)
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
