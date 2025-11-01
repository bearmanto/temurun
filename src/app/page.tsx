import { Suspense } from "react";
import Hero from "./components/Hero";
import ProductGrid from "./components/ProductGrid";
import { ProductsSkeleton } from "./components/Skeletons";

export default function Home() {
  return (
    <>
      <Hero />
      <section id="products" className="space-y-3">
        <h2 className="text-xl font-semibold">What’s fresh</h2>
        <Suspense fallback={<ProductsSkeleton />}>
          {/* @ts-expect-error Async Server Component */}
          <ProductGrid />
        </Suspense>
      </section>
    </>
  );
}
