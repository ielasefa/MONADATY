"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

type OrderInfo = {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  warehouseName: string;
  status: string;
  notes: string;
  subtotal: string;
  tax: string;
  total: string;
  createdAt: string;
  updatedAt: string;
};

type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  variantId: string;
  quantity: number;
  cost: string;
  receivedQuantity: number;
  remainingQuantity: number;
};

type SelectOption = { id: string; name: string };

const statusFlow: Record<string, string[]> = {
  Draft: ["Pending"],
  Pending: ["Approved", "Cancelled"],
  Approved: ["Ordered", "Cancelled"],
  Ordered: ["Received"],
  Received: [],
  Cancelled: [],
};

const statusColors: Record<string, string> = {
  Draft: "bg-white/10 text-white/60 border border-white/10",
  Pending: "badge-gold",
  Approved: "bg-gold/10 text-gold border border-emerald/20",
  Ordered: "bg-gold/30 text-gold border border-blue-500/20",
  Received: "badge-emerald",
  Cancelled: "badge-red",
};

export function PurchaseOrderDetailClient({
  order,
  items,
  suppliers,
  warehouses,
}: {
  order: OrderInfo | null;
  items: OrderItem[];
  suppliers: SelectOption[];
  warehouses: SelectOption[];
}) {
  const router = useRouter();
  const isNew = !order;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [localOrder, setLocalOrder] = useState(order);
  const [receiveQuantities, setReceiveQuantities] = useState<Record<string, number>>({});
  const localItems = items;

  const handleSave = useCallback(
    async (formData: FormData) => {
      setSaving(true);
      setError("");
      try {
        const data = Object.fromEntries(formData.entries());
        const method = isNew ? "POST" : "PUT";
        const url = isNew
          ? "/api/admin/inventory/purchase-orders"
          : `/api/admin/inventory/purchase-orders/${order!.id}`;
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to save");
        }
        router.push("/admin/inventory/purchase-orders");
        router.refresh();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "An error occurred");
      } finally {
        setSaving(false);
      }
    },
    [isNew, order, router]
  );

  const updateStatus = async (newStatus: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/inventory/purchase-orders/${order!.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update status");
      }
      setLocalOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleReceive = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/inventory/purchase-orders/${order!.id}/receive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantities: receiveQuantities }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to receive items");
      }
      setReceiveQuantities({});
      setLocalOrder((prev) => (prev ? { ...prev, status: "Received" } : prev));
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const nextStatuses = localOrder ? statusFlow[localOrder.status] || [] : [];

  if (isNew) {
    return (
      <div>
        <div className="mb-8">
          <Link href="/admin/inventory/purchase-orders" className="mb-2 inline-flex items-center gap-1 text-xs text-muted transition hover:text-white">
            {t("back_to_purchase_orders", "← Back to Purchase Orders")}
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-white">New Purchase Order</h1>
        </div>
        {error && <div className="mb-6 rounded-card border border-burgundy/20 bg-burgundy/10 px-4 py-3 text-sm text-burgundy">{error}</div>}
        <form action={handleSave} className="space-y-8">
          <div className="luxury-card rounded-card border border-white/[0.06] bg-card p-6">
            <p className="luxury-label mb-6 text-[10px] text-muted">Order Details</p>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="luxury-label text-[10px] text-muted">Supplier</label>
                <select name="supplierId" className="input-premium w-full" required>
                  <option value="">Select supplier...</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="luxury-label text-[10px] text-muted">Warehouse</label>
                <select name="warehouseId" className="input-premium w-full" required>
                  <option value="">Select warehouse...</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <div className="space-y-2">
                  <label className="luxury-label text-[10px] text-muted">Notes</label>
                  <textarea name="notes" rows={3} className="input-premium w-full min-h-[80px] resize-y px-4 py-3" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="btn-primary h-12 rounded-button px-6 text-xs font-semibold uppercase tracking-[0.1em] disabled:opacity-50">
              {saving ? t("saving") : : `${t("create")} ${t("purchase_order").toLowerCase()}`}
            </button>
            <Link href="/admin/inventory/purchase-orders" className="btn-secondary h-12 rounded-button px-6 text-xs font-semibold uppercase tracking-[0.1em]">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/admin/inventory/purchase-orders" className="mb-2 inline-flex items-center gap-1 text-xs text-muted transition hover:text-white">
            {t("back_to_purchase_orders", "← Back to Purchase Orders")}
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            {localOrder!.orderNumber}
          </h1>
        </div>
        <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] ${statusColors[localOrder!.status] || "bg-white/10 text-white/60"}`}>
          {localOrder!.status}
        </span>
      </div>

      {error && (
        <div className="mb-6 rounded-card border border-burgundy/20 bg-burgundy/10 px-4 py-3 text-sm text-burgundy">{error}</div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="luxury-card rounded-card border border-white/[0.06] bg-card p-5">
          <p className="luxury-label text-[10px] text-muted">Supplier</p>
          <p className="mt-1 text-sm font-medium text-white">{localOrder!.supplierName}</p>
        </div>
        <div className="luxury-card rounded-card border border-white/[0.06] bg-card p-5">
          <p className="luxury-label text-[10px] text-muted">Warehouse</p>
          <p className="mt-1 text-sm font-medium text-white">{localOrder!.warehouseName}</p>
        </div>
        <div className="luxury-card rounded-card border border-white/[0.06] bg-card p-5">
          <p className="luxury-label text-[10px] text-muted">Created</p>
          <p className="mt-1 text-sm font-medium text-white">
            {new Date(localOrder!.createdAt).toLocaleDateString("en-US", {
              year: "numeric", month: "long", day: "numeric",
            })}
          </p>
        </div>
      </div>

      {nextStatuses.length > 0 && (
        <div className="mb-8 flex flex-wrap items-center gap-3 rounded-card border border-white/[0.06] bg-card p-4">
          <span className="text-xs text-muted">Update Status:</span>
          {nextStatuses.map((s) => (
            <button
              key={s}
              onClick={() => updateStatus(s)}
              disabled={saving}
              className={`h-10 rounded-button px-4 text-xs font-semibold uppercase tracking-[0.1em] transition-all disabled:opacity-50 ${
                s === "Cancelled"
                  ? "bg-burgundy/10 text-burgundy border border-burgundy/20 hover:bg-burgundy/20"
                  : "btn-gold"
              }`}
            >
              {saving ? "..." : `Mark as ${s}`}
            </button>
          ))}
        </div>
      )}

      <div className="mb-8">
        <p className="luxury-label mb-4 text-[10px] text-muted">Items</p>
        <div className="glass overflow-hidden rounded-card border border-white/[0.06]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-xs uppercase tracking-[0.1em] text-muted">
                  <th className="px-5 py-4 font-medium">Product</th>
                  <th className="px-5 py-4 font-medium">SKU</th>
                  <th className="px-5 py-4 font-medium text-right">Qty Ordered</th>
                  <th className="px-5 py-4 font-medium text-right">Cost</th>
                  <th className="px-5 py-4 font-medium text-right">Received</th>
                  <th className="px-5 py-4 font-medium text-right">Remaining</th>
                  <th className="px-5 py-4 font-medium text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {localItems.map((item) => {
                  const costNum = parseFloat(item.cost.replace(/[^0-9.]/g, "")) || 0;
                  const subtotal = costNum * item.quantity;
                  return (
                    <motion.tr key={item.id} className="transition hover:bg-white/[0.02]">
                      <td className="px-5 py-4 font-medium text-white">{item.productName}</td>
                      <td className="px-5 py-4 font-mono text-xs text-muted">{item.sku || "\u2014"}</td>
                      <td className="px-5 py-4 text-right text-white">{item.quantity}</td>
                      <td className="px-5 py-4 text-right text-muted">{item.cost}</td>
                      <td className="px-5 py-4 text-right text-gold">{item.receivedQuantity}</td>
                      <td className="px-5 py-4 text-right text-muted">{item.remainingQuantity}</td>
                      <td className="px-5 py-4 text-right font-medium text-white">{subtotal.toFixed(2)} DH</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {localOrder!.status === "Ordered" && (
        <div className="mb-8 luxury-card rounded-card border border-white/[0.06] bg-card p-6">
          <p className="luxury-label mb-4 text-[10px] text-muted">Receive Items</p>
          <div className="space-y-4">
            {localItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <span className="flex-1 text-sm text-white">{item.productName}</span>
                <span className="text-xs text-muted">
                  Ordered: {item.quantity} | Received: {item.receivedQuantity} | Remaining: {item.remainingQuantity}
                </span>
                <input
                  type="number"
                  min={0}
                  max={item.remainingQuantity}
                  value={receiveQuantities[item.id] ?? 0}
                  onChange={(e) =>
                    setReceiveQuantities((prev) => ({
                      ...prev,
                      [item.id]: Math.max(0, Math.min(item.remainingQuantity, parseInt(e.target.value) || 0)),
                    }))
                  }
                  className="input-premium w-24 text-center"
                  placeholder="Qty"
                />
              </div>
            ))}
            <button
              onClick={handleReceive}
              disabled={saving || Object.values(receiveQuantities).every((v) => v === 0)}
              className="btn-primary h-12 rounded-button px-6 text-xs font-semibold uppercase tracking-[0.1em] disabled:opacity-50"
            >
              {saving ? t("processing") : : `${t("receive_items", "Receive Items")}`}
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-end border-t border-white/[0.06] pt-4">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Subtotal</span>
            <span className="text-white">{localOrder!.subtotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Tax</span>
            <span className="text-white">{localOrder!.tax}</span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span className="text-white">Total</span>
            <span className="text-gold">{localOrder!.total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
