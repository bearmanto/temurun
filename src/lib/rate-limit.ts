// Minimal, DB-backed rate limiter for Server Actions (admin sign-in, checkout, etc.)
// Uses Supabase tables and works in Node (App Router). If the table is missing, it
// fails open (does not block) to avoid breaking flows.

import { getAdminSupabase } from "@/lib/supabase/admin";
import { getSupabase } from "@/lib/supabase/server";
import { headers as nextHeaders } from "next/headers";

export type RateLimitArgs = {
  action: string; // e.g., 'admin_signin', 'checkout_submit'
  ip: string; // caller IP (X-Forwarded-For first hop)
  limit: number; // max attempts allowed in window
  windowSeconds: number; // rolling window in seconds
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number; // present when blocked
};

function sb() {
  return getAdminSupabase() || getSupabase();
}

export async function getClientIp(): Promise<string> {
  const h = await nextHeaders();
  const xff = h.get("x-forwarded-for");
  const real = h.get("x-real-ip");
  const ip = (xff ? xff.split(",")[0].trim() : "") || real || "0.0.0.0";
  return ip;
}

/** Returns { allowed, remaining, retryAfterSeconds }. If allowed, records the attempt. */
export async function checkRateLimit({ action, ip, limit, windowSeconds }: RateLimitArgs): Promise<RateLimitResult> {
  const client = sb();
  if (!client) return { allowed: true, remaining: limit };

  const sinceISO = new Date(Date.now() - windowSeconds * 1000).toISOString();

  try {
    // 1) Count attempts in window
    const { count } = await client
      .from("rate_limit_events")
      .select("id", { count: "exact", head: true })
      .eq("action", action)
      .eq("ip", ip)
      .gte("created_at", sinceISO);

    const attempts = typeof count === "number" ? count : 0;

    // 2) Blocked? Compute retryAfterSeconds ~= time until window slides past oldest hit
    if (attempts >= limit) {
      const { data: oldestRows } = await client
        .from("rate_limit_events")
        .select("created_at")
        .eq("action", action)
        .eq("ip", ip)
        .gte("created_at", sinceISO)
        .order("created_at", { ascending: true })
        .limit(1);

      let retryAfterSeconds = windowSeconds; // worst case fallback
      if (oldestRows && oldestRows[0]?.created_at) {
        const oldest = new Date(oldestRows[0].created_at as string).getTime();
        const elapsedMs = Date.now() - oldest;
        const remainMs = windowSeconds * 1000 - Math.max(0, elapsedMs);
        retryAfterSeconds = Math.max(1, Math.ceil(remainMs / 1000));
      }
      return { allowed: false, remaining: 0, retryAfterSeconds };
    }

    // 3) Allowed → record this attempt (best-effort)
    await client.from("rate_limit_events").insert({ action, ip });

    return { allowed: true, remaining: Math.max(0, limit - attempts - 1) };
  } catch {
    // Table missing or any error → fail open
    return { allowed: true, remaining: limit };
  }
}
