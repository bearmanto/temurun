"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/store/cart";

type AddableProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
};

export default function AddToCart({ product }: { product: AddableProduct }) {
  const add = useCartStore((s) => s.add);
  const [qty, setQty] = useState<number>(1);
  const [added, setAdded] = useState(false);

  function inc() {
    setQty((q) => Math.min(99, q + 1));
  }
  function dec() {
    setQty((q) => Math.max(1, q - 1));
  }

  function onAdd() {
    add(
      { id: product.id, slug: product.slug, name: product.name, price: product.price },
      qty
    );
    setAdded(true);
    const id = setTimeout(() => setAdded(false), 1200);
    // Clean up if component unmounts quickly
    return () => clearTimeout(id);
  }

  return (
    <div className="flex items-stretch gap-2">
      <div className="flex items-center rounded border border-line">
        <button
          type="button"
          onClick={dec}
          className="px-3 py-2 text-lg leading-none hover:text-brand"
          aria-label="Decrease quantity"
        >
          –
        </button>
        <input
          type="number"
          min={1}
          max={99}
          value={qty}
          onChange={(e) => setQty(() => Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
          className="w-14 border-l border-r border-line p-2 text-center"
          aria-label="Quantity"
        />
        <button
          type="button"
          onClick={inc}
          className="px-3 py-2 text-lg leading-none hover:text-brand"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="flex-1 rounded border border-brand px-4 py-2 font-medium text-brand hover:bg-brand hover:text-white"
      >
        {added ? "Added ✓" : "Add to cart"}
      </button>
    </div>
  );
}
