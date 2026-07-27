"use client";

import { Confetti } from "@/components/Confetti";

export function SuccessClient() {
  return (
    <>
      <Confetti particleCount={80} />

      {/* Success checkmark — red as the primary brand action color */}
      <div
        className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-burgundy/15 bg-burgundy/[0.05] text-burgundy"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-11 w-11"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>
    </>
  );
}
