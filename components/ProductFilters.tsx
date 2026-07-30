"use client";

import { Component, useMemo, useState, useEffect, useRef, useCallback, type ErrorInfo, type ReactNode } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/types";
import { FilterSidebar } from "@/components/FilterSidebar";
import { useTranslation } from "@/hooks/useTranslation";

// ─── URL helpers ───────────────────────────────────────────────────────────

function parseParams(
  sp: URLSearchParams,
  categoryMap: Record<string, string>,
  allLabel = "All",
) {
  const s = sp.get("search") ?? "";
  const coll = sp.get("collection") ?? sp.get("category") ?? "";
  const price = sp.get("price") ?? "";
  const avail = sp.get("availability") ?? "";
  const sort = sp.get("sort") ?? "default";
  let minP: number | null = null;
  let maxP: number | null = null;
  if (price) {
    const [mn, mx] = price.split("-").map(p => Number(p) || null);
    minP = mn;
    maxP = mx;
  }
  const slug = coll || null;
  const label = slug ? categoryMap[slug] ?? slug : allLabel;
  return {
    query: s,
    collectionSlug: slug,
    activeCategory: label,
    minPrice: minP,
    maxPrice: maxP,
    availabilityOnly: avail === "in-stock",
    sort,
  };
}

function paramsToUrl(
  search: string,
  coll: string | null,
  minP: number | null,
  maxP: number | null,
  avail: boolean,
  sort: string,
) {
  const sp = new URLSearchParams();
  if (search) sp.set("search", search);
  if (coll) sp.set("collection", coll);
  if (minP != null || maxP != null) {
    const p = `${minP ?? ""}-${maxP ?? ""}`;
    if (p !== "-") sp.set("price", p);
  }
  if (avail) sp.set("availability", "in-stock");
  if (sort && sort !== "default") sp.set("sort", sort);
  const qs = sp.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

// ─── Error boundary ────────────────────────────────────────────────────────

class ShopErrorBoundary extends Component<
  { children: ReactNode; t?: (key: string) => string },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; t?: (key: string) => string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // logged server-side in production
  }

  render() {
    if (this.state.hasError) {
      const fn = this.props.t ?? (k => k);
      return (
        <div className="rounded-xl border border-white/[0.06] bg-[#252525] p-10 text-center">
          <p className="label-utility">{fn("shop_unavailable")}</p>
          <h3 className="font-display mt-3 text-2xl text-white">{fn("shop_unavailable_desc")}</h3>
          <p className="mt-3 text-sm text-white/40">{fn("try_again")}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Sort options ──────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: "default", labelKey: "sort_default", fallback: "Featured" },
  { value: "price-asc", labelKey: "sort_price_asc", fallback: "Price: Low to High" },
  { value: "price-desc", labelKey: "sort_price_desc", fallback: "Price: High to Low" },
  { value: "name-asc", labelKey: "sort_name_asc", fallback: "Name: A-Z" },
  { value: "name-desc", labelKey: "sort_name_desc", fallback: "Name: Z-A" },
];

// ─── Sub-components ─────────────────────────────────────────────────────────

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex h-9 items-center rounded-full px-5 text-[0.6rem] font-semibold uppercase tracking-[0.12em] transition-all duration-200 ${
        active
          ? "bg-burgundy text-white shadow-rouge"
          : "border border-white/[0.08] text-white/50 hover:border-white/20 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function FilterPill({
  label,
  onClear,
}: {
  label: string;
  onClear: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#1E1E1E] px-3 py-1.5 text-[0.6rem] text-white/65">
      {label}
      <button
        type="button"
        onClick={onClear}
        aria-label="Remove filter"
        className="flex h-4 w-4 items-center justify-center rounded-full text-white/40 transition-colors duration-200 hover:text-burgundy"
      >
        <svg aria-hidden="true" className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
          <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </span>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────

export function ProductFilters({
  products: propProducts,
  categories,
}: {
  products?: Product[];
  categories: { slug: string; name: string }[];
}) {
  const { t } = useTranslation("common");
  const { t: tShop } = useTranslation("shop");
  const { t: tErrors } = useTranslation("errors");

  const productsSafe = useMemo(
    () => (Array.isArray(propProducts) ? propProducts : []),
    [propProducts],
  );
  const searchParams = useSearchParams();
  const router = useRouter();

  const CATEGORY_MAP = useMemo(
    () => Object.fromEntries(categories.map(c => [c.slug, c.name])),
    [categories],
  );

  // state
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(t("all"));
  const [collectionSlug, setCollectionSlug] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [availabilityOnly, setAvailabilityOnly] = useState(false);
  const [sort, setSort] = useState("default");
  const [mobileOpen, setMobileOpen] = useState(false);

  // refs
  const lastUrlStrRef = useRef<string>("");
  const mobileDrawerRef = useRef<HTMLElement | null>(null);
  const filterButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // URL → state sync
  useEffect(() => {
    const sp = searchParams ?? new URLSearchParams(window.location.search);
    const parsed = parseParams(sp, CATEGORY_MAP, t("all"));
    const urlStr = sp.toString();
    if (urlStr === lastUrlStrRef.current && activeCategory === parsed.activeCategory) return;
    lastUrlStrRef.current = urlStr;

    setQuery(parsed.query);
    setCollectionSlug(parsed.collectionSlug);
    setActiveCategory(parsed.activeCategory);
    setMinPrice(parsed.minPrice);
    setMaxPrice(parsed.maxPrice);
    setAvailabilityOnly(parsed.availabilityOnly);
    setSort(parsed.sort ?? "default");
  }, [searchParams, CATEGORY_MAP, t, activeCategory]);

  // cleanup debounce
  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  // derived
  const normalizedSearch = query.trim();
  const activeFilterCount = useMemo(() => {
    const count = [
      normalizedSearch,
      collectionSlug,
      minPrice != null || maxPrice != null ? "price" : null,
      availabilityOnly,
      sort && sort !== "default" ? "sort" : null,
    ].filter(Boolean).length;
    return count;
  }, [normalizedSearch, collectionSlug, minPrice, maxPrice, availabilityOnly, sort]);
  const filtersActive = activeFilterCount > 0;

  // sort helper
  const sortProducts = useCallback(
    (list: Product[]) => {
      const sorted = [...list];
      switch (sort) {
        case "price-asc":
          sorted.sort((a, b) => {
            const na = Number(String(a.price ?? "0").replace(/[^0-9.]/g, "")) || 0;
            const nb = Number(String(b.price ?? "0").replace(/[^0-9.]/g, "")) || 0;
            return na - nb;
          });
          break;
        case "price-desc":
          sorted.sort((a, b) => {
            const na = Number(String(a.price ?? "0").replace(/[^0-9.]/g, "")) || 0;
            const nb = Number(String(b.price ?? "0").replace(/[^0-9.]/g, "")) || 0;
            return nb - na;
          });
          break;
        case "name-asc":
          sorted.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
          break;
        case "name-desc":
          sorted.sort((a, b) => (b.name ?? "").localeCompare(a.name ?? ""));
          break;
        default:
          break;
      }
      return sorted;
    },
    [sort],
  );

  const filteredProducts = useMemo(() => {
    const q = normalizedSearch.toLowerCase();
    const collSlug = collectionSlug;
    const catMap = new Map(categories.map(c => [c.slug, c.name]));
    const list = productsSafe.filter((product) => {
      const name = product?.name ?? "";
      const category = product?.category ?? "";
      if (!name || !category) return false;
      if (q && !name.toLowerCase().includes(q)) return false;
      if (collSlug) {
        const expectedName = catMap.get(collSlug);
        if (!expectedName || category !== expectedName) return false;
      }
      if (minPrice != null || maxPrice != null) {
        const numeric = Number(String(product.price ?? "").replace(/[^0-9.]/g, "")) || 0;
        if (minPrice != null && numeric < minPrice) return false;
        if (maxPrice != null && maxPrice > 0 && numeric > maxPrice) return false;
      }
      if (availabilityOnly) {
        type Stocked = Product & { stock?: number };
        const p = product as Stocked;
        if (p.stock != null && p.stock <= 0) return false;
      }
      return true;
    });
    return sortProducts(list);
  }, [
    collectionSlug,
    normalizedSearch,
    minPrice,
    maxPrice,
    availabilityOnly,
    productsSafe,
    categories,
    sortProducts,
  ]);

  // URL update
  const updateUrl = useCallback(
    (updates: {
      search?: string;
      collection?: string | null;
      minPrice?: number | null;
      maxPrice?: number | null;
      availability?: boolean;
      sort?: string;
    }) => {
      const newQ = updates.search !== undefined ? updates.search : query;
      const newColl = updates.collection !== undefined ? updates.collection : collectionSlug;
      const newMin = updates.minPrice !== undefined ? updates.minPrice : minPrice;
      const newMax = updates.maxPrice !== undefined ? updates.maxPrice : maxPrice;
      const newAvail = updates.availability !== undefined ? updates.availability : availabilityOnly;
      const newSort = updates.sort !== undefined ? updates.sort : sort;
      const url = paramsToUrl(newQ.trim(), newColl, newMin, newMax, newAvail, newSort);
      const cur = searchParams?.toString() ?? "";
      const curUrl = cur ? `/shop?${cur}` : "/shop";
      if (url === curUrl) return;

      if (updates.search !== undefined) setQuery(updates.search);
      if (updates.collection !== undefined) {
        setCollectionSlug(updates.collection);
        const label = updates.collection
          ? CATEGORY_MAP[updates.collection] ?? updates.collection
          : t("all");
        setActiveCategory(label);
      }
      if (updates.minPrice !== undefined) setMinPrice(updates.minPrice);
      if (updates.maxPrice !== undefined) setMaxPrice(updates.maxPrice);
      if (updates.availability !== undefined) setAvailabilityOnly(updates.availability);
      if (updates.sort !== undefined) setSort(updates.sort);
      router.replace(url, { scroll: false });
    },
    [query, collectionSlug, minPrice, maxPrice, availabilityOnly, sort, searchParams, router, CATEGORY_MAP, t],
  );

  // handlers
  const handleCategoryChange = useCallback(
    (c: string) => {
      const cat = categories.find(cat => cat.name === c);
      const slug = c === t("all") ? null : cat?.slug ?? null;
      updateUrl({ collection: slug });
    },
    [updateUrl, categories, t],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        updateUrl({ search: value });
      }, 300);
    },
    [updateUrl],
  );

  const handleClearSearch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    updateUrl({ search: "" });
  }, [updateUrl]);

  const handleClearAll = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    updateUrl({ search: "", collection: null, minPrice: null, maxPrice: null, availability: false, sort: "default" });
  }, [updateUrl]);

  const handleClearCollection = useCallback(() => {
    updateUrl({ collection: null });
  }, [updateUrl]);

  const handlePriceChange = useCallback((min: number, max: number) => {
    updateUrl({ minPrice: min || null, maxPrice: max || null });
  }, [updateUrl]);

  const handleAvailabilityChange = useCallback((v: boolean) => {
    updateUrl({ availability: v });
  }, [updateUrl]);

  const handleSortChange = useCallback((v: string) => {
    updateUrl({ sort: v });
  }, [updateUrl]);

  function closeMobileDrawer() {
    filterButtonRef.current?.focus();
    setMobileOpen(false);
  }

  // focus trap for mobile drawer
  useEffect(() => {
    if (!mobileOpen) {
      if (previousFocusRef.current) previousFocusRef.current.focus();
      return;
    }
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const drawer = mobileDrawerRef.current;
    const focusable = drawer?.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const nodes = focusable ? Array.from(focusable) : [];
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  // early return — no products
  if (productsSafe.length === 0) {
    return (
      <section className="space-y-8">
        <div className="rounded-xl border border-white/[0.06] bg-[#252525] p-10 text-center">
          <p className="label-utility">{t("no_inventory")}</p>
          <h3 className="font-display mt-3 text-2xl text-white">{t("products_unavailable")}</h3>
          <p className="mt-3 text-sm text-white/40">{t("check_back_shortly")}</p>
        </div>
      </section>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <ShopErrorBoundary
      t={k => (tErrors as unknown as Record<string, string>)[k] ?? k}
    >
      <section className="space-y-10">
        {/* ── Category chips ─────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2">
          {[t("all"), ...categories.map(c => c.name)].map(c => (
            <FilterChip
              key={c}
              label={c}
              active={activeCategory === c}
              onClick={() => handleCategoryChange(c)}
            />
          ))}
        </div>

        {/* ── Search + sort + filter button ─────────────────────────────── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={tShop("search_drinks", "Search drinks...")}
              className="h-11 w-full rounded-xl border border-white/[0.08] bg-[#1E1E1E] px-4 ps-11 pr-10 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/30 focus:border-gold/40 focus:ring-2 focus:ring-gold/10 caret-white"
              style={{ WebkitTextFillColor: "#FFFFFF" }}
            />
            {query && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label={tShop("clear_search")}
                className="absolute end-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/25 transition-colors duration-200 hover:text-white"
              >
                <svg
                  aria-hidden="true"
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              aria-label={tShop("sort_by", "Sort by")}
              className="h-11 appearance-none rounded-xl border border-white/[0.08] bg-[#1E1E1E] px-4 pe-10 text-sm text-white outline-none transition-all duration-200 focus:border-gold/40 focus:ring-2 focus:ring-gold/10"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-[#171717]">
                  {tShop(opt.labelKey, opt.fallback)}
                </option>
              ))}
            </select>
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute end-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Filter button */}
          <button
            ref={filterButtonRef}
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-11 items-center gap-2.5 rounded-xl border border-white/[0.08] bg-[#1E1E1E] px-5 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-white/60 transition-all duration-200 hover:border-white/20 hover:text-white"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                d="M3 6h18M7 12h10M10 18h4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {tShop("filter", "Filters")}
            {activeFilterCount > 0 ? (
              <span className="flex h-4 min-w-[0.8rem] items-center justify-center rounded-full bg-burgundy px-1 text-[0.48rem] font-bold text-white">
                {activeFilterCount}
              </span>
            ) : null}
          </button>
        </div>

        {/* ── Active filter pills ────────────────────────────────────────── */}
        {filtersActive && (
          <div className="flex flex-wrap items-center gap-2">
            {normalizedSearch && (
              <FilterPill
                label={`${tShop("search")}: ${query}`}
                onClear={handleClearSearch}
              />
            )}
            {collectionSlug && (
              <FilterPill
                label={CATEGORY_MAP[collectionSlug] ?? collectionSlug}
                onClear={handleClearCollection}
              />
            )}
            {(minPrice != null || maxPrice != null) && (
              <FilterPill
                label={`${tShop("price_label")}: ${minPrice ?? ""}${minPrice != null && maxPrice != null ? "–" : ""}${maxPrice ?? ""}`}
                onClear={() => updateUrl({ minPrice: null, maxPrice: null })}
              />
            )}
            {availabilityOnly && (
              <FilterPill
                label={tShop("in_stock")}
                onClear={() => updateUrl({ availability: false })}
              />
            )}
            {sort && sort !== "default" && (
              <FilterPill
                label={
                  SORT_OPTIONS.find(o => o.value === sort)?.fallback ?? sort
                }
                onClear={() => updateUrl({ sort: "default" })}
              />
            )}
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-white/40 transition-colors duration-200 hover:text-burgundy"
            >
              {tShop("clear_all", "Clear all")}
            </button>
          </div>
        )}

        {/* ── Product grid ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product: Product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ProductCard {...product} />
                </motion.div>
              ))
            ) : (
              <motion.div
                className="col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="rounded-xl border border-white/[0.06] bg-[#252525] p-10 text-center">
                  <p className="label-utility">{tShop("no_matches")}</p>
                  <h3 className="font-display mt-3 text-2xl text-white">{tShop("no_matches_desc")}</h3>
                  <p className="mt-3 text-sm text-white/40">{tShop("no_results")}</p>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="btn-secondary mt-6"
                  >
                    {tShop("clear_all", "Clear all")}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Results bar ────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-t border-white/[0.06] pt-6">
          <p className="text-[0.65rem] uppercase tracking-[0.15em] text-white/35">
            {filteredProducts.length === 1
              ? tShop("products_found", "1 product found")
              : tShop("products_found_plural", {
                  count: String(filteredProducts.length),
                })}
          </p>
          {filtersActive && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-burgundy transition-colors duration-200 hover:text-burgundy-dark"
            >
              {tShop("reset_filters", "Reset filters")}
            </button>
          )}
        </div>

        {/* ── Mobile filter drawer ────────────────────────────────────────── */}
        <AnimatePresence>
          {mobileOpen && (
            <div className="fixed inset-0 z-50 flex">
              <motion.div
                aria-hidden="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={closeMobileDrawer}
              />
              <motion.aside
                id="mobile-filter-drawer"
                ref={mobileDrawerRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="filter-title"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="relative ms-auto flex h-full w-full max-w-sm flex-col bg-black shadow-premium-xl"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
                  <div className="flex items-center gap-3">
                    <span className="h-px w-6 bg-gold/60" />
                    <h3
                      id="filter-title"
                      className="font-display text-lg tracking-wide text-white"
                    >
                      {tShop("filter", "Filters")}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={closeMobileDrawer}
                    aria-label={tShop("close", "Close")}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-white/50 transition-colors duration-200 hover:text-white hover:bg-white/5"
                  >
                    <svg
                      aria-hidden="true"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        d="M6 18L18 6M6 6l12 12"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                  <FilterSidebar
                    activeCategory={activeCategory}
                    onCategoryChange={handleCategoryChange}
                    minPrice={minPrice ?? 0}
                    maxPrice={maxPrice ?? 0}
                    onPriceChange={handlePriceChange}
                    availabilityOnly={availabilityOnly}
                    onAvailabilityChange={handleAvailabilityChange}
                    categories={categories}
                  />
                </div>

                {/* Footer */}
                <div className="border-t border-white/[0.06] p-5">
                  <button
                    type="button"
                    onClick={closeMobileDrawer}
                    className="btn-primary h-12 w-full text-sm"
                  >
                    {filteredProducts.length}{" "}
                    {tShop("products_found", "results")}
                  </button>
                </div>
              </motion.aside>
            </div>
          )}
        </AnimatePresence>
      </section>
    </ShopErrorBoundary>
  );
}
