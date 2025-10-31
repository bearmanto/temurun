import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrderByCode } from "@/lib/queries/orders";
import { formatIDR } from "@/lib/types";
import { WA_NUMBER } from "@/lib/env";
import ConfirmWhatsAppButton from "@/app/components/ConfirmWhatsAppButton";

type Params = { code: string };

function buildWhatsAppUrl(order: {
  code: string;
  items: { name: string; price: number; qty: number }[];
  total: number;
  customer_name: string;
  phone: string;
  address: string;
  notes?: string;
}) {
  const lines = order.items
    .map((it) => `${it.qty}× ${it.name} — ${formatIDR(it.price * it.qty)}`)
    .join("\n");

  const msg = [
    `Order ${order.code}`,
    lines,
    `Total: ${formatIDR(order.total)}`,
    `Name: ${order.customer_name}`,
    `Phone: ${order.phone}`,
    `Address: ${order.address}`,
    order.notes ? `Notes: ${order.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const number = String(WA_NUMBER || "+6281111111").replace(/[^\d]/g, "");
  const waBase = number ? `https://wa.me/${number}` : "https://wa.me";
  return `${waBase}?text=${encodeURIComponent(msg)}`;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { code } = await params;
  return { title: `Order ${code} — Temurun` };
}

export default async function OrderSummaryPage({ params }: { params: Promise<Params> }) {
  const { code } = await params;
  const order = await getOrderByCode(code);

  if (!order) return notFound();

  const waUrl = buildWhatsAppUrl({
    code: order.code,
    items: order.items.map((it) => ({ name: it.name, price: it.price, qty: it.qty })),
    total: order.total,
    customer_name: order.customer_name,
    phone: order.phone,
    address: order.address,
    notes: order.notes,
  });

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Order {order.code}</h1>
        <p className="text-neutral-600">Thank you! Review your order and confirm via WhatsApp.</p>
      </header>

      <div className="grid gap-6 sm:grid-cols-[1fr_320px]">
        <div className="rounded border p-4 bg-card">
          <div className="font-medium mb-2">Items</div>
          <ul className="divide-y">
            {order.items.map((it) => (
              <li key={it.id} className="flex items-center justify-between py-2">
                <div className="text-sm">
                  {it.qty}× {it.name}
                </div>
                <div className="text-sm font-medium">{formatIDR(it.price * it.qty)}</div>
              </li>
            ))}
          </ul>
        </div>

        <aside className="rounded border p-4 bg-card space-y-2 text-sm">
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

          <div className="pt-2">
            <ConfirmWhatsAppButton waUrl={waUrl} />
          </div>
        </aside>
      </div>
    </section>
  );
}
