"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

type Warehouse = {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  country: string;
  manager: string;
  phone: string;
  email: string;
  isDefault: boolean;
  isActive: boolean;
};

type StockRecord = {
  id: string;
  productId: string;
  variantId: string;
  stock: number;
  reservedStock: number;
  productName: string;
  sku: string;
};

export function WarehouseForm({
  warehouse,
  stocks,
}: {
  warehouse: Warehouse | null;
  stocks: StockRecord[];
}) {
  const router = useRouter();
  const isNew = !warehouse;
  const { t } = useTranslation("inventory");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = useCallback(
    async (formData: FormData) => {
      setSaving(true);
      setError("");
      try {
        const data = Object.fromEntries(formData.entries());
        const method = isNew ? "POST" : "PUT";
        const url = isNew ? "/api/admin/inventory/warehouses" : `/api/admin/inventory/warehouses/${warehouse.id}`;
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to save");
        }
        router.push("/admin/inventory/warehouses");
        router.refresh();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : t("an_error_occurred", "An error occurred"));
      } finally {
        setSaving(false);
      }
    },
    [isNew, warehouse, router, t]
  );

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link
            href="/admin/inventory/warehouses"
            className="mb-2 inline-flex items-center gap-1 text-xs text-muted transition hover:text-white"
          >
            &larr; Back to Warehouses
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            {isNew ? t("add_warehouse", "Add Warehouse") : `${t("edit")}: ${warehouse.name}`}
          </h1>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-card border border-burgundy/20 bg-burgundy/10 px-4 py-3 text-sm text-burgundy">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="space-y-8">
        <div className="luxury-card rounded-card border border-white/[0.06] bg-card p-6">
          <p className="luxury-label mb-6 text-[10px] text-muted">{t("warehouse_information", "Warehouse Information")}</p>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label={t("warehouse_name", "Warehouse Name")} name="name" defaultValue={warehouse?.name} required />
            <Field label={t("code_label", "Code")} name="code" defaultValue={warehouse?.code} required />
            <div className="md:col-span-2">
              <Field label={t("address_field")} name="address" defaultValue={warehouse?.address} />
            </div>
            <Field label={t("city_field")} name="city" defaultValue={warehouse?.city} />
            <Field label={t("country_field")} name="country" defaultValue={warehouse?.country ?? "Morocco"} />
            <Field label={t("manager_field")} name="manager" defaultValue={warehouse?.manager} />
            <Field label={t("phone_field")} name="phone" defaultValue={warehouse?.phone} />
            <Field label={t("email_field")} name="email" defaultValue={warehouse?.email} type="email" />
          </div>

          <div className="mt-6 flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isDefault"
                defaultChecked={warehouse?.isDefault ?? false}
                className="h-4 w-4 rounded border-white/20 bg-white/5 accent-gold"
              />
              <span className="text-sm text-white">{t("default_warehouse", "Default Warehouse")}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={warehouse?.isActive ?? true}
                className="h-4 w-4 rounded border-white/20 bg-white/5 accent-gold"
              />
              <span className="text-sm text-white">{t("active", "Active")}</span>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary h-12 rounded-button px-6 text-xs font-semibold uppercase tracking-[0.1em] disabled:opacity-50"
          >
            {saving ? t("saving") : isNew ? "Create Warehouse" : `${t("update")} ${t("warehouse").toLowerCase()}`}
          </button>
          <Link
            href="/admin/inventory/warehouses"
            className="btn-secondary h-12 rounded-button px-6 text-xs font-semibold uppercase tracking-[0.1em]"
          >
            Cancel
          </Link>
        </div>
      </form>

      {!isNew && stocks.length > 0 && (
        <div className="mt-10">
          <p className="luxury-label mb-4 text-[10px] text-muted">Stock Records ({stocks.length})</p>
          <div className="glass overflow-hidden rounded-card border border-white/[0.06]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] text-xs uppercase tracking-[0.1em] text-muted">
                    <th className="px-5 py-4 font-medium">{t("product", "Product")}</th>
                    <th className="px-5 py-4 font-medium">{t("sku", "SKU")}</th>
                    <th className="px-5 py-4 font-medium text-right">{t("stock", "Stock")}</th>
                    <th className="px-5 py-4 font-medium text-right">{t("reserved_stock", "Reserved")}</th>
                    <th className="px-5 py-4 font-medium text-right">{t("available_stock", "Available")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {stocks.map((s) => (
                    <motion.tr key={s.id} className="transition hover:bg-white/[0.02]">
                      <td className="px-5 py-4 font-medium text-white">{s.productName}</td>
                      <td className="px-5 py-4 font-mono text-xs text-muted">{s.sku || "\u2014"}</td>
                      <td className="px-5 py-4 text-right text-white">{s.stock}</td>
                      <td className="px-5 py-4 text-right text-muted">{s.reservedStock}</td>
                      <td className="px-5 py-4 text-right font-medium text-gold">
                        {s.stock - s.reservedStock}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="luxury-label text-[10px] text-muted">{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="input-premium w-full"
      />
    </div>
  );
}
