import Link from "next/link";

export const metadata = {
  title: "Cart — Temurun",
  description: "View items in your cart before checkout.",
};

export default function CartPage() {
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

      {/* Placeholder summary */}
      <div className="rounded border p-4 text-sm text-neutral-700">
        <p>Subtotal: —</p>
        <p>Delivery: —</p>
        <p className="font-medium">Total: —</p>
      </div>
    </section>
  );
}
