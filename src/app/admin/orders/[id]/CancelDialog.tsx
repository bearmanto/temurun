"use client";

import { useEffect, useRef, useState } from "react";
import { updateOrderStatus } from "./actions";

export default function CancelDialog({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Basic focus trap (focus the first input when opening)
  useEffect(() => {
    if (open) {
      const el = dialogRef.current?.querySelector<HTMLTextAreaElement>("textarea[name='note']");
      el?.focus();
    }
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center rounded border border-red-600 px-3 py-1 text-sm text-red-600 hover:bg-red-600 hover:text-white"
      >
        Cancel
      </button>

      {open && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => {
            if (e.target === overlayRef.current) setOpen(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-title"
        >
          <div ref={dialogRef} className="w-[min(92vw,480px)] rounded-md bg-white p-4 shadow-xl">
            <div id="cancel-title" className="mb-2 text-base font-semibold">Confirm cancellation</div>
            <p className="mb-2 text-sm text-neutral-700">
              This action will mark the order as <strong>Cancelled</strong>. Please provide a note for the audit trail.
            </p>
            <form action={updateOrderStatus} className="space-y-2" onSubmit={() => setOpen(false)}>
              <input type="hidden" name="order_id" value={orderId} />
              <input type="hidden" name="next_status" value="cancelled" />
              <textarea
                name="note"
                required
                rows={3}
                placeholder="Reason for cancellation"
                className="w-full rounded border px-2 py-1 text-sm"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded border px-3 py-1 text-sm"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="rounded border border-red-600 px-3 py-1 text-sm text-red-600 hover:bg-red-600 hover:text-white"
                >
                  Confirm cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
