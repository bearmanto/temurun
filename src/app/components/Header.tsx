"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCartStore, selectCount } from "@/lib/store/cart";
import MiniCart from "./MiniCart";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  const [open, setOpen] = useState(false); // mobile nav
  const [miniOpen, setMiniOpen] = useState(false); // mini cart
  const count = useCartStore(selectCount);

  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) {
        setMiniOpen(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setMiniOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  useEffect(() => {
    // Close menus when the route changes
    setOpen(false);
    setMiniOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur supports-[backdrop-filter]:bg-bg/60">
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
            <span aria-hidden="true">
              <span className="mb-1 block h-0.5 w-5 bg-current" />
              <span className="mb-1 block h-0.5 w-5 bg-current" />
              <span className="block h-0.5 w-5 bg-current" />
            </span>
          </button>

          <nav className="hidden gap-4 sm:flex items-center" ref={wrapRef} aria-label="Primary">
            <Link href="/#products" className="hover:text-brand">
              Products
            </Link>
            <div className="relative">
              <button
                type="button"
                className="hover:text-brand inline-flex items-center gap-1"
                aria-expanded={miniOpen}
                aria-haspopup="dialog"
                onClick={() => setMiniOpen((v) => !v)}
              >
                Cart
                {count > 0 && (
                  <span className="ml-0.5 inline-flex items-center justify-center rounded-full bg-brand px-1.5 py-0.5 text-[11px] leading-none text-white">
                    {count}
                  </span>
                )}
              </button>

              {miniOpen && (
                <div className="absolute right-0 top-full z-50 mt-2">
                  <MiniCart onClose={() => setMiniOpen(false)} />
                </div>
              )}
            </div>

            <Link href="/checkout" className="hover:text-brand">
              Checkout
            </Link>
            <Link href="/admin" className="hover:text-brand">
              Admin
            </Link>
          </nav>
        </div>

        {open && (
          <nav className="sm:hidden border-t" aria-label="Primary mobile">
            <div className="mx-auto max-w-screen-md px-4 py-2">
              <ul className="flex flex-col">
                <li>
                  <Link
                    href="/#products"
                    className="block py-2"
                    onClick={() => setOpen(false)}
                  >
                    Products
                  </Link>
                </li>
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
    </>
  );
}
