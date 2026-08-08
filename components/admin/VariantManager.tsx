"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import type { ProductVariantData } from "@/types";

type Props = {
  productId: string;
  variants: ProductVariantData[];
  onVariantsChange: (variants: ProductVariantData[]) => void;
  onHistoryChange: () => void;
};

const EMPTY_VARIANT: ProductVariantData = {
  name: "",
  size: "",
  price: "",
  salePrice: "",
  stock: 0,
  sku: "",
  barcode: "",
  image: "",
  weight: "",
  sortOrder: 0,
  status: "Active",
  isDefault: false,
};

function stripCurrency(val: string): string {
  return val.replace(/[^0-9.]/g, "");
}

export function VariantManager({ productId, variants, onVariantsChange, onHistoryChange }: Props) {
  const { t } = useTranslation("admin");
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVariant, setNewVariant] = useState<ProductVariantData>({ ...EMPTY_VARIANT });

  const handleInlineEdit = (variantId: string, field: keyof ProductVariantData, value: string | number | boolean) => {
    onVariantsChange(
      variants.map((v) => (v.id === variantId ? { ...v, [field]: value } : v))
    );
  };

  const handleSaveInline = async () => {
    setSaving(true);
    try {
      const activeVariants = variants.filter((v) => v.id);
      const res = await fetch(`/api/admin/products/${productId}/variants`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variants: activeVariants }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || t("failed_to_save_variants", "Failed to save variants"));
        return;
      }
      onVariantsChange(data.variants || activeVariants);
      onHistoryChange();
      toast.success(t("variants_saved_success", "Variants saved successfully"));
    } catch {
      toast.error(t("network_error", "Network error"));
    } finally {
      setSaving(false);
    }
  };

  const handleAddVariant = async () => {
    if (!newVariant.name && !newVariant.size) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVariant),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || t("add_variant_error"));
        return;
      }
      onVariantsChange([...variants, data.variant]);
      setNewVariant({ ...EMPTY_VARIANT });
      setShowAddForm(false);
      onHistoryChange();
      toast.success(t("variant_added_success", "Variant added successfully"));
    } catch {
      toast.error(t("network_error", "Network error"));
    } finally {
      setSaving(false);
    }
  };

   const handleDeleteVariant = async (variantId: string) => {
     setSaving(true);
     try {
       const res = await fetch(`/api/admin/products/${productId}/variants/${variantId}`, {
         method: "DELETE",
       });
       if (!res.ok) throw new Error(t("delete_failed"));
       onVariantsChange(variants.filter((v) => v.id !== variantId));
       onHistoryChange();
       toast.success(t("variant_deleted_success", "Variant deleted successfully"));
     } catch {
       toast.error(t("delete_variant_failed", "Failed to delete variant"));
     } finally {
       setSaving(false);
     }
   };

  const handleDuplicateVariant = async (variantId: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}/variants/${variantId}/duplicate`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(t("duplicate_failed", "Duplicate failed"));
      onVariantsChange([...variants, data.variant]);
      onHistoryChange();
      toast.success(t("variant_duplicated_success", "Variant duplicated successfully"));
    } catch {
      toast.error(t("duplicate_variant_error"));
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = (variantId: string) => {
    const updated = variants.map((v) => ({
      ...v,
      isDefault: v.id === variantId,
    }));
    onVariantsChange(updated);
  };

  const handleMoveVariant = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= variants.length) return;
    const updated = [...variants];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    const reordered = updated.map((v, i) => ({ ...v, sortOrder: i }));
    onVariantsChange(reordered);
  };

  if (variants.length === 0 && !showAddForm) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-3 rounded-lg border border-white/[0.06] bg-[#171717]/50 py-8">
          <p className="text-sm text-white/50">{t("no_variants")}</p>
          <p className="text-xs text-white/50">{t("variant_sizes_hint", "Add sizes like 250ml, 330ml, 500ml, 1L")}</p>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="btn-gold h-9 rounded-md px-4 text-xs font-semibold uppercase tracking-[0.1em]"
          >
            {t("new_variant")}
         </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      <div className="flex items-center justify-between">
        <p className="text-xs text-white/50">{variants.length} {t("variants_count", "variant(s)")}</p>
        <div className="flex gap-2">
          {variants.length > 0 && (
            <button
              type="button"
              onClick={handleSaveInline}
              disabled={saving}
              className="btn-gold h-8 rounded-md px-3 text-[10px] font-semibold uppercase tracking-[0.1em] disabled:opacity-50"
            >
              {saving ? t("saving") : t("save_all")}
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="btn-secondary h-8 rounded-md px-3 text-[10px] font-semibold uppercase tracking-[0.1em]"
          >
            {t("add_variant", "+ Add Variant")}
          </button>
        </div>
      </div>

      {/* Add variant form */}
      {showAddForm && (
        <div className="rounded-lg border border-yellow/20 bg-yellow/5 p-4">
          <h3 className="mb-3 text-sm font-medium text-white">{t("new_variant")}</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-[10px] font-medium uppercase tracking-[0.1em] text-white/50">{t("name")}</label>
              <input
                type="text"
                value={newVariant.name}
                onChange={(e) => setNewVariant((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-md border border-white/[0.06] bg-[#171717] px-3 py-2 text-sm text-white outline-none transition focus:border-gold/30"
                placeholder={t("variant_name_placeholder")}
              />
           </div>
            <div>
              <label className="mb-1 block text-[10px] font-medium uppercase tracking-[0.1em] text-white/50">{t("size")}</label>
              <input
                type="text"
                value={newVariant.size}
                onChange={(e) => setNewVariant((prev) => ({ ...prev, size: e.target.value }))}
                className="w-full rounded-md border border-white/[0.06] bg-[#171717] px-3 py-2 text-sm text-white outline-none transition focus:border-gold/30"
                placeholder={t("variant_size_placeholder")}
              />
           </div>
            <div>
              <label className="mb-1 block text-[10px] font-medium uppercase tracking-[0.1em] text-white/50">{t("price")}</label>
              <input
                type="text"
                inputMode="decimal"
                value={newVariant.price}
                onChange={(e) => {
                  const val = stripCurrency(e.target.value);
                  setNewVariant((prev) => ({ ...prev, price: val }));
                }}
                className="w-full rounded-md border border-white/[0.06] bg-[#171717] px-3 py-2 text-sm text-white outline-none transition focus:border-gold/30"
                placeholder={t("price_zero_placeholder", "0.00")}
              />
           </div>
            <div>
              <label className="mb-1 block text-[10px] font-medium uppercase tracking-[0.1em] text-white/50">{t("stock")}</label>
              <input
                type="number"
                min={0}
                value={newVariant.stock}
                onChange={(e) => setNewVariant((prev) => ({ ...prev, stock: Math.max(0, parseInt(e.target.value) || 0) }))}
                className="w-full rounded-md border border-white/[0.06] bg-[#171717] px-3 py-2 text-sm text-white outline-none transition focus:border-gold/30"
              />
           </div>
            <div>
              <label className="mb-1 block text-[10px] font-medium uppercase tracking-[0.1em] text-white/50">{t("sku")}</label>
              <input
                type="text"
                value={newVariant.sku}
                onChange={(e) => setNewVariant((prev) => ({ ...prev, sku: e.target.value }))}
                className="w-full rounded-md border border-white/[0.06] bg-[#171717] px-3 py-2 text-sm text-white outline-none transition focus:border-gold/30"
                placeholder={t("optional")}
              />
           </div>
            <div>
              <label className="mb-1 block text-[10px] font-medium uppercase tracking-[0.1em] text-white/50">{t("barcode")}</label>
              <input
                type="text"
                value={newVariant.barcode}
                onChange={(e) => setNewVariant((prev) => ({ ...prev, barcode: e.target.value }))}
                className="w-full rounded-md border border-white/[0.06] bg-[#171717] px-3 py-2 text-sm text-white outline-none transition focus:border-gold/30"
                placeholder={t("optional", "Optional")}
              />
           </div>
            <div>
              <label className="mb-1 block text-[10px] font-medium uppercase tracking-[0.1em] text-white/50">{t("sale_price")}</label>
              <input
                type="text"
                inputMode="decimal"
                value={newVariant.salePrice}
                onChange={(e) => {
                  const val = stripCurrency(e.target.value);
                  setNewVariant((prev) => ({ ...prev, salePrice: val }));
                }}
                className="w-full rounded-md border border-white/[0.06] bg-[#171717] px-3 py-2 text-sm text-white outline-none transition focus:border-gold/30"
                placeholder={t("price_zero_placeholder", "0.00")}
              />
           </div>
            <div>
              <label className="mb-1 block text-[10px] font-medium uppercase tracking-[0.1em] text-white/50">{t("weight")}</label>
              <input
                type="text"
                value={newVariant.weight}
                onChange={(e) => setNewVariant((prev) => ({ ...prev, weight: e.target.value }))}
                className="w-full rounded-md border border-white/[0.06] bg-[#171717] px-3 py-2 text-sm text-white outline-none transition focus:border-gold/30"
                placeholder={t("variant_weight_placeholder")}
              />
           </div>
         </div>
          <div className="mt-3 flex items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={newVariant.isDefault}
                onChange={(e) => setNewVariant((prev) => ({ ...prev, isDefault: e.target.checked }))}
                className="h-4 w-4 rounded border-white/20 bg-white/5 accent-gold"
              />
              <span className="text-xs text-white">{t("default_variant")}</span>
           </label>
            <label className="flex cursor-pointer items-center gap-2">
              <select
                value={newVariant.status}
                onChange={(e) => setNewVariant((prev) => ({ ...prev, status: e.target.value }))}
                className="rounded-md border border-white/[0.06] bg-[#171717] px-3 py-1.5 text-xs text-white outline-none"
              >
                <option value="Active">{t("active")}</option>
                <option value="Inactive">{t("inactive")}</option>
             </select>
           </label>
         </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleAddVariant}
              disabled={saving || (!newVariant.name && !newVariant.size)}
              className="btn-gold h-8 rounded-md px-4 text-[10px] font-semibold uppercase tracking-[0.1em] disabled:opacity-50"
            >
              {saving ? t("saving") : t("new_variant")}
           </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setNewVariant({ ...EMPTY_VARIANT });
              }}
              className="btn-secondary h-8 rounded-md px-4 text-[10px] font-semibold uppercase tracking-[0.1em]"
            >
              {t("cancel", "Cancel")}
           </button>
         </div>
       </div>
      )}

      {/* Variants table */}
      {variants.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-white/[0.06]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-[10px] uppercase tracking-[0.1em] text-white/50">
                <th className="w-8 px-3 py-2"></th>
                <th className="px-3 py-2">{t("name_size_header")}</th>
                <th className="px-3 py-2">{t("price")}</th>
                <th className="px-3 py-2">{t("sale")}</th>
                <th className="px-3 py-2 text-center">{t("stock")}</th>
                <th className="px-3 py-2">{t("sku")}</th>
                <th className="px-3 py-2">{t("barcode")}</th>
                <th className="px-3 py-2">{t("status")}</th>
                <th className="px-3 py-2 text-right">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant, idx) => {
                return (
                  <tr key={variant.id || `new-${idx}`} className="border-b border-white/[0.04] transition hover:bg-white/[0.02]">
                    <td className="px-3 py-2">
                      <div className="flex gap-0.5">
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => handleMoveVariant(idx, idx - 1)}
                            className="rounded p-0.5 text-white/50 transition hover:text-white"
                            aria-label={t("move_up")}
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="18 15 12 9 6 15" />
                            </svg>
                          </button>
                        )}
                        {idx < variants.length - 1 && (
                          <button
                            type="button"
                            onClick={() => handleMoveVariant(idx, idx + 1)}
                            className="rounded p-0.5 text-white/50 transition hover:text-white"
                            aria-label={t("move_down")}
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div>
                          <input
                            type="text"
                            value={variant.name}
                            onChange={(e) => handleInlineEdit(variant.id!, "name", e.target.value)}
                            className="w-24 rounded border border-transparent bg-transparent px-1 py-0.5 text-white outline-none transition hover:border-white/10 focus:border-gold/30"
                          />
                          <input
                            type="text"
                            value={variant.size}
                            onChange={(e) => handleInlineEdit(variant.id!, "size", e.target.value)}
                            className="block w-20 rounded border border-transparent bg-transparent px-1 py-0.5 text-white/50 outline-none transition hover:border-white/10 focus:border-gold/30"
                            placeholder={t("size")}
                          />
                        </div>
                        {variant.isDefault && (
                          <span className="shrink-0 rounded bg-yellow/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-yellow">
                            {t("default_variant")}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={variant.price}
                        onChange={(e) => handleInlineEdit(variant.id!, "price", stripCurrency(e.target.value))}
                        className="w-16 rounded border border-transparent bg-transparent px-1 py-0.5 text-white outline-none transition hover:border-white/10 focus:border-gold/30"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={variant.salePrice}
                        onChange={(e) => handleInlineEdit(variant.id!, "salePrice", stripCurrency(e.target.value))}
                        className="w-16 rounded border border-transparent bg-transparent px-1 py-0.5 text-white outline-none transition hover:border-white/10 focus:border-gold/30"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className={`inline-flex h-2 w-2 rounded-full ${
                          variant.stock <= 0 ? "bg-burgundy" : variant.stock < 5 ? "bg-gold" : "bg-white/20"
                        }`} />
                        <input
                          type="number"
                          min={0}
                          value={variant.stock}
                          onChange={(e) => handleInlineEdit(variant.id!, "stock", Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-12 rounded border border-transparent bg-transparent px-1 py-0.5 text-center text-white outline-none transition hover:border-white/10 focus:border-gold/30"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={variant.sku}
                        onChange={(e) => handleInlineEdit(variant.id!, "sku", e.target.value)}
                        className="w-20 rounded border border-transparent bg-transparent px-1 py-0.5 font-mono text-xs text-white outline-none transition hover:border-white/10 focus:border-gold/30"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={variant.barcode}
                        onChange={(e) => handleInlineEdit(variant.id!, "barcode", e.target.value)}
                        className="w-16 rounded border border-transparent bg-transparent px-1 py-0.5 font-mono text-xs text-white outline-none transition hover:border-white/10 focus:border-gold/30"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={variant.status}
                        onChange={(e) => handleInlineEdit(variant.id!, "status", e.target.value)}
                        className="rounded border border-transparent bg-transparent px-1 py-0.5 text-xs text-white outline-none transition hover:border-white/10 focus:border-gold/30"
                      >
                        <option value="Active">{t("active")}</option>
                        <option value="Inactive">{t("inactive")}</option>
                      </select>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleSetDefault(variant.id!)}
                          className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] transition ${
                            variant.isDefault
                              ? "bg-yellow/20 text-yellow"
                              : "text-white/50 hover:text-white"
                          }`}
                          title={t("set_default")}
                        >
                          D
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicateVariant(variant.id!)}
                          className="rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-white/50 transition hover:text-white"
                          title={t("duplicate_variant")}
                        >
                          ⧉
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteVariant(variant.id!)}
                          className="rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-burgundy/60 transition hover:text-burgundy"
                          title={t("delete_variant")}
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
