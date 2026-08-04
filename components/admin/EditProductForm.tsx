"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { ProductHistory } from "@/components/admin/ProductHistory";
import { VariantManager } from "@/components/admin/VariantManager";
import { useTranslation } from "@/hooks/useTranslation";
import type { StoredProductImage, ProductVariantData } from "@/types";

const CURRENCIES = ["MAD", "EUR", "USD"];

type CategoryOption = { id: string; name: string; slug: string };
type CollectionOption = { id: string; name: string; slug: string };

type ProductData = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  sku: string;
  barcode: string;
  price: string;
  salePrice: string;
  costPrice: string;
  stock: number;
  lowStockThreshold: number;
  categoryId: string | null;
  collectionId: string | null;
  brand: string;
  status: string;
  featured: boolean;
  isBestSeller: boolean;
  image: string;
  gallery: string[];
  images: StoredProductImage[];
  variants: ProductVariantData[];
  category?: { id: string; name: string; slug: string } | null;
  collection?: { id: string; name: string; slug: string } | null;
};

function generateSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripCurrency(val: string): string {
  return val.replace(/[^0-9.]/g, "");
}

function formatPrice(val: string, currency: string): string {
  const num = parseFloat(stripCurrency(val));
  if (isNaN(num)) return `0.00 ${currency}`;
  return `${num.toFixed(2)} ${currency}`;
}

function extractCurrency(priceStr: string): string {
  const parts = priceStr.split(" ");
  return parts.length > 1 ? parts[parts.length - 1] : "MAD";
}

function extractNumeric(priceStr: string): string {
  return stripCurrency(priceStr);
}

