export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number; // in IDR
  image?: string; // optional image URL (we'll wire real images later)
  is_new?: boolean; // optional "New" badge
}

/** Format number to Indonesian Rupiah (no cents). */
export function formatIDR(amount: number): string {
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `Rp${Math.round(amount).toLocaleString("id-ID")}`;
  }
}