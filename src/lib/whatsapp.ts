import { formatIDR } from "@/lib/types";

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
