import ProductCard from "./ProductCard";
import { getAllProducts } from "@/lib/data";

export default function ProductGrid() {
  const products = getAllProducts();

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
