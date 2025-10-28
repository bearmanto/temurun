export const metadata = {
  title: "Admin — Temurun",
  description: "Basic admin dashboard to manage orders and products (coming soon).",
};

export default function AdminPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <p className="text-neutral-600">
        This is a placeholder. In later milestones you will be able to:
      </p>
      <ul className="list-disc pl-5 text-neutral-700">
        <li>View new orders and update their status.</li>
        <li>View and edit products (limited fields at first).</li>
      </ul>
      <p className="text-sm text-neutral-500">
        Admin MVP is planned for Milestone 5.
      </p>
    </section>
  );
}
