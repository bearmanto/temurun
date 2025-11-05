import { formatIDR } from "@/lib/types";

/**
 * WhatsApp Click to Chat uses `https://wa.me/<number>?text=...`.
 * Number must be in international format (E.164-like): digits only, no '+', spaces, dashes, or brackets,
 * 8–15 digits max. See WhatsApp docs + ITU E.164.
 */
export function normalizePhoneForWa(input: string): string {
  return String(input || "").replace(/[^\d]/g, "");
}

/** E.164-like check: 8–15 digits, cannot start with 0. */
const E164_LIKE = /^[1-9]\d{7,14}$/;

export function isLikelyValidWaNumber(input: string): boolean {
  const n = normalizePhoneForWa(input);
  return E164_LIKE.test(n);
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

/** Build a wa.me URL with a prefilled message (URL-encoded). */
export function buildWaUrl(rawNumber: string, message: string): string {
  const number = normalizePhoneForWa(rawNumber);
  const encoded = encodeURIComponent(message || "");
  // Only include phone segment if it looks valid by E.164 rules (digits-only, 8–15, no leading 0)
  if (E164_LIKE.test(number)) {
    return `https://wa.me/${number}?text=${encoded}`;
  }
  // Fallback: omit phone segment (lets WhatsApp/Web prompt the user). Still prefill text.
  return `https://wa.me?text=${encoded}`;
}
