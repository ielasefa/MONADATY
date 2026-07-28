"use client";
import { logError } from "@/lib/logger";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { SingleImageUploader } from "@/components/admin/SingleImageUploader";
import type { StoredProduct, StoredCategory, StoredCollection } from "@/types";

type Props = {
  products: StoredProduct[];
  categories: StoredCategory[];
  collections: StoredCollection[];
  saveProduct: (d: FormData) => void;
};

export function ShopForm({ products, categories, collections, saveProduct }: Props) {
  const { t } = useTranslation("admin");
  const { t: tc } = useTranslation("common");
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const deleteLockRef = useRef(false);

  const visibleProducts = products.filter((p) => !removedIds.has(p.id));

  const editing = editingId ? visibleProducts.find((p) => p.id === editingId) ?? null : null;

  return (
    <div>
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-white">{t("products")}</h1>
          <p className="mt-1 text-sm text-muted">{t("products_found_plural", { count: String(visibleProducts.length) })}</p>
        </div>
          <button onClick={() => setEditingId("__new__")} className="btn-secondary h-12 rounded-button px-5 text-sm font-medium uppercase tracking-[0.08em] text-white transition hover:bg-secondary/90">
            {tc("new_product")}
          </button>
      </div>

      {(editingId === "__new__" || editing) && (
        <ProductEditor
          product={editing}
          categories={categories}
          collections={collections}
          onSave={saveProduct}
          onCancel={() => setEditingId(null)}
        />
      )}

      <div className="space-y-3">
        {visibleProducts.map((p) => {
          const stockStatus = p.stock === 0 ? "out" : p.stock <= 10 ? "low" : "in";
          const statusStyles = {
            out: "border-red/20 bg-red/10 text-red",
            low: "border-orange-500/20 bg-orange-500/10 text-orange-400",
            in: "border-emerald/20 bg-emerald/10 text-emerald-400",
          };
          const statusIcons = {
            out: "\u274C",
            low: "\u26A0\uFE0F",
            in: "\u2705",
          };
          const statusLabels = {
            out: t("out_of_stock_label"),
            low: t("low_stock_label"),
            in: t("in_stock_label"),
          };
          return (
          <div key={p.id} className="luxury-card flex items-center gap-4 rounded-card border border-white/[0.06] bg-card p-5 transition-all duration-300 hover:bg-card">
            <div className="flex-1">
              <p className="font-medium text-white">{p.name}</p>
              <p className="mt-0.5 text-sm text-muted">{p.price} &middot; {p.category}</p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.1em] ${statusStyles[stockStatus]}`}
              title={`${statusLabels[stockStatus]}: ${p.stock} units remaining`}
              aria-label={`${statusLabels[stockStatus]}: ${p.stock} units remaining`}
            >
              <span className="text-[0.5rem]">{statusIcons[stockStatus]}</span>
              <span>{statusLabels[stockStatus]}</span>
              <span className="ml-0.5 opacity-70">({p.stock})</span>
            </span>
            <button
              onClick={() => setEditingId(p.id)}
              className="text-sm text-gold hover:underline"
              aria-label={`${t("edit")} ${p.name}`}
            >
              {t("edit")}
            </button>
            <button
              onClick={async () => {
                if (deleting || deleteLockRef.current) return;
                deleteLockRef.current = true;
                setDeleting(p.id);
                try {
                  const res = await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
                  if (!res.ok) {
                    const body = await res.text();
                    throw new Error(body.slice(0, 100));
                  }
                  setRemovedIds((prev) => new Set([...prev, p.id]));
                  setDeleting(null);
                  router.refresh();
                } catch (e) {
                  logError(e, "Delete failed:");
                  toast.error(t("delete_failed") || "Delete failed");
                  setDeleting(null);
                } finally {
                  deleteLockRef.current = false;
                }
              }}
              disabled={deleting === p.id}
              className="badge-red rounded-full bg-red/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-red transition hover:bg-red/20 disabled:opacity-50"
              aria-label={`${t("delete")} ${p.name}`}
            >
              {deleting === p.id ? "..." : t("delete")}
            </button>
          </div>
          );
        })}
      </div>
    </div>
  );
}

function ProductEditor({ product, categories, collections, onSave, onCancel }: {
  product: StoredProduct | null;
  categories: StoredCategory[];
  collections: StoredCollection[];
  onSave: (d: FormData) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation("admin");
  const { t: tc } = useTranslation("common");
  const [isPending, startTransition] = useTransition();
  const isNew = !product;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await onSave(formData);
        toast.success(isNew ? tc("product_created_success", "Product created successfully") : tc("product_updated_success", "Product updated successfully"));
        onCancel();
      } catch {
        toast.error(tc("save_failed", "Save failed"));
      }
    });
  };

  return (
        <div className="glass mb-8 rounded-card border border-white/[0.06] p-8">
      <h2 className="font-display mb-6 text-lg font-semibold text-white">{isNew ? tc("new_product") : `${tc("edit_product")}: ${product.name}`}</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {!isNew && <input type="hidden" name="id" value={product.id} />}
        <div className="grid grid-cols-2 gap-4">
          <Field label={t("name_label")} name="name" defaultValue={product?.name} />
          <Field label={tc("slug_label")} name="slug" defaultValue={product?.slug} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Field label={t("price")} name="price" defaultValue={product?.price} />
          <Field label={tc("compare_price_label")} name="comparePrice" defaultValue={product?.comparePrice} />
          <Field label={tc("stock_label")} name="stock" type="number" defaultValue={product?.stock?.toString()} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Select label={t("category")} name="category" options={categories.map((c) => c.name)} defaultValue={product?.category} />
          <Select label={t("collection")} name="collection" options={collections.map((c) => c.slug)} defaultValue={product?.collection} />
          <div className="space-y-1.5">
            <label className="luxury-label block text-[10px] text-muted">{tc("image_label")}</label>
            <input type="hidden" name="image" value={product?.image || ""} />
            <SingleImageUploader
              value={product?.image || ""}
              onChange={(url) => {
                const input = document.querySelector<HTMLInputElement>('input[name="image"]');
                if (input) input.value = url;
              }}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select label={tc("visual_label")} name="visual" options={["", "can", "bottle", "glass"]} defaultValue={product?.visual} />
          <Field label={tc("accent_color_label")} name="accent" defaultValue={product?.accent || "#D5B87D"} type="color" />
        </div>
        <Field label={t("description_label")} name="description" defaultValue={product?.description} rows={3} />
        <div className="grid grid-cols-2 gap-4">
          <Field label={tc("ingredients_label")} name="ingredients" defaultValue={product?.ingredients} rows={2} />
          <Field label={tc("nutrition_label")} name="nutrition" defaultValue={product?.nutrition} rows={2} />
        </div>
        <Field label={tc("badges_label")} name="badges" defaultValue={product?.badges?.join(", ")} />
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-muted">
            <input type="hidden" name="featured" value="false" />
            <input type="checkbox" name="featured" value="true" defaultChecked={product?.featured} className="h-4 w-4 rounded border-white/10 bg-surface text-gold focus:ring-gold/30" /> {tc("featured_label")}
          </label>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input type="hidden" name="available" value="false" />
            <input type="checkbox" name="available" value="true" defaultChecked={product?.available ?? true} className="h-4 w-4 rounded border-white/10 bg-surface text-gold focus:ring-gold/30" /> {tc("available_label")}
          </label>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={isPending} className="btn-primary h-12 rounded-button bg-red px-6 text-sm font-medium text-white transition hover:bg-red/90 disabled:opacity-50">
            {isPending ? tc("saving", "Saving...") : isNew ? tc("create_product", "Create Product") : tc("update_product", "Update Product")}
          </button>
          <button type="button" onClick={onCancel} disabled={isPending} className="btn-secondary h-12 rounded-button border border-white/[0.06] bg-card px-6 text-sm text-muted transition hover:bg-surface hover:text-white disabled:opacity-50">{tc("cancel")}</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, name, defaultValue, type, rows }: { label: string; name: string; defaultValue?: string; type?: string; rows?: number }) {
  return (
    <div className="space-y-1.5">
      <label className="luxury-label block text-[10px] text-muted">{label}</label>
      {rows ? (
          <textarea name={name} defaultValue={defaultValue} rows={rows} className="input-premium h-12 w-full rounded-input border border-white/[0.06] bg-surface px-4 py-2.5 text-sm text-white outline-none transition focus:border-gold/40 focus:ring-1 focus:ring-gold/20" />
        ) : (
          <input name={name} type={type || "text"} defaultValue={defaultValue} className="input-premium h-12 w-full rounded-input border border-white/[0.06] bg-surface px-4 text-sm text-white outline-none transition focus:border-gold/40 focus:ring-1 focus:ring-gold/20" />
      )}
    </div>
  );
}

function Select({ label, name, options, defaultValue }: { label: string; name: string; options: string[]; defaultValue?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="luxury-label block text-[10px] text-muted">{label}</label>
      <select name={name} defaultValue={defaultValue} className="input-premium h-12 w-full rounded-input border border-white/[0.06] bg-surface px-4 text-sm text-white outline-none transition focus:border-gold/40 focus:ring-1 focus:ring-gold/20">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
