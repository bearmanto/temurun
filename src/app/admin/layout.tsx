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
    <div className="mx-auto max-w-screen-xl px-4 py-6">
      <AdminHeader />
      <main id="main" tabIndex={-1} className="pt-2" role="main">
        {children}
      </main>
    </div>
  );
}