"use client";

import { useMemo } from "react";
import type { StoredOrder } from "@/types";
import type { CustomerInfo } from "@/lib/customers";
import { DashboardHeader } from "@/components/admin/dashboard/DashboardHeader";
import { KpiGrid, type Kpi } from "@/components/admin/dashboard/KpiGrid";
import { StatusHighlights } from "@/components/admin/dashboard/StatusHighlights";
import { QuickActions } from "@/components/admin/dashboard/QuickActions";
import { AnalyticsSection } from "@/components/admin/dashboard/AnalyticsSection";
import { OrdersActivity } from "@/components/admin/dashboard/OrdersActivity";
import { ShowcaseHealth } from "@/components/admin/dashboard/ShowcaseHealth";
import { IconRevenue, IconBag, IconBox, IconUsers } from "@/components/admin/dashboard/icons";
import { useTranslation } from "@/hooks/useTranslation";

type Props = {
  adminName?: string | null;
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
  showcaseStats: { configuredCollections: number; configuredProducts: number; totalCollections: number };
  showcaseCollections: { id: string; name: string; configured: number }[];
};

const fmtMoney = (n: number) => `${n.toLocaleString(undefined, { maximumFractionDigits: 0 })} DH`;

export function DashboardClient(props: Props) {
  const { t } = useTranslation("admin");

  const kpis: Kpi[] = useMemo(
    () => [
      {
        key: "revenue",
        label: t("total_revenue", "Total Revenue"),
        value: props.totalRevenue,
        format: fmtMoney,
        trendLabel: `${t("revenue_this_month", "Revenue This Month")} · ${fmtMoney(props.revenueThisMonth)}`,
        icon: <IconRevenue className="h-[18px] w-[18px]" />,
        accent: true,
        spark: props.revenueChartData.map((d) => d.revenue),
        href: "/admin/orders",
      },
      {
        key: "orders",
        label: t("total_orders", "Total Orders"),
        value: props.totalOrders,
        trendLabel: `${t("orders_this_month", "Orders This Month")} · ${props.ordersThisMonth}`,
        icon: <IconBag className="h-[18px] w-[18px]" />,
        spark: props.ordersChartData.map((d) => d.orders),
        href: "/admin/orders",
      },
      {
        key: "products",
        label: t("products_count", "Products"),
        value: props.productCount,
        trendLabel:
          props.lowStock > 0
            ? `${props.lowStock} ${t("low_stock_count", "low stock")}`
            : t("all_in_stock", "All in stock"),
        icon: <IconBox className="h-[18px] w-[18px]" />,
        href: "/admin/shop",
      },
      {
        key: "customers",
        label: t("customers_count", "Customers"),
        value: props.customerCount,
        trendLabel: `+${props.newCustomers30Days} ${t("new_customers_30d", "new")}`,
        icon: <IconUsers className="h-[18px] w-[18px]" />,
        href: "/admin/customers",
      },
    ],
    [props, t],
  );

  return (
    <div className="space-y-10">
      <DashboardHeader adminName={props.adminName} />

      <KpiGrid kpis={kpis} />

      <StatusHighlights
        pendingOrders={props.pendingOrders}
        processingOrders={props.processingOrders}
        deliveredOrders={props.deliveredOrders}
        cancelledOrders={props.cancelledOrders}
        paidOrders={props.paidOrders}
        refundedOrders={props.refundedOrders}
        totalOrders={props.totalOrders}
        averageOrderValue={props.averageOrderValue}
        bestSellingProduct={props.bestSellingProduct}
        bestCollection={props.bestCollection}
      />

      <QuickActions />

      <AnalyticsSection
        revenueData={props.revenueChartData}
        ordersData={props.ordersChartData}
        topProducts={props.topProductsChart}
        collectionSales={props.collectionSalesData}
        monthlyRevenue={props.monthlyRevenueData}
      />

      <OrdersActivity
        latestOrders={props.latestOrders}
        topProducts={props.topProducts}
        latestCustomers={props.latestCustomers}
      />

      <ShowcaseHealth
        showcaseStats={props.showcaseStats}
        showcaseCollections={props.showcaseCollections}
        lowStockProducts={props.lowStockProducts}
      />
    </div>
  );
}
