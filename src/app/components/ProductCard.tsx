import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { formatIDR } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  const src = product.image && product.image.trim() ? product.image : "/placeholders/product.svg";
  const productHref = `/product/${product.slug}`;

  return (
    <article className="group overflow-hidden rounded-lg border bg-card transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-sm focus-within:shadow-sm">
      <Link
        href={productHref}
        aria-label={`View ${product.name}`}
        className="relative block aspect-square w-full bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand/60"
     >
        <Image
          src={src}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority={false}
        />

        {product.is_new && (
          <span className="absolute left-2 top-2 rounded-full bg-brand/90 px-2 py-0.5 text-xs text-white">
            New
          </span>
        )}
      </Link>

      <div className="p-4">
        <h3 className="line-clamp-1 text-base font-semibold tracking-tight">
          <Link
            href={productHref}
            className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand/60"
          >
            {product.name}
          </Link>
        </h3>
        <p className="mt-0.5 text-sm text-neutral-600">{formatIDR(product.price)}</p>

        <div className="mt-3">
          <Link
            href={productHref}
            className="inline-block rounded border border-brand px-3 py-1 text-sm text-brand transition-colors hover:bg-brand hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand/60"
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
