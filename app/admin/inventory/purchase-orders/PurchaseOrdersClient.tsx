"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

type PO = {
  id: string;
  orderNumber: string;
  supplierName: string;
  warehouseName: string;
  status: string;
  total: string;
  createdAt: string;
};

const statusColors: Record<string, string> = {
  Draft: "bg-white/10 text-white/60 border border-white/10",
  Pending: "badge-gold",
  Approved: "bg-gold/10 text-gold border border-emerald/20",
  Ordered: "bg-gold/30 text-gold border border-blue-500/20",
  Received: "badge-emerald",
  Cancelled: "badge-red",
};

const statuses = ["Draft", "Pending", "Approved", "Ordered", "Received", "Cancelled"];

export function PurchaseOrdersClient({
  orders: initial,
  suppliers,
}: {
  orders: PO[];
  suppliers: { id: string; name: string }[];
}) {
  const { t } = useTranslation("inventory");
  const [statusFilter, setStatusFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return initial.filter((o) => {
      if (statusFilter && o.status !== statusFilter) return false;
      if (supplierFilter && o.supplierName !== supplierFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          o.orderNumber.toLowerCase().includes(q) ||
          o.supplierName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [initial, statusFilter, supplierFilter, search]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="luxury-label mb-2">Inventory</p>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Purchase Orders</h1>
          <p className="mt-1 text-sm text-muted">{initial.length} total orders</p>
        </div>
        <Link
          href="/admin/inventory/purchase-orders/new"
          className="btn-primary inline-flex h-12 items-center rounded-button px-5 text-xs font-semibold uppercase tracking-[0.1em]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mr-2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Purchase Order
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search orders..."
          className="input-premium w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-premium w-44"
        >
          <option value="">All Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={supplierFilter}
          onChange={(e) => setSupplierFilter(e.target.value)}
          className="input-premium w-48"
        >
          <option value="">All Suppliers</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.name}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="glass overflow-hidden rounded-card border border-white/[0.06]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-xs uppercase tracking-[0.1em] text-muted">
                <th className="px-5 py-4 font-medium">Order #</th>
                <th className="px-5 py-4 font-medium">Supplier</th>
                <th className="px-5 py-4 font-medium">Warehouse</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium text-right">{t("total")}</th>
                <th className="px-5 py-4 font-medium text-right">Date</th>
                <th className="px-5 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filtered.map((o, i) => (
                <motion.tr
                  key={o.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="transition hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-4 font-mono text-xs font-medium text-white">{o.orderNumber}</td>
                  <td className="px-5 py-4 text-muted">{o.supplierName}</td>
                  <td className="px-5 py-4 text-muted">{o.warehouseName}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.15em] ${statusColors[o.status] || "bg-white/10 text-white/60"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-medium text-white">{o.total}</td>
                  <td className="px-5 py-4 text-right text-xs text-muted">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/inventory/purchase-orders/${o.id}`}
                      className="rounded-button px-3 py-1.5 text-sm font-medium text-gold transition hover:bg-gold/10"
                    >
                      View
                    </Link>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted">
                    No purchase orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