export function EditProductForm({
  product,
  categories,
  collections,
}: {
  product: ProductData;
  categories: CategoryOption[];
  collections: CollectionOption[];
}) {
  const { t } = useTranslation("admin");
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const slugTimeout = useRef<NodeJS.Timeout | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "images" | "variants" | "history">("general");
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);

  const currency = extractCurrency(product.price);
  const [form, setForm] = useState({
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription,
    description: product.description,
    sku: product.sku,
    barcode: product.barcode,
    regularPrice: extractNumeric(product.price),
    salePrice: product.salePrice ? extractNumeric(product.salePrice) : "",
    costPrice: product.costPrice ? extractNumeric(product.costPrice) : "",
    currency: currency,
    stock: product.stock,
    lowStockThreshold: product.lowStockThreshold,
    categoryId: product.categoryId || "",
    collectionId: product.collectionId || "",
    brand: product.brand,
    status: product.status,
    featured: product.featured,
    isBestSeller: product.isBestSeller,
  });

  const [images, setImages] = useState<StoredProductImage[]>(
    product.images.map((img) => ({
      ...img,
      publicId: (img as { publicId?: string }).publicId || "",
    }))
  );

  const [variants, setVariants] = useState<ProductVariantData[]>(product.variants || []);
  const [historyKey, setHistoryKey] = useState(0);
  const initialNameRef = useRef(product.name);

  useEffect(() => {
    if (!slugManuallyEdited && form.name !== initialNameRef.current) {
      const newSlug = generateSlug(form.name);
      setForm((prev) => ({ ...prev, slug: newSlug }));
    }
  }, [form.name, slugManuallyEdited]);

  const updateField = useCallback(<K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSlugChange = (val: string) => {
    setSlugManuallyEdited(true);
    const clean = generateSlug(val);
    setForm((prev) => ({ ...prev, slug: clean }));
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
        const res = await fetch(`/api/admin/products/check-slug?slug=${encodeURIComponent(slug)}&excludeId=${product.id}`);
        const data = await res.json();
        setSlugAvailable(data.available);
      } catch {
        setSlugAvailable(null);
      }
    }, 400);
  };

  const handlePriceChange = (field: "regularPrice" | "salePrice" | "costPrice", val: string) => {
    const cleaned = stripCurrency(val);
    const num = parseFloat(cleaned);
    setForm((prev) => ({ ...prev, [field]: isNaN(num) ? "" : cleaned }));
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

  const handleImageChange = (newImages: StoredProductImage[]) => {
    // Track which existing images were removed
    const currentIds = images.map((i) => i.id);
    const newIds = newImages.map((i) => i.id);
    const removed = currentIds.filter((id) => !newIds.includes(id) && !id.startsWith("new-"));
    if (removed.length > 0) {
      setDeletedImageIds((prev) => [...prev, ...removed]);
    }
    setImages(newImages);
  };

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
        images: images.map((img, idx) => ({
          id: img.id,
          url: img.url,
          alt: img.alt,
          sortOrder: idx,
          isCover: img.isCover,
          width: img.width,
          height: img.height,
          format: img.format,
          publicId: (img as { publicId?: string }).publicId || "",
          bytes: (img as { bytes?: number }).bytes || 0,
          imageHash: (img as { imageHash?: string }).imageHash || "",
          blurDataURL: (img as { blurDataURL?: string }).blurDataURL || "",
        })),
        deletedImageIds,
      };

      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("failed_to_update_product", "Failed to update product"));
        setSaving(false);
        return;
      }

      toast.success(t("product_updated_success", "Product updated successfully"));
      setSuccess(true);
      setHistoryKey((prev) => prev + 1);
      setDeletedImageIds([]);
      setTimeout(() => router.push("/admin/products"), 2000);
    } catch {
      setError(t("network_error", "Network error"));
      setSaving(false);
    }
  };

  const tabClass = (tab: string) =>
    `rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition ${
      activeTab === tab
        ? "bg-gold/20 text-gold"
        : "text-white/50 hover:text-white"
    }`;

  if (success) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/10">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0F8B6F" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-white">{t("product_updated")}</h2>
          <p className="mt-2 text-white/50">{t("redirecting")}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red/20 bg-red/10 px-4 py-3 text-sm text-red">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-white md:text-3xl">{t("edit_product", "Edit Product")}</h1>
          <p className="mt-1 text-sm text-white/50">{product.name}</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="btn-gold h-10 rounded-md px-6 text-xs font-semibold uppercase tracking-[0.1em] disabled:opacity-50"
        >
          {saving ? t("saving") : t("save_changes")}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-white/[0.06] pb-2">
        <button type="button" onClick={() => setActiveTab("general")} className={tabClass("general")}>
          {t("general")}
        </button>
        <button type="button" onClick={() => setActiveTab("images")} className={tabClass("images")}>
          {t("images")}
        </button>
        <button type="button" onClick={() => setActiveTab("variants")} className={tabClass("variants")}>
          {t("variants")}
        </button>
        <button type="button" onClick={() => setActiveTab("history")} className={tabClass("history")}>
          {t("history")}
        </button>
      </div>

      {/* General Tab */}
      {activeTab === "general" && (
        <div className="space-y-6">
          <section className="rounded-xl p-6">
            <h2 className="mb-5 text-base font-semibold text-white">{t("basic_information")}</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-white/50">
                  {t("product_name", "Product Name")} <span className="text-burgundy">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm((prev) => ({ ...prev, name: val }));
                    if (!slugManuallyEdited) {
                      const newSlug = generateSlug(val);
                      setForm((prev) => ({ ...prev, slug: newSlug }));
                      checkSlug(newSlug);
                    }
                  }}
                  className="w-full rounded-md border border-white/[0.06] bg-[#171717] px-4 py-2.5 text-sm text-white outline-none transition focus:border-gold/30"
                  placeholder={t("product_name_placeholder")}
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-white/50">
                  {t("slug", "Slug")}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="w-full rounded-md border border-white/[0.06] bg-[#171717] px-4 py-2.5 pr-10 text-sm text-white outline-none transition focus:border-gold/30"
                    placeholder={t("product_slug_placeholder", "product-slug")}
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
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-white/50">
                  {t("short_description", "Short Description")}
                </label>
                <input
                  type="text"
                  value={form.shortDescription}
                  onChange={(e) => updateField("shortDescription", e.target.value)}
                  className="w-full rounded-md border border-white/[0.06] bg-[#171717] px-4 py-2.5 text-sm text-white outline-none transition focus:border-gold/30"
                  placeholder={t("product_desc_placeholder")}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-white/50">
                  {t("full_description", "Full Description")}
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className="w-full rounded-md border border-white/[0.06] bg-[#171717] px-4 py-2.5 text-sm text-white outline-none transition focus:border-gold/30"
                  placeholder={t("product_detail_placeholder")}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-white/50">
                    {t("sku", "SKU")}
                  </label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => updateField("sku", e.target.value)}
                    className="w-full rounded-md border border-white/[0.06] bg-[#171717] px-4 py-2.5 text-sm text-white outline-none transition focus:border-gold/30"
                    placeholder={t("sku_placeholder")}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-white/50">
                    {t("barcode", "Barcode")}
                  </label>
                  <input
                    type="text"
                    value={form.barcode}
                    onChange={(e) => updateField("barcode", e.target.value)}
                    className="w-full rounded-md border border-white/[0.06] bg-[#171717] px-4 py-2.5 text-sm text-white outline-none transition focus:border-gold/30"
                    placeholder={t("optional")}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl p-6">
            <h2 className="mb-5 text-base font-semibold text-white">{t("pricing")}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-white/50">
                  {t("regular_price", "Regular Price")} <span className="text-burgundy">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.regularPrice}
                    onChange={(e) => handlePriceChange("regularPrice", e.target.value)}
                    className="w-full rounded-md border border-white/[0.06] bg-[#171717] px-4 py-2.5 pr-14 text-sm text-white outline-none transition focus:border-gold/30"
                    placeholder={t("price_zero_placeholder", "0.00")}
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/50">{form.currency}</span>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-white/50">
                  {t("sale_price")}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.salePrice}
                    onChange={(e) => handlePriceChange("salePrice", e.target.value)}
                    className="w-full rounded-md border border-white/[0.06] bg-[#171717] px-4 py-2.5 pr-14 text-sm text-white outline-none transition focus:border-gold/30"
                    placeholder={t("price_zero_placeholder", "0.00")}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/50">{form.currency}</span>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-white/50">
                  {t("cost_price")}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.costPrice}
                    onChange={(e) => handlePriceChange("costPrice", e.target.value)}
                    className="w-full rounded-md border border-white/[0.06] bg-[#171717] px-4 py-2.5 pr-14 text-sm text-white outline-none transition focus:border-gold/30"
                    placeholder={t("price_zero_placeholder", "0.00")}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/50">{form.currency}</span>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-white/50">
                  {t("currency")}
                </label>
                <select
                  value={form.currency}
                  onChange={(e) => updateField("currency", e.target.value)}
                  className="w-full rounded-md border border-white/[0.06] bg-[#171717] px-4 py-2.5 text-sm text-white outline-none transition focus:border-gold/30"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg border border-white/[0.06] bg-[#171717] p-3">
                <p className="text-xs text-white/50">{t("profit")}</p>
                <p className={`mt-1 text-sm font-semibold ${profit >= 0 ? "text-white/80" : "text-burgundy"}`}>
                  {profit.toFixed(2)} {form.currency}
                </p>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-[#171717] p-3">
                <p className="text-xs text-white/50">{t("margin")}</p>
                <p className={`mt-1 text-sm font-semibold ${margin >= 0 ? "text-white/80" : "text-burgundy"}`}>
                  {margin.toFixed(1)}%
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-xl p-6">
            <h2 className="mb-5 text-base font-semibold text-white">{t("inventory")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-white/50">
                  {t("stock_qty")}
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) => updateField("stock", Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full rounded-md border border-white/[0.06] bg-[#171717] px-4 py-2.5 text-sm text-white outline-none transition focus:border-gold/30"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-white/50">
                  {t("low_stock_threshold")}
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.lowStockThreshold}
                  onChange={(e) => updateField("lowStockThreshold", Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full rounded-md border border-white/[0.06] bg-[#171717] px-4 py-2.5 text-sm text-white outline-none transition focus:border-gold/30"
                />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className={`inline-flex h-2.5 w-2.5 rounded-full ${inventoryStatus.dot}`} />
              <span className={`text-sm font-medium ${inventoryStatus.color}`}>{inventoryStatus.label}</span>
            </div>
          </section>

          <section className="rounded-xl p-6">
            <h2 className="mb-5 text-base font-semibold text-white">{t("organization")}</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-white/50">
                  {t("category")}
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) => updateField("categoryId", e.target.value)}
                  className="w-full rounded-md border border-white/[0.06] bg-[#171717] px-4 py-2.5 text-sm text-white outline-none transition focus:border-gold/30"
                >
                  <option value="">{t("no_category")}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-white/50">
                  {t("collection")}
                </label>
                <select
                  value={form.collectionId}
                  onChange={(e) => updateField("collectionId", e.target.value)}
                  className="w-full rounded-md border border-white/[0.06] bg-[#171717] px-4 py-2.5 text-sm text-white outline-none transition focus:border-gold/30"
                >
                  <option value="">{t("no_collection")}</option>
                  {collections.map((col) => (
                    <option key={col.id} value={col.id}>{col.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-white/50">
                  {t("brand")}
                </label>
                <input
                  type="text"
                  value={form.brand}
                  onChange={(e) => updateField("brand", e.target.value)}
                  className="w-full rounded-md border border-white/[0.06] bg-[#171717] px-4 py-2.5 text-sm text-white outline-none transition focus:border-gold/30"
                  placeholder={t("brand_placeholder")}
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl p-6">
            <h2 className="mb-5 text-base font-semibold text-white">{t("status_and_flags")}</h2>
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-white/50">
                  {t("status")}
                </label>
                <select
                  value={form.status}
                  onChange={(e) => updateField("status", e.target.value)}
                  className="w-40 rounded-md border border-white/[0.06] bg-[#171717] px-4 py-2.5 text-sm text-white outline-none transition focus:border-gold/30"
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
        </div>
      )}

      {/* Images Tab */}
      {activeTab === "images" && (
        <section className="rounded-xl p-6">
          <h2 className="mb-5 text-base font-semibold text-white">{t("images")}</h2>
          <ImageUploader
            images={images}
            onChange={handleImageChange}
          />
        </section>
      )}

      {/* Variants Tab */}
      {activeTab === "variants" && (
        <section className="rounded-xl p-6">
          <h2 className="mb-5 text-base font-semibold text-white">{t("variants")}</h2>
          <VariantManager
            productId={product.id}
            variants={variants}
            onVariantsChange={setVariants}
            onHistoryChange={() => setHistoryKey((prev) => prev + 1)}
          />
        </section>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <section className="rounded-xl p-6">
          <h2 className="mb-5 text-base font-semibold text-white">{t("version_history")}</h2>
          <ProductHistory key={historyKey} productId={product.id} />
        </section>
      )}

      <div className="flex items-center justify-end gap-3 pb-10">
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="btn-secondary h-10 rounded-md px-5 text-xs font-semibold uppercase tracking-[0.1em]"
        >
          {t("cancel")}
        </button>
        <button
          type="submit"
          disabled={saving}
          className="btn-gold h-10 rounded-md px-6 text-xs font-semibold uppercase tracking-[0.1em] disabled:opacity-50"
        >
          {saving ? t("saving") : t("save_changes")}
        </button>
      </div>
    </form>
  );
}
