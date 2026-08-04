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

  if (loading) return <div className="container-shell mx-auto px-6 py-10"><div className="h-32 animate-pulse rounded-card bg-white/[0.04]" /></div>;
  if (!data) return null;

  return (
    <div className="container-shell mx-auto px-6 py-10">
      <div className="mb-6">
        <p className="luxury-label mb-2">{t("reports")}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">{t("inventory_report")}</h1>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-card border border-white/[0.06] bg-card p-4">
          <p className="text-[10px] text-muted">{t("products_count")}</p>
          <p className="mt-1 text-xl font-semibold text-white">{data.totalProducts}</p>
        </div>
        <div className="rounded-card border border-white/[0.06] bg-card p-4">
          <p className="text-[10px] text-muted">{t("total_stock")}</p>
          <p className="mt-1 text-xl font-semibold text-white">{data.totalStock}</p>
        </div>
        <div className="rounded-card border border-white/[0.06] bg-card p-4">
          <p className="text-[10px] text-muted">{t("low_stock_items")}</p>
          <p className="mt-1 text-xl font-semibold text-gold">{data.lowStockCount}</p>
        </div>
        <div className="rounded-card border border-white/[0.06] bg-card p-4">
          <p className="text-[10px] text-muted">{t("out_of_stock", "Out of Stock")}</p>
          <p className="mt-1 text-xl font-semibold text-burgundy">{data.outOfStockCount}</p>
        </div>
      </div>
    </div>
  );
}
