import { getSupabase } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/supabase/admin";

// ────────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────────
export type AdminOrderSummary = {
  id: string;
  created_at: string;
  code: string;
  customer_name: string;
  total: number;
  status: string;
};

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

// Prefer service-role on server (admin) and fall back to request-bound when available
function sb() {
  return getAdminSupabase() || getSupabase();
}

// ────────────────────────────────────────────────────────────────────────────────
// Queries
// ────────────────────────────────────────────────────────────────────────────────
export async function listOrders(
  opts: { status?: string; q?: string; limit?: number } = {}
): Promise<AdminOrderSummary[]> {
  const { status, q, limit = 200 } = opts;
  const client = sb();
  if (!client) return [];

  let query = client
    .from("orders")
    .select("id, created_at, code, customer_name, total, status")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status && status !== "all") {
    const s = status.toLowerCase();
    if (s === "canceled" || s === "cancelled") {
      query = query.in("status", ["cancelled", "canceled"]);
    } else {
      query = query.eq("status", s);
    }
  }

  const term = (q || "").trim();
  if (term) {
    // Match code OR customer_name
    query = query.or(`code.ilike.%${term}%,customer_name.ilike.%${term}%`);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return (data as any[]).map((r) => ({
    id: String(r.id),
    created_at: String(r.created_at),
    code: String(r.code || ""),
    customer_name: String(r.customer_name || ""),
    total: Number(r.total || 0),
    status: String(r.status || ""),
  }));
}

export async function getOrderById(id: string): Promise<AdminOrderDetail | null> {
  const client = sb();
  if (!client) return null;

  const { data: orderRow, error: orderErr } = await client
    .from("orders")
    .select("id, code, created_at, status, total, customer_name, phone, address, notes")
    .eq("id", id)
    .maybeSingle();

  if (orderErr || !orderRow) return null;

  const { data: itemRows } = await client
    .from("order_items")
    .select("id, name, price, qty")
    .eq("order_id", (orderRow as any).id);

  const items = ((itemRows as any[]) || []).map((r) => ({
    id: String(r.id || ""),
    name: String(r.name || ""),
    price: Number(r.price || 0),
    qty: Number(r.qty || 0),
  }));

  const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);

  return {
    id: String((orderRow as any).id),
    code: String((orderRow as any).code || ""),
    created_at: String((orderRow as any).created_at || ""),
    status: String((orderRow as any).status || "pending"),
    subtotal,
    total: Number((orderRow as any).total ?? subtotal ?? 0),
    customer_name: String((orderRow as any).customer_name || ""),
    phone: String((orderRow as any).phone || ""),
    address: String((orderRow as any).address || ""),
    notes: (orderRow as any).notes ?? null,
    items,
  };
}

export async function getOrderByCode(code: string): Promise<NormalizedOrder | null> {
  const client = sb();
  if (!client) return null;

  const { data: orderRow, error: orderErr } = await client
    .from("orders")
    .select("id, code, total, customer_name, phone, address, notes")
    .eq("code", code)
    .maybeSingle();

  if (orderErr || !orderRow) return null;

  const { data: itemRows } = await client
    .from("order_items")
    .select("id, name, price, qty")
    .eq("order_id", (orderRow as any).id);

  const items = ((itemRows as any[]) || []).map((r) => ({
    id: String(r.id || ""),
    name: String(r.name || ""),
    price: Number(r.price || 0),
    qty: Number(r.qty || 0),
  }));

  const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);

  return {
    code: String((orderRow as any).code),
    subtotal,
    total: Number((orderRow as any).total ?? subtotal ?? 0),
    customer_name: String((orderRow as any).customer_name || ""),
    phone: String((orderRow as any).phone || ""),
    address: String((orderRow as any).address || ""),
    notes: (orderRow as any).notes ?? null,
    items,
  };
}

export type OrderStatusEvent = {
  from_status: string | null;
  to_status: string;
  note: string | null;
  created_at: string;
};

export async function getOrderEvents(orderId: string): Promise<OrderStatusEvent[]> {
  const client = sb();
  if (!client) return [];
  const { data } = await client
    .from("order_status_events")
    .select("from_status,to_status,note,created_at")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });
  return ((data as any[]) || []).map((r) => ({
    from_status: r.from_status ?? null,
    to_status: r.to_status,
    note: r.note ?? null,
    created_at: String(r.created_at || ""),
  }));
}