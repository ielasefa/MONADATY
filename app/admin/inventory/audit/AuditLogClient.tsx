"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";

type Movement = {
  id: string;
  productId: string;
  warehouseId: string;
  warehouseName: string;
  movementType: string;
  quantity: number;
  reason: string;
  reference: string;
  createdAt: string;
  previousStock: number;
  newStock: number;
};

type Warehouse = { id: string; name: string };

const MOVEMENT_TYPES = [
  "IN", "OUT", "SALE", "RETURN", "ADJUSTMENT", "TRANSFER", "PURCHASE", "REFUND", "DAMAGED",
];

const typeColors: Record<string, string> = {
  IN: "badge-emerald",
  OUT: "badge-red",
  SALE: "bg-burgundy/10 text-burgundy border border-burgundy/20",
  RETURN: "badge-emerald",
  ADJUSTMENT: "badge-gold",
  TRANSFER: "bg-gold/30 text-gold border border-blue-500/20",
  PURCHASE: "bg-gold/10 text-gold border border-emerald/20",
  REFUND: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  DAMAGED: "badge-red",
};

export function AuditLogClient({
  warehouses,
  initialMovements,
}: {
  warehouses: Warehouse[];
  initialMovements: Movement[];
}) {
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 15;

  const filtered = useMemo(() => {
    return initialMovements.filter((m) => {
      if (warehouseFilter && m.warehouseId !== warehouseFilter) return false;
      if (typeFilter && m.movementType !== typeFilter) return false;
      if (dateFrom && new Date(m.createdAt) < new Date(dateFrom)) return false;
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        if (new Date(m.createdAt) > end) return false;
      }
      return true;
    });
  }, [initialMovements, warehouseFilter, typeFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const exportCSV = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (warehouseFilter) params.set("warehouseId", warehouseFilter);
      if (typeFilter) params.set("type", typeFilter);
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      const res = await fetch(`/api/admin/inventory/export?format=csv&${params.toString()}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `inventory-audit-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silent
    }
  }, [warehouseFilter, typeFilter, dateFrom, dateTo]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="luxury-label mb-2">Inventory</p>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Audit Log</h1>
          <p className="mt-1 text-sm text-muted">{filtered.length} movements</p>
        </div>
        <button
          onClick={exportCSV}
          className="btn-secondary inline-flex h-12 items-center rounded-button px-5 text-xs font-semibold uppercase tracking-[0.1em]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          Export CSV
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <select
          value={warehouseFilter}
          onChange={(e) => { setWarehouseFilter(e.target.value); setPage(0); }}
          className="input-premium w-48"
        >
          <option value="">{t("all_warehouses", "All Warehouses")}</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
          className="input-premium w-44"
        >
          <option value="">{t("all_types", "All Types")}</option>
          {MOVEMENT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted">From:</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
            className="input-premium w-40"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted">To:</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
            className="input-premium w-40"
          />
        </div>
      </div>

      <div className="glass overflow-hidden rounded-card border border-white/[0.06]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-xs uppercase tracking-[0.1em] text-muted">
                <th className="px-5 py-4 font-medium">Date</th>
                <th className="px-5 py-4 font-medium">Product</th>
                <th className="px-5 py-4 font-medium">Warehouse</th>
                <th className="px-5 py-4 font-medium">Type</th>
                <th className="px-5 py-4 font-medium text-right">Qty</th>
                <th className="px-5 py-4 font-medium">Reason</th>
                <th className="px-5 py-4 font-medium">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {paged.map((m, i) => (
                <motion.tr
                  key={m.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="transition hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-4 whitespace-nowrap text-xs text-muted">
                    {new Date(m.createdAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-white">{m.productId.slice(0, 8)}...</td>
                  <td className="px-5 py-4 text-muted">{m.warehouseName}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.15em] ${typeColors[m.movementType] || "bg-white/10 text-white/60"}`}>
                      {m.movementType}
                    </span>
                  </td>
                  <td className={`px-5 py-4 text-right font-medium ${m.quantity > 0 ? "text-gold" : m.quantity < 0 ? "text-burgundy" : "text-muted"}`}>
                    {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                  </td>
                  <td className="px-5 py-4 text-muted max-w-[160px] truncate" title={m.reason}>
                    {m.reason || "\u2014"}
                  </td>
                  <td className="px-5 py-4 text-xs text-muted max-w-[120px] truncate" title={m.reference}>
                    {m.reference || "\u2014"}
                  </td>
                </motion.tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted">
                    No movements found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="btn-secondary h-10 rounded-button border border-white/[0.06] bg-card px-4 text-sm text-muted transition hover:bg-surface hover:text-white disabled:opacity-30"
          >
            Previous
          </button>
          <span className="text-sm text-muted">
            Page {page + 1} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="btn-secondary h-10 rounded-button border border-white/[0.06] bg-card px-4 text-sm text-muted transition hover:bg-surface hover:text-white disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
