"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
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
        data-accent={kpi.accent || undefined}
        className="admin-kpi-card group relative flex h-full flex-col overflow-hidden p-5 transition-colors duration-200"
      >
        <div className="flex items-center justify-between">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
              kpi.accent
                ? "bg-gold/15 text-accent"
                : "bg-surface text-secondary"
            }`}
          >
            {kpi.icon}
          </span>
          {kpi.spark ? (
            <Sparkline
              data={kpi.spark}
              className="h-7 w-12 shrink-0 opacity-60 transition-opacity duration-300 group-hover:opacity-100 sm:w-24"
              color={kpi.accent ? "currentColor" : "#7A7670"}
            />
          ) : (
            <span className="h-7" aria-hidden />
          )}
        </div>

        <p className="admin-kpi-label mt-4 text-sm font-medium text-secondary">
          {kpi.label}
        </p>
        <p
          className="admin-kpi-value mt-2 leading-tight tracking-tight"
        >
          <AnimatedNumber value={kpi.value} format={kpi.format} />
        </p>

        <div className="mt-3 flex items-center gap-2">
          {kpi.trendValue !== undefined && (
            <TrendPill value={kpi.trendValue} suffix={kpi.trendSuffix} positive={kpi.trendPositive} />
          )}
          {kpi.trendLabel && (
            <span className="text-xs text-secondary">{kpi.trendLabel}</span>
          )}
        </div>

        <div className="pointer-events-none absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-gold/[0.18] via-gold/[0.05] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </Link>
    </motion.div>
  );
}

export function KpiGrid({ kpis }: { kpis: Kpi[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {kpis.map((kpi, i) => (
        <KpiCard key={kpi.key} kpi={kpi} index={i} />
      ))}
    </div>
  );
}
