"use client";

import { useEffect, useState } from "react";

export default function Toast({
  kind = "success",
  message,
  timeout = 3000,
}: {
  kind?: "success" | "error" | "info";
  message: string;
  timeout?: number;
}) {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), timeout);
    return () => clearTimeout(t);
  }, [timeout]);
  if (!show || !message) return null;

  const base = "fixed right-4 top-4 z-50 rounded-md px-3 py-2 shadow-lg text-sm";
  const styles =
    kind === "error"
      ? "bg-red-600 text-white"
      : kind === "info"
      ? "bg-neutral-900 text-white"
      : "bg-green-600 text-white";

  return (
    <div className={`${base} ${styles}`} role="status" aria-live="polite">
      {message}
    </div>
  );
}
