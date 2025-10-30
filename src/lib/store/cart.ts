import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  qty: number;
};

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (p, qty = 1) =>
        set((state) => {
          const idx = state.items.findIndex((i) => i.id === p.id);
          if (idx >= 0) {
            const items = state.items.slice();
            items[idx] = { ...items[idx], qty: items[idx].qty + qty };
            return { items };
          }
          return { items: [...state.items, { ...p, qty }] };
        }),
      remove: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      setQty: (id, qty) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i)),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "temurun_cart_v1",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items }),
    }
  )
);

// selectors
export const selectItems = (s: CartState) => s.items;
export const selectCount = (s: CartState) => s.items.reduce((n, i) => n + i.qty, 0);
export const selectSubtotal = (s: CartState) => s.items.reduce((sum, i) => sum + i.price * i.qty, 0);
