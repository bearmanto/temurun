

import Link from "next/link";

export default function NotFound() {
  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-semibold">Product not found</h1>
      <p className="text-neutral-600">It may have been removed or renamed.</p>
      <div>
        <Link href="/#products" className="underline">
          Back to products
        </Link>
      </div>
    </section>
  );
}