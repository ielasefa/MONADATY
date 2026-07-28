"use client";

import { useRouter } from "next/navigation";

/**
 * MONADATY monogram + wordmark for the admin auth screens.
 * Dark chip with a red→yellow gradient, clickable to return to the storefront.
 */
export function AdminLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const router = useRouter();
  const dims =
    size === "lg" ? "h-16 w-16" : size === "sm" ? "h-10 w-10" : "h-14 w-14";
  const text =
    size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";

  return (
    <button
      type="button"
      onClick={() => router.push("/")}
      aria-label="MONADATY — back to store"
      className="group mx-auto flex flex-col items-center gap-3 outline-none"
    >
      <div
        className={`relative flex ${dims} items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-red/30 via-red/10 to-yellow/20 transition-transform duration-200 group-hover:scale-105`}
      >
        <span className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_60%)]" />
        <span className={`relative font-display ${text} font-bold leading-none text-gold`}>
          M
        </span>
      </div>
      <span className="font-display text-xl font-bold uppercase tracking-[0.35em] text-gold transition-colors group-hover:text-gold/70">
        MONADATY
      </span>
    </button>
  );
}
