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

/** Returns { allowed, remaining }. If allowed, records the attempt. */
export async function checkRateLimit({ action, ip, limit, windowSeconds }: RateLimitArgs) {
  const client = sb();
  if (!client) return { allowed: true, remaining: limit };

  const sinceISO = new Date(Date.now() - windowSeconds * 1000).toISOString();

  try {
    // Count attempts in window (use head:true for count-only request)
    const { count } = await client
      .from("rate_limit_events")
      .select("id", { count: "exact", head: true })
      .eq("action", action)
      .eq("ip", ip)
      .gte("created_at", sinceISO);

    const attempts = typeof count === "number" ? count : 0;
    if (attempts >= limit) return { allowed: false, remaining: 0 };

    // Record this attempt (best-effort)
    await client.from("rate_limit_events").insert({ action, ip });

    return { allowed: true, remaining: Math.max(0, limit - attempts - 1) };
  } catch {
    // Table missing or any error → fail open
    return { allowed: true, remaining: limit };
  }
}
