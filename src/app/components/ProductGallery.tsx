"use client";

import { useState } from "react";

export default function ProductGallery({
  images,
  name,
}: {
  images?: string[];
  name: string;
}) {
  const slides = images && images.length ? images : ["", "", ""];
  const [index, setIndex] = useState(0);
  const safeIndex = Math.max(0, Math.min(index, slides.length - 1));
  const hasImage = Boolean(slides[safeIndex]);

  return (
    <div className="space-y-3">
      <div className="aspect-square w-full rounded border bg-neutral-100 flex items-center justify-center">
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={slides[safeIndex] as string}
            alt={name}
            className="h-full w-full object-cover rounded"
          />
        ) : (
          <span className="text-neutral-400 text-sm">Image coming soon</span>
        )}
      </div>
      <div className="flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Show image ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-12 w-12 rounded border bg-neutral-100 ${
              i === safeIndex ? "ring-2 ring-brand" : ""
            }`}
          />
        ))}
      </div>
    </div>
  );
}
