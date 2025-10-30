import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatIDR } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group overflow-hidden rounded border bg-card">
      <div className="relative">
        {/* Image (or placeholder) */}
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            className="aspect-square w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="aspect-square w-full bg-neutral-100" aria-hidden="true" />
        )}

        {product.is_new && (
          <span className="absolute left-2 top-2 rounded-full bg-brand/90 px-2 py-0.5 text-xs text-white">
            New
          </span>
        )}
      </div>

      <div className="p-3">
        <h3 className="line-clamp-1 font-medium tracking-tight">{product.name}</h3>
        <p className="text-sm text-neutral-600">{formatIDR(product.price)}</p>

        <div className="mt-2">
          <Link
            href={`/product/${product.slug}`}
            className="inline-block rounded border border-brand text-brand px-3 py-1 text-sm hover:bg-brand hover:text-white"
            aria-label={`View ${product.name}`}
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
