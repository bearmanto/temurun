"use client";

import Link from "next/link";
import { useCartStore, selectSubtotal } from "@/lib/store/cart";
import { formatIDR } from "@/lib/types";

export default function CartSummary() {
  const subtotal = useCartStore(selectSubtotal);
  const hasItems = useCartStore((s) => s.items.length > 0);

  const delivery = 0; // to be determined later
  const total = subtotal + delivery;

  return (
    <div className="rounded border p-4 text-sm bg-card">
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>{formatIDR(subtotal)}</span>
      </div>
      <div className="mt-1 flex justify-between text-neutral-600">
        <span>Delivery</span>
        <span>—</span>
      </div>
      <div className="mt-2 flex justify-between font-medium">
        <span>Total</span>
        <span>{formatIDR(total)}</span>
      </div>

      <div className="mt-3">
        <Link
          aria-disabled={!hasItems}
          href={hasItems ? "/checkout" : "#"}
          className={`inline-block rounded border px-4 py-2 ${
            hasItems
              ? "border-brand text-brand hover:bg-brand hover:text-white"
              : "opacity-50 cursor-not-allowed"
          }`}
        >
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
}
