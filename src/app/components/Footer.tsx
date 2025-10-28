import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-screen-md px-4 py-6 text-sm text-neutral-600">
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <p>&copy; {year} Temurun. All rights reserved.</p>
          <nav className="flex gap-4">
            <Link href="/admin" className="hover:underline">
              Admin
            </Link>
            <Link href="https://wa.me/" target="_blank" className="hover:underline">
              WhatsApp
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
