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
  const [error, setError] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/admin/reports/orders", { cache: "no-store" });
      if (!res.ok) throw new Error("Could not load orders report");
      setData(await res.json());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="container-shell mx-auto px-6 py-10"><div className="h-32 animate-pulse rounded-card bg-surface" /></div>;
  const report = data ?? { totalOrders: 0, statusCounts: {}, paymentCounts: {}, orders: [] };

  const statusData = Object.entries(report.statusCounts).map(([name, value]) => ({ name, value }));
  const paymentData = Object.entries(report.paymentCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="container-shell mx-auto px-6 py-10">
      <div className="mb-6">
        <p className="luxury-label mb-2">{t("reports")}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t("orders_report")}</h1>
      </div>

      {error && <div role="alert" className="mb-6 rounded-card border border-burgundy/20 bg-burgundy/[0.04] p-4 text-sm text-burgundy">{t("report_load_failed", "The report data could not be loaded. Refresh the page and try again.")}</div>}

      <div className="mb-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-card border border-line bg-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">{t("order_status_dist")}</h3>
          {statusData.length === 0 ? <div className="flex h-64 items-center justify-center text-sm text-muted">{t("no_report_data", "No order data is available yet.")}</div> : <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {statusData.map((entry, i) => <Cell key={i} fill={STATUS_COLORS[entry.name] || "#666"} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #E8E1D8", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>}
        </div>
        <div className="rounded-card border border-line bg-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">{t("payment_status_dist")}</h3>
          {paymentData.length === 0 ? <div className="flex h-64 items-center justify-center text-sm text-muted">{t("no_report_data", "No order data is available yet.")}</div> : <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {paymentData.map((entry, i) => <Cell key={i} fill={[ "#0F8B6F", "#8C6228", "#C8121F" ][i] || "#666"} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #E8E1D8", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>}
        </div>
      </div>

      <div className="rounded-card border border-line bg-card p-6">
        <h3 className="mb-4 text-sm font-semibold text-foreground">{t("all_orders_count", `All Orders (${report.totalOrders})`)}</h3>
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
              {report.orders.map((o: any, i: number) => (
                <tr key={i} className="border-b border-line text-secondary">
                  <td className="py-2.5">{o.number}</td>
                  <td className="py-2.5">{o.customer}</td>
                  <td className="py-2.5">{o.total}</td>
                  <td className="py-2.5">{o.status}</td>
                  <td className="py-2.5">{new Date(o.date).toLocaleDateString()}</td>
                </tr>
              ))}
              {report.orders.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-sm text-muted">{t("no_report_data", "No order data is available yet.")}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
