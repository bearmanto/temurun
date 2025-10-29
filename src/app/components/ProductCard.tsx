import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatIDR } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group overflow-hidden rounded border">
      {/* Image placeholder for now */}
      <div className="aspect-square w-full bg-neutral-100" aria-hidden="true" />

      <div className="p-3">
        <h3 className="line-clamp-1 font-medium tracking-tight">{product.name}</h3>
        <p className="text-sm text-neutral-600">{formatIDR(product.price)}</p>

        <div className="mt-2">
          <Link
            href={`/product/${product.slug}`}
            className="inline-block rounded border px-3 py-1 text-sm"
            aria-label={`View ${product.name}`}
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
