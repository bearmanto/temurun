import { Suspense } from "react";
import Hero from "./components/Hero";
import UspBar from "./components/UspBar";
import ProductGrid from "./components/ProductGrid";
import { ProductsSkeleton } from "./components/Skeletons";

export default function Home() {
  return (
    <>
      <Hero />
      <UspBar />
      <section id="products" className="space-y-4 py-6 sm:py-8">
        <div className="mx-auto max-w-screen-xl px-4">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">What’s fresh</h2>
          <Suspense fallback={<ProductsSkeleton />}>
            {/* @ts-expect-error Async Server Component */}
            <ProductGrid />
          </Suspense>
        </div>
      </section>
    </>
  );
}
