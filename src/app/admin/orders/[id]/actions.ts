"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSupabase } from "@/lib/supabase/admin";

/**
 * Server Action: Update an order's status with safe transitions + audit trail.
 * Flow: pending → confirmed → preparing → out_for_delivery → delivered
 * You may move to cancelled at any step. Accepts US/UK spellings.
 */
export async function updateOrderStatus(formData: FormData) {
  const orderId = String(formData.get("order_id") || "").trim();
  const rawNext = String(formData.get("next_status") || "").trim().toLowerCase();
  const nextStatus = rawNext === "canceled" ? "cancelled" : rawNext; // normalize
  const note = String(formData.get("note") || "").slice(0, 500);

  if (nextStatus === "cancelled" && !note.trim()) {
    redirect(`/admin/orders/${orderId}?err=${encodeURIComponent("Cancellation requires a note")}`);
  }

  if (!orderId || !nextStatus) {
    redirect(`/admin/orders/${orderId}?err=${encodeURIComponent("Missing order_id or next_status")}`);
  }

  const sb = getAdminSupabase();
  if (!sb) {
    redirect(`/admin/orders/${orderId}?err=${encodeURIComponent("Admin client unavailable")}`);
  }

  // 1) Load current status
  const { data: orderRow, error: orderErr } = await sb!
    .from("orders")
    .select("id, status")
    .eq("id", orderId)
    .maybeSingle();

  if (orderErr || !orderRow) {
    redirect(`/admin/orders/${orderId}?err=${encodeURIComponent("Order not found")}`);
  }

  const current = String(orderRow!.status || "").toLowerCase();

  // 2) Validate transition
  const transitions: Record<string, string[]> = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["preparing", "cancelled"],
    preparing: ["out_for_delivery", "cancelled"],
    out_for_delivery: ["delivered", "cancelled"],
    delivered: [],
    cancelled: [],
    canceled: [], // tolerate legacy spelling
  };

  const allowed = transitions[current] || [];
  const isSame = nextStatus === current;
  if (!isSame && !allowed.includes(nextStatus)) {
    redirect(
      `/admin/orders/${orderId}?err=${encodeURIComponent(
        `Illegal transition from ${current || "(blank)"} to ${nextStatus}`
      )}`
    );
  }

  // 3) Update order
  const { error: updateErr } = await sb!
    .from("orders")
    .update({ status: nextStatus })
    .eq("id", orderId);

  if (updateErr) {
    redirect(`/admin/orders/${orderId}?err=${encodeURIComponent("Failed to update order status")}`);
  }

  // 4) Append audit event (best-effort)
  await sb!
    .from("order_status_events")
    .insert({ order_id: orderId, from_status: current, to_status: nextStatus, note: note || null });

  // 5) Revalidate and redirect back with a success flag
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  redirect(`/admin/orders/${orderId}?ok=1`);
}
