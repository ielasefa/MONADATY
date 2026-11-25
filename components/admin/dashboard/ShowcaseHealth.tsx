"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useTranslation } from "@/hooks/useTranslation";
import { EASE, Panel, SectionHeading, EmptyState } from "./ui";
import { IconLayers, IconAlert, IconCheck, IconChevronRight } from "./icons";

function ProgressBar({
  value,
  max,
  tone,
  delay,
  reduce,
}: {
  value: number;
  max: number;
  tone: string;
  delay: number;
  reduce: boolean | null;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
      <motion.div
        className={`h-full rounded-full ${tone}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.9, ease: EASE, delay: reduce ? 0 : delay }}
      />
    </div>
  );
}

export function ShowcaseHealth({
  showcaseStats,
  showcaseCollections,
  lowStockProducts,
}: {
  showcaseStats: { configuredCollections: number; configuredProducts: number; totalCollections: number };
  showcaseCollections: { id: string; name: string; configured: number }[];
  lowStockProducts: { id: string; name: string; stock?: number }[];
}) {
  const { t } = useTranslation("admin");
  const reduce = useReducedMotion();
  const allConfigured = showcaseStats.totalCollections > 0 && showcaseStats.configuredCollections === showcaseStats.totalCollections;

  return (
    <div className="space-y-4">
      <SectionHeading title={t("showcase_and_stock", "Showcase & Stock")} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Collection showcase */}
        <Panel className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <div className="flex items-center gap-2.5">
              <IconLayers className="h-4 w-4 text-accent" />
              <h3 className="text-sm font-semibold text-foreground">{t("collection_showcase", "Collection Showcase")}</h3>
            </div>
            <Link
              href="/admin/collections-showcase"
              className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-accent transition-colors hover:text-accent"
            >
              {t("manage_products", "Manage")}
              <IconChevronRight className="h-3 w-3 rtl:rotate-180" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
            <div className="space-y-5">
              <div>
                <div className="flex items-baseline justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-secondary">
                    {t("configured_collections", "Configured Collections")}
                  </p>
                  <p className="font-display text-2xl font-semibold text-accent">
                    {showcaseStats.configuredCollections}
                    <span className="text-sm font-normal text-secondary"> / {showcaseStats.totalCollections}</span>
                  </p>
                </div>
                <div className="mt-2">
                  <ProgressBar
                    value={showcaseStats.configuredCollections}
                    max={showcaseStats.totalCollections}
                    tone="bg-gradient-to-r from-gold/70 to-gold"
                    delay={0.15}
                    reduce={reduce}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-secondary">
                    {t("featured_products", "Featured Products")}
                  </p>
                  <p className="font-display text-2xl font-semibold text-foreground">{showcaseStats.configuredProducts}</p>
                </div>
                <div className="mt-2">
                  <ProgressBar
                    value={showcaseStats.configuredProducts}
                    max={showcaseStats.totalCollections * 3}
                    tone="bg-surface"
                    delay={0.3}
                    reduce={reduce}
                  />
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] ${
                  allConfigured
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
                    : "border-amber-500/20 bg-amber-500/10 text-amber-700"
                }`}
              >
                {allConfigured ? <IconCheck className="h-3 w-3" /> : <IconAlert className="h-3 w-3" />}
                {allConfigured ? t("all_collections_configured", "All collections configured") : t("showcase_incomplete", "Showcase incomplete")}
              </span>
            </div>

            <div className="space-y-2">
              {showcaseCollections.length === 0 && (
                <EmptyState
                  title={t("collection_showcase_empty", "No collections configured")}
                  description={t("collection_showcase_empty_desc", "Pick and order featured products for each collection.")}
                />
              )}
              {showcaseCollections.slice(0, 6).map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: EASE, delay: reduce ? 0 : 0.06 * i }}
                >
                  <Link
                    href="/admin/collections-showcase"
                    className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-2.5 transition-colors duration-200 hover:border-gold/25"
                  >
                    <span className="truncate text-sm font-medium text-foreground">{c.name}</span>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.12em] ${
                        c.configured === 3
                          ? "bg-emerald-500/10 text-emerald-700"
                          : c.configured > 0
                            ? "bg-amber-500/10 text-amber-700"
                            : "bg-surface text-secondary"
                      }`}
                    >
                      {c.configured} / 3
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </Panel>

        {/* Low stock */}
        <Panel>
          <div className="flex items-center gap-2.5 border-b border-line px-6 py-4">
            <IconAlert className="h-4 w-4 text-[var(--rouge)]" />
            <h3 className="text-sm font-semibold text-foreground">{t("low_stock_products", "Low Stock")}</h3>
          </div>

          <div className="p-6">
            {lowStockProducts.length === 0 ? (
              <EmptyState
                title={t("no_low_stock", "Stock looks healthy")}
                description={t("no_low_stock_desc", "No products are running low on stock.")}
              />
            ) : (
              <>
                <div className="space-y-3">
                  {lowStockProducts.map((p, i) => {
                    const stock = p.stock ?? 0;
                    const critical = stock === 0;
                    return (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, ease: EASE, delay: reduce ? 0 : 0.06 * i }}
                        className="flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                          <div className="mt-1.5 w-28">
                            <ProgressBar
                              value={Math.min(stock, 5)}
                              max={5}
                              tone={critical ? "bg-[#C1121F]" : stock <= 2 ? "bg-amber-400" : "bg-emerald-400"}
                              delay={0.2 + 0.05 * i}
                              reduce={reduce}
                            />
                          </div>
                        </div>
                        <span
                          className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                            critical
                              ? "bg-[rgba(110,31,42,0.15)] text-[var(--rouge)]"
                              : stock <= 2
                                ? "bg-amber-500/10 text-amber-700"
                                : "bg-emerald-500/10 text-emerald-700"
                          }`}
                        >
                          {stock} {t("left_label", "left")}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
                <Link
                  href="/admin/products"
                  className="mt-5 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-accent transition-colors hover:text-accent"
                >
                  {t("restock_products", "Restock products")}
                  <IconChevronRight className="h-3 w-3 rtl:rotate-180" />
                </Link>
              </>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
