import "./globals.css";
import type { Metadata } from "next";
import Header from "./components/Header";
import { baseMetadata } from "@/lib/seo";

export const metadata: Metadata = baseMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">
        {/* Global storefront header; Header hides itself on /admin */}
        <Header />
        {children}
      </body>
    </html>
  );
}