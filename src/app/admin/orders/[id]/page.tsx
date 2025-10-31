import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { getOrderById } from "@/lib/queries/orders";
import { formatIDR } from "@/lib/types";
import { getAdminSupabase } from "@/lib/supabase/admin";

type Params = { id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  return { title: `Admin — Order ${id}` };
}

export default async function AdminOrderDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) return notFound();

  async function updateStatus(formData: FormData) {
    "use server";
    const sb = getAdminSupabase();
    if (!sb) return;

    const next = String(formData.get("status") || "").toLowerCase();
    const allowed = ["pending", "confirmed", "delivered", "cancelled"];
    if (!allowed.includes(next)) return;

    await sb.from("orders").update({ status: next }).eq("id", id);
    revalidatePath(`/admin/orders/${id}`);
  }

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <div className="text-sm">
          <Link href="/admin/orders" className="underline">← Back to Orders</Link>
        </div>
        <h1 className="text-2xl font-semibold">Order {order.code}</h1>
        <div className="text-neutral-600">
          Placed {new Date(order.created_at).toLocaleString()} • Status: {order.status}
        </div>
      </header>

      <div className="grid gap-6 sm:grid-cols-[1fr_320px]">
        <div className="rounded border bg-card p-4">
          <div className="font-medium mb-2">Items</div>
          <ul className="divide-y">
            {order.items.map((it) => (
              <li key={it.id} className="flex items-center justify-between py-2">
                <div className="text-sm">
                  {it.qty}× {it.name}
                  <div className="text-xs text-neutral-600">{it.slug}</div>
                </div>
                <div className="text-sm font-medium">{formatIDR(it.price * it.qty)}</div>
              </li>
            ))}
          </ul>
        </div>

        <aside className="rounded border bg-card p-4 space-y-2 text-sm">
          <div className="font-medium">Customer</div>
          <div>{order.customer_name}</div>
          <div>{order.phone}</div>
          <div className="whitespace-pre-line">{order.address}</div>
          {order.notes && (
            <div className="pt-2">
              <div className="font-medium">Notes</div>
              <div className="whitespace-pre-line text-neutral-700">{order.notes}</div>
            </div>
          )}
          <hr />
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatIDR(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-neutral-600">
            <span>Delivery</span>
            <span>—</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>{formatIDR(order.total)}</span>
          </div>

          <hr />
          <form action={updateStatus} className="pt-1 space-y-2">
            <label className="block text-sm font-medium">Update status</label>
            <select
              name="status"
              defaultValue={order.status}
              className="w-full rounded border px-2 py-1 text-sm"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              type="submit"
              className="inline-flex items-center rounded border border-brand px-3 py-1 text-sm text-brand hover:bg-brand hover:text-white"
            >
              Save status
            </button>
          </form>
        </aside>
      </div>
    </section>
  );
}
