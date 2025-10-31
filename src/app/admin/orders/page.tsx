import Link from "next/link";
import { listOrders } from "@/lib/queries/orders";
import { formatIDR } from "@/lib/types";

export const metadata = {
  title: "Admin — Orders",
};

export default async function AdminOrdersPage() {
  const orders = await listOrders(200);

  return (
    <section className="space-y-4">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <Link href="/admin" className="text-sm underline">Back to Admin</Link>
      </header>

      {orders.length === 0 ? (
        <p className="text-neutral-600">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto rounded border">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-700">
              <tr>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Code</th>
                <th className="px-3 py-2 text-left">Customer</th>
                <th className="px-3 py-2 text-right">Total</th>
                <th className="px-3 py-2 text-left">Status</th>
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
                  <td className="px-3 py-2">{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
