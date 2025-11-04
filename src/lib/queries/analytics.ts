import { getAdminSupabase } from "@/lib/supabase/admin";
import { getSupabase } from "@/lib/supabase/server";

// ────────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────────
export type AnalyticsRange = { fromISO: string; toISO: string };
export type StatusSummary = Record<string, number>;
export type ProductStat = { name: string; qty: number; revenue: number };
export type AnalyticsResult = {
  range: AnalyticsRange;
  orders: number;
  revenue: number;
  aov: number; // average order value
  byStatus: StatusSummary;
  topProducts: ProductStat[]; // sorted by revenue desc
};

function sb() {
  return getAdminSupabase() || getSupabase();
}

// ────────────────────────────────────────────────────────────────────────────────
// Entry point
// ────────────────────────────────────────────────────────────────────────────────
export async function getAnalytics(range: AnalyticsRange): Promise<AnalyticsResult> {
  const client = sb();
  if (!client) {
    return {
      range,
      orders: 0,
      revenue: 0,
      aov: 0,
      byStatus: {},
      topProducts: [],
    };
  }

  // 1) Fetch orders in range (id, total, status)
  const { data: orders, error: ordersErr } = await client
    .from("orders")
    .select("id,total,status,created_at")
    .gte("created_at", range.fromISO)
    .lt("created_at", range.toISO);

  if (ordersErr || !orders || orders.length === 0) {
    return {
      range,
      orders: 0,
      revenue: 0,
      aov: 0,
      byStatus: {},
      topProducts: [],
    };
  }

  const orderIds = orders.map((o: any) => o.id);
  const ordersCount = orders.length;
  const revenue = orders.reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);

  // Status summary
  const byStatus: StatusSummary = {};
  for (const o of orders as any[]) {
    const key = String(o.status || "").toLowerCase();
    byStatus[key] = (byStatus[key] || 0) + 1;
  }

  // 2) Fetch order_items for these orders and aggregate by product name
  let topProducts: ProductStat[] = [];
  if (orderIds.length > 0) {
    const { data: items } = await client
      .from("order_items")
      .select("name,price,qty,order_id")
      .in("order_id", orderIds);

    const map = new Map<string, { qty: number; revenue: number }>();
    for (const it of (items as any[]) || []) {
      const name = String(it.name || "");
      const qty = Number(it.qty || 0);
      const rev = Number(it.price || 0) * qty;
      const prev = map.get(name) || { qty: 0, revenue: 0 };
      prev.qty += qty;
      prev.revenue += rev;
      map.set(name, prev);
    }

    topProducts = Array.from(map.entries())
      .map(([name, v]) => ({ name, qty: v.qty, revenue: v.revenue }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  const aov = ordersCount > 0 ? revenue / ordersCount : 0;

  return { range, orders: ordersCount, revenue, aov, byStatus, topProducts };
}
