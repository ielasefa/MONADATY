"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AdminDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin dashboard error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-16">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
         </svg>
       </div>
        <h2 className="font-display text-2xl text-white">Dashboard failed</h2>
        <p className="mt-3 text-sm text-white/55">
          We couldn&apos;t load your dashboard data. This is usually a temporary connection issue.
       </p>
        {error.digest ? (
          <p className="mt-3 font-mono text-[0.65rem] text-white/30">
            Error ref: {error.digest}
         </p>
        ) : null}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={reset}
            className="btn-primary h-11 rounded-lg bg-gold px-6 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-black transition hover:bg-gold/90"
          >
            Try again
         </button>
          <Link
            href="/admin/dashboard"
            className="btn-secondary h-11 rounded-lg border border-white/[0.06] bg-card px-6 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/70 transition hover:bg-surface hover:text-white"
          >
            Reload page
         </Link>
       </div>
     </div>
   </div>
  );
}