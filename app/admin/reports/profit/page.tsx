"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/hooks/useTranslation";

export default function ProfitReportPage() {
  const { t } = useTranslation("admin");
  const [data, setData] = useState({ orderCount: 0, totalRevenue: 0, totalCost: 0, profit: 0, margin: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/admin/reports/profit", { cache: "no-store" });
      if (!res.ok) throw new Error("Could not load profit report");
      setData(await res.json());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="container-shell mx-auto px-6 py-10"><div className="h-32 animate-pulse rounded-card bg-surface" /></div>;

  return (
    <div className="container-shell mx-auto px-6 py-10">
      <div className="mb-8">
        <p className="luxury-label mb-2">{t("reports")}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t("profit_report")}</h1>
      </div>

      {error && <div role="alert" className="mb-6 rounded-card border border-burgundy/20 bg-burgundy/[0.04] p-4 text-sm text-burgundy">{t("report_load_failed", "The report data could not be loaded. Refresh the page and try again.")}</div>}
      {!error && data.orderCount === 0 && <div className="mb-6 rounded-card border border-line bg-white p-4 text-sm text-muted">{t("no_report_data", "No completed orders are available for this report yet.")}</div>}

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-card border border-line bg-card p-4">
          <p className="text-xs text-muted">{t("total_revenue")}</p>
          <p className="mt-1 text-xl font-semibold text-accent">{data.totalRevenue.toFixed(2)} DH</p>
        </div>
        <div className="rounded-card border border-line bg-card p-4">
          <p className="text-xs text-muted">{t("total_cost")}</p>
          <p className="mt-1 text-xl font-semibold text-burgundy">{data.totalCost.toFixed(2)} DH</p>
        </div>
        <div className="rounded-card border border-line bg-card p-4">
          <p className="text-xs text-muted">{t("net_profit", "Net Profit")}</p>
          <p className={`mt-1 text-xl font-semibold ${data.profit >= 0 ? "text-accent" : "text-burgundy"}`}>{data.profit.toFixed(2)} DH</p>
        </div>
        <div className="rounded-card border border-line bg-card p-4">
          <p className="text-xs text-muted">{t("margin")}</p>
          <p className={`mt-1 text-xl font-semibold ${data.margin >= 0 ? "text-accent" : "text-burgundy"}`}>{data.margin}%</p>
        </div>
      </div>
    </div>
  );
}
