"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

type Summary = {
  orderCount: number;
  revenue: number;
  productCount: number;
  totalStock: number;
};

export function ReportsOverview({ summary }: { summary: Summary }) {
  const { t } = useTranslation("admin");

  const metrics = [
    { label: t("report_orders", "Orders"), value: summary.orderCount.toLocaleString() },
    { label: t("report_revenue", "Revenue"), value: `${summary.revenue.toFixed(2)} DH` },
    { label: t("products_count", "Products"), value: summary.productCount.toLocaleString() },
    { label: t("total_stock", "Units in stock"), value: summary.totalStock.toLocaleString() },
  ];

  const reportLinks = [
    { href: "/admin/reports/sales", label: t("sales_report"), desc: t("sales_report_desc") },
    { href: "/admin/reports/revenue", label: t("revenue_report"), desc: t("revenue_report_desc") },
    { href: "/admin/reports/profit", label: t("profit_report"), desc: t("profit_report_desc") },
    { href: "/admin/reports/customers", label: t("customers_report"), desc: t("customers_report_desc") },
    { href: "/admin/reports/orders", label: t("orders_report"), desc: t("orders_report_desc") },
    { href: "/admin/reports/products", label: t("products_report"), desc: t("products_report_desc") },
    { href: "/admin/reports/inventory", label: t("inventory_report"), desc: t("inventory_report_desc") },
  ];

  return (
    <div className="container-shell mx-auto px-6 py-10">
      <div className="mb-7">
        <p className="luxury-label mb-2">{t("analytics")}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t("reports_center")}</h1>
        <p className="mt-1 text-sm text-muted">{t("reports_desc")}</p>
      </div>

      <section aria-label={t("reports_summary", "Business summary")} className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {metrics.map((metric, index) => (
          <article key={metric.label} className="admin-kpi-card min-w-0 p-4 sm:p-5" data-accent={index === 1 || index === 2}>
            <p className="admin-kpi-label text-xs leading-relaxed text-muted">{metric.label}</p>
            <p className="admin-kpi-value mt-2">{metric.value}</p>
          </article>
        ))}
      </section>

      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-foreground">{t("all_reports", "All reports")}</h2>
        <span className="text-xs text-muted">{t("all_time", "All time")}</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reportLinks.map((report) => (
          <Link key={report.href} href={report.href} className="luxury-card group block p-5 transition hover:border-gold/40 sm:p-6">
            <span className="mb-4 grid h-10 w-10 place-items-center rounded-xl border border-gold/20 bg-gold/[0.06] text-accent" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M4 19V5M4 19h17" />
                <path d="m7 15 4-4 3 2 6-7" />
              </svg>
            </span>
            <h3 className="font-semibold text-foreground transition-colors group-hover:text-accent">{report.label}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">{report.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
