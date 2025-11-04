import { formatIDR } from "@/lib/types";
import { getSupabase } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/supabase/admin";

/**
 * WhatsApp requires numbers in international format without '+', dashes, spaces, or brackets.
 * This keeps only digits so "+62 811-111-111" -> "62811111111".
 */
export function normalizePhoneForWa(input: string): string {
  return String(input || "").replace(/[^\d]/g, "");
}

export type OrderMessageInput = {
  code: string;
  items: { name: string; price: number; qty: number }[];
  total: number;
  customer_name: string;
  phone: string;
  address: string;
  notes?: string | null;
};

/** Build a readable multi-line message for WhatsApp from an order. */
export function buildOrderMessage(o: OrderMessageInput): string {
  const lines = (o.items || [])
    .map((it) => `${it.qty}× ${it.name} — ${formatIDR((it.price || 0) * (it.qty || 0))}`)
    .join("\n");

  return [
    `Order ${o.code}`,
    lines,
    `Total: ${formatIDR(o.total || 0)}`,
    `Name: ${o.customer_name}`,
    `Phone: ${o.phone}`,
    `Address: ${o.address}`,
    o.notes ? `Notes: ${o.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Build a wa.me URL with a prefilled message */
export function buildWaUrl(rawNumber: string, message: string): string {
  const number = normalizePhoneForWa(rawNumber);
  const base = number ? `https://wa.me/${number}` : "https://wa.me";
  return `${base}?text=${encodeURIComponent(message || "")}`;
}

export type NormalizedOrder = {
  code: string;
  subtotal: number;
  total: number;
  customer_name: string;
  phone: string;
  address: string;
  notes: string | null;
  items: { id: string; name: string; price: number; qty: number }[];
};

export async function getOrderByCode(code: string): Promise<NormalizedOrder | null> {
  const sb = getAdminSupabase() || getSupabase();
  if (!sb) return null;

  // 1) Fetch order by public code
  const { data: orderRow, error: orderErr } = await sb
    .from("orders")
    .select("id, code, total, customer_name, phone, address, notes")
    .eq("code", code)
    .maybeSingle();

  if (orderErr || !orderRow) return null;

  // 2) Fetch items for that order
  const { data: itemRows } = await sb
    .from("order_items")
    .select("id, name, price, qty")
    .eq("order_id", orderRow.id);

  const items = (itemRows || []).map((r: any) => ({
    id: String(r.id || ""),
    name: String(r.name || ""),
    price: Number(r.price || 0),
    qty: Number(r.qty || 0),
  }));

  const subtotal = items.reduce((sum: number, it: any) => sum + it.price * it.qty, 0);

  return {
    code: String(orderRow.code),
    subtotal,
    total: Number(orderRow.total || 0),
    customer_name: String(orderRow.customer_name || ""),
    phone: String(orderRow.phone || ""),
    address: String(orderRow.address || ""),
    notes: (orderRow as any).notes ?? null,
    items,
  };
}


export type AdminOrderSummary = {
  id: string;
  created_at: string;
  code: string;
  customer_name: string;
  total: number;
  status: string;
};

/** List recent orders for Admin (RLS-safe via service role on the server). */
export async function listOrders(limit = 200): Promise<AdminOrderSummary[]> {
  const sb = getAdminSupabase() || getSupabase();
  if (!sb) return [];

  const { data, error } = await sb
    .from("orders")
    .select("id, created_at, code, customer_name, total, status")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((r: any) => ({
    id: String(r.id),
    created_at: String(r.created_at),
    code: String(r.code || ""),
    customer_name: String(r.customer_name || ""),
    total: Number(r.total || 0),
    status: String(r.status || "")
  }));
}

export type AdminOrderDetail = {
  id: string;
  code: string;
  created_at: string;
  status: string;
  subtotal: number;
  total: number;
  customer_name: string;
  phone: string;
  address: string;
  notes: string | null;
  items: { id: string; name: string; price: number; qty: number; slug?: string }[];
};

export async function getOrderById(id: string): Promise<AdminOrderDetail | null> {
  const sb = getAdminSupabase() || getSupabase();
  if (!sb) return null;

  const { data: orderRow, error: orderErr } = await sb
    .from("orders")
    .select("id, code, created_at, status, total, customer_name, phone, address, notes")
    .eq("id", id)
    .maybeSingle();

  if (orderErr || !orderRow) return null;

  const { data: itemRows } = await sb
    .from("order_items")
    .select("id, name, price, qty")
    .eq("order_id", orderRow.id);

  const items = (itemRows || []).map((r: any) => ({
    id: String(r.id || ""),
    name: String(r.name || ""),
    price: Number(r.price || 0),
    qty: Number(r.qty || 0),
    // slug not guaranteed in schema; omit or leave empty string
  }));

  const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);

  return {
    id: String(orderRow.id),
    code: String(orderRow.code || ""),
    created_at: String(orderRow.created_at || ""),
    status: String(orderRow.status || "pending"),
    subtotal,
    total: Number(orderRow.total || subtotal || 0),
    customer_name: String(orderRow.customer_name || ""),
    phone: String(orderRow.phone || ""),
    address: String(orderRow.address || ""),
    notes: (orderRow as any).notes ?? null,
    items,
  };
}