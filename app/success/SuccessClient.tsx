"use client";

import { Confetti } from "@/components/Confetti";

export function SuccessClient() {
  return (
    <>
      <Confetti particleCount={50} />

      {/* Success checkmark — minimal icon */}
      <div
        className="relative mx-auto flex h-24 w-24 items-center justify-center border border-burgundy/15"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-10 w-10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6L9 17l-5-5" />
      </svg>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-px w-16 bg-burgundy/40" />
    </div>
   </>
  );
}
