import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE } from "@/lib/env";
import { verifyAdminSessionCookie } from "@/lib/auth/admin";

export const metadata = {
  title: "Admin — Temurun",
  description: "Basic admin dashboard to manage orders and products (coming soon).",
};

export default async function AdminPage() {
  const store = await cookies();
  const token = store.get(ADMIN_SESSION_COOKIE)?.value;
  const ok = verifyAdminSessionCookie(token);
  if (!ok) redirect("/admin/sign-in");

  return (
    <section className="space-y-4">
      <p className="text-neutral-600">
        This is a placeholder. In later milestones you will be able to:
      </p>
      <ul className="list-disc pl-5 text-neutral-700">
        <li>View new orders and update their status.</li>
        <li>View and edit products (limited fields at first).</li>
        <li><a href="/admin/orders" className="underline">View orders</a></li>
        <li><a href="/admin/products" className="underline">View products</a></li>
        <li><a href="/admin/settings" className="underline">Settings</a></li>
      </ul>
      <p className="text-sm text-neutral-500">
        Admin MVP is planned for Milestone 5.
      </p>
    </section>
  );
}
