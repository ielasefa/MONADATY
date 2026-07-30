"use client";

import { useState, useEffect, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useTranslation } from "@/hooks/useTranslation";

export default function SalesReportPage() {
  const { t } = useTranslation("admin");
  const [data, setData] = useState<{ date: string; sales: number; revenue: number; orders: number }[]>([]);
  const [summary, setSummary] = useState({ totalSales: 0, totalRevenue: 0, totalItems: 0, avgOrderValue: 0 });
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const to = new Date().toISOString();
    const from = new Date(Date.now() - days * 86400000).toISOString();
    const res = await fetch(`/api/admin/reports/sales?from=${from}&to=${to}`);
    if (res.ok) {
      const json = await res.json();
      setData(json.dailyData || []);
      setSummary(json);
    }
    setLoading(false);
  }, [days]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="container-shell mx-auto px-6 py-10"><div className="h-32 animate-pulse rounded-card bg-white/[0.04]" /></div>;

  return (
    <div className="container-shell mx-auto px-6 py-10">
      <div className="mb-6">
        <p className="luxury-label mb-2">{t("reports")}</p>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight text-white">{t("sales_report")}</h1>
          <select value={days} onChange={e => setDays(Number(e.target.value))} className="input-premium px-3 py-1.5 text-sm">
            <option value={7}>{t("days_7")}</option>
            <option value={30}>{t("days_30")}</option>
            <option value={90}>{t("days_90")}</option>
            <option value={365}>{t("months_12")}</option>
          </select>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-card border border-white/[0.06] bg-card p-4">
          <p className="text-[10px] text-muted">{t("total_sales")}</p>
          <p className="mt-1 text-xl font-semibold text-white">{summary.totalSales}</p>
        </div>
        <div className="rounded-card border border-white/[0.06] bg-card p-4">
          <p className="text-[10px] text-muted">{t("total_revenue")}</p>
          <p className="mt-1 text-xl font-semibold text-gold">{summary.totalRevenue.toFixed(2)} DH</p>
        </div>
        <div className="rounded-card border border-white/[0.06] bg-card p-4">
          <p className="text-[10px] text-muted">Items Sold</p>
          <p className="mt-1 text-xl font-semibold text-white">{summary.totalItems}</p>
        </div>
        <div className="rounded-card border border-white/[0.06] bg-card p-4">
          <p className="text-[10px] text-muted">Avg Order Value</p>
          <p className="mt-1 text-xl font-semibold text-gold">{summary.avgOrderValue.toFixed(2)} DH</p>
        </div>
      </div>

      <div className="mb-6 rounded-card border border-white/[0.06] bg-card p-6">
        <h3 className="mb-4 text-sm font-semibold text-white">Daily Revenue</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tick={{ fill: "#8B7355", fontSize: 11 }} />
              <YAxis tick={{ fill: "#8B7355", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
              <Area type="monotone" dataKey="revenue" stroke="#D5B87D" fill="rgba(213,184,125,0.1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-card border border-white/[0.06] bg-card p-6">
        <h3 className="mb-4 text-sm font-semibold text-white">Daily Orders</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tick={{ fill: "#8B7355", fontSize: 11 }} />
              <YAxis tick={{ fill: "#8B7355", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
              <Bar dataKey="orders" fill="#D5B87D" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
