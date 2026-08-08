"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { IconArrowUp, IconArrowDown, IconEmpty } from "./icons";

export const EASE = [0.16, 1, 0.3, 1] as const;

/* ── Number count-up ─────────────────────────────────────────── */
export function AnimatedNumber({
  value,
  format,
  duration = 900,
}: {
  value: number;
  format?: (n: number) => string;
  duration?: number;
}) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    let start: number | null = null;
    const animate = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration, reduce]);

  return <>{format ? format(display) : Math.round(display).toLocaleString()}</>;
}

/* ── Panel (card) ────────────────────────────────────────────── */
export function Panel({
  children,
  className = "",
  hover = true,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE, delay }}
      className={`rounded-xl border border-white/[0.06] bg-surface ${
        hover
          ? "transition-colors duration-300 hover:border-gold/20"
          : ""
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ── Section heading with gold tick ──────────────────────────── */
export function SectionHeading({
  title,
  action,
  className = "",
}: {
  title: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-end justify-between gap-4 ${className}`}>
      <div className="flex items-center gap-2.5">
        <span className="h-3.5 w-px bg-gold/60" aria-hidden />
        <h2 className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white/70">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

/* ── Trend pill ──────────────────────────────────────────────── */
export function TrendPill({
  value,
  suffix = "",
  positive,
}: {
  value: number;
  suffix?: string;
  positive?: boolean;
}) {
  const up = positive ?? value >= 0;
  const isNeutral = Math.abs(value) < 0.05 && suffix === "";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.66rem] font-semibold ${
        isNeutral
          ? "bg-white/[0.05] text-white/40"
          : up
            ? "bg-emerald-500/10 text-emerald-400"
            : "bg-[rgba(110,31,42,0.12)] text-[var(--rouge)]"
      }`}
    >
      {!isNeutral &&
        (up ? <IconArrowUp className="h-3 w-3" strokeWidth={2} /> : <IconArrowDown className="h-3 w-3" strokeWidth={2} />)}
      {Math.abs(value).toFixed(1)}
      {suffix}
    </span>
  );
}

/* ── Status badge ────────────────────────────────────────────── */
const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/15",
  processing: "bg-blue-500/10 text-blue-400 border-blue-500/15",
  shipped: "bg-teal-500/10 text-teal-400 border-teal-500/15",
  out_for_delivery: "bg-purple-500/10 text-purple-400 border-purple-500/15",
  delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/15",
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/15",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/15",
  refunded: "bg-red-500/10 text-red-400 border-red-500/15",
  paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/15",
};

const STATUS_DOT: Record<string, string> = {
  pending: "bg-amber-400",
  processing: "bg-blue-400",
  shipped: "bg-teal-400",
  out_for_delivery: "bg-purple-400",
  delivered: "bg-emerald-400",
  completed: "bg-emerald-400",
  cancelled: "bg-red-400",
  refunded: "bg-red-400",
  paid: "bg-emerald-400",
};

export function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.12em] ${
        STATUS_STYLE[status] ?? "border-white/[0.08] bg-white/[0.04] text-white/60"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status] ?? "bg-white/40"}`}
        aria-hidden
      />
      {label}
    </span>
  );
}

/* ── Empty state ─────────────────────────────────────────────── */
export function EmptyState({
  icon = <IconEmpty className="h-6 w-6" />,
  title,
  description,
  cta,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.03] text-gold/70">
        {icon}
      </div>
      <p className="text-sm font-medium text-white/85">{title}</p>
      <p className="mt-1 max-w-[30ch] text-xs leading-relaxed text-muted">{description}</p>
      {cta && (
        <Link
          href={cta.href}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-white/70 transition-colors duration-200 hover:border-gold/30 hover:text-gold"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}

/* ── Mini sparkline (pure SVG, no deps) ──────────────────────── */
export function Sparkline({
  data,
  className = "",
  color = "currentColor",
}: {
  data: number[];
  className?: string;
  color?: string;
}) {
  const reduce = useReducedMotion();
  if (!data || data.length < 2) return null;
  const w = 96;
  const h = 30;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (w - 2) + 1;
    const y = h - 2 - ((v - min) / range) * (h - 6);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const id = `spark-${color.replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={className}
      aria-hidden
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`1,${h - 1} ${pts.join(" ")} ${w - 1},${h - 1}`}
        fill={`url(#${id})`}
        opacity={reduce ? 0 : 1}
      />
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Skeleton primitives ─────────────────────────────────────── */
export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-white/[0.05] ${className}`} />;
}
