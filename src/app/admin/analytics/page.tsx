import { getAnalytics } from "@/lib/queries/analytics";
import { formatIDR } from "@/lib/types";
import { monthRangeFromParamsJKT, presetRangeJKT } from "@/lib/time";

// Next 16: Dynamic APIs (searchParams) are async — accept a Promise and await it.
// https://nextjs.org/docs/messages/sync-dynamic-apis
export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; preset?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const sort = sp?.sort === "qty" ? "qty" : "revenue";

  const usePreset = !!sp?.preset;
  const { fromISO, toISO, fromMonth, toMonth } = usePreset
    ? presetRangeJKT(sp!.preset)
    : monthRangeFromParamsJKT(sp!.from, sp!.to);

  const data = await getAnalytics({ fromISO, toISO });
  const topProducts = [...data.topProducts].sort((a, b) =>
    sort === "qty" ? b.qty - a.qty : b.revenue - a.revenue
  );

  return (
    <section className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Analytics</h1>
          <p className="text-sm text-neutral-600">
            {fromMonth} → {toMonth} (Asia/Jakarta)
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          {/* Presets */}
          <a href={`/admin/analytics?preset=this-month&sort=${sort}`} className="rounded border px-2 py-1 text-sm">This month</a>
          <a href={`/admin/analytics?preset=last-month&sort=${sort}`} className="rounded border px-2 py-1 text-sm">Last month</a>
          <a href={`/admin/analytics?preset=last-30-days&sort=${sort}`} className="rounded border px-2 py-1 text-sm">Last 30 days</a>
          {/* Sort toggle */}
          <span className="mx-1 text-neutral-400">|</span>
          {(() => {
            const base = sp?.preset ? `?preset=${encodeURIComponent(sp.preset || "")}` : `?from=${fromMonth}&to=${toMonth}`;
            return (
              <span className="text-sm">
                Sort:
                <a href={`/admin/analytics${base}&sort=revenue`} className={`ml-2 rounded border px-2 py-1 ${sort === "revenue" ? "bg-black text-white" : ""}`}>Revenue</a>
                <a href={`/admin/analytics${base}&sort=qty`} className={`ml-2 rounded border px-2 py-1 ${sort === "qty" ? "bg-black text-white" : ""}`}>Qty</a>
              </span>
            );
          })()}
        </div>
        <form method="get" action="/admin/analytics" className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col">
            <label htmlFor="from" className="text-xs text-neutral-600">From</label>
            <input id="from" name="from" type="month" defaultValue={fromMonth} className="rounded border px-2 py-1" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="to" className="text-xs text-neutral-600">To</label>
            <input id="to" name="to" type="month" defaultValue={toMonth} className="rounded border px-2 py-1" />
          </div>
          <input type="hidden" name="sort" value={sort} />
          <button className="rounded bg-black px-3 py-1 text-white" type="submit">Apply</button>
        </form>
      </header>

      {/* KPI tiles */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Kpi title="Orders" value={String(data.orders)} />
        <Kpi title="Revenue" value={formatIDR(data.revenue)} />
        <Kpi title="AOV" value={formatIDR(data.aov)} />
      </div>

      {/* Status summary */}
      <div className="rounded border bg-white p-4">
        <div className="mb-2 font-medium">Status summary</div>
        {Object.keys(data.byStatus).length === 0 ? (
          <div className="text-sm text-neutral-600">No orders in this range.</div>
        ) : (
          <table className="w-full table-fixed text-sm">
            <thead>
              <tr className="text-left">
                <th className="w-1/2 px-2 py-1">Status</th>
                <th className="w-1/2 px-2 py-1">Count</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data.byStatus).map(([s, c]) => (
                <tr key={s} className="border-t">
                  <td className="px-2 py-1 capitalize">{s.replaceAll("_", " ")}</td>
                  <td className="px-2 py-1">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Top products */}
      <div className="rounded border bg-white p-4">
        <div className="mb-2 font-medium">Top products (by {sort === "qty" ? "quantity" : "revenue"})</div>
        {topProducts.length === 0 ? (
          <div className="text-sm text-neutral-600">No items sold in this range.</div>
        ) : (
          <table className="w-full table-fixed text-sm">
            <thead>
              <tr className="text-left">
                <th className="w-1/2 px-2 py-1">Product</th>
                <th className="w-1/4 px-2 py-1">Qty</th>
                <th className="w-1/4 px-2 py-1">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p) => (
                <tr key={p.name} className="border-t">
                  <td className="px-2 py-1">{p.name}</td>
                  <td className="px-2 py-1">{p.qty}</td>
                  <td className="px-2 py-1">{formatIDR(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded border bg-white p-4">
      <div className="text-xs text-neutral-600">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
