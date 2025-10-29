import Link from "next/link";

export default function Hero() {
  return (
    <section className="py-10 sm:py-14">
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Welcome to Temurun
        </h1>
        <p className="text-neutral-600 max-w-prose">
          A simple personal commerce site. Browse products, add to cart, and check out — we’ll
          confirm your order manually via WhatsApp.
        </p>
        <div className="flex gap-3">
          <Link href="#products" className="rounded border px-4 py-2">
            Shop now
          </Link>
          <Link href="/cart" className="rounded border px-4 py-2">
            View cart
          </Link>
        </div>
      </div>
    </section>
  );
}
