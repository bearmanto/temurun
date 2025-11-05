import Link from "next/link";
import { listOrders } from "@/lib/queries/orders";
import { formatIDR } from "@/lib/types";

export const metadata = {
  title: "Admin — Orders",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status: statusParam = "all", q: qParam = "" } = await searchParams;
  const statusRaw = (statusParam || "all").toLowerCase();
  const normalizedStatus = statusRaw === "canceled" ? "cancelled" : statusRaw;
  const q = (qParam || "").trim();
  const orders = (await listOrders({ status: normalizedStatus, q, limit: 200 })) ?? [];

  function formatStatus(s: string) {
    const map: Record<string, string> = {
      canceled: "Cancelled",
      cancelled: "Cancelled",
      pending: "Pending",
      confirmed: "Confirmed",
      preparing: "Preparing",
      out_for_delivery: "Out for delivery",
      delivered: "Delivered",
    };
    return map[String(s || "").toLowerCase()] ?? s;
  }

  return (
    <section className="space-y-4">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <Link href="/admin" className="text-sm underline">Back to Admin</Link>
      </header>

      <form method="get" action="/admin/orders" className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col">
          <label htmlFor="q" className="text-xs text-neutral-600">Search</label>
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Code or customer name"
            className="rounded border px-2 py-1"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="status" className="text-xs text-neutral-600">Status</label>
          <select id="status" name="status" defaultValue={normalizedStatus} className="rounded border px-2 py-1">
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="out_for_delivery">Out for delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button type="submit" className="rounded bg-black px-3 py-1 text-white">Apply</button>
        <a href="/admin/orders" className="text-sm underline">Clear</a>
      </form>

      {orders.length === 0 ? (
        <p className="text-neutral-600">No orders yet.</p>
      ) : (
        <div className="max-h-[70vh] overflow-x-auto overflow-y-auto rounded border">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-700">
              <tr>
                <th className="sticky top-0 z-10 bg-neutral-50 px-3 py-2 text-left">Date</th>
                <th className="sticky top-0 z-10 bg-neutral-50 px-3 py-2 text-left">Code</th>
                <th className="sticky top-0 z-10 bg-neutral-50 px-3 py-2 text-left">Customer</th>
                <th className="sticky top-0 z-10 bg-neutral-50 px-3 py-2 text-right">Total</th>
                <th className="sticky top-0 z-10 bg-neutral-50 px-3 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="px-3 py-2">{new Date(o.created_at).toLocaleString()}</td>
                  <td className="px-3 py-2">
                    <Link href={`/admin/orders/${o.id}`} className="underline">
                      {o.code}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{o.customer_name}</td>
                  <td className="px-3 py-2 text-right">{formatIDR(o.total)}</td>
                  <td className="px-3 py-2">{formatStatus(o.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
