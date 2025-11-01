

import Link from "next/link";

export default function NotFound() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-neutral-600">The page you’re looking for doesn’t exist.</p>
      <div>
        <Link href="/" className="rounded border px-4 py-2 hover:text-brand">
          Go home
        </Link>
      </div>
    </section>
  );
}