"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

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

  // Filters
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

      const res = await fetch(`/api/admin/products/list?${params.toString()}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch {}
    setLoading(false);
  }, [search, filterStatus, filterCategory, filterCollection, filterStock, filterFeatured, filterBestSeller]);

  fetchProductsRef.current = fetchProducts;

  const doFetchProducts = useCallback(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchProductsRef.current();
    }, 300);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/categories/list", { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {});
    fetch("/api/admin/collections/list", { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => setCollections(d.collections || []))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    doFetchProducts();
  }, [doFetchProducts]);

  useEffect(() => {
    setSelected(new Set());
  }, [products]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === products.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(products.map((p) => p.id)));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selected.size === 0) return;

    if (["delete", "archive", "hide", "duplicate"].includes(bulkAction)) {
      setShowConfirm(true);
      return;
    }

    await executeBulkAction();
  };

  const executeBulkAction = async () => {
    setRunningBulk(true);
    setShowConfirm(false);
    try {
      const payload: Record<string, unknown> = {
        action: bulkAction,
        productIds: Array.from(selected),
      };
      if (bulkValue) payload.value = bulkValue;

      const res = await fetch("/api/admin/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`${t("bulk_action_completed")}: ${bulkAction}`);
        setSelected(new Set());
        setBulkAction("");
        setBulkValue("");
        fetchProducts();
      } else {
        toast.error(data.error || "Bulk action failed");
      }
    } catch {
      toast.error(t("network_error"));
    }
    setRunningBulk(false);
  };

  const handleExport = async (format: string) => {
    try {
      const res = await fetch(`/api/admin/products/export?format=${format}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `products-export-${Date.now()}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${t("exported_as")}${format.toUpperCase()}`);
    } catch {
      toast.error(t("export_failed"));
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      Active: "badge-emerald",
      Draft: "badge-gold",
      Hidden: "bg-white/10 text-white/60",
      Archived: "bg-burgundy/10 text-burgundy",
    };
    return `inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] ${map[status] || "bg-white/10 text-white/60"}`;
  };

  const stockDot = (stock: number, threshold: number) => {
    if (stock <= 0) return "bg-burgundy";
    if (stock < threshold) return "bg-gold";
    return "bg-emerald";
  };

  const allSelected = products.length > 0 && selected.size === products.length;

  return (
    <div className="container-shell py-10" data-testid="products-page">
      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-card border border-white/[0.06] bg-surface p-6 shadow-dark">
            <h3 className="text-lg font-semibold text-white">{t("confirm_bulk")}</h3>
            <p className="mt-2 text-sm text-muted">
              {bulkAction === "delete"
                ? `Delete ${selected.size} product(s)? This cannot be undone.`
                : bulkAction === "archive"
                  ? `Archive ${selected.size} product(s)?`
                  : bulkAction === "hide"
                    ? `Hide ${selected.size} product(s)?`
                    : `Duplicate ${selected.size} product(s)?`}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="btn-secondary h-10 rounded-button px-4 text-xs font-semibold uppercase tracking-[0.1em]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeBulkAction}
                disabled={runningBulk}
                className={`h-10 rounded-button px-4 text-xs font-semibold uppercase tracking-[0.1em] ${
                  bulkAction === "delete"
                    ? "bg-burgundy text-white hover:bg-burgundy/80"
                    : "btn-gold"
                } disabled:opacity-50`}
              >
                {runningBulk ? t("processing") : t("confirm_action")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-white md:text-4xl">{t("products")}</h1>
          <p className="mt-1 text-sm text-muted">
            {loading ? (
              <span data-testid="products-loading">Loading...</span>
            ) : (
              <span data-testid="products-count">{products.length} product(s)</span>
            )}
            {selected.size > 0 && ` · ${selected.size} selected`}
          </p>
        </div>
        <Link
          href="/admin/products/add"
          className="btn-gold inline-flex h-10 items-center rounded-button px-5 text-xs font-semibold uppercase tracking-[0.1em]"
        >
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mr-2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          {t("add_product")}
        </Link>
      </div>

      {/* Search + Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("search_products")}
          className="input-premium min-w-[200px] flex-1"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-premium w-auto min-w-[130px]"
        >
          <option value="">{t("all_statuses")}</option>
          <option value="Active">{t("active")}</option>
          <option value="Draft">{t("draft")}</option>
          <option value="Hidden">{t("hidden")}</option>
          <option value="Archived">{t("archived")}</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-button border border-white/[0.06] bg-bg px-3 py-2 text-xs text-white outline-none"
        >
          <option value="">{t("all_categories")}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <select
          value={filterCollection}
          onChange={(e) => setFilterCollection(e.target.value)}
          className="rounded-button border border-white/[0.06] bg-bg px-3 py-2 text-xs text-white outline-none"
        >
          <option value="">{t("all_collections")}</option>
          {collections.map((col) => (
            <option key={col.id} value={col.id}>{col.name}</option>
          ))}
        </select>
        <select
          value={filterStock}
          onChange={(e) => setFilterStock(e.target.value)}
          className="rounded-button border border-white/[0.06] bg-bg px-3 py-2 text-xs text-white outline-none"
        >
          <option value="">{t("all_stock")}</option>
          <option value="in">{t("in_stock")}</option>
          <option value="low">{t("low_stock")}</option>
          <option value="out">{t("out_of_stock")}</option>
        </select>
        <select
          value={filterFeatured}
          onChange={(e) => setFilterFeatured(e.target.value)}
          className="rounded-button border border-white/[0.06] bg-bg px-3 py-2 text-xs text-white outline-none"
        >
          <option value="">{t("featured_all", "Featured: All")}</option>
          <option value="true">{t("featured_only")}</option>
          <option value="false">Non-Featured</option>
        </select>
        <select
          value={filterBestSeller}
          onChange={(e) => setFilterBestSeller(e.target.value)}
          className="rounded-button border border-white/[0.06] bg-bg px-3 py-2 text-xs text-white outline-none"
        >
          <option value="">Best Seller: All</option>
          <option value="true">{t("best_seller_only")}</option>
          <option value="false">{t("non_best_seller", "Non-Best Seller")}</option>
        </select>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-gold/20 bg-gold/5 px-4 py-3">
          <span className="text-xs font-medium text-white">
            {t("products_selected", { count: selected.size })}
          </span>
          <select
            value={bulkAction}
            onChange={(e) => {
              setBulkAction(e.target.value);
              setBulkValue("");
            }}
            className="rounded-button border border-white/[0.06] bg-[#171717] px-3 py-1.5 text-xs text-white outline-none transition focus:border-gold/30 focus:ring-1 focus:ring-gold/20"
          >
            <option value="">{t("bulk_actions")}</option>
            <option value="delete">{t("delete")}</option>
            <option value="archive">{t("archive")}</option>
            <option value="activate">{t("activate")}</option>
            <option value="hide">{t("hide")}</option>
            <option value="duplicate">{t("duplicate")}</option>
            <option value="changeCategory">{t("change_category")}</option>
            <option value="changeCollection">{t("change_collection")}</option>
          </select>
          {bulkAction === "changeCategory" && (
            <select
              value={bulkValue}
              onChange={(e) => setBulkValue(e.target.value)}
              className="rounded-button border border-white/[0.06] bg-[#171717] px-3 py-1.5 text-xs text-white outline-none transition focus:border-gold/30 focus:ring-1 focus:ring-gold/20"
            >
              <option value="">Select category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          )}
          {bulkAction === "changeCollection" && (
            <select
              value={bulkValue}
              onChange={(e) => setBulkValue(e.target.value)}
              className="rounded-button border border-white/[0.06] bg-[#171717] px-3 py-1.5 text-xs text-white outline-none transition focus:border-gold/30 focus:ring-1 focus:ring-gold/20"
            >
              <option value="">Select collection...</option>
              {collections.map((col) => (
                <option key={col.id} value={col.id}>{col.name}</option>
              ))}
            </select>
          )}
          <button
            type="button"
            onClick={handleBulkAction}
            disabled={runningBulk || !bulkAction || (["changeCategory", "changeCollection"].includes(bulkAction) && !bulkValue)}
            className="btn-gold h-8 rounded-button px-3 text-[10px] font-semibold uppercase tracking-[0.1em] disabled:opacity-50"
          >
            {runningBulk ? t("processing") : "Apply"}
          </button>
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={() => handleExport("csv")}
              className="btn-secondary h-8 rounded-button px-3 text-[10px] font-semibold uppercase tracking-[0.1em]"
            >
              CSV
            </button>
            <button
              type="button"
              onClick={() => handleExport("xlsx")}
              className="btn-secondary h-8 rounded-button px-3 text-[10px] font-semibold uppercase tracking-[0.1em]"
            >
              Excel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="glass overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-xs uppercase tracking-[0.1em] text-muted">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-white/20 bg-white/5 accent-gold"
                  />
                </th>
                <th className="w-14 px-4 py-3">{t("image")}</th>
                <th className="px-4 py-3">{t("product")}</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">{t("price")}</th>
                <th className="px-4 py-3 text-right">{t("stock")}</th>
                <th className="px-4 py-3 text-right">{t("variants")}</th>
                <th className="px-4 py-3 text-right">{t("date")}</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/[0.04]">
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-5 w-full animate-pulse rounded bg-white/5" />
                        </td>
                      ))}
                    </tr>
                  ))
                : products.map((p) => {
                    const coverImg = p.images?.find((i) => i.isCover)?.url || p.image;
                    return (
                      <tr
                        key={p.id}
                        data-testid="product-row"
                        className={`border-b border-white/[0.04] transition hover:bg-white/[0.02] ${
                          selected.has(p.id) ? "bg-gold/[0.03]" : ""
                        }`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selected.has(p.id)}
                            onChange={() => toggleSelect(p.id)}
                            className="h-4 w-4 rounded border-white/20 bg-white/5 accent-gold"
                          />
                        </td>
                        <td className="px-4 py-3">
                          {coverImg ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={coverImg} alt={p.name || "Product cover"} className="h-10 w-10 rounded-lg object-cover" />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-xs text-muted">
                              —
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/products/${p.id}/edit`}
                              className="font-medium text-white transition hover:text-gold"
                            >
                              {p.name}
                            </Link>
                            {p.featured && (
                              <span className="inline-flex shrink-0 rounded bg-gold/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-gold">
                                Featured
                              </span>
                            )}
                            {p.isBestSeller && (
                              <span className="inline-flex shrink-0 rounded bg-emerald/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-gold">
                                Best
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-muted">
                            {p.category?.name || ""}
                            {p.category?.name && p.collection?.name ? " · " : ""}
                            {p.collection?.name || ""}
                          </p>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted">{p.sku || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={statusBadge(p.status)} data-testid="product-status">{p.status}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-white" data-testid="product-price">{p.price}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className={`inline-flex h-2 w-2 rounded-full ${stockDot(p.stock, p.lowStockThreshold || 5)}`} />
                            <span className="text-sm text-white">{p.stock}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-muted">
                          {p._count?.variants ?? 0}
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-muted">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
              {!loading && products.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-muted">
                    <div className="flex flex-col items-center gap-4">
                      <span className="text-4xl">📦</span>
                      <p>{t("no_products")}</p>
                      <Link href="/admin/products/add" className="btn-gold h-10 rounded-button px-5 text-xs font-semibold uppercase tracking-[0.1em]">
                        {t("add_your_first_product", "Add Your First Product")}
                      </Link>
                    </div>
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
