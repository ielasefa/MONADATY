"use client";

import { useState, useEffect, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslation } from "@/hooks/useTranslation";

export default function ProductsReportPage() {
  const { t } = useTranslation("admin");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/admin/reports/products", { cache: "no-store" });
      if (!res.ok) throw new Error("Could not load product report");
      setData(await res.json());
    } catch {
      setError(true);
      setData({ products: [], totalProducts: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="container-shell mx-auto px-6 py-10"><div className="h-32 animate-pulse rounded-card bg-surface" /></div>;
  if (!data) return <div className="container-shell mx-auto px-6 py-10 text-sm text-muted">{t("no_report_data", "No product sales data is available yet.")}</div>;

  const top10 = data.products.slice(0, 10);

  return (
    <div className="container-shell mx-auto px-6 py-10">
      <div className="mb-6">
        <p className="luxury-label mb-2">{t("reports")}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t("products_report")}</h1>
      </div>

      {error && <div role="alert" className="mb-6 rounded-card border border-burgundy/20 bg-burgundy/[0.04] p-4 text-sm text-burgundy">{t("report_load_failed", "The report data could not be loaded. Refresh the page and try again.")}</div>}

      <div className="mb-6 rounded-card border border-line bg-card p-6">
        <h3 className="mb-4 text-sm font-semibold text-foreground">{t("top_products")}</h3>
        {top10.length === 0 ? <div className="flex h-96 items-center justify-center text-sm text-muted">{t("no_report_data", "No product sales data is available yet.")}</div> : <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={top10} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" tick={{ fill: "#8B7355", fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#8B7355", fontSize: 10 }} width={180} />
              <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #E8E1D8", borderRadius: 8 }} />
              <Bar dataKey="qty" fill="#8C6228" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>}
      </div>
    </div>
  );
}
