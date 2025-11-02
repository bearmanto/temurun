"use client";

import { useMemo, useRef, useState } from "react";

export type ImageItem = {
  id: string;
  src: string; // resolved public URL
  url: string; // storage key (for display only)
  sort: number;
};

type Props = {
  productId: string;
  items: ImageItem[];
  onReorder: (payload: { productId: string; ids: string[] }) => Promise<void>;
  onSetCover: (payload: { productId: string; imageId: string }) => Promise<void>;
};

export default function ImageListClient({ productId, items, onReorder, onSetCover }: Props) {
  const initial = useMemo(() => items.slice().sort((a, b) => a.sort - b.sort), [items]);
  const [order, setOrder] = useState(initial.map((it) => it.id));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // HTML5 drag & drop
  const dragFrom = useRef<number | null>(null);

  const byId = useMemo(() => new Map(items.map((it) => [it.id, it])), [items]);
  const changed = useMemo(() => order.join("|") !== initial.map((it) => it.id).join("|"), [order, initial]);

  function handleDragStart(index: number) {
    dragFrom.current = index;
  }

  function handleDragOver(e: React.DragEvent<HTMLButtonElement>) {
    e.preventDefault(); // allow drop
  }

  function handleDrop(index: number) {
    const from = dragFrom.current;
    dragFrom.current = null;
    if (from == null || from === index) return;
    setOrder((prev) => {
      const next = prev.slice();
      const [moved] = next.splice(from, 1);
      next.splice(index, 0, moved);
      return next;
    });
  }

  async function saveOrder() {
    try {
      setSaving(true);
      setMessage(null);
      await onReorder({ productId, ids: order });
      setMessage("Order saved");
    } catch (e) {
      setMessage("Failed to save order");
    } finally {
      setSaving(false);
    }
  }

  async function makeCover(id: string) {
    try {
      setSaving(true);
      setMessage(null);
      await onSetCover({ productId, imageId: id });
      setMessage("Cover updated");
    } catch (e) {
      setMessage("Failed to update cover");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-2 rounded border bg-card p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-neutral-700">Drag thumbnails to reorder (first = cover).</div>
        <div className="flex items-center gap-2">
          {message && <span className="text-xs text-neutral-600">{message}</span>}
          <button
            type="button"
            onClick={saveOrder}
            disabled={!changed || saving}
            className="rounded border border-brand px-3 py-1 text-xs text-brand disabled:opacity-50 hover:bg-brand hover:text-white"
          >
            {saving ? "Saving…" : "Save order"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {order.map((id, index) => {
          const it = byId.get(id)!;
          return (
            <div key={id} className="relative">
              <button
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(index)}
                className={`h-16 w-16 overflow-hidden rounded border ${index === 0 ? "ring-2 ring-brand" : ""}`}
                aria-label={`Drag to position ${index + 1}`}
                title={index === 0 ? "Cover image" : "Drag to reorder"}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.src} alt="" className="h-full w-full object-cover" />
              </button>
              <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-black/30 p-0.5">
                <button
                  type="button"
                  onClick={() => makeCover(id)}
                  className="rounded bg-white/90 px-1 text-[10px] leading-4 text-neutral-900 hover:bg-white"
                  title="Set as cover"
                >
                  Cover
                </button>
                <span className="rounded bg-white/90 px-1 text-[10px] leading-4 text-neutral-700">{index + 1}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
