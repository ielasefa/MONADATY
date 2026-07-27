"use client";

import { useEffect, useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { StoredOrder } from "@/types";
import type { CustomerInfo } from "@/lib/customers";
import { KpiCards } from "@/components/admin/KpiCards";
import { ChartsSection } from "@/components/admin/ChartsSection";
import { QuickActions } from "@/components/admin/QuickActions";
import { useTranslation } from "@/hooks/useTranslation";

type Props = {
  totalOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  revenueThisMonth: number;
  ordersToday: number;
  ordersThisMonth: number;
  customerCount: number;
  newCustomers30Days: number;
  pendingOrders: number;
  processingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  paidOrders: number;
  refundedOrders: number;
  productCount: number;
  lowStock: number;
  lowStockProducts: { id: string; name: string; stock?: number }[];
  latestOrders: StoredOrder[];
  latestCustomers: CustomerInfo[];
  revenueChartData: { date: string; revenue: number }[];
  ordersChartData: { date: string; orders: number }[];
  topProducts: { id: string; name: string; qty: number; total: number }[];
  averageOrderValue: number;
  bestSellingProduct: string | null;
  bestCollection: string | null;
  topProductsChart: { name: string; value: number }[];
  collectionSalesData: { name: string; value: number }[];
  monthlyRevenueData: { month: string; revenue: number }[];
};

function AnimatedCounter({ value, duration = 1200 }: { value: number; duration?: number }) {
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

function StatCard({ label, value, href, accent }: { label: string; value: React.ReactNode; href: string; accent?: "gold" | "red" | "emerald" }) {
  const accentMap = {
    gold: "text-gold",
    red: "text-red",
    emerald: "text-secondary",
  };
  return (
    <motion.div
      whileHover={{ y: -4, borderColor: "rgba(212,175,55,0.15)", transition: { duration: 0.25 } }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <Link
        href={href}
        className="luxury-card group block rounded-card border border-white/[0.06] bg-card p-6 transition-all duration-300 hover:border-gold/20"
      >
        <p className="luxury-label text-[10px] text-muted">{label}</p>
        <p className={`mt-2 font-display text-3xl font-semibold tracking-tight ${accent ? accentMap[accent] : "text-white"}`}>
          {value}
        </p>
      </Link>
    </motion.div>
  );
}

export function DashboardClient(props: Props) {
  const { t } = useTranslation("admin");
  const router = useRouter();

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const kpiCards = useMemo(() => [
          { title: t("revenue_today"), value: `${props.todayRevenue.toFixed(2)} DH`, trend: props.todayRevenue > 0 ? "+" : "0", trendDir: (props.todayRevenue > 0 ? "up" : "neutral") as "up" | "down" | "neutral", icon: "\uD83D\uDCB0" },
    { title: t("revenue_this_month"), value: `${props.revenueThisMonth.toFixed(2)} DH`, trend: props.revenueThisMonth > 0 ? "+" : "0", trendDir: (props.revenueThisMonth > 0 ? "up" : "neutral") as "up" | "down" | "neutral", icon: "\uD83D\uDCC8" },
    { title: t("orders_today"), value: `${props.ordersToday}`, trend: props.ordersToday > 0 ? "+" : "0", trendDir: (props.ordersToday > 0 ? "up" : "neutral") as "up" | "down" | "neutral", icon: "\uD83D\uDCE6" },
    { title: t("orders_this_month"), value: `${props.ordersThisMonth}`, trend: props.ordersThisMonth > 0 ? "+" : "0", trendDir: (props.ordersThisMonth > 0 ? "up" : "neutral") as "up" | "down" | "neutral", icon: "\uD83D\uDCCB" },
    { title: t("total_customers"), value: `${props.customerCount}`, trend: `${props.newCustomers30Days} new`, trendDir: (props.newCustomers30Days > 0 ? "up" : "neutral") as "up" | "down" | "neutral", icon: "\uD83D\uDC65" },
    { title: t("new_customers_30d"), value: `${props.newCustomers30Days}`, trend: props.newCustomers30Days > 0 ? "+" : "0", trendDir: (props.newCustomers30Days > 0 ? "up" : "neutral") as "up" | "down" | "neutral", icon: "\uD83D\uDC4B" },
    { title: t("conversion_rate"), value: "\u2014", trend: "", trendDir: "neutral" as "up" | "down" | "neutral", icon: "\uD83D\uDD04" },
    { title: t("best_selling"), value: props.bestSellingProduct || "\u2014", trend: "", trendDir: "neutral" as "up" | "down" | "neutral", icon: "\uD83C\uDFC6" },
    { title: t("best_collection"), value: props.bestCollection || "\u2014", trend: "", trendDir: "neutral" as "up" | "down" | "neutral", icon: "\uD83D\uDCC1" },
    { title: t("avg_order_value"), value: `${props.averageOrderValue.toFixed(2)} DH`, trend: props.averageOrderValue > 0 ? `DH ${props.averageOrderValue.toFixed(0)}` : "", trendDir: "neutral" as "up" | "down" | "neutral", icon: "\uD83D\uDCCA" },
  ], [props, t]);

  const {
    revenueChartData,
    ordersChartData,
    topProductsChart,
    collectionSalesData,
    monthlyRevenueData,
    topProducts,
    latestOrders,
    latestCustomers,
    lowStockProducts,
    productCount,
    lowStock,
    paidOrders,
    refundedOrders,
    totalOrders,
    totalRevenue,
    todayRevenue,
    ordersToday,
    customerCount,
    pendingOrders,
    processingOrders,
    deliveredOrders,
    cancelledOrders,
  } = props;

  return (
    <div>
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white">{t("dashboard")}</h1>
          <p className="mt-1 text-sm text-muted">{t("overview_of_store")}</p>
        </div>
        <button
          onClick={refresh}
          className="btn-secondary h-12 rounded-button border border-white/[0.06] bg-card px-5 text-sm text-muted transition hover:bg-surface hover:text-white"
          aria-label={t("refresh_data")}
        >
          {t("refresh")}
        </button>
      </div>

      <div className="mb-10">
        <p className="luxury-label mb-4 text-[10px] text-muted">{t("key_metrics")}</p>
        <KpiCards cards={kpiCards} />
      </div>

      <div className="mb-10">
        <ChartsSection
          revenueData={revenueChartData}
          ordersData={ordersChartData}
          topProducts={topProductsChart}
          collectionSales={collectionSalesData}
          monthlyRevenue={monthlyRevenueData}
        />
      </div>

      <div className="mb-10">
        <QuickActions />
      </div>

      <div className="mb-10">
        <p className="luxury-label mb-4 text-[10px] text-muted">{t("revenue_and_orders")}</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <StatCard label={t("total_revenue")} value={<><AnimatedCounter value={totalRevenue} /> DH</>} href="/admin/orders" accent="gold" />
          <StatCard label={t("todays_revenue")} value={<><AnimatedCounter value={todayRevenue} /> DH</>} href="/admin/orders" accent="gold" />
          <StatCard label={t("orders_today")} value={<AnimatedCounter value={ordersToday} />} href="/admin/orders" accent="red" />
          <StatCard label={t("total_orders")} value={<AnimatedCounter value={totalOrders} />} href="/admin/orders" />
          <StatCard label={t("customers_count")} value={<AnimatedCounter value={customerCount} />} href="/admin/customers" accent="emerald" />
          <StatCard label={t("pending")} value={<AnimatedCounter value={pendingOrders} />} href="/admin/orders?status=pending" accent="red" />
        </div>
      </div>

      <div className="mb-10">
        <p className="luxury-label mb-4 text-[10px] text-muted">{t("order_status_title")}</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <StatCard label={t("processing")} value={<AnimatedCounter value={processingOrders} />} href="/admin/orders?status=processing" accent="gold" />
          <StatCard label={t("delivered")} value={<AnimatedCounter value={deliveredOrders} />} href="/admin/orders?status=delivered" accent="emerald" />
          <StatCard label={t("cancelled")} value={<AnimatedCounter value={cancelledOrders} />} href="/admin/orders?status=cancelled" accent="red" />
          <StatCard label={t("paid")} value={<AnimatedCounter value={paidOrders} />} href="/admin/orders" accent="emerald" />
          <StatCard label={t("refunded")} value={<AnimatedCounter value={refundedOrders} />} href="/admin/orders" accent="red" />
          <StatCard label={t("products_count")} value={<AnimatedCounter value={productCount} />} href="/admin/shop" />
        </div>
      </div>

      {topProducts.length > 0 && (
        <div className="mb-10">
          <p className="luxury-label mb-4 text-[10px] text-muted">{t("top_selling_products")}</p>
          <div className="glass rounded-card border border-white/[0.06] p-6">
            <div className="divide-y divide-white/[0.06]">
              {topProducts.map((p, i) => (
                <motion.div
                  key={p.id}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0 -mx-6 px-6"
                >
                  <div className="flex items-center gap-3">
                    <span className="badge-gold flex h-7 w-7 items-center justify-center rounded-full bg-gold/10 text-[0.65rem] font-bold text-gold">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-white">{p.name}</span>
                  </div>
                  <div className="text-right text-sm">
                    <span className="text-muted">{p.qty}{t("sold_label")}</span>
                    <span className="ml-3 font-medium text-white">{p.total.toFixed(2)} DH</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {latestOrders.length > 0 && (
        <div className="mb-10">
          <p className="luxury-label mb-4 text-[10px] text-muted">{t("latest_orders")}</p>
          <div className="glass rounded-card border border-white/[0.06] p-6">
            <div className="divide-y divide-white/[0.06]">
              {latestOrders.map((o) => (
                <motion.div
                  key={o.id}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                  transition={{ duration: 0.15 }}
                >
                <Link
                  href={`/admin/orders/${o.id}`}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0 transition hover:opacity-70"
                >
                  <div>
                    <p className="font-mono text-sm font-medium text-white">{o.orderNumber}</p>
                    <p className="text-xs text-muted">{o.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{o.total}</p>
                    <p className="text-xs text-muted capitalize">{o.orderStatus.replace(/_/g, " ")}</p>
                  </div>
                </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {latestCustomers.length > 0 && (
        <div className="mb-10">
          <p className="luxury-label mb-4 text-[10px] text-muted">{t("latest_customers")}</p>
          <div className="glass rounded-card border border-white/[0.06] p-6">
            <div className="divide-y divide-white/[0.06]">
              {latestCustomers.map((c) => (
                <motion.div
                  key={c.email}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                  transition={{ duration: 0.15 }}
                >
                <Link
                  href="/admin/customers"
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0 transition hover:opacity-70"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{c.name}</p>
                    <p className="text-xs text-muted">{c.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gold">{c.totalSpent.toFixed(2)} DH</p>
                    <p className="text-xs text-muted">{c.totalOrders}{t("orders_label")}</p>
                  </div>
                </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {lowStockProducts.length > 0 && (
        <div className="mb-10">
          <p className="luxury-label mb-4 text-[10px] text-muted">{t("low_stock_products")}</p>
          <div className="glass rounded-card border border-white/[0.06] p-6">
            <div className="divide-y divide-white/[0.06]">
              {lowStockProducts.map((p) => (
                <motion.div
                  key={p.id}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <span className="text-sm font-medium text-white">{p.name}</span>
                  <span className="badge-red rounded-full bg-red/10 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-red">
                    {p.stock}{t("left_label")}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div>
        <p className="luxury-label mb-4 text-[10px] text-muted">{t("content_section")}</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label={t("products_count")} value={<AnimatedCounter value={productCount} />} href="/admin/shop" />
          <StatCard label={t("low_stock_count")} value={<AnimatedCounter value={lowStock} />} href="/admin/shop" accent="red" />
          <StatCard label={t("paid_orders")} value={<AnimatedCounter value={paidOrders} />} href="/admin/orders" accent="emerald" />
          <StatCard label={t("refunded")} value={<AnimatedCounter value={refundedOrders} />} href="/admin/orders" accent="red" />
        </div>
      </div>


    </div>
  );
}
