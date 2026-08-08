"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { AnimatedNumber, EASE, Sparkline, TrendPill } from "./ui";

export type Kpi = {
  key: string;
  label: string;
  value: number;
  format?: (n: number) => string;
  trendValue?: number;
  trendSuffix?: string;
  trendLabel?: string;
  trendPositive?: boolean;
  icon: ReactNode;
  accent?: boolean;
  spark?: number[];
  href: string;
};

function KpiCard({ kpi, index }: { kpi: Kpi; index: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE, delay: reduce ? 0 : 0.05 * index }}
    >
      <Link
        href={kpi.href}
        className={`group relative flex h-full flex-col overflow-hidden rounded-xl border p-5 transition-all duration-300 hover:-translate-y-0.5 ${
          kpi.accent
            ? "border-gold/25 bg-gradient-to-b from-gold/[0.06] to-transparent hover:border-gold/40"
            : "border-white/[0.06] bg-surface hover:border-gold/20"
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
              kpi.accent
                ? "bg-gold/15 text-gold"
                : "bg-white/[0.04] text-white/60"
            }`}
          >
            {kpi.icon}
          </span>
          {kpi.spark ? (
            <Sparkline
              data={kpi.spark}
              className="h-7 w-24 opacity-60 transition-opacity duration-300 group-hover:opacity-100"
              color={kpi.accent ? "currentColor" : "#7A7670"}
            />
          ) : (
            <span className="h-7" aria-hidden />
          )}
        </div>

        <p className="mt-4 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-muted">
          {kpi.label}
        </p>
        <p
          className={`mt-1.5 font-display text-[1.85rem] font-semibold leading-none tracking-tight ${
            kpi.accent ? "text-gold" : "text-white"
          }`}
        >
          <AnimatedNumber value={kpi.value} format={kpi.format} />
        </p>

        <div className="mt-3 flex items-center gap-2">
          {kpi.trendValue !== undefined && (
            <TrendPill value={kpi.trendValue} suffix={kpi.trendSuffix} positive={kpi.trendPositive} />
          )}
          {kpi.trendLabel && (
            <span className="text-[0.66rem] text-white/35">{kpi.trendLabel}</span>
          )}
        </div>

        <div className="pointer-events-none absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-gold/[0.18] via-gold/[0.05] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </Link>
    </motion.div>
  );
}

export function KpiGrid({ kpis }: { kpis: Kpi[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi, i) => (
        <KpiCard key={kpi.key} kpi={kpi} index={i} />
      ))}
    </div>
  );
}
