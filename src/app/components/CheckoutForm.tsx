"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useCartStore, selectItems } from "@/lib/store/cart";

type ServerResult =
  | { ok: true; code: string; waUrl: string }
  | { ok: false; error: string };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="rounded border border-brand px-4 py-2 text-brand hover:bg-brand hover:text-white disabled:opacity-60"
      disabled={pending}
    >
      {pending ? "Processing…" : "Submit order"}
    </button>
  );
}

export default function CheckoutForm({
  action,
}: {
  action: (prevState: unknown, formData: FormData) => Promise<ServerResult>;
}) {
  const items = useCartStore(selectItems);
  const [state, formAction] = useActionState<ServerResult, FormData>(action, { ok: false, error: "" } as any);

  // Clear cart on success
  useEffect(() => {
    if (state && "ok" in state && state.ok) {
      useCartStore.getState().clear();
    }
  }, [state]);

  const hasItems = items.length > 0;

  return (
    <div className="grid gap-6 sm:grid-cols-[1fr_320px]">
      <form action={formAction} className="space-y-4 max-w-xl">
        <input type="hidden" name="cart" value={JSON.stringify(items.map(({ slug, qty }) => ({ slug, qty })))} />

        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            name="name"
            type="text"
            required
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">WhatsApp number</label>
          <input
            name="phone"
            type="tel"
            required
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="+62..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Address</label>
          <textarea
            name="address"
            required
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="Delivery address"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Notes (optional)</label>
          <textarea
            name="notes"
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="Any special requests?"
            rows={2}
          />
        </div>

        <SubmitButton />
      </form>

      <aside className="rounded border p-4 bg-card space-y-2 text-sm">
        <div className="font-medium">Order summary</div>
        {!hasItems && <div className="text-neutral-600">Your cart is empty.</div>}
        {hasItems && (
          <ul className="list-disc pl-5 text-neutral-700">
            {items.map((it) => (
              <li key={it.id}>
                {it.qty}× {it.name}
              </li>
            ))}
          </ul>
        )}

        {state && "error" in state && state.error && (
          <div className="mt-2 rounded border border-red-300 bg-red-50 px-3 py-2 text-red-700">
            {state.error}
          </div>
        )}

        {state && "ok" in state && state.ok && (
          <div className="mt-2 space-y-2">
            <div className="rounded border border-green-300 bg-green-50 px-3 py-2 text-green-800">
              Order created — code <span className="font-mono">{state.code}</span>
            </div>
            <a
              href={state.waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded border border-brand px-3 py-1 text-brand hover:bg-brand hover:text-white"
            >
              Confirm via WhatsApp
            </a>
          </div>
        )}
      </aside>
    </div>
  );
}
