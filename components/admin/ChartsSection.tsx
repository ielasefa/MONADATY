"use client";

import { lazy, Suspense } from "react";
import { useTranslation } from "@/hooks/useTranslation";

const RevenueChart = lazy(() => import("./charts/RevenueChart"));
const OrdersChart = lazy(() => import("./charts/OrdersChart"));
const TopProductsChart = lazy(() => import("./charts/TopProductsChart"));
const CollectionSalesChart = lazy(() => import("./charts/CollectionSalesChart"));
const MonthlyRevenueChart = lazy(() => import("./charts/MonthlyRevenueChart"));

function ChartSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-white/[0.06] bg-card p-6">
      <div className="mb-4 h-4 w-32 rounded bg-white/5" />
      <div className="h-48 rounded bg-white/5" />
    </div>
  );
}

type Props = {
  revenueData: { date: string; revenue: number }[];
  ordersData: { date: string; orders: number }[];
  topProducts: { name: string; value: number }[];
  collectionSales: { name: string; value: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
};

export function ChartsSection({ revenueData, ordersData, topProducts, collectionSales, monthlyRevenue }: Props) {
  const { t } = useTranslation("admin");

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <p className="luxury-label text-[10px] text-white/50">{t("analytics", "Analytics")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Suspense fallback={<ChartSkeleton />}>
          <RevenueChart data={revenueData} />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <OrdersChart data={ordersData} />
        </Suspense>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Suspense fallback={<ChartSkeleton />}>
          <TopProductsChart data={topProducts} />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <CollectionSalesChart data={collectionSales} />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <MonthlyRevenueChart data={monthlyRevenue} />
        </Suspense>
      </div>
    </div>
  );
}