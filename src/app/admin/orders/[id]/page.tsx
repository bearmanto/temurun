import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderById, getOrderEvents } from "@/lib/queries/orders";
import { formatIDR } from "@/lib/types";
import { updateOrderStatus } from "./actions";
import Toast from "@/app/components/Toast";
import CancelDialog from "./CancelDialog";

type Params = { id: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { id } = await params;
  return { title: `Admin — Order ${id}` };
}

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const ok = sp?.ok === "1";
  const err = sp?.err ? String(sp.err) : "";

  const order = await getOrderById(id);
  const events = await getOrderEvents(id);
  if (!order) return notFound();

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
      {ok && <Toast kind="success" message="Status updated" />}
      {!!err && <Toast kind="error" message={err} />}
      <header className="space-y-1">
        <div className="text-sm">
          <Link href="/admin/orders" className="underline">← Back to Orders</Link>
        </div>
        <h1 className="text-2xl font-semibold">Order {order.code}</h1>
        <div className="text-neutral-600">
          Placed {new Date(order.created_at).toLocaleString()} • Status: {formatStatus(order.status)}
        </div>
      </header>

      <div className="grid gap-6 sm:grid-cols-[1fr_320px]">
        <div className="rounded border bg-card p-4">
          <div className="font-medium mb-2">Items</div>
          <ul className="divide-y">
            {order.items.map((it, i) => (
              <li key={it.id || `${it.name}-${i}`} className="flex items-center justify-between py-2">
                <div className="text-sm">
                  {it.qty}× {it.name}
                  {it.slug ? (
                    <div className="text-xs text-neutral-600">{it.slug}</div>
                  ) : null}
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
          {/* Quick actions (no outer form to avoid nested forms) */}
          <div className="flex flex-wrap gap-2 pt-1">
            {(() => {
              const current = String(order.status || "").toLowerCase();
              const nextMap: Record<string, string> = {
                pending: "confirmed",
                confirmed: "preparing",
                preparing: "out_for_delivery",
                out_for_delivery: "delivered",
              };
              const next = nextMap[current as keyof typeof nextMap];
              return (
                <>
                  {next ? (
                    <form action={updateOrderStatus} className="inline">
                      <input type="hidden" name="order_id" value={order.id} />
                      <input type="hidden" name="next_status" value={next} />
                      <button
                        type="submit"
                        className="inline-flex items-center rounded border border-brand px-3 py-1 text-sm text-brand hover:bg-brand hover:text-white"
                      >
                        Mark {next.replaceAll("_", " ")}
                      </button>
                    </form>
                  ) : null}
                  {current !== "delivered" && current !== "cancelled" ? (
                    <CancelDialog orderId={order.id} />
                  ) : null}
                </>
              );
            })()}
          </div>

          {/* Manual change */}
          <form action={updateOrderStatus} className="space-y-2">
            <input type="hidden" name="order_id" value={order.id} />
            <label className="block text-sm font-medium">Set status</label>
            <select
              name="next_status"
              defaultValue={order.status}
              className="w-full rounded border px-2 py-1 text-sm"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="out_for_delivery">Out for delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <textarea
              name="note"
              placeholder="Note (optional)"
              className="w-full rounded border px-2 py-1 text-sm"
              rows={2}
            />
            <button
              type="submit"
              className="inline-flex items-center rounded border border-brand px-3 py-1 text-sm text-brand hover:bg-brand hover:text-white"
            >
              Save status
            </button>
          </form>

          <hr />
          <div className="pt-1">
            <div className="font-medium">Status history</div>
            {events.length === 0 ? (
              <div className="text-xs text-neutral-600">No status changes yet.</div>
            ) : (
              <ul className="mt-1 space-y-1 text-xs">
                {events.map((e, i) => (
                  <li key={i} className="flex justify-between gap-3">
                    <span>
                      {e.from_status ? e.from_status.replaceAll("_", " ") : "(initial)"} → {e.to_status.replaceAll("_", " ")}
                      {e.note ? <span className="text-neutral-600"> — {e.note}</span> : null}
                    </span>
                    <span className="text-neutral-500">{new Date(e.created_at).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
