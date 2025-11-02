"use client";

import Link from "next/link";
import QtyInput from "./QtyInput";
import { useCartStore } from "@/lib/store/cart";
import type { CartItem } from "@/lib/store/cart";
import { formatIDR } from "@/lib/types";

export default function CartLine({ item }: { item: CartItem }) {
  const remove = useCartStore((s) => s.remove);
  const setQty = useCartStore((s) => s.setQty);

  return (
    <div className="flex items-start justify-between gap-3 py-3 border-b border-line">
      <div className="flex items-start gap-3">
        {/* thumbnail placeholder */}
        <div className="h-16 w-16 rounded border border-line bg-neutral-100" aria-hidden="true" />
        <div>
          <Link href={`/product/${item.slug}`} className="font-medium hover:text-brand">
            {item.name}
          </Link>
          <div className="text-sm text-neutral-600">{formatIDR(item.price)}</div>
          <div className="mt-2">
            <QtyInput value={item.qty} onChange={(q) => setQty(item.id, q)} />
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className="font-medium">{formatIDR(item.price * item.qty)}</div>
        <button
          type="button"
          onClick={() => remove(item.id)}
          className="mt-2 text-sm underline hover:text-brand"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
