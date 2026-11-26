"use client";

import { useState, useEffect, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useTranslation } from "@/hooks/useTranslation";

export default function SalesReportPage() {
  const { t } = useTranslation("admin");
  const [data, setData] = useState<{ date: string; sales: number; revenue: number; orders: number }[]>([]);
  const [summary, setSummary] = useState({ totalSales: 0, totalRevenue: 0, totalItems: 0, avgOrderValue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [days, setDays] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    const to = new Date().toISOString();
    const from = days === 0 ? new Date(0).toISOString() : new Date(Date.now() - days * 86400000).toISOString();
    try {
      const res = await fetch(`/api/admin/reports/sales?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Could not load sales report");
      const json = await res.json();
      setData(json.dailyData || []);
      setSummary(json);
    } catch {
      setError(true);
      setData([]);
      setSummary({ totalSales: 0, totalRevenue: 0, totalItems: 0, avgOrderValue: 0 });
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="container-shell mx-auto px-6 py-10"><div className="h-32 animate-pulse rounded-card bg-surface" /></div>;

  return (
    <div className="container-shell mx-auto px-6 py-10">
      <div className="mb-6">
        <p className="luxury-label mb-2">{t("reports")}</p>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t("sales_report")}</h1>
          <select value={days} onChange={e => setDays(Number(e.target.value))} className="input-premium px-3 py-1.5 text-sm">
            <option value={0}>{t("all_time", "All time")}</option>
            <option value={7}>{t("days_7")}</option>
            <option value={30}>{t("days_30")}</option>
            <option value={90}>{t("days_90")}</option>
            <option value={365}>{t("months_12")}</option>
          </select>
        </div>
      </div>

      {error && <div role="alert" className="mb-6 rounded-card border border-burgundy/20 bg-burgundy/[0.04] p-4 text-sm text-burgundy">{t("report_load_failed", "The report data could not be loaded. Refresh the page and try again.")}</div>}

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-card border border-line bg-card p-4">
          <p className="text-xs text-muted">{t("total_sales")}</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{summary.totalSales}</p>
        </div>
        <div className="rounded-card border border-line bg-card p-4">
          <p className="text-xs text-muted">{t("total_revenue")}</p>
          <p className="mt-1 text-xl font-semibold text-accent">{summary.totalRevenue.toFixed(2)} DH</p>
        </div>
        <div className="rounded-card border border-line bg-card p-4">
          <p className="text-xs text-muted">{t("items_sold", "Items Sold")}</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{summary.totalItems}</p>
        </div>
        <div className="rounded-card border border-line bg-card p-4">
          <p className="text-xs text-muted">{t("avg_order_value", "Avg Order Value")}</p>
          <p className="mt-1 text-xl font-semibold text-accent">{summary.avgOrderValue.toFixed(2)} DH</p>
        </div>
      </div>

      <div className="mb-6 rounded-card border border-line bg-card p-6">
        <h3 className="mb-4 text-sm font-semibold text-foreground">{t("daily_revenue", "Daily Revenue")}</h3>
        {data.length === 0 ? <div className="flex h-72 items-center justify-center text-sm text-muted">{t("no_report_data", "No sales data for this period yet.")}</div> : <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tick={{ fill: "#8B7355", fontSize: 11 }} />
              <YAxis tick={{ fill: "#8B7355", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #E8E1D8", borderRadius: 8 }} />
              <Area type="monotone" dataKey="revenue" stroke="#8C6228" fill="rgba(213,184,125,0.1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>}
      </div>

      <div className="rounded-card border border-line bg-card p-6">
        <h3 className="mb-4 text-sm font-semibold text-foreground">{t("daily_orders", "Daily Orders")}</h3>
        {data.length === 0 ? <div className="flex h-72 items-center justify-center text-sm text-muted">{t("no_report_data", "No sales data for this period yet.")}</div> : <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tick={{ fill: "#8B7355", fontSize: 11 }} />
              <YAxis tick={{ fill: "#8B7355", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #E8E1D8", borderRadius: 8 }} />
              <Bar dataKey="orders" fill="#8C6228" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>}
      </div>
    </div>
  );
}
