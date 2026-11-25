"use client";

import { useState, useEffect, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useTranslation } from "@/hooks/useTranslation";

const COLORS = ["#8C6228", "#C8121F", "#0F8B6F", "#4A0080", "#8C6228", "#E2C98A"];

export default function RevenueReportPage() {
  const { t } = useTranslation("admin");
  const [data, setData] = useState<{ month: string; revenue: number }[]>([]);
  const [summary, setSummary] = useState({ totalRevenue: 0, subtotalRevenue: 0, shippingRevenue: 0, discountTotal: 0, netRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const to = new Date().toISOString();
    const from = new Date(Date.now() - days * 86400000).toISOString();
    const res = await fetch(`/api/admin/reports/revenue?from=${from}&to=${to}`);
    if (res.ok) {
      const json = await res.json();
      setData(json.monthlyData || []);
      setSummary(json);
    }
    setLoading(false);
  }, [days]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const pieData = [
    { name: t("products_count"), value: summary.subtotalRevenue },
    { name: t("shipping_label"), value: summary.shippingRevenue },
    { name: t("discounts_label"), value: summary.discountTotal },
  ].filter(d => d.value > 0);

  if (loading) return <div className="container-shell mx-auto px-6 py-10"><div className="h-32 animate-pulse rounded-card bg-surface" /></div>;

  return (
    <div className="container-shell mx-auto px-6 py-10">
      <div className="mb-6">
        <p className="luxury-label mb-2">{t("reports")}</p>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t("revenue_report")}</h1>
          <select value={days} onChange={e => setDays(Number(e.target.value))} className="input-premium px-3 py-1.5 text-sm">
            <option value={30}>{t("days_30")}</option>
            <option value={90}>{t("days_90")}</option>
            <option value={365}>{t("months_12")}</option>
          </select>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-card border border-line bg-card p-4">
          <p className="text-xs text-muted">{t("gross_revenue", "Gross Revenue")}</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{summary.totalRevenue.toFixed(2)} DH</p>
        </div>
        <div className="rounded-card border border-line bg-card p-4">
          <p className="text-xs text-muted">{t("net_revenue", "Net Revenue")}</p>
          <p className="mt-1 text-xl font-semibold text-accent">{summary.netRevenue.toFixed(2)} DH</p>
        </div>
        <div className="rounded-card border border-line bg-card p-4">
          <p className="text-xs text-muted">{t("shipping_admin", "Shipping")}</p>
          <p className="mt-1 text-xl font-semibold text-accent">{summary.shippingRevenue.toFixed(2)} DH</p>
        </div>
        <div className="rounded-card border border-line bg-card p-4">
          <p className="text-xs text-muted">{t("discounts_admin", "Discounts")}</p>
          <p className="mt-1 text-xl font-semibold text-burgundy">{summary.discountTotal.toFixed(2)} DH</p>
        </div>
      </div>

      <div className="mb-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-card border border-line bg-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">{t("monthly_revenue", "Monthly Revenue")}</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" tick={{ fill: "#8B7355", fontSize: 11 }} />
                <YAxis tick={{ fill: "#8B7355", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #E8E1D8", borderRadius: 8 }} />
                <Bar dataKey="revenue" fill="#8C6228" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-card border border-line bg-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">{t("revenue_breakdown")}</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value.toFixed(0)} DH`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #E8E1D8", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
