"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

export default function ReportsIndexPage() {
  const { t } = useTranslation("admin");

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
      <div className="mb-8">
        <p className="luxury-label mb-2">{t("analytics")}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">{t("reports_center")}</h1>
        <p className="mt-1 text-sm text-muted">{t("reports_desc")}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reportLinks.map((r) => (
          <Link key={r.href} href={r.href} className="luxury-card group block p-6 transition hover:border-gold/30">
            <h3 className="font-semibold text-white group-hover:text-gold">{r.label}</h3>
            <p className="mt-1 text-sm text-muted">{r.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
