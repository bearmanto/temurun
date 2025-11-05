// Lightweight time helpers for Asia/Jakarta (UTC+7) without external deps.
// We build boundaries at local JKT midnight and convert to UTC ISO strings for DB filters.

const JKT_TZ = "+07:00"; // Asia/Jakarta is UTC+7 with no DST

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function isoAtJktMidnight(y: number, m: number, d: number) {
  // Construct a time at JKT midnight and return its UTC ISO string
  return new Date(`${y}-${pad2(m)}-${pad2(d)}T00:00:00${JKT_TZ}`).toISOString();
}

function toJktParts(dateUTC: Date) {
  // Shift the instant by +7h then read UTC fields to get JKT calendar parts
  const shifted = new Date(dateUTC.getTime() + 7 * 3600 * 1000);
  return {
    y: shifted.getUTCFullYear(),
    m: shifted.getUTCMonth() + 1,
    d: shifted.getUTCDate(),
  };
}

function fmtYYYYMM(y: number, m: number) {
  return `${y}-${pad2(m)}`;
}

export type RangeResult = {
  fromISO: string; // inclusive
  toISO: string; // exclusive
  fromMonth: string; // YYYY-MM (JKT)
  toMonth: string; // YYYY-MM (JKT)
};

export function monthRangeFromParamsJKT(from?: string, to?: string): RangeResult {
  const now = new Date();
  const { y, m } = toJktParts(now);

  const fallbackFromMonth = fmtYYYYMM(y, m); // current month in JKT
  const fromMonth = normalizeMonth(from) || fallbackFromMonth;
  const toMonth = normalizeMonth(to) || fromMonth; // default same month

  const [fy, fm] = fromMonth.split("-").map((n) => parseInt(n, 10));
  const [ty, tm] = toMonth.split("-").map((n) => parseInt(n, 10));

  const fromISO = isoAtJktMidnight(fy, fm, 1);
  // first day of the next month in JKT
  const nextMonthY = tm === 12 ? ty + 1 : ty;
  const nextMonthM = tm === 12 ? 1 : tm + 1;
  const toISO = isoAtJktMidnight(nextMonthY, nextMonthM, 1);

  return { fromISO, toISO, fromMonth, toMonth };
}

export function presetRangeJKT(preset?: string): RangeResult {
  const now = new Date();
  const { y, m, d } = toJktParts(now);

  if (preset === "last-month") {
    const pmY = m === 1 ? y - 1 : y;
    const pmM = m === 1 ? 12 : m - 1;
    const fromISO = isoAtJktMidnight(pmY, pmM, 1);
    const toISO = isoAtJktMidnight(y, m, 1); // this month's start (exclusive)
    return { fromISO, toISO, fromMonth: fmtYYYYMM(pmY, pmM), toMonth: fmtYYYYMM(y, m) };
  }

  if (preset === "last-30-days") {
    const todayStart = new Date(`${y}-${pad2(m)}-${pad2(d)}T00:00:00${JKT_TZ}`);
    const to = new Date(todayStart);
    to.setUTCDate(to.getUTCDate() + 1); // start of tomorrow JKT (exclusive)
    const from = new Date(todayStart);
    from.setUTCDate(from.getUTCDate() - 30); // 30 days back

    const fromParts = toJktParts(from);
    const toMinus1 = new Date(to.getTime() - 1);
    const toParts = toJktParts(toMinus1);

    return {
      fromISO: from.toISOString(),
      toISO: to.toISOString(),
      fromMonth: fmtYYYYMM(fromParts.y, fromParts.m),
      toMonth: fmtYYYYMM(toParts.y, toParts.m),
    };
  }

  // default: this-month
  const fromISO = isoAtJktMidnight(y, m, 1);
  const nextMonthY = m === 12 ? y + 1 : y;
  const nextMonthM = m === 12 ? 1 : m + 1;
  const toISO = isoAtJktMidnight(nextMonthY, nextMonthM, 1);
  return { fromISO, toISO, fromMonth: fmtYYYYMM(y, m), toMonth: fmtYYYYMM(y, m) };
}

function normalizeMonth(v?: string) {
  if (!v) return "";
  return /^\d{4}-\d{2}$/.test(v.trim()) ? v : "";
}