"use client";

import { useTransition } from "react";
import type { Product } from "@/lib/types";
import { useCartStore } from "@/lib/store/cart";

export default function AddToCart({ product }: { product: Product }) {
  const add = useCartStore((s) => s.add);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="rounded px-4 py-2 bg-brand text-white border border-brand disabled:opacity-60"
      disabled={pending}
      onClick={() => startTransition(() => add(product, 1))}
    >
      {pending ? "Adding…" : "Add to cart"}
    </button>
  );
}
