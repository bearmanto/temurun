import AdminHeader from "./components/AdminHeader";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Consistent container + header on every admin page
  return (
    <div className="mx-auto max-w-screen-md px-4 py-6">
      <AdminHeader />
      <div className="pt-2">{children}</div>
    </div>
  );
}