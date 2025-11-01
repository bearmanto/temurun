

export function ProductsSkeleton() {
  const cells = Array.from({ length: 6 });
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {cells.map((_, i) => (
        <div key={i} className="overflow-hidden rounded border bg-card">
          <div className="aspect-square w-full bg-neutral-200 animate-pulse" />
          <div className="p-3 space-y-2">
            <div className="h-4 w-2/3 rounded bg-neutral-200 animate-pulse" />
            <div className="h-4 w-1/3 rounded bg-neutral-200 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProductPageSkeleton() {
  return (
    <section className="space-y-4">
      <div className="grid gap-6 sm:grid-cols-[1fr_320px]">
        <div>
          <div className="aspect-square w-full rounded border bg-neutral-200 animate-pulse" />
          <div className="mt-3 flex gap-2">
            <div className="size-16 rounded border bg-neutral-200 animate-pulse" />
            <div className="size-16 rounded border bg-neutral-200 animate-pulse" />
            <div className="size-16 rounded border bg-neutral-200 animate-pulse" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-6 w-2/3 rounded bg-neutral-200 animate-pulse" />
          <div className="h-5 w-24 rounded bg-neutral-200 animate-pulse" />
          <div className="h-24 w-full rounded bg-neutral-200 animate-pulse" />
          <div className="h-10 w-36 rounded bg-neutral-200 animate-pulse" />
        </div>
      </div>
    </section>
  );
}