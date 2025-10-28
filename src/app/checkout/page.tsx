export const metadata = {
  title: "Checkout — Temurun",
  description: "Provide your delivery details and confirm your order.",
};

export default function CheckoutPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <p className="text-neutral-600">
        Manual confirmation flow: once you submit your order (coming soon), we
        will reach out via WhatsApp to confirm details and delivery.
      </p>

      {/* Form placeholder (disabled for now) */}
      <form className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="Your name"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium">WhatsApp number</label>
          <input
            type="tel"
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="+62..."
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Address</label>
          <textarea
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="Delivery address"
            rows={3}
            disabled
          />
        </div>

        <button
          type="button"
          className="rounded border px-4 py-2"
          disabled
          aria-disabled="true"
        >
          Submit order (coming soon)
        </button>
      </form>
    </section>
  );
}
