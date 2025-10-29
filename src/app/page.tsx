import Hero from "./components/Hero";

export default function Home() {
  return (
    <>
      <Hero />
      <section id="products" className="space-y-3">
        <h2 className="text-xl font-semibold">What’s fresh</h2>
        <p className="text-neutral-600">
          Product grid coming next (Milestone 2B).
        </p>
      </section>
    </>
  );
}
