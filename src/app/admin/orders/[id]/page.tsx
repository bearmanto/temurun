import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderById } from "@/lib/queries/orders";
import { formatIDR } from "@/lib/types";

type Params = { id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  return { title: `Admin — Order ${id}` };
}

export default async function AdminOrderDetailPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) return notFound();

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
        </aside>
      </div>
    </section>
  );
}
