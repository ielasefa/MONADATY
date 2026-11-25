"use client";

import { useState, useEffect, useCallback } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useTranslation } from "@/hooks/useTranslation";

const STATUS_COLORS: Record<string, string> = {
  pending: "#F5C542", processing: "#4A90D9", shipped: "#7B68EE", out_for_delivery: "#FF8C00",
  delivered: "#0F8B6F", completed: "#8C6228", cancelled: "#C8121F", refunded: "#8B7355",
};

export default function OrdersReportPage() {
  const { t } = useTranslation("admin");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/reports/orders");
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="container-shell mx-auto px-6 py-10"><div className="h-32 animate-pulse rounded-card bg-surface" /></div>;
  if (!data) return null;

  const statusData = Object.entries(data.statusCounts).map(([name, value]) => ({ name, value }));
  const paymentData = Object.entries(data.paymentCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="container-shell mx-auto px-6 py-10">
      <div className="mb-6">
        <p className="luxury-label mb-2">{t("reports")}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t("orders_report")}</h1>
      </div>

      <div className="mb-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-card border border-line bg-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">{t("order_status_dist")}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {statusData.map((entry, i) => <Cell key={i} fill={STATUS_COLORS[entry.name] || "#666"} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #E8E1D8", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-card border border-line bg-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">{t("payment_status_dist")}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {paymentData.map((entry, i) => <Cell key={i} fill={[ "#0F8B6F", "#8C6228", "#C8121F" ][i] || "#666"} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #E8E1D8", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-card border border-line bg-card p-6">
        <h3 className="mb-4 text-sm font-semibold text-foreground">All Orders ({data.totalOrders})</h3>
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-start text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-muted">
                <th className="pb-3 font-medium">{t("order_number_prefix", "Order #")}</th>
                <th className="pb-3 font-medium">{t("customer")}</th>
                <th className="pb-3 font-medium">{t("total_header")}</th>
                <th className="pb-3 font-medium">{t("status")}</th>
                <th className="pb-3 font-medium">{t("date")}</th>
              </tr>
            </thead>
            <tbody>
              {data.orders.map((o: any, i: number) => (
                <tr key={i} className="border-b border-line text-secondary">
                  <td className="py-2.5">{o.number}</td>
                  <td className="py-2.5">{o.customer}</td>
                  <td className="py-2.5">{o.total}</td>
                  <td className="py-2.5">{o.status}</td>
                  <td className="py-2.5">{new Date(o.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
