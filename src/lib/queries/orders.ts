import { getSupabase } from "@/lib/supabase/server";

export type OrderItemRow = {
  id: number;
  order_id: string;
  product_id: string;
  slug: string;
  name: string;
  price: number;
  qty: number;
};

export type OrderRow = {
  id: string;
  code: string;
  customer_name: string;
  phone: string;
  address: string;
  notes: string;
  subtotal: number;
  total: number;
  status: string;
  created_at: string;
};

export type OrderWithItems = OrderRow & { items: OrderItemRow[] };

export async function getOrderByCode(code: string): Promise<OrderWithItems | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const { data: order, error } = await sb
    .from("orders")
    .select("id, code, customer_name, phone, address, notes, subtotal, total, status, created_at")
    .eq("code", code)
    .maybeSingle();

  if (error || !order) return null;

  const { data: items, error: itemsErr } = await sb
    .from("order_items")
    .select("id, order_id, product_id, slug, name, price, qty")
    .eq("order_id", order.id);

  if (itemsErr || !items) return { ...(order as OrderRow), items: [] };

  return { ...(order as OrderRow), items: items as OrderItemRow[] };
}
