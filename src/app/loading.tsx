

import { ProductsSkeleton } from "./components/Skeletons";

export default function Loading() {
  return (
    <>
      <section className="py-12 sm:py-16 border-b border-line bg-transparent">
        <div className="mx-auto max-w-screen-md px-4">
          <div className="h-7 w-2/3 rounded bg-neutral-200 animate-pulse" />
        </div>
      </section>

      <section className="space-y-3 mx-auto max-w-screen-md px-4 py-6">
        <div className="h-5 w-40 rounded bg-neutral-200 animate-pulse" />
        <ProductsSkeleton />
      </section>
    </>
  );
}