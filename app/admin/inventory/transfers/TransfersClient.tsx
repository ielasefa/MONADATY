"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";

type Warehouse = { id: string; name: string };
type RecentTransfer = {
  id: string;
  productId: string;
  warehouseName: string;
  quantity: number;
  reason: string;
  reference: string;
  createdAt: string;
};

type ProductSearchResult = { id: string; name: string; sku: string; stock: number };

export function TransfersClient({
  warehouses,
  recentTransfers,
}: {
  warehouses: Warehouse[];
  recentTransfers: RecentTransfer[];
}) {
  const { t } = useTranslation("inventory");
  const router = useRouter();
  const [fromWarehouse, setFromWarehouse] = useState("");
  const [toWarehouse, setToWarehouse] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductSearchResult | null>(null);
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

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
      if (!fromWarehouse || !toWarehouse || !selectedProduct || quantity < 1) {
        toast.error(t("fill_required_fields", "Please fill all required fields"));
        return;
      }
      if (fromWarehouse === toWarehouse) {
        toast.error(t("different_warehouses_required", "Source and destination warehouses must be different"));
        return;
      }
      setSaving(true);
       try {
        const res = await fetch("/api/admin/inventory/transfers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromWarehouseId: fromWarehouse,
            toWarehouseId: toWarehouse,
            productId: selectedProduct.id,
            variantId: "",
            quantity,
            reason,
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Transfer failed");
        }
         toast.success(t("transfer_completed", "Transfer completed successfully"));
        setFromWarehouse("");
        setToWarehouse("");
        setSelectedProduct(null);
        setProductQuery("");
        setQuantity(1);
        setReason("");
        router.refresh();
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : t("an_error_occurred", "An error occurred"));
      } finally {
        setSaving(false);
      }
    },
    [fromWarehouse, toWarehouse, selectedProduct, quantity, reason, router, t]
  );

  return (
    <div>
      <div className="mb-8">
        <p className="luxury-label mb-2">{t("inventory", "Inventory")}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">{t("stock_transfers", "Stock Transfers")}</h1>
        <p className="mt-1 text-sm text-muted">{t("stock_transfers_desc", "Transfer stock between warehouses")}</p>
      </div>

      <div className="mb-10 luxury-card rounded-card border border-white/[0.06] bg-card p-6">
        <p className="luxury-label mb-6 text-[10px] text-muted">{t("new_transfer", "New Transfer")}</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="luxury-label text-[10px] text-muted">{t("from_warehouse", "From Warehouse")}</label>
              <select
                value={fromWarehouse}
                onChange={(e) => setFromWarehouse(e.target.value)}
                className="input-premium w-full"
                required
              >
                <option value="">{t("select_source", "Select source...")}</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="luxury-label text-[10px] text-muted">{t("to_warehouse", "To Warehouse")}</label>
              <select
                value={toWarehouse}
                onChange={(e) => setToWarehouse(e.target.value)}
                className="input-premium w-full"
                required
              >
                <option value="">{t("select_destination", "Select destination...")}</option>
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
                }}
                placeholder={t("search_products_inventory", "Search products...")}
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
                  <span className="text-xs text-muted">(Stock: {selectedProduct.stock})</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProduct(null);
                      setProductQuery("");
                    }}
                    className="ml-auto text-xs text-burgundy"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="luxury-label text-[10px] text-muted">{t("quantity", "Quantity")}</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="input-premium w-full"
                required
              />
            </div>
            <div className="md:col-span-2">
              <div className="space-y-2">
                <label className="luxury-label text-[10px] text-muted">{t("reason_optional", "Reason (Optional)")}</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  className="input-premium w-full min-h-[60px] resize-y px-4 py-3"
                  placeholder={t("why_transfer_needed", "Why is this transfer needed?")}
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary h-12 rounded-button px-6 text-xs font-semibold uppercase tracking-[0.1em] disabled:opacity-50"
          >
            {saving ? t("transferring") : t("transfer_stock", "Transfer Stock")}
          </button>
        </form>
      </div>

      <div>
        <p className="luxury-label mb-4 text-[10px] text-muted">{t("recent_transfers", "Recent Transfers")}</p>
        <div className="glass overflow-hidden rounded-card border border-white/[0.06]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-xs uppercase tracking-[0.1em] text-muted">
                  <th className="px-5 py-4 font-medium">{t("date", "Date")}</th>
                  <th className="px-5 py-4 font-medium">{t("product", "Product")}</th>
                  <th className="px-5 py-4 font-medium">{t("warehouse", "Warehouse")}</th>
                  <th className="px-5 py-4 font-medium text-right">{t("qty", "Qty")}</th>
                  <th className="px-5 py-4 font-medium">{t("reason", "Reason")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {recentTransfers.map((t, i) => (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    className="transition hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-4 text-xs text-muted">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-sm text-white">{t.productId.slice(0, 8)}...</td>
                    <td className="px-5 py-4 text-muted">{t.warehouseName}</td>
                    <td className="px-5 py-4 text-right font-medium text-white">
                      {t.quantity > 0 ? `+${t.quantity}` : t.quantity}
                    </td>
                    <td className="px-5 py-4 text-muted">{t.reason || "\u2014"}</td>
                  </motion.tr>
                ))}
                {recentTransfers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-muted">
                      No transfers yet.
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
