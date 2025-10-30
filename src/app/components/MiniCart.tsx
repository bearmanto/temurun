"use client";

import Link from "next/link";
import { useCartStore, selectItems, selectSubtotal } from "@/lib/store/cart";
import { formatIDR } from "@/lib/types";

export default function MiniCart({ onClose }: { onClose?: () => void }) {
  const items = useCartStore(selectItems);
  const subtotal = useCartStore(selectSubtotal);

  if (!items.length) {
    return (
      <div
        role="dialog"
        aria-label="Mini cart (empty)"
        className="w-80 max-w-[calc(100vw-2rem)] rounded border border-line bg-card p-3 shadow-sm"
      >
        <p className="text-sm text-neutral-600">Your cart is empty.</p>
        <div className="mt-3">
          <Link
            href="/#products"
            className="inline-block rounded border border-brand px-3 py-1 text-sm text-brand hover:bg-brand hover:text-white"
            onClick={onClose}
          >
            Shop now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-label="Mini cart"
      className="w-80 max-w-[calc(100vw-2rem)] rounded border border-line bg-card p-3 shadow-sm"
    >
      <div className="mb-2 text-sm font-medium">Your cart</div>

      <ul className="divide-y">
        {items.map((it) => (
          <li key={it.id} className="flex items-start justify-between gap-3 py-2">
            <div className="flex items-start gap-2">
              <div className="size-10 rounded border bg-neutral-100" aria-hidden="true" />
              <div>
                <div className="text-sm leading-tight">{it.name}</div>
                <div className="text-xs text-neutral-600">
                  {it.qty} × {formatIDR(it.price)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">{formatIDR(it.price * it.qty)}</div>
              <button
                type="button"
                className="mt-1 text-[11px] underline text-neutral-600 hover:text-brand"
                onClick={() => {
                  const { remove } = require("@/lib/store/cart");
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                  (remove ? remove : require("@/lib/store/cart").useCartStore.getState().remove)(it.id);
                  if (typeof onClose === "function") onClose();
                }}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-neutral-600">Subtotal</span>
        <span className="font-medium">{formatIDR(subtotal)}</span>
      </div>

      <div className="mt-3 flex gap-2">
        <Link
          href="/cart"
          className="inline-flex flex-1 items-center justify-center rounded border px-3 py-1 text-sm hover:text-brand"
          onClick={onClose}
        >
          View cart
        </Link>
        <Link
          href="/checkout"
          className="inline-flex flex-1 items-center justify-center rounded border border-brand px-3 py-1 text-sm text-brand hover:bg-brand hover:text-white"
          onClick={onClose}
        >
          Checkout
        </Link>
      </div>
    </div>
  );
}
