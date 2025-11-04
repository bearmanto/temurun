"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductGallery({
  images,
  name,
}: {
  images?: string[];
  name: string;
}) {
  // Only keep truthy, trimmed URLs
  const cleaned = (images || []).map((u) => (u || "").trim()).filter(Boolean);
  const slides = cleaned.length ? cleaned : ["/placeholders/product.svg"];

  const [index, setIndex] = useState(0);
  const safeIndex = Math.max(0, Math.min(index, slides.length - 1));
  const currentSrc = slides[safeIndex] || "/placeholders/product.svg";

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-square w-full rounded border border-line bg-neutral-100">
        <Image
          src={currentSrc}
          alt={name}
          fill
          sizes="(min-width: 1024px) 600px, (min-width: 768px) 480px, 100vw"
          className="object-cover rounded"
          priority={false}
        />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2">
        {slides.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            aria-label={`Show image ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-12 w-12 overflow-hidden rounded border border-line ${i === safeIndex ? "ring-2 ring-brand" : ""}`}
          >
            <Image
              src={src || "/placeholders/product.svg"}
              alt=""
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
