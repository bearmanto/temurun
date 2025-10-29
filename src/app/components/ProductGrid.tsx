import ProductCard from "./ProductCard";
import type { Product } from "@/lib/types";

/** Temporary in-code products (will move to Supabase in a later milestone). */
const products: Product[] = [
  { id: "p1", slug: "signature-sourdough", name: "Signature Sourdough", price: 45000 },
  { id: "p2", slug: "country-loaf", name: "Country Loaf", price: 50000 },
  { id: "p3", slug: "garlic-bread", name: "Garlic Bread", price: 35000 },
  { id: "p4", slug: "choco-babka", name: "Chocolate Babka", price: 65000 },
  { id: "p5", slug: "cinnamon-roll", name: "Cinnamon Roll (2 pcs)", price: 30000 },
  { id: "p6", slug: "croissant", name: "Butter Croissant (2 pcs)", price: 38000 },
  { id: "p7", slug: "brownies", name: "Fudgy Brownies", price: 55000 },
  { id: "p8", slug: "banana-bread", name: "Banana Bread", price: 42000 },
];

export default function ProductGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
