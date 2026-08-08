"use client";

import { lazy, Suspense } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Panel, SectionHeading, SkeletonBlock } from "./ui";

const RevenueChart = lazy(() => import("../charts/RevenueChart"));
const OrdersChart = lazy(() => import("../charts/OrdersChart"));
const TopProductsChart = lazy(() => import("../charts/TopProductsChart"));
const CollectionSalesChart = lazy(() => import("../charts/CollectionSalesChart"));
const MonthlyRevenueChart = lazy(() => import("../charts/MonthlyRevenueChart"));

function ChartSkeleton() {
  return (
    <Panel hover={false} className="p-6">
      <SkeletonBlock className="mb-4 h-4 w-36" />
      <SkeletonBlock className="h-48 w-full" />
    </Panel>
  );
}

type Props = {
  revenueData: { date: string; revenue: number }[];
  ordersData: { date: string; orders: number }[];
  topProducts: { name: string; value: number }[];
  collectionSales: { name: string; value: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
};

export function AnalyticsSection({
  revenueData,
  ordersData,
  topProducts,
  collectionSales,
  monthlyRevenue,
}: Props) {
  const { t } = useTranslation("admin");

  return (
    <div className="space-y-4">
      <SectionHeading
        title={t("analytics", "Analytics")}
        action={
          <span className="text-[0.64rem] uppercase tracking-[0.18em] text-white/30">
            {t("last_30_days", "Last 30 days")}
          </span>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Suspense fallback={<ChartSkeleton />}>
          <RevenueChart data={revenueData} />
        </Suspense>
        <Suspense fallback={<ChartSkeleton />}>
          <OrdersChart data={ordersData} />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
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
