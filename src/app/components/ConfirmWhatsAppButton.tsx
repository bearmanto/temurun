"use client";

import { useCartStore } from "@/lib/store/cart";

export default function ConfirmWhatsAppButton({ waUrl }: { waUrl: string }) {
  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        // Clear cart when user proceeds to WhatsApp
        useCartStore.getState().clear();
      }}
      className="inline-block rounded border border-brand px-3 py-1 text-brand hover:bg-brand hover:text-white"
    >
      Confirm via WhatsApp
    </a>
  );
}