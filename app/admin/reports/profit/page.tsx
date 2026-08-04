"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/hooks/useTranslation";

export default function ProfitReportPage() {
  const { t } = useTranslation("admin");
  const [data, setData] = useState({ totalRevenue: 0, totalCost: 0, profit: 0, margin: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/reports/profit");
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="container-shell mx-auto px-6 py-10"><div className="h-32 animate-pulse rounded-card bg-white/[0.04]" /></div>;

  return (
    <div className="container-shell mx-auto px-6 py-10">
      <div className="mb-8">
        <p className="luxury-label mb-2">{t("reports")}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">{t("profit_report")}</h1>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-card border border-white/[0.06] bg-card p-4">
          <p className="text-[10px] text-muted">{t("total_revenue")}</p>
          <p className="mt-1 text-xl font-semibold text-gold">{data.totalRevenue.toFixed(2)} DH</p>
        </div>
        <div className="rounded-card border border-white/[0.06] bg-card p-4">
          <p className="text-[10px] text-muted">{t("total_cost")}</p>
          <p className="mt-1 text-xl font-semibold text-burgundy">{data.totalCost.toFixed(2)} DH</p>
        </div>
        <div className="rounded-card border border-white/[0.06] bg-card p-4">
          <p className="text-[10px] text-muted">{t("net_profit", "Net Profit")}</p>
          <p className={`mt-1 text-xl font-semibold ${data.profit >= 0 ? "text-gold" : "text-burgundy"}`}>{data.profit.toFixed(2)} DH</p>
        </div>
        <div className="rounded-card border border-white/[0.06] bg-card p-4">
          <p className="text-[10px] text-muted">{t("margin")}</p>
          <p className={`mt-1 text-xl font-semibold ${data.margin >= 0 ? "text-gold" : "text-burgundy"}`}>{data.margin}%</p>
        </div>
      </div>
    </div>
  );
}
