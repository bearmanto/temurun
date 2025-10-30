"use client";

import Link from "next/link";
import { useState } from "react";
import { useCartStore, selectCount } from "@/lib/store/cart";

export default function Header() {
  const [open, setOpen] = useState(false);
  const count = useCartStore(selectCount);

  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-screen-md items-center justify-between px-4">
        <Link href="/" className="font-semibold tracking-tight">
          Temurun
        </Link>

        <button
          type="button"
          aria-label="Toggle menu"
          className="sm:hidden inline-flex items-center justify-center rounded px-2 py-1"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="i-[--icon]" aria-hidden="true">
            {/* simple hamburger using spans to avoid external icons */}
            <span className="block h-0.5 w-5 bg-current mb-1" />
            <span className="block h-0.5 w-5 bg-current mb-1" />
            <span className="block h-0.5 w-5 bg-current" />
          </span>
        </button>

        <nav className="hidden gap-4 sm:flex">
          <Link href="/cart" className="hover:text-brand inline-flex items-center gap-1">
            Cart
            {count > 0 && (
              <span className="ml-0.5 inline-flex items-center justify-center rounded-full bg-brand px-1.5 py-0.5 text-[11px] leading-none text-white">
                {count}
              </span>
            )}
          </Link>
          <Link href="/checkout" className="hover:text-brand">
            Checkout
          </Link>
          <Link href="/admin" className="hover:text-brand">
            Admin
          </Link>
        </nav>
      </div>

      {open && (
        <nav className="sm:hidden border-t">
          <div className="mx-auto max-w-screen-md px-4 py-2">
            <ul className="flex flex-col">
              <li>
                <Link
                  href="/cart"
                  className="block py-2"
                  onClick={() => setOpen(false)}
                >
                  Cart {count > 0 ? `(${count})` : ""}
                </Link>
              </li>
              <li>
                <Link
                  href="/checkout"
                  className="block py-2"
                  onClick={() => setOpen(false)}
                >
                  Checkout
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="block py-2"
                  onClick={() => setOpen(false)}
                >
                  Admin
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      )}
    </header>
  );
}
