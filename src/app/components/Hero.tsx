import Link from "next/link";

export default function Hero() {
  return (
    <section className="py-12 sm:py-20 border-b border-line">
      <div className="mx-auto max-w-screen-md px-4">
        <h1 className="text-5xl sm:text-7xl font-semibold leading-tight tracking-tight">
          Baked fresh. Boldly simple.
        </h1>
        <p className="mt-4 text-neutral-700 text-base sm:text-lg max-w-prose">
          Small-batch, made-to-order bakes. Choose your favorites, pick a date,
          and confirm in one tap via WhatsApp.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="#products"
            className="rounded px-5 py-2.5 border border-brand text-brand hover:bg-brand hover:text-white"
            aria-label="Shop now"
          >
            Shop now
          </Link>
          <Link
            href="/cart"
            className="rounded px-5 py-2.5 border border-brand text-brand hover:bg-brand hover:text-white"
            aria-label="View cart"
          >
            View cart
          </Link>
        </div>
      </div>
    </section>
  );
}
