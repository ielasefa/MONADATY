"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/hooks/useTranslation";

export default function CustomersReportPage() {
  const { t } = useTranslation("admin");
  const [data, setData] = useState<{ totalCustomers: number; avgOrdersPerCustomer: number; avgSpentPerCustomer: number; customers: any[] }>({ totalCustomers: 0, avgOrdersPerCustomer: 0, avgSpentPerCustomer: 0, customers: [] });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/reports/customers");
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="container-shell mx-auto px-6 py-10"><div className="h-32 animate-pulse rounded-card bg-surface" /></div>;

  return (
    <div className="container-shell mx-auto px-6 py-10">
      <div className="mb-6">
        <p className="luxury-label mb-2">{t("reports")}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t("customers_report")}</h1>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className="rounded-card border border-line bg-card p-4">
          <p className="text-xs text-muted">{t("total_customers")}</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{data.totalCustomers}</p>
        </div>
        <div className="rounded-card border border-line bg-card p-4">
          <p className="text-xs text-muted">{t("avg_orders_customer")}</p>
          <p className="mt-1 text-xl font-semibold text-accent">{data.avgOrdersPerCustomer.toFixed(2)}</p>
        </div>
        <div className="rounded-card border border-line bg-card p-4">
          <p className="text-xs text-muted">{t("avg_spent_customer", "Avg Spent / Customer")}</p>
          <p className="mt-1 text-xl font-semibold text-accent">{data.avgSpentPerCustomer.toFixed(2)} DH</p>
        </div>
      </div>

      <div className="rounded-card border border-line bg-card p-6">
        <h3 className="mb-4 text-sm font-semibold text-foreground">{t("all_customers", "All Customers")}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-muted">
                <th className="pb-3 font-medium">{t("email", "Email")}</th>
                <th className="pb-3 font-medium">{t("name", "Name")}</th>
                <th className="pb-3 font-medium">{t("orders", "Orders")}</th>
                <th className="pb-3 font-medium">{t("total_spent")}</th>
              </tr>
            </thead>
            <tbody>
              {data.customers.slice(0, 50).map((c: any, i: number) => (
                <tr key={i} className="border-b border-line text-secondary">
                  <td className="py-2.5">{c.email}</td>
                  <td className="py-2.5">{c.name}</td>
                  <td className="py-2.5">{c.orders}</td>
                  <td className="py-2.5">{c.total.toFixed(2)} DH</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
