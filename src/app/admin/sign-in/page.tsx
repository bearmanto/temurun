

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { verifyPasscode, setAdminSession } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Admin — Sign in",
  description: "Enter the admin passcode to continue.",
};

async function signIn(formData: FormData) {
  "use server";

  const pass = String(formData.get("passcode") || "");
  const next = String(formData.get("next") || "/admin");

  const ok = verifyPasscode(pass);
  if (!ok) {
    redirect(`/admin/sign-in?error=1&next=${encodeURIComponent(next)}`);
  }

  await setAdminSession();
  // only allow redirecting to /admin paths
  const safeNext = next.startsWith("/admin") ? next : "/admin";
  redirect(safeNext);
}

export default async function AdminSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const next = sp?.next || "/admin";
  const hasError = Boolean(sp?.error);

  return (
    <section className="mx-auto max-w-md space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Admin sign in</h1>
        <p className="text-neutral-600">Enter the passcode to access the admin.</p>
      </header>

      {hasError && (
        <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          Incorrect passcode. Please try again.
        </div>
      )}

      <form action={signIn} className="space-y-3 rounded border bg-card p-4">
        <input type="hidden" name="next" value={next} />
        <div>
          <label className="block text-sm font-medium">Passcode</label>
          <input
            type="password"
            name="passcode"
            required
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="••••••••"
            autoFocus
          />
        </div>
        <button
          type="submit"
          className="rounded border border-brand px-4 py-2 text-brand hover:bg-brand hover:text-white"
        >
          Sign in
        </button>
      </form>
    </section>
  );
}