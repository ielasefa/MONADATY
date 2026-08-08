"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import type { StoredOrder } from "@/types";
import type { CustomerInfo } from "@/lib/customers";
import { EASE, Panel, SectionHeading, StatusBadge, EmptyState } from "./ui";
import { IconBag, IconTrophy, IconUser, IconChevronRight } from "./icons";

const AVATAR_COLORS = [
  "bg-gold/15 text-gold",
  "bg-emerald-500/15 text-emerald-400",
  "bg-blue-500/15 text-blue-400",
  "bg-purple-500/15 text-purple-400",
  "bg-[rgba(110,31,42,0.15)] text-[var(--rouge)]",
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

function avatarClass(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function OrdersActivity({
  latestOrders,
  topProducts,
  latestCustomers,
}: {
  latestOrders: StoredOrder[];
  topProducts: { id: string; name: string; qty: number; total: number }[];
  latestCustomers: CustomerInfo[];
}) {
  const { t } = useTranslation("admin");
  const reduce = useReducedMotion();

  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
  };

  return (
    <div className="space-y-4">
      <SectionHeading title={t("recent_activity", "Recent Activity")} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Latest orders */}
        <Panel className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <div className="flex items-center gap-2.5">
              <IconBag className="h-4 w-4 text-gold" />
              <h3 className="text-sm font-semibold text-white">{t("latest_orders", "Latest Orders")}</h3>
            </div>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-gold transition-colors hover:text-gold/80"
            >
              {t("view_all", "View all")}
              <IconChevronRight className="h-3 w-3 rtl:rotate-180" />
            </Link>
          </div>

          <div className="divide-y divide-white/[0.05]">
            {latestOrders.length === 0 && (
              <EmptyState
                title={t("no_orders_yet", "No orders yet")}
                description={t("no_orders_yet_desc", "Orders will appear here once your customers start purchasing.")}
              />
            )}
            {latestOrders.map((o, i) => (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: EASE, delay: reduce ? 0 : 0.05 * i }}
              >
                <Link
                  href={`/admin/orders/${o.id}`}
                  className="group flex items-center gap-4 px-6 py-3.5 transition-colors duration-200 hover:bg-white/[0.02]"
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[0.68rem] font-semibold ${avatarClass(o.customerName)}`}
                  >
                    {initials(o.customerName)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white group-hover:text-gold">
                      {o.customerName}
                    </p>
                    <p className="font-mono text-[0.68rem] text-muted">{o.orderNumber}</p>
                  </div>
                  <span className="hidden text-[0.68rem] text-muted sm:block">{fmtDate(o.createdAt)}</span>
                  <StatusBadge status={o.orderStatus} label={t(`status_${o.orderStatus}`, o.orderStatus.replace(/_/g, " "))} />
                  <p className="w-20 shrink-0 text-end text-sm font-semibold text-white">{o.total}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </Panel>

        {/* Top products */}
        <Panel>
          <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-6 py-4">
            <IconTrophy className="h-4 w-4 text-gold" />
            <h3 className="text-sm font-semibold text-white">{t("top_selling_products", "Top Selling")}</h3>
          </div>

          <div className="px-6 py-4">
            {topProducts.length === 0 && (
              <EmptyState
                title={t("no_products_yet", "No sales yet")}
                description={t("no_products_yet_desc", "Your best sellers will be ranked here.")}
              />
            )}
            <div className="space-y-4">
              {topProducts.map((p, i) => {
                const max = topProducts[0]?.qty || 1;
                const pct = Math.max(4, (p.qty / max) * 100);
                return (
                  <motion.div
                    key={p.id || `top-${i}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: EASE, delay: reduce ? 0 : 0.06 * i }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[0.64rem] font-bold ${
                            i === 0 ? "bg-gold/20 text-gold" : "bg-white/[0.05] text-white/50"
                          }`}
                        >
                          {i + 1}
                        </span>
                        <span className="truncate text-[0.8rem] font-medium text-white">{p.name}</span>
                      </div>
                      <span className="shrink-0 text-[0.72rem] font-semibold text-muted">
                        {p.qty} {t("sold_label", "sold")}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-gold/70 to-gold"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: EASE, delay: reduce ? 0 : 0.2 + 0.08 * i }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </Panel>
      </div>

      {/* Latest customers */}
      <Panel hover={false} className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <IconUser className="h-4 w-4 text-gold" />
            <h3 className="text-sm font-semibold text-white">{t("latest_customers", "Latest Customers")}</h3>
          </div>
          <Link
            href="/admin/customers"
            className="inline-flex items-center gap-1 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-gold transition-colors hover:text-gold/80"
          >
            {t("view_all", "View all")}
            <IconChevronRight className="h-3 w-3 rtl:rotate-180" />
          </Link>
        </div>

        {latestCustomers.length === 0 ? (
          <EmptyState
            title={t("no_customers_yet", "No customers yet")}
            description={t("no_customers_yet_desc", "New customers will be listed here.")}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start">
              <thead>
                <tr className="border-b border-white/[0.05] text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white/35">
                  <th className="px-6 py-3 text-start font-semibold">{t("customer", "Customer")}</th>
                  <th className="hidden px-6 py-3 text-start font-semibold md:table-cell">{t("location", "Location")}</th>
                  <th className="px-6 py-3 text-end font-semibold">{t("orders_label", "Orders")}</th>
                  <th className="px-6 py-3 text-end font-semibold">{t("total_spent", "Total Spent")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {latestCustomers.map((c) => (
                  <tr key={c.email} className="transition-colors duration-150 hover:bg-white/[0.02]">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[0.68rem] font-semibold ${avatarClass(c.name)}`}
                        >
                          {initials(c.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">{c.name}</p>
                          <p className="truncate text-[0.7rem] text-muted">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-6 py-3.5 text-[0.78rem] text-muted md:table-cell">{c.city || "—"}</td>
                    <td className="px-6 py-3.5 text-end text-[0.8rem] text-white/70">{c.totalOrders}</td>
                    <td className="px-6 py-3.5 text-end text-sm font-semibold text-gold">
                      {c.totalSpent.toFixed(2)} DH
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
