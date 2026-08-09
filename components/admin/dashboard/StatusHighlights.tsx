"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { ProductImage } from "@/components/ProductImage";
import { EASE, Panel, SectionHeading, AnimatedNumber } from "./ui";
import { IconChart, IconTrophy, IconLayers, IconChevronRight } from "./icons";

type Props = {
  pendingOrders: number;
  processingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  paidOrders: number;
  refundedOrders: number;
  totalOrders: number;
  averageOrderValue: number;
  bestSellingProduct: { id: string; name: string; qty: number; total: number; image: string } | null;
  bestCollection: { name: string; revenue: number; orders: number } | null;
};

const STATUS_ITEMS = [
  { key: "pending", tone: "text-amber-400", dot: "bg-amber-400", href: "/admin/orders?status=pending" },
  { key: "processing", tone: "text-blue-400", dot: "bg-blue-400", href: "/admin/orders?status=processing" },
  { key: "delivered", tone: "text-emerald-400", dot: "bg-emerald-400", href: "/admin/orders?status=delivered" },
  { key: "cancelled", tone: "text-[var(--rouge)]", dot: "bg-[var(--rouge)]", href: "/admin/orders?status=cancelled" },
] as const;

export function StatusHighlights(props: Props) {
  const { t } = useTranslation("admin");
  const reduce = useReducedMotion();
  const paidPct = props.totalOrders > 0 ? (props.paidOrders / props.totalOrders) * 100 : 0;
  const refundPct = props.totalOrders > 0 ? (props.refundedOrders / props.totalOrders) * 100 : 0;

  return (
    <div className="space-y-4">
      <SectionHeading title={t("orders_status_title", "Orders at a glance")} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border-b border-white/[0.06] bg-white/[0.03] sm:grid-cols-4">
            {STATUS_ITEMS.map((s, i) => {
              const value = props[`${s.key}Orders` as keyof Props] as number;
              const pct = props.totalOrders > 0 ? (value / props.totalOrders) * 100 : 0;
              return (
                <motion.div
                  key={s.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: EASE, delay: reduce ? 0 : 0.05 * i }}
                >
                  <Link
                    href={s.href}
                    className="flex h-full flex-col gap-2 bg-bg/60 p-5 transition-colors duration-200 hover:bg-white/[0.02]"
                  >
                    <span className={`inline-flex items-center gap-1.5 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-white/45`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden />
                      {t(`status_${s.key}`, s.key)}
                    </span>
                    <span className={`font-display text-2xl font-semibold tracking-tight ${s.tone}`}>
                      <AnimatedNumber value={value} />
                    </span>
                    <span className="text-[0.62rem] text-white/30">{pct.toFixed(0)}%</span>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <div className="flex flex-col gap-1 px-6 py-5 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between text-[0.64rem] uppercase tracking-[0.16em] text-white/45">
                <span>{t("paid_orders", "Paid Orders")}</span>
                <span className="text-emerald-400">{paidPct.toFixed(0)}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500/70 to-emerald-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${paidPct}%` }}
                  transition={{ duration: 0.9, ease: EASE, delay: reduce ? 0 : 0.2 }}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between text-[0.64rem] uppercase tracking-[0.16em] text-white/45">
                <span>{t("refunded", "Refunded")}</span>
                <span className="text-[var(--rouge)]">{refundPct.toFixed(0)}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                <motion.div
                  className="h-full rounded-full bg-[#C1121F]/70"
                  initial={{ width: 0 }}
                  animate={{ width: `${refundPct}%` }}
                  transition={{ duration: 0.9, ease: EASE, delay: reduce ? 0 : 0.3 }}
                />
              </div>
            </div>
          </div>
        </Panel>

        <Panel className="flex flex-col justify-between overflow-hidden">
          <div className="px-5 py-5">
            <p className="text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-white/45">
              {t("highlights", "Highlights")}
            </p>

            <div className="mt-4 divide-y divide-white/[0.06]">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE, delay: reduce ? 0 : 0.04 }}
                className="flex items-center gap-3 py-3 first:pt-0"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-gold/80">
                  <IconChart className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[0.58rem] uppercase tracking-[0.14em] text-white/35">{t("avg_order_value", "Avg Order Value")}</p>
                  <p className="mt-0.5 text-sm font-semibold text-white">{props.averageOrderValue.toFixed(2)} DH</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE, delay: reduce ? 0 : 0.08 }}
                className="flex items-center gap-3 py-3"
              >
                {props.bestSellingProduct ? (
                  <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-white/[0.07] bg-black/30">
                    <ProductImage
                      product={props.bestSellingProduct}
                      alt={props.bestSellingProduct.name}
                      fill
                      sizes="40px"
                      className="object-contain p-1"
                    />
                  </span>
                ) : (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-gold/80">
                    <IconTrophy className="h-4 w-4" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-[0.58rem] uppercase tracking-[0.14em] text-white/35">{t("best_selling", "Best Selling")}</p>
                  <p className="mt-0.5 truncate text-[0.8rem] font-semibold text-white">{props.bestSellingProduct?.name ?? "—"}</p>
                  {props.bestSellingProduct && (
                    <p className="mt-0.5 text-[0.62rem] text-white/38">
                      {props.bestSellingProduct.qty} {t("sold_label", "sold")} · {props.bestSellingProduct.total.toFixed(2)} DH
                    </p>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE, delay: reduce ? 0 : 0.12 }}
                className="flex items-center gap-3 py-3 pb-0"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-gold/80">
                  <IconLayers className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.58rem] uppercase tracking-[0.14em] text-white/35">{t("best_collection", "Best Collection")}</p>
                  <p className="mt-0.5 truncate text-[0.8rem] font-semibold text-white">{props.bestCollection?.name ?? "—"}</p>
                  {props.bestCollection && (
                    <p className="mt-0.5 text-[0.62rem] text-white/38">
                      {props.bestCollection.orders} {t("orders_label", "orders")} · {props.bestCollection.revenue.toFixed(2)} DH
                    </p>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
          <Link
            href="/admin/reports"
            className="mx-6 mb-5 inline-flex items-center gap-1 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-gold transition-colors hover:text-gold/80"
          >
            {t("reports_center", "Reports Center")}
            <IconChevronRight className="h-3 w-3 rtl:rotate-180" />
          </Link>
        </Panel>
      </div>
    </div>
  );
}
