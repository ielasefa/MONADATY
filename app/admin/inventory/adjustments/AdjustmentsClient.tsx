"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

type Warehouse = { id: string; name: string };
type RecentAdjustment = {
  id: string;
  productId: string;
  warehouseName: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  createdAt: string;
};

type ProductSearchResult = { id: string; name: string; sku: string; stock: number };

export function AdjustmentsClient({
  warehouses,
  recentAdjustments,
}: {
  warehouses: Warehouse[];
  recentAdjustments: RecentAdjustment[];
}) {
  const { t } = useTranslation("admin");
  const router = useRouter();
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductSearchResult | null>(null);
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [currentStock, setCurrentStock] = useState<number | null>(null);
  const [newStock, setNewStock] = useState<number | "">("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (selectedProduct) {
      setCurrentStock(selectedProduct.stock);
      setNewStock(selectedProduct.stock);
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (productQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/admin/products/search?q=${encodeURIComponent(productQuery)}`);
        const data = await res.json();
        setSearchResults(data.products || []);
      } catch {
        setSearchResults([]);
      }
      setSearching(false);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [productQuery]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedWarehouse || !selectedProduct || newStock === "" || !reason) {
        setError(t("fill_required"));
        return;
      }
      setSaving(true);
      setError("");
      setSuccess("");
      try {
        const res = await fetch("/api/admin/inventory/adjustments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            warehouseId: selectedWarehouse,
            productId: selectedProduct.id,
            variantId: "",
            newStock: Number(newStock),
            reason,
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Adjustment failed");
        }
        setSuccess(t("stock_adjusted"));
        setSelectedProduct(null);
        setProductQuery("");
        setNewStock("");
        setCurrentStock(null);
        setReason("");
        router.refresh();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : t("error_occurred"));
      } finally {
        setSaving(false);
      }
    },
    [selectedWarehouse, selectedProduct, newStock, reason, router, t]
  );

  const adjustment = currentStock !== null && newStock !== ""
    ? Number(newStock) - currentStock
    : 0;

  return (
    <div>
      <div className="mb-8">
        <p className="luxury-label mb-2">{t("inventory", "Inventory")}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">{t("adjustments_title", "Stock Adjustments")}</h1>
        <p className="mt-1 text-sm text-muted">{t("adjust_stock_manually", "Adjust stock levels manually")}</p>
      </div>

      {error && (
        <div className="mb-6 rounded-card border border-burgundy/20 bg-burgundy/10 px-4 py-3 text-sm text-burgundy">{error}</div>
      )}
      {success && (
        <div className="mb-6 rounded-card border border-emerald/20 bg-emerald/10 px-4 py-3 text-sm text-gold">{success}</div>
      )}

      <div className="mb-10 luxury-card rounded-card border border-white/[0.06] bg-card p-6">
        <p className="luxury-label mb-6 text-[10px] text-muted">{t("new_adjustment", "New Adjustment")}</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="luxury-label text-[10px] text-muted">{t("warehouse", "Warehouse")}</label>
              <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className="input-premium w-full"
                required
              >
                <option value="">{t("po_select_warehouse", "Select warehouse...")}</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="luxury-label text-[10px] text-muted">{t("product", "Product")}</label>
              <input
                type="text"
                value={productQuery}
                onChange={(e) => {
                  setProductQuery(e.target.value);
                  setSelectedProduct(null);
                  setCurrentStock(null);
                }}
                placeholder={t("search_products")}
                className="input-premium w-full"
              />
              {searching && <p className="text-xs text-muted">{t("searching", "Searching...")}</p>}
              {searchResults.length > 0 && !selectedProduct && (
                <div className="mt-1 max-h-40 overflow-y-auto rounded-card border border-white/[0.06] bg-surface">
                  {searchResults.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedProduct(p);
                        setProductQuery(p.name);
                        setSearchResults([]);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-white transition hover:bg-white/[0.04]"
                    >
                      {p.name}
                      <span className="ml-2 text-xs text-muted">SKU: {p.sku || "\u2014"} | Stock: {p.stock}</span>
                    </button>
                  ))}
                </div>
              )}
              {selectedProduct && (
                <div className="mt-1 flex items-center gap-2 rounded-lg bg-emerald/10 px-3 py-2">
                  <span className="text-sm text-gold">{selectedProduct.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProduct(null);
                      setProductQuery("");
                      setCurrentStock(null);
                    }}
                    className="ml-auto text-xs text-burgundy"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="luxury-label text-[10px] text-muted">{t("current_stock", "Current Stock")}</label>
              <div className="flex h-12 items-center rounded-button border border-white/[0.06] bg-surface px-4 text-sm text-white">
                {currentStock !== null ? currentStock : "\u2014"}
              </div>
            </div>
            <div className="space-y-2">
              <label className="luxury-label text-[10px] text-muted">{t("new_stock", "New Stock")}</label>
              <input
                type="number"
                min={0}
                value={newStock}
                onChange={(e) => setNewStock(e.target.value === "" ? "" : parseInt(e.target.value) || 0)}
                className="input-premium w-full"
                required
              />
              {currentStock !== null && newStock !== "" && (
                <p className={`text-xs ${adjustment > 0 ? "text-gold" : adjustment < 0 ? "text-burgundy" : "text-muted"}`}>
                  {adjustment > 0 ? "+" : ""}{adjustment} unit{Math.abs(adjustment) !== 1 ? "s" : ""}
                </p>
              )}
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="luxury-label text-[10px] text-muted">{t("reason")}</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="input-premium w-full"
                required
              >
                <option value="">{t("select_reason")}</option>
                {[t("inventory_count"), t("damage"), t("lost"), t("expired"), t("manual_correction")].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={saving || !adjustment}
            className="btn-primary h-12 rounded-button px-6 text-xs font-semibold uppercase tracking-[0.1em] disabled:opacity-50"
          >
            {saving ? t("adjusting") : t("adjust_stock")}
          </button>
        </form>
      </div>

      <div>
        <p className="luxury-label mb-4 text-[10px] text-muted">{t("recent_adjustments", "Recent Adjustments")}</p>
        <div className="glass overflow-hidden rounded-card border border-white/[0.06]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-xs uppercase tracking-[0.1em] text-muted">
                  <th className="px-5 py-4 font-medium">{t("date", "Date")}</th>
                  <th className="px-5 py-4 font-medium">{t("product", "Product")}</th>
                  <th className="px-5 py-4 font-medium">{t("warehouse", "Warehouse")}</th>
                  <th className="px-5 py-4 font-medium text-right">{t("prev", "Prev")}</th>
                  <th className="px-5 py-4 font-medium text-right">{t("new", "New")}</th>
                  <th className="px-5 py-4 font-medium text-right">{t("change_col", "Change")}</th>
                  <th className="px-5 py-4 font-medium">{t("reason", "Reason")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {recentAdjustments.map((a, i) => (
                  <motion.tr
                    key={a.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    className="transition hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-4 text-xs text-muted">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-sm text-white">{a.productId.slice(0, 8)}...</td>
                    <td className="px-5 py-4 text-muted">{a.warehouseName}</td>
                    <td className="px-5 py-4 text-right text-muted">{a.previousStock}</td>
                    <td className="px-5 py-4 text-right text-white">{a.newStock}</td>
                    <td className={`px-5 py-4 text-right font-medium ${a.quantity > 0 ? "text-gold" : a.quantity < 0 ? "text-burgundy" : "text-muted"}`}>
                      {a.quantity > 0 ? `+${a.quantity}` : a.quantity}
                    </td>
                    <td className="px-5 py-4 text-muted">{a.reason || "\u2014"}</td>
                  </motion.tr>
                ))}
                {recentAdjustments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-muted">
                      No adjustments yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
