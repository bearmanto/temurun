"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function NavItem({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isRoot = href === "/admin";
  const active = isRoot ? pathname === "/admin" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={[
        "px-2.5 py-1.5 rounded",
        active ? "text-brand" : "text-neutral-700 hover:text-brand",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

export default function AdminHeader() {
  return (
    <header className="mb-4 border-b border-line pb-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <nav className="flex flex-wrap items-center gap-2 text-sm">
          <NavItem href="/admin">Home</NavItem>
          <span aria-hidden className="text-neutral-300">·</span>
          <NavItem href="/admin/orders">Orders</NavItem>
          <span aria-hidden className="text-neutral-300">·</span>
          <NavItem href="/admin/products">Products</NavItem>
          <span aria-hidden className="text-neutral-300">·</span>
          <NavItem href="/admin/settings">Settings</NavItem>
          <span aria-hidden className="text-neutral-300">·</span>
          <Link href="/admin/sign-out" className="px-2.5 py-1.5 rounded text-neutral-700 hover:text-brand">
            Sign out
          </Link>
        </nav>
      </div>
    </header>
  );
}
