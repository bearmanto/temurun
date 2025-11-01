export default function Loading() {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <div className="h-6 w-40 rounded bg-neutral-200 animate-pulse" />
        <div className="h-4 w-24 rounded bg-neutral-200 animate-pulse" />
      </div>
      <div className="h-40 rounded border animate-pulse" />
    </section>
  );
}