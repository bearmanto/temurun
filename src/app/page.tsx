import Hero from "./components/Hero";
import ProductGrid from "./components/ProductGrid";

export default function Home() {
  return (
    <>
      <Hero />
      <section id="products" className="space-y-3">
        <h2 className="text-xl font-semibold">What’s fresh</h2>
        <ProductGrid />
      </section>
    </>
  );
}
