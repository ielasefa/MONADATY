"use client";

import { useState, useEffect } from "react";

type KpiCardData = {
  title: string;
  value: string;
  trend: string;
  trendDir: "up" | "down" | "neutral";
  icon: string;
};

type Props = {
  cards: KpiCardData[];
};

function AnimatedNumber({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    let raf: number;
    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setDisplay(Math.round(value * (1 - Math.pow(2, -10 * progress))));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{display}</>;
}

function parseNumericValue(val: string): number {
  const cleaned = val.replace(/[^0-9.]/g, "");
  return parseFloat(cleaned) || 0;
}

export function KpiCards({ cards }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
      {cards.map((card, i) => {
        const numericValue = parseNumericValue(card.value);
        const isNumeric = !isNaN(numericValue) && card.value.replace(/[^0-9.]/g, "").length > 0;
        const suffix = card.value.includes("DH") ? " DH" : "";

        return (
          <div
            key={card.title}
            className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-surface p-5 transition-all duration-300 hover:border-gold/20 hover:shadow-lg hover:shadow-gold/5 animate-fade-in"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">{card.icon}</span>
                {card.trend && (
                  <span
                    className={`flex items-center gap-0.5 text-[0.6rem] font-medium ${
                      card.trendDir === "up"
                        ? "text-white/80"
                        : card.trendDir === "down"
                          ? "text-burgundy"
                          : "text-white/50"
                    }`}
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={
                        card.trendDir === "up"
                          ? "rotate-0"
                          : card.trendDir === "down"
                            ? "rotate-180"
                            : ""
                      }
                    >
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                    {card.trend}
                  </span>
                )}
              </div>
              <p className="mt-3 text-[0.6rem] font-medium uppercase tracking-[0.15em] text-white/50">
                {card.title}
              </p>
              <p className="mt-1 font-display text-xl font-semibold tracking-tight text-white">
                {isNumeric ? (
                  <>
                    <AnimatedNumber value={numericValue} />
                    {suffix}
                  </>
                ) : (
                  card.value
                )}
              </p>
            </div>

                      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gold/[0.04] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
          </div>
        );
      })}
    </div>
  );
}

export function KpiCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border border-white/[0.06] bg-surface p-5">
          <div className="mb-3 h-3 w-8 rounded bg-white/5" />
          <div className="mb-2 h-2 w-16 rounded bg-white/5" />
          <div className="h-6 w-24 rounded bg-white/5" />
        </div>
      ))}
    </div>
  );
}
