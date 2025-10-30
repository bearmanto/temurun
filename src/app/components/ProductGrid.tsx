import ProductCard from "./ProductCard";
import { listProducts } from "@/lib/queries/products";

export default async function ProductGrid() {
  const products = await listProducts();

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
