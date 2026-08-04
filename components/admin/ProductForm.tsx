"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { CategoryCreateModal } from "@/components/admin/CategoryCreateModal";
import { useTranslation } from "@/hooks/useTranslation";
import type { ProductFormData } from "@/types";

const AUTO_SAVE_INTERVAL = 10000;
const DRAFT_KEY = "monadaty-product-draft";
const CURRENCIES = ["MAD", "EUR", "USD"];

type CategoryOption = { id: string; name: string; slug: string };
type CollectionOption = { id: string; name: string; slug: string };

function generateSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function generateSku(name: string): string {
  const prefix = name
    .split(/\s+/)
    .slice(0, 3)
    .map((w) => w.replace(/[^a-zA-Z0-9]/g, "").toUpperCase())
    .join("-");
  const suffix = Math.random().toString(36).toUpperCase().slice(-6);
  return `${prefix}-${suffix}`;
}

function stripCurrency(val: string): string {
  return val.replace(/[^0-9.]/g, "");
}

function formatPrice(val: string, currency: string): string {
  const num = parseFloat(stripCurrency(val));
  if (isNaN(num)) return `0.00 ${currency}`;
  return `${num.toFixed(2)} ${currency}`;
}

export function ProductForm() {
  const { t } = useTranslation("admin");
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [collections, setCollections] = useState<CollectionOption[]>([]);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [skuManuallyEdited, setSkuManuallyEdited] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const slugTimeout = useRef<NodeJS.Timeout | null>(null);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const formDirty = useRef(false);

  const initialForm: ProductFormData = {
    name: "",
    slug: "",
    shortDescription: "",
    description: "",
    sku: "",
    barcode: "",
    regularPrice: "",
    salePrice: "",
    costPrice: "",
    currency: "MAD",
    stock: 0,
    lowStockThreshold: 5,
    categoryId: "",
    collectionId: "",
    brand: "",
    status: "Draft",
    featured: false,
    isBestSeller: false,
    images: [],
  };

  const [form, setForm] = useState<ProductFormData>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return { ...initialForm, ...parsed, images: parsed.images || [] };
        }
      } catch {}
    }
    return initialForm;
  });

  useEffect(() => {
    fetch("/api/admin/categories/list")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {});

    fetch("/api/admin/collections/list")
      .then((r) => r.json())
      .then((d) => setCollections(d.collections || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    autoSaveTimer.current = setInterval(() => {
      if (formDirty.current) {
        try {
          localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
        } catch {}
        formDirty.current = false;
      }
    }, AUTO_SAVE_INTERVAL);
    return () => {
      if (autoSaveTimer.current) clearInterval(autoSaveTimer.current);
    };
  }, [form]);

  useEffect(() => {
    formDirty.current = true;
  }, [form]);

  const updateField = useCallback(<K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleNameChange = (val: string) => {
    updateField("name", val);
    if (!slugManuallyEdited) {
      const newSlug = generateSlug(val);
      updateField("slug", newSlug);
      checkSlug(newSlug);
    }
    if (!skuManuallyEdited && val.trim()) {
      updateField("sku", generateSku(val));
    }
  };

  const handleSlugChange = (val: string) => {
    setSlugManuallyEdited(true);
    const clean = generateSlug(val);
    updateField("slug", clean);
    checkSlug(clean);
  };

  const checkSlug = (slug: string) => {
    if (slugTimeout.current) clearTimeout(slugTimeout.current);
    if (!slug) {
      setSlugAvailable(null);
      return;
    }
    slugTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/products/check-slug?slug=${encodeURIComponent(slug)}`);
        const data = await res.json();
        setSlugAvailable(data.available);
      } catch {
        setSlugAvailable(null);
      }
    }, 400);
  };

  const handleSkuChange = (val: string) => {
    setSkuManuallyEdited(true);
    updateField("sku", val);
  };

  const handlePriceChange = (field: "regularPrice" | "salePrice" | "costPrice", val: string) => {
    const cleaned = stripCurrency(val);
    const num = parseFloat(cleaned);
    updateField(field, isNaN(num) ? "" : cleaned);
  };

  const inventoryStatus = (() => {
    if (form.stock <= 0) return { label: t("out_of_stock_label"), color: "text-burgundy", dot: "bg-burgundy" };
    if (form.stock < form.lowStockThreshold) return { label: t("low_stock"), color: "text-gold", dot: "bg-gold" };
    return { label: t("in_stock_label"), color: "text-white/80", dot: "bg-white/20" };
  })();

  const profit = (() => {
    const reg = parseFloat(form.regularPrice) || 0;
    const cost = parseFloat(form.costPrice) || 0;
    return reg - cost;
  })();

  const margin = (() => {
    const reg = parseFloat(form.regularPrice) || 0;
    if (reg <= 0) return 0;
    return (profit / reg) * 100;
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const payload = {
        ...form,
        regularPrice: formatPrice(form.regularPrice, form.currency),
        salePrice: form.salePrice ? formatPrice(form.salePrice, form.currency) : "",
        costPrice: form.costPrice ? formatPrice(form.costPrice, form.currency) : "",
        images: form.images.map((img, idx) => ({
          url: img.url,
          alt: img.alt,
          sortOrder: idx,
          isCover: img.isCover,
          width: img.width,
          height: img.height,
          format: img.format,
          publicId: img.publicId || "",
          bytes: img.bytes || 0,
          imageHash: img.imageHash || "",
          blurDataURL: img.blurDataURL || "",
        })),
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("failed_to_create_product", "Failed to create product"));
        setSaving(false);
        return;
      }

      localStorage.removeItem(DRAFT_KEY);
      toast.success(t("product_created_success", "Product created successfully"));
      setCreated(true);
      setTimeout(() => router.push("/admin/products"), 2000);
    } catch {
      setError(t("network_error", "Network error"));
      setSaving(false);
    }
  };

  const discardDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setForm(initialForm);
    setSlugManuallyEdited(false);
    setSkuManuallyEdited(false);
  };

  if (created) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" data-testid="product-created-success">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald/20">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0F8B6F" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-white">{t("product_created_success", "Product created successfully")}</h2>
          <p className="mt-2 text-muted">{t("redirecting", "Redirecting to products list...")}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red/20 bg-red/10 px-4 py-3 text-sm text-red">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-white md:text-3xl">{t("add_product", "Add Product")}</h1>
          <p className="mt-1 text-sm text-muted">{t("product_create_desc")}</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={discardDraft}
            className="btn-secondary h-10 rounded-button px-4 text-xs font-semibold uppercase tracking-[0.1em]"
          >
            {t("discard")}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-gold h-10 rounded-button px-6 text-xs font-semibold uppercase tracking-[0.1em] disabled:opacity-50"
          >
            {saving ? t("saving") : t("save_product")}
          </button>
        </div>
      </div>

      {/* Basic Information */}
      <section className="glass rounded-card p-6">
        <h2 className="mb-5 text-base font-semibold text-white">{t("basic_information")}</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="p-name" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-muted">
              {t("product_name", "Product Name")} <span className="text-burgundy">*</span>
            </label>
            <input
              id="p-name"
              type="text"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full rounded-button border border-white/[0.06] bg-bg px-4 py-2.5 text-sm text-white outline-none transition focus:border-gold/30"
              placeholder={t("product_name_placeholder")}
              required
            />
          </div>
          <div>
            <label htmlFor="p-slug" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-muted">
              {t("slug", "Slug")}
            </label>
            <div className="relative">
              <input
                id="p-slug"
                type="text"
                value={form.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className="w-full rounded-button border border-white/[0.06] bg-bg px-4 py-2.5 pr-10 text-sm text-white outline-none transition focus:border-gold/30"
                placeholder={t("product_slug_placeholder")}
                required
              />
              {slugAvailable !== null && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {slugAvailable ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F8B6F" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C1121F" strokeWidth="2.5">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  )}
                </span>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="p-short" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-muted">
              {t("short_description", "Short Description")}
            </label>
            <input
              id="p-short"
              type="text"
              value={form.shortDescription}
              onChange={(e) => updateField("shortDescription", e.target.value)}
              className="w-full rounded-button border border-white/[0.06] bg-bg px-4 py-2.5 text-sm text-white outline-none transition focus:border-gold/30"
              placeholder={t("product_desc_placeholder")}
            />
          </div>
          <div>
            <label htmlFor="p-desc" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-muted">
              {t("full_description", "Full Description")}
            </label>
            <textarea
              id="p-desc"
              rows={4}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              className="w-full rounded-button border border-white/[0.06] bg-bg px-4 py-2.5 text-sm text-white outline-none transition focus:border-gold/30"
              placeholder={t("product_detail_placeholder")}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="p-sku" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-muted">
                {t("sku", "SKU")}
              </label>
              <input
                id="p-sku"
                type="text"
                value={form.sku}
                onChange={(e) => handleSkuChange(e.target.value)}
                className="w-full rounded-button border border-white/[0.06] bg-bg px-4 py-2.5 text-sm text-white outline-none transition focus:border-gold/30"
                placeholder={t("auto_generated")}
              />
            </div>
            <div>
              <label htmlFor="p-barcode" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-muted">
                {t("barcode", "Barcode")}
              </label>
              <input
                id="p-barcode"
                type="text"
                value={form.barcode}
                onChange={(e) => updateField("barcode", e.target.value)}
                className="w-full rounded-button border border-white/[0.06] bg-bg px-4 py-2.5 text-sm text-white outline-none transition focus:border-gold/30"
                placeholder={t("optional")}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="glass rounded-card p-6">
        <h2 className="mb-5 text-base font-semibold text-white">{t("pricing")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="p-regular" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-muted">
              {t("regular_price", "Regular Price")} <span className="text-burgundy">*</span>
            </label>
            <div className="relative">
              <input
                id="p-regular"
                type="text"
                inputMode="decimal"
                value={form.regularPrice}
                onChange={(e) => handlePriceChange("regularPrice", e.target.value)}
                className="w-full rounded-button border border-white/[0.06] bg-bg px-4 py-2.5 pr-14 text-sm text-white outline-none transition focus:border-gold/30"
                placeholder={t("price_zero_placeholder", "0.00")}
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">{form.currency}</span>
            </div>
          </div>
          <div>
            <label htmlFor="p-sale" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-muted">
              {t("sale_price")}
            </label>
            <div className="relative">
              <input
                id="p-sale"
                type="text"
                inputMode="decimal"
                value={form.salePrice}
                onChange={(e) => handlePriceChange("salePrice", e.target.value)}
                className="w-full rounded-button border border-white/[0.06] bg-bg px-4 py-2.5 pr-14 text-sm text-white outline-none transition focus:border-gold/30"
                placeholder={t("price_zero_placeholder", "0.00")}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">{form.currency}</span>
            </div>
          </div>
          <div>
            <label htmlFor="p-cost" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-muted">
              {t("cost_price")}
            </label>
            <div className="relative">
              <input
                id="p-cost"
                type="text"
                inputMode="decimal"
                value={form.costPrice}
                onChange={(e) => handlePriceChange("costPrice", e.target.value)}
                className="w-full rounded-button border border-white/[0.06] bg-bg px-4 py-2.5 pr-14 text-sm text-white outline-none transition focus:border-gold/30"
                placeholder={t("price_zero_placeholder", "0.00")}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">{form.currency}</span>
            </div>
          </div>
          <div>
            <label htmlFor="p-currency" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-muted">
              {t("currency")}
            </label>
            <select
              id="p-currency"
              value={form.currency}
              onChange={(e) => updateField("currency", e.target.value)}
              className="w-full rounded-button border border-white/[0.06] bg-bg px-4 py-2.5 text-sm text-white outline-none transition focus:border-gold/30"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-white/[0.06] bg-bg p-3">
            <p className="text-xs text-muted">{t("profit")}</p>
            <p className={`mt-1 text-sm font-semibold ${profit >= 0 ? "text-white/80" : "text-burgundy"}`}>
              {profit.toFixed(2)} {form.currency}
            </p>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-bg p-3">
            <p className="text-xs text-muted">{t("margin")}</p>
            <p className={`mt-1 text-sm font-semibold ${margin >= 0 ? "text-white/80" : "text-burgundy"}`}>
              {margin.toFixed(1)}%
            </p>
          </div>
        </div>
      </section>

      {/* Inventory */}
      <section className="glass rounded-card p-6">
        <h2 className="mb-5 text-base font-semibold text-white">{t("inventory")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="p-stock" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-muted">
              {t("stock_qty")}
            </label>
            <input
              id="p-stock"
              type="number"
              min={0}
              value={form.stock}
              onChange={(e) => updateField("stock", Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full rounded-button border border-white/[0.06] bg-bg px-4 py-2.5 text-sm text-white outline-none transition focus:border-gold/30"
            />
          </div>
          <div>
            <label htmlFor="p-low" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-muted">
              {t("low_stock_threshold")}
            </label>
            <input
              id="p-low"
              type="number"
              min={1}
              value={form.lowStockThreshold}
              onChange={(e) => updateField("lowStockThreshold", Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full rounded-button border border-white/[0.06] bg-bg px-4 py-2.5 text-sm text-white outline-none transition focus:border-gold/30"
            />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className={`inline-flex h-2.5 w-2.5 rounded-full ${inventoryStatus.dot}`} />
          <span className={`text-sm font-medium ${inventoryStatus.color}`}>{inventoryStatus.label}</span>
        </div>
      </section>

      {/* Category / Collection / Brand */}
      <section className="glass rounded-card p-6">
        <h2 className="mb-5 text-base font-semibold text-white">{t("organization")}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="p-category" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-muted">
              {t("category")}
            </label>
            <div className="flex gap-2">
              <select
                id="p-category"
                value={form.categoryId}
                onChange={(e) => updateField("categoryId", e.target.value)}
                className="flex-1 rounded-button border border-white/[0.06] bg-bg px-4 py-2.5 text-sm text-white outline-none transition focus:border-gold/30"
              >
                <option value="">{t("no_category")}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowCategoryModal(true)}
                className="btn-secondary shrink-0 rounded-button px-3 text-xs font-semibold uppercase tracking-[0.1em]"
                aria-label={t("create_category")}
              >
                {t("new_item")}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="p-collection" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-muted">
              {t("collection")}
            </label>
            <select
              id="p-collection"
              value={form.collectionId}
              onChange={(e) => updateField("collectionId", e.target.value)}
              className="w-full rounded-button border border-white/[0.06] bg-bg px-4 py-2.5 text-sm text-white outline-none transition focus:border-gold/30"
            >
              <option value="">{t("no_collection")}</option>
              {collections.map((col) => (
                <option key={col.id} value={col.id}>{col.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="p-brand" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-muted">
              {t("brand")}
            </label>
            <input
              id="p-brand"
              type="text"
              value={form.brand}
              onChange={(e) => updateField("brand", e.target.value)}
              className="w-full rounded-button border border-white/[0.06] bg-bg px-4 py-2.5 text-sm text-white outline-none transition focus:border-gold/30"
              placeholder={t("brand_placeholder")}
            />
          </div>
        </div>
      </section>

      {/* Status & Flags */}
      <section className="glass rounded-card p-6">
        <h2 className="mb-5 text-base font-semibold text-white">{t("status_and_flags")}</h2>
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <label htmlFor="p-status" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-muted">
              {t("status")}
            </label>
            <select
              id="p-status"
              value={form.status}
              onChange={(e) => updateField("status", e.target.value as ProductFormData["status"])}
              className="w-40 rounded-button border border-white/[0.06] bg-bg px-4 py-2.5 text-sm text-white outline-none transition focus:border-gold/30"
            >
              <option value="Draft">{t("draft")}</option>
              <option value="Active">{t("active")}</option>
              <option value="Hidden">{t("hidden")}</option>
              <option value="Archived">{t("archived")}</option>
            </select>
          </div>
          <label className="flex cursor-pointer items-center gap-3 pt-5">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => updateField("featured", e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-white/5 accent-gold"
            />
            <span className="text-sm text-white">{t("featured")}</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 pt-5">
            <input
              type="checkbox"
              checked={form.isBestSeller}
              onChange={(e) => updateField("isBestSeller", e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-white/5 accent-gold"
            />
            <span className="text-sm text-white">{t("best_seller")}</span>
          </label>
        </div>
      </section>

      {/* Images */}
      <section className="glass rounded-card p-6">
        <h2 className="mb-5 text-base font-semibold text-white">{t("images")}</h2>
        <ImageUploader
          images={form.images}
          onChange={(images) => updateField("images", images)}
        />
      </section>

      <div className="flex items-center justify-end gap-3 pb-10">
        <button
          type="button"
          onClick={discardDraft}
          className="btn-secondary h-10 rounded-button px-5 text-xs font-semibold uppercase tracking-[0.1em]"
        >
          {t("discard")}
        </button>
        <button
          type="submit"
          disabled={saving}
          className="btn-gold h-10 rounded-button px-6 text-xs font-semibold uppercase tracking-[0.1em] disabled:opacity-50"
        >
          {saving ? t("saving") : t("save_product")}
        </button>
      </div>

      <CategoryCreateModal
        open={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onCreated={(cat) => {
          setCategories((prev) => [...prev, cat]);
          updateField("categoryId", cat.id);
        }}
      />
    </form>
  );
}
