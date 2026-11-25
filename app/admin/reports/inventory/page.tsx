"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/hooks/useTranslation";

export default function InventoryReportPage() {
  const { t } = useTranslation("admin");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/reports/inventory");
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="container-shell mx-auto px-6 py-10"><div className="h-32 animate-pulse rounded-card bg-surface" /></div>;
  if (!data) return null;

  return (
    <div className="container-shell mx-auto px-6 py-10">
      <div className="mb-6">
        <p className="luxury-label mb-2">{t("reports")}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t("inventory_report")}</h1>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-card border border-line bg-card p-4">
          <p className="text-xs text-muted">{t("products_count")}</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{data.totalProducts}</p>
        </div>
        <div className="rounded-card border border-line bg-card p-4">
          <p className="text-xs text-muted">{t("total_stock")}</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{data.totalStock}</p>
        </div>
        <div className="rounded-card border border-line bg-card p-4">
          <p className="text-xs text-muted">{t("low_stock_items")}</p>
          <p className="mt-1 text-xl font-semibold text-accent">{data.lowStockCount}</p>
        </div>
        <div className="rounded-card border border-line bg-card p-4">
          <p className="text-xs text-muted">{t("out_of_stock", "Out of Stock")}</p>
          <p className="mt-1 text-xl font-semibold text-burgundy">{data.outOfStockCount}</p>
        </div>
      </div>
    </div>
  );
}
