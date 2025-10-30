import type { Metadata } from "next";
import CheckoutForm from "@/app/components/CheckoutForm";
import { getSupabase } from "@/lib/supabase/server";
import { fetchProductBySlug } from "@/lib/queries/products";
import { formatIDR } from "@/lib/types";

export const metadata: Metadata = {
  title: "Checkout — Temurun",
  description: "Provide your delivery details and confirm your order.",
};

type ServerResult =
  | { ok: true; code: string; waUrl: string }
  | { ok: false; error: string };

async function placeOrder(_: unknown, formData: FormData): Promise<ServerResult> {
  "use server";

  const sb = getSupabase();
  if (!sb) return { ok: false, error: "Supabase is not configured." };

  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const notes = String(formData.get("notes") || "").trim();
  const cartJson = String(formData.get("cart") || "[]");

  if (!name || !phone || !address) {
    return { ok: false, error: "Please fill name, phone, and address." };
  }

  let items: { slug: string; qty: number }[] = [];
  try {
    items = JSON.parse(cartJson);
  } catch {
    return { ok: false, error: "Invalid cart data." };
  }

  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }

  // Validate & price using server-side data
  const validated: {
    id: string; slug: string; name: string; price: number; qty: number;
  }[] = [];

  for (const it of items) {
    if (!it?.slug || !it?.qty || it.qty <= 0) {
      return { ok: false, error: "Invalid cart item." };
    }
    const p = await fetchProductBySlug(it.slug);
    if (!p) {
      return { ok: false, error: `Product not found: ${it.slug}` };
    }
    validated.push({
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price,
      qty: it.qty,
    });
  }

  const subtotal = validated.reduce((sum, v) => sum + v.price * v.qty, 0);
  const total = subtotal; // delivery TBA

  // Insert order
  const { data: orderRow, error: orderErr } = await sb
    .from("orders")
    .insert({
      customer_name: name,
      phone,
      address,
      notes,
      subtotal,
      total,
      status: "pending",
    })
    .select("id, code")
    .single();

  if (orderErr || !orderRow) {
    return { ok: false, error: "Failed to create order. Please try again." };
  }

  // Insert items
  const orderItems = validated.map((v) => ({
    order_id: orderRow.id,
    product_id: v.id,
    slug: v.slug,
    name: v.name,
    price: v.price,
    qty: v.qty,
  }));

  const { error: itemsErr } = await sb.from("order_items").insert(orderItems);
  if (itemsErr) {
    return { ok: false, error: "Failed to save order items." };
  }

  // Build WhatsApp message
  const lines = validated
    .map((v) => `${v.qty}× ${v.name} — ${formatIDR(v.price * v.qty)}`)
    .join("\n");

  const msg = [
    `Order ${orderRow.code}`,
    lines,
    `Total: ${formatIDR(total)}`,
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Address: ${address}`,
    notes ? `Notes: ${notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;

  return { ok: true, code: orderRow.code as string, waUrl };
}

export default function CheckoutPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <p className="text-neutral-600">
        Manual confirmation: after submitting, you’ll get a WhatsApp link to confirm your order.
      </p>

      <CheckoutForm action={placeOrder} />
    </section>
  );
}
