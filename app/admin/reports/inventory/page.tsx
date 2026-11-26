"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/hooks/useTranslation";

export default function InventoryReportPage() {
  const { t } = useTranslation("admin");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/admin/reports/inventory", { cache: "no-store" });
      if (!res.ok) throw new Error("Could not load inventory report");
      setData(await res.json());
    } catch {
      setError(true);
      setData({ totalProducts: 0, totalStock: 0, lowStockCount: 0, outOfStockCount: 0, movementCount: 0, recentMovements: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="container-shell mx-auto px-6 py-10"><div className="h-32 animate-pulse rounded-card bg-surface" /></div>;
  if (!data) return <div className="container-shell mx-auto px-6 py-10 text-sm text-muted">{t("no_report_data", "No inventory data is available yet.")}</div>;

  return (
    <div className="container-shell mx-auto px-6 py-10">
      <div className="mb-6">
        <p className="luxury-label mb-2">{t("reports")}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t("inventory_report")}</h1>
      </div>

      {error && <div role="alert" className="mb-6 rounded-card border border-burgundy/20 bg-burgundy/[0.04] p-4 text-sm text-burgundy">{t("report_load_failed", "The report data could not be loaded. Refresh the page and try again.")}</div>}

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

      <div className="rounded-card border border-line bg-card p-6">
        <h3 className="mb-4 text-sm font-semibold text-foreground">{t("recent_inventory_movements", "Recent stock movements")} <span className="font-normal text-muted">({data.movementCount})</span></h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-start text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-muted">
                <th className="pb-3 font-medium">{t("product", "Product")}</th>
                <th className="pb-3 font-medium">{t("warehouse", "Warehouse")}</th>
                <th className="pb-3 font-medium">{t("movement_type", "Movement")}</th>
                <th className="pb-3 font-medium">{t("quantity", "Quantity")}</th>
                <th className="pb-3 font-medium">{t("date", "Date")}</th>
              </tr>
            </thead>
            <tbody>
              {data.recentMovements.map((movement: any) => (
                <tr key={movement.id} className="border-b border-line text-secondary">
                  <td className="py-3 font-medium text-foreground">{movement.product?.name ?? "—"}</td>
                  <td className="py-3">{movement.warehouse?.name ?? "—"}</td>
                  <td className="py-3">{t(`movement_${movement.movementType.toLowerCase()}`, movement.movementType.replaceAll("_", " "))}</td>
                  <td className="py-3 tabular-nums">{movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity}</td>
                  <td className="py-3">{new Date(movement.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {data.recentMovements.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-sm text-muted">{t("no_report_data", "No stock movements are available yet.")}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
