import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Temurun",
  description: "Simple personal commerce site — products, cart, checkout, and admin.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}