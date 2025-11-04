import { getAnalytics } from "@/lib/queries/analytics";
import { formatIDR } from "@/lib/types";

// Next 16: Dynamic APIs (searchParams) are async — accept a Promise and await it.
// https://nextjs.org/docs/messages/sync-dynamic-apis
export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const { fromISO, toISO, fromMonth, toMonth } = monthRangeFromParams(sp.from, sp.to);

  const data = await getAnalytics({ fromISO, toISO });

  return (
    <section className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Analytics</h1>
          <p className="text-sm text-neutral-600">
            {fromMonth} → {toMonth} (UTC ISO range)
          </p>
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
        <div className="mb-2 font-medium">Top products (by revenue)</div>
        {data.topProducts.length === 0 ? (
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
              {data.topProducts.map((p) => (
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

function monthRangeFromParams(from?: string, to?: string) {
  const now = new Date();

  const fromMonth = normalizeMonth(from) || fmtYYYYMM(new Date(now.getFullYear(), now.getMonth(), 1));
  const toMonth = normalizeMonth(to) || fromMonth; // default to same month

  const [fy, fm] = fromMonth.split("-").map((n) => parseInt(n, 10));
  const [ty, tm] = toMonth.split("-").map((n) => parseInt(n, 10));

  const fromDate = new Date(fy, fm - 1, 1);
  const toDate = new Date(ty, tm - 1 + 1, 1); // first day of next month (exclusive)

  return {
    fromISO: fromDate.toISOString(),
    toISO: toDate.toISOString(),
    fromMonth,
    toMonth,
  };
}

function normalizeMonth(v?: string) {
  if (!v) return "";
  // expect YYYY-MM
  const m = /^\d{4}-\d{2}$/.exec(v.trim());
  return m ? v : "";
}

function fmtYYYYMM(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded border bg-white p-4">
      <div className="text-xs text-neutral-600">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
