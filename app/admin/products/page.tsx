"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";
import { SafeImage } from "@/components/SafeImage";

type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: string;
  stock: number;
  lowStockThreshold: number;
  status: string;
  featured: boolean;
  isBestSeller: boolean;
  image: string;
  category?: { id: string; name: string } | null;
  collection?: { id: string; name: string } | null;
  createdAt: string;
  images: { url: string; isCover: boolean }[];
  _count?: { variants: number };
};

type CategoryOption = { id: string; name: string };
type CollectionOption = { id: string; name: string };

export default function ProductsPage() {
  const { t } = useTranslation("admin");
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [collections, setCollections] = useState<CollectionOption[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState("");
  const [bulkValue, setBulkValue] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [runningBulk, setRunningBulk] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCollection, setFilterCollection] = useState("");
  const [filterStock, setFilterStock] = useState("");
  const [filterFeatured, setFilterFeatured] = useState("");
  const [filterBestSeller, setFilterBestSeller] = useState("");
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchProductsRef = useRef<() => void>(() => {});

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filterStatus) params.set("status", filterStatus);
      if (filterCategory) params.set("categoryId", filterCategory);
      if (filterCollection) params.set("collectionId", filterCollection);
      if (filterStock) params.set("stock", filterStock);
      if (filterFeatured) params.set("featured", filterFeatured);
      if (filterBestSeller) params.set("isBestSeller", filterBestSeller);
      const response = await fetch(`/api/admin/products/list?${params.toString()}`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus, filterCategory, filterCollection, filterStock, filterFeatured, filterBestSeller]);

  fetchProductsRef.current = fetchProducts;

  const doFetchProducts = useCallback(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => fetchProductsRef.current(), 300);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/categories/list", { signal: controller.signal }).then((response) => response.json()).then((data) => setCategories(data.categories || [])).catch(() => {});
    fetch("/api/admin/collections/list", { signal: controller.signal }).then((response) => response.json()).then((data) => setCollections(data.collections || [])).catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    doFetchProducts();
  }, [doFetchProducts]);

  useEffect(() => setSelected(new Set()), [products]);

  function toggleSelect(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected(selected.size === products.length ? new Set() : new Set(products.map((product) => product.id)));
  }

  async function handleBulkAction() {
    if (!bulkAction || selected.size === 0) return;

    if (["delete", "archive", "hide", "duplicate"].includes(bulkAction)) {
      setShowConfirm(true);
      return;
    }

    await executeBulkAction();
  }

  async function executeBulkAction() {
    setRunningBulk(true);
    setShowConfirm(false);
    try {
      const payload: Record<string, unknown> = { action: bulkAction, productIds: Array.from(selected) };
      if (bulkValue) payload.value = bulkValue;
      const response = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Bulk action failed");
      toast.success(`${t("bulk_action_completed", "Bulk action completed")}: ${bulkAction}`);
      setSelected(new Set());
      setBulkAction("");
      setBulkValue("");
      fetchProducts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("network_error", "Network error"));
    } finally {
      setRunningBulk(false);
    }
  }

  async function handleExport(format: string) {
    try {
      const response = await fetch(`/api/admin/products/export?format=${format}`);
      if (!response.ok) throw new Error(t("export_failed", "Export failed"));
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `products-export-${Date.now()}.${format}`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success(`${t("exported_as", "Exported as ")}${format.toUpperCase()}`);
    } catch {
      toast.error(t("export_failed", "Export failed"));
    }
  }

  function clearFilters() {
    setSearch("");
    setFilterStatus("");
    setFilterCategory("");
    setFilterCollection("");
    setFilterStock("");
    setFilterFeatured("");
    setFilterBestSeller("");
  }

  const allSelected = products.length > 0 && selected.size === products.length;
  const hasFilters = Boolean(search || filterStatus || filterCategory || filterCollection || filterStock || filterFeatured || filterBestSeller);
  const filterClass = "input-premium h-11 min-w-0 bg-[#0B0B0A] px-3 text-xs";

  return (
    <div className="min-h-[calc(100vh-4rem)] min-w-0 bg-[#0B0B0A]" data-testid="products-page">
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-white/[0.08] bg-[#171717] p-5 shadow-2xl sm:p-6" role="dialog" aria-modal="true" aria-labelledby="bulk-confirm-title">
            <p className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-gold/70">{t("bulk_actions", "Bulk action")}</p>
            <h2 id="bulk-confirm-title" className="mt-2 text-lg font-semibold text-white">{t("confirm_bulk", "Confirm bulk action")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/45">
              {bulkAction === "delete"
                ? `Delete ${selected.size} product(s)? This cannot be undone.`
                : bulkAction === "archive"
                  ? `Archive ${selected.size} product(s)?`
                  : bulkAction === "hide"
                    ? `Hide ${selected.size} product(s)?`
                    : `Duplicate ${selected.size} product(s)?`}
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setShowConfirm(false)} className="btn-secondary h-10 px-4 text-[0.6rem]">{t("cancel", "Cancel")}</button>
              <button type="button" onClick={executeBulkAction} disabled={runningBulk} className={`inline-flex h-10 items-center justify-center rounded-md px-4 text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-white transition disabled:opacity-50 ${bulkAction === "delete" ? "bg-burgundy hover:bg-burgundy/80" : "bg-gold text-black hover:bg-gold/90"}`}>
                {runningBulk ? t("processing", "Processing") : t("confirm_action", "Confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="mx-auto w-full max-w-[1600px] px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
        <header className="mb-7 flex flex-col gap-4 border-b border-white/[0.06] pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-gold/50" />
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-gold/70">{t("products", "Products")}</p>
            </div>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">{t("product_management", "Product Management")}</h1>
            <p className="mt-2 text-sm text-white/45">{loading ? t("loading", "Loading...") : `${products.length} ${t("products_label", "products")}`}{selected.size > 0 ? ` · ${selected.size} ${t("selected_label", "selected")}` : ""}</p>
          </div>
          <Link href="/admin/products/add" className="btn-primary h-11 w-full px-5 text-[0.62rem] sm:w-auto">
            <span className="text-base font-light" aria-hidden>+</span>
            {t("add_product", "Add product")}
          </Link>
        </header>

        <section className="mb-5 rounded-xl border border-white/[0.06] bg-[#121211] p-3" aria-label={t("product_filters", "Product filters")}>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(240px,2fr)_repeat(3,minmax(130px,1fr))]">
            <div className="relative min-w-0">
              <svg className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("search_products", "Search products") } className="input-premium h-11 w-full bg-[#0B0B0A] ps-10" />
            </div>
            <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)} className={filterClass} aria-label={t("all_statuses", "All statuses")}>
              <option value="">{t("all_statuses", "All statuses")}</option><option value="Active">{t("active", "Active")}</option><option value="Draft">{t("draft", "Draft")}</option><option value="Hidden">{t("hidden", "Hidden")}</option><option value="Archived">{t("archived", "Archived")}</option>
            </select>
            <select value={filterCategory} onChange={(event) => setFilterCategory(event.target.value)} className={filterClass} aria-label={t("all_categories", "All categories")}>
              <option value="">{t("all_categories", "All categories")}</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <select value={filterCollection} onChange={(event) => setFilterCollection(event.target.value)} className={filterClass} aria-label={t("all_collections", "All collections")}>
              <option value="">{t("all_collections", "All collections")}</option>{collections.map((collection) => <option key={collection.id} value={collection.id}>{collection.name}</option>)}
            </select>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(3,minmax(140px,200px))_1fr_auto]">
            <select value={filterStock} onChange={(event) => setFilterStock(event.target.value)} className={filterClass}><option value="">{t("all_stock", "All stock")}</option><option value="in">{t("in_stock", "In stock")}</option><option value="low">{t("low_stock", "Low stock")}</option><option value="out">{t("out_of_stock", "Out of stock")}</option></select>
            <select value={filterFeatured} onChange={(event) => setFilterFeatured(event.target.value)} className={filterClass}><option value="">{t("featured_all", "Featured: All")}</option><option value="true">{t("featured_only", "Featured only")}</option><option value="false">{t("non_featured", "Not featured")}</option></select>
            <select value={filterBestSeller} onChange={(event) => setFilterBestSeller(event.target.value)} className={filterClass}><option value="">{t("best_seller_all", "Best seller: All")}</option><option value="true">{t("best_seller_only", "Best sellers")}</option><option value="false">{t("non_best_seller", "Not best sellers")}</option></select>
            <span className="hidden lg:block" />
            {hasFilters && <button type="button" onClick={clearFilters} className="inline-flex h-11 items-center justify-center rounded-md px-4 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-white/45 transition hover:bg-white/[0.04] hover:text-white">{t("clear_filters", "Clear")}</button>}
          </div>
        </section>

        {selected.size > 0 && (
          <section className="mb-5 flex flex-col gap-3 rounded-xl border border-gold/20 bg-gold/[0.04] p-3 sm:flex-row sm:flex-wrap sm:items-center">
            <span className="shrink-0 text-xs font-semibold text-gold">{t("products_selected", { count: selected.size })}</span>
            <select value={bulkAction} onChange={(event) => { setBulkAction(event.target.value); setBulkValue(""); }} className={`${filterClass} sm:w-48`}>
              <option value="">{t("bulk_actions", "Bulk actions")}</option><option value="delete">{t("delete", "Delete")}</option><option value="archive">{t("archive", "Archive")}</option><option value="activate">{t("activate", "Activate")}</option><option value="hide">{t("hide", "Hide")}</option><option value="duplicate">{t("duplicate", "Duplicate")}</option><option value="changeCategory">{t("change_category", "Change category")}</option><option value="changeCollection">{t("change_collection", "Change collection")}</option>
            </select>
            {bulkAction === "changeCategory" && <select value={bulkValue} onChange={(event) => setBulkValue(event.target.value)} className={`${filterClass} sm:w-52`}><option value="">{t("select_category_placeholder", "Select category...")}</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>}
            {bulkAction === "changeCollection" && <select value={bulkValue} onChange={(event) => setBulkValue(event.target.value)} className={`${filterClass} sm:w-52`}><option value="">{t("select_collection_placeholder", "Select collection...")}</option>{collections.map((collection) => <option key={collection.id} value={collection.id}>{collection.name}</option>)}</select>}
            <button type="button" onClick={handleBulkAction} disabled={runningBulk || !bulkAction || (["changeCategory", "changeCollection"].includes(bulkAction) && !bulkValue)} className="btn-primary h-10 px-4 text-[0.58rem] disabled:opacity-40">{runningBulk ? t("processing", "Processing") : t("apply", "Apply")}</button>
            <div className="flex gap-2 sm:ms-auto">
              <button type="button" onClick={() => handleExport("csv")} className="inline-flex h-9 items-center rounded-md border border-white/[0.08] px-3 text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-white/50 hover:text-white">CSV</button>
              <button type="button" onClick={() => handleExport("xlsx")} className="inline-flex h-9 items-center rounded-md border border-white/[0.08] px-3 text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-white/50 hover:text-white">Excel</button>
            </div>
          </section>
        )}

        {loading ? (
          <div className="space-y-2 rounded-xl border border-white/[0.06] bg-[#121211] p-4" role="status">
            <span className="sr-only">{t("loading", "Loading")}</span>{[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="h-[72px] animate-pulse rounded-lg bg-white/[0.035]" />)}
          </div>
        ) : products.length === 0 ? (
          <section className="rounded-xl border border-dashed border-white/[0.1] bg-[#121211] px-6 py-20 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-gold/60" aria-hidden>□</div>
            <h2 className="mt-4 text-sm font-semibold text-white/80">{t("no_products", "No products found")}</h2>
            <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-white/40">{hasFilters ? t("adjust_product_filters", "Try adjusting your search or filters.") : t("no_products_description", "Create your first product to start building the catalog.")}</p>
            {!hasFilters && <Link href="/admin/products/add" className="btn-primary mt-5 h-10 px-5 text-[0.6rem]">{t("add_your_first_product", "Add your first product")}</Link>}
          </section>
        ) : (
          <>
            <div className="hidden overflow-x-auto rounded-xl border border-white/[0.07] bg-[#121211] min-[1400px]:block">
              <table className="w-full min-w-[1120px] table-fixed text-start text-sm">
                <colgroup><col className="w-11" /><col className="w-16" /><col className="w-[25%]" /><col className="w-[11%]" /><col className="w-[10%]" /><col className="w-[11%]" /><col className="w-[9%]" /><col className="w-[8%]" /><col className="w-[11%]" /><col className="w-[8%]" /></colgroup>
                <thead className="bg-white/[0.015]"><tr className="h-12 border-b border-white/[0.06] text-[0.58rem] uppercase tracking-[0.13em] text-white/40">
                  <th className="px-4"><input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="h-4 w-4 accent-gold" aria-label={t("select_all", "Select all")} /></th><th className="px-2">{t("image", "Image")}</th><th className="px-4">{t("product", "Product")}</th><th className="px-4">{t("sku", "SKU")}</th><th className="px-4">{t("status", "Status")}</th><th className="px-4 text-end">{t("price", "Price")}</th><th className="px-4 text-end">{t("stock", "Stock")}</th><th className="px-4 text-end">{t("variants", "Variants")}</th><th className="px-4 text-end">{t("date", "Date")}</th><th className="px-4 text-end">{t("actions_header", "Action")}</th>
                </tr></thead>
                <tbody className="divide-y divide-white/[0.06]">{products.map((product) => <ProductTableRow key={product.id} product={product} checked={selected.has(product.id)} onToggle={() => toggleSelect(product.id)} t={t} />)}</tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 min-[1400px]:hidden">
              {products.map((product) => {
                const cover = product.images?.find((item) => item.isCover)?.url || product.image;
                return (
                  <article key={product.id} className={`min-w-0 rounded-xl border bg-[#121211] p-4 transition ${selected.has(product.id) ? "border-gold/30" : "border-white/[0.07]"}`}>
                    <div className="flex items-start gap-3">
                      <input type="checkbox" checked={selected.has(product.id)} onChange={() => toggleSelect(product.id)} className="mt-1 h-4 w-4 shrink-0 accent-gold" aria-label={`${t("select", "Select")} ${product.name}`} />
                      <ProductImage src={cover} name={product.name} className="h-16 w-16" />
                      <div className="min-w-0 flex-1"><Link href={`/admin/products/${product.id}/edit`} className="line-clamp-2 text-sm font-semibold text-white hover:text-gold">{product.name}</Link><p className="mt-1 truncate text-xs text-white/35">{product.category?.name || t("no_category", "No category")}</p><div className="mt-2"><StatusBadge status={product.status} /></div></div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 border-y border-white/[0.06] py-3 text-center"><Metric label={t("price", "Price")} value={product.price} accent /><Metric label={t("stock", "Stock")} value={String(product.stock)} /><Metric label={t("variants", "Variants")} value={String(product._count?.variants ?? 0)} /></div>
                    <div className="mt-3 flex items-center justify-between gap-3"><p className="truncate font-mono text-[0.68rem] text-white/35">{product.sku || "—"}</p><Link href={`/admin/products/${product.id}/edit`} className="inline-flex h-9 shrink-0 items-center rounded-md border border-gold/20 px-3 text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-gold">{t("edit", "Edit")}</Link></div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ProductTableRow({ product, checked, onToggle, t }: { product: ProductListItem; checked: boolean; onToggle: () => void; t: (key: string, fallback?: string) => string }) {
  const cover = product.images?.find((item) => item.isCover)?.url || product.image;
  const stockTone = product.stock <= 0 ? "bg-burgundy" : product.stock < (product.lowStockThreshold || 5) ? "bg-gold" : "bg-emerald-400";
  return (
    <tr className={`h-[76px] transition-colors hover:bg-white/[0.025] ${checked ? "bg-gold/[0.035]" : ""}`} data-testid="product-row">
      <td className="px-4"><input type="checkbox" checked={checked} onChange={onToggle} className="h-4 w-4 accent-gold" aria-label={`${t("select", "Select")} ${product.name}`} /></td>
      <td className="px-2"><ProductImage src={cover} name={product.name} className="h-12 w-12" /></td>
      <td className="px-4"><div className="flex min-w-0 items-center gap-2"><Link href={`/admin/products/${product.id}/edit`} className="truncate font-medium text-white hover:text-gold" title={product.name}>{product.name}</Link>{product.featured && <span className="shrink-0 rounded bg-gold/10 px-1.5 py-0.5 text-[0.52rem] font-semibold uppercase text-gold">Featured</span>}{product.isBestSeller && <span className="shrink-0 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[0.52rem] font-semibold uppercase text-emerald-400">Best</span>}</div><p className="mt-1 truncate text-xs text-white/35">{[product.category?.name, product.collection?.name].filter(Boolean).join(" · ") || "—"}</p></td>
      <td className="px-4"><p className="truncate font-mono text-xs text-white/45" title={product.sku}>{product.sku || "—"}</p></td><td className="px-4"><StatusBadge status={product.status} /></td><td className="px-4 text-end font-semibold tabular-nums text-gold">{product.price}</td><td className="px-4 text-end"><span className="inline-flex items-center gap-2 text-white/70"><span className={`h-2 w-2 rounded-full ${stockTone}`} />{product.stock}</span></td><td className="px-4 text-end text-white/50">{product._count?.variants ?? 0}</td><td className="px-4 text-end text-xs text-white/35">{new Date(product.createdAt).toLocaleDateString()}</td><td className="px-4 text-end"><Link href={`/admin/products/${product.id}/edit`} className="inline-flex h-8 items-center rounded-md border border-gold/20 px-3 text-[0.56rem] font-semibold uppercase tracking-[0.1em] text-gold hover:bg-gold/10">{t("edit", "Edit")}</Link></td>
    </tr>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone = status === "Active" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : status === "Draft" ? "border-gold/20 bg-gold/10 text-gold" : status === "Archived" ? "border-burgundy/25 bg-burgundy/10 text-red-300" : "border-white/[0.08] bg-white/[0.04] text-white/55";
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[0.56rem] font-semibold uppercase tracking-[0.1em] ${tone}`} data-testid="product-status">{status}</span>;
}

function ProductImage({ src, name, className }: { src: string; name: string; className: string }) {
  return <div className={`relative shrink-0 overflow-hidden rounded-lg border border-white/[0.06] bg-[#0B0B0A] ${className}`}>{src ? <SafeImage src={src} alt={name} fill sizes="64px" className="object-cover" /> : <div className="flex h-full w-full items-center justify-center text-white/15">□</div>}</div>;
}

function Metric({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return <div className="min-w-0"><p className="truncate text-[0.55rem] uppercase tracking-[0.1em] text-white/30">{label}</p><p className={`mt-1 truncate text-xs font-semibold ${accent ? "text-gold" : "text-white/70"}`}>{value}</p></div>;
}
