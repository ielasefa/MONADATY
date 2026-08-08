"use client";

import { Confetti } from "@/components/Confetti";
import { useEffect, useState, useRef } from "react";

export function SuccessClient() {
  const [hasDrawn, setHasDrawn] = useState(false);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const tm = setTimeout(() => setHasDrawn(true), 300);
    return () => clearTimeout(tm);
  }, []);

  return (
    <>
      <Confetti particleCount={50} />

      <div className="relative mx-auto flex">
        <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gold/[0.06] animate-pulse" />

          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="relative h-12 w-12 text-gold"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              className="stroke-white/[0.08]"
              strokeWidth="0.8"
            />
            <path
              ref={pathRef}
              d="M8 12.5l2.5 2.5 5.5-5.5"
              style={{
                strokeDasharray: 16,
                strokeDashoffset: hasDrawn ? 0 : 16,
                transition: "stroke-dashoffset 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
          </svg>
        </div>
      </div>
    </>
  );
}
