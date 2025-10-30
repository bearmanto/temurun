"use client";

import Link from "next/link";
import CartLine from "@/app/components/CartLine";
import CartSummary from "@/app/components/CartSummary";
import { useCartStore, selectItems } from "@/lib/store/cart";

export default function CartPage() {
  const items = useCartStore(selectItems);

  if (items.length === 0) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Cart</h1>
        <p className="text-neutral-600">
          Your cart is empty.{" "}
          <Link href="/" className="underline">
            Continue shopping
          </Link>
          .
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Cart</h1>

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
    </section>
  );
}
