"use client";

import Link from "next/link";
import CartLine from "@/app/components/CartLine";
import CartSummary from "@/app/components/CartSummary";
import { useCartStore, selectItems } from "@/lib/store/cart";

export default function CartPage() {
  const items = useCartStore(selectItems);

  return (
    <section className="py-6">
      <div className="mx-auto max-w-screen-md px-4">
        {items.length === 0 ? (
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold">Cart</h1>
            <p className="text-neutral-600">
              Your cart is empty. Browse our latest bakes and add something you like.
            </p>
            <div>
              <Link
                href="/#products"
                className="rounded border border-brand px-4 py-2 text-brand hover:bg-brand hover:text-white"
              >
                Shop now
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold">Cart</h1>
            <div>
              <Link href="/#products" className="text-sm underline hover:text-brand">
                Continue shopping
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-[1fr_280px]">
              <div>
                {items.map((it) => (
                  <CartLine key={it.id} item={it} />
                ))}
              </div>

              <div>
                <CartSummary />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
