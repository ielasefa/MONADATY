"use client";
import { logError } from "@/lib/logger";

import { Component, useMemo, useState, useEffect, useRef, useCallback, type ErrorInfo, type ReactNode } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/types";
import { FilterSidebar } from "@/components/FilterSidebar";
import { useTranslation } from "@/hooks/useTranslation";

// ─── URL helpers ───────────────────────────────────────────────────────────

function parseParams(sp: URLSearchParams, categoryMap: Record<string, string>, allLabel = "All") {
  const s = sp.get("search") ?? "";
  const coll = sp.get("collection") ?? sp.get("category") ?? "";
  const price = sp.get("price") ?? "";
  const avail = sp.get("availability") ?? "";
  let minP: number | null = null;
  let maxP: number | null = null;
  if (price) {
    const [mn, mx] = price.split("-").map((p) => Number(p) || null);
    minP = mn;
    maxP = mx;
  }
  const slug = coll || null;
  const label = slug ? (categoryMap[slug] ?? slug) : allLabel;
  return { query: s, collectionSlug: slug, activeCategory: label, minPrice: minP, maxPrice: maxP, availabilityOnly: avail === "in-stock" };
}

function paramsToUrl(search: string, coll: string | null, minP: number | null, maxP: number | null, avail: boolean) {
  const sp = new URLSearchParams();
  if (search) sp.set("search", search);
  if (coll) sp.set("collection", coll);
  if (minP != null || maxP != null) {
    const p = `${minP ?? ""}-${maxP ?? ""}`;
    if (p !== "-") sp.set("price", p);
  }
  if (avail) sp.set("availability", "in-stock");
  const qs = sp.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

// ─── Error boundary ────────────────────────────────────────────────────────

class ShopErrorBoundary extends Component<{ children: ReactNode; t?: (key: string) => string }, { hasError: boolean }> {
  constructor(props: { children: ReactNode; t?: (key: string) => string }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { logError(error, "Shop render error", { info }); }
  render() {
    if (this.state.hasError) {
      const t = this.props.t || ((k: string) => k);
      return (
        <div className="rounded-md border border-ivory/[0.06] bg-black-surface p-10 text-center">
          <p className="label-utility">{t("shop_unavailable")}</p>
          <h3 className="font-display mt-3 text-2xl text-ivory">{t("shop_unavailable_desc")}</h3>
          <p className="mt-3 text-sm text-ivory/40">{t("try_again")}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Component ─────────────────────────────────────────────────────────────

export function ProductFilters({ products: propProducts, categories }: { products?: Product[]; categories: { slug: string; name: string }[] }) {
  const { t } = useTranslation("common");
  const { t: tShop } = useTranslation("shop");
  const { t: tErrors } = useTranslation("errors");
  const errorT = (key: string) => {
    if (key === "shop_unavailable" || key === "shop_unavailable_desc") return tShop(key);
    if (key === "try_again") return tErrors(key);
    return key;
  };
  const productsSafe = useMemo(() => (Array.isArray(propProducts) ? propProducts : []), [propProducts]);
  const searchParams = useSearchParams();
  const router = useRouter();

  const CATEGORY_MAP = useMemo(() =>
    Object.fromEntries(categories.map(c => [c.slug, c.name])),
    [categories]
  );

  // ── state (all derived from URL on initial render, then synced via effect) ─
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(t("all"));
  const [collectionSlug, setCollectionSlug] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [availabilityOnly, setAvailabilityOnly] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // ── refs ─────────────────────────────────────────────────────────────────
  const lastUrlStrRef = useRef<string>("");
  const mobileDrawerRef = useRef<HTMLElement | null>(null);
  const filterButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // ── SINGLE URL → state effect (runs on mount AND whenever URL changes) ────
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
  }, [searchParams, CATEGORY_MAP, t, activeCategory]);

  // ── derived values ───────────────────────────────────────────────────────
  const normalizedSearch = query.trim();

  const activeFilterCount = [
    normalizedSearch,
    collectionSlug,
    minPrice != null || maxPrice != null ? "price" : null,
    availabilityOnly,
  ].filter(Boolean).length;
  const filtersActive = activeFilterCount > 0;

  const filteredProducts = useMemo(() => {
    const q = normalizedSearch.toLowerCase();
    const collSlug = collectionSlug;
    const catMap = new Map(categories.map(c => [c.slug, c.name]));
    return productsSafe.filter((product) => {
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
  }, [collectionSlug, normalizedSearch, minPrice, maxPrice, availabilityOnly, productsSafe, categories]);

  // ── URL update helper (called by event handlers) ─────────────────────────
  const updateUrl = useCallback((updates: { search?: string; collection?: string | null; minPrice?: number | null; maxPrice?: number | null; availability?: boolean }) => {
    const newQ = updates.search !== undefined ? updates.search : query;
    const newColl = updates.collection !== undefined ? updates.collection : collectionSlug;
    const newMin = updates.minPrice !== undefined ? updates.minPrice : minPrice;
    const newMax = updates.maxPrice !== undefined ? updates.maxPrice : maxPrice;
    const newAvail = updates.availability !== undefined ? updates.availability : availabilityOnly;

    const url = paramsToUrl(newQ.trim(), newColl, newMin, newMax, newAvail);
    const cur = searchParams?.toString() ?? "";
    const curUrl = cur ? `/shop?${cur}` : "/shop";
    if (url === curUrl) return;

    // Update state immediately so the UI is responsive
    if (updates.search !== undefined) setQuery(updates.search);
    if (updates.collection !== undefined) {
      setCollectionSlug(updates.collection);
      const label = updates.collection ? (CATEGORY_MAP[updates.collection] ?? updates.collection) : t("all");
      setActiveCategory(label);
    }
    if (updates.minPrice !== undefined) setMinPrice(updates.minPrice);
    if (updates.maxPrice !== undefined) setMaxPrice(updates.maxPrice);
    if (updates.availability !== undefined) setAvailabilityOnly(updates.availability);

    router.replace(url, { scroll: false });
  }, [query, collectionSlug, minPrice, maxPrice, availabilityOnly, searchParams, router, CATEGORY_MAP, t]);

  // ── event handlers ───────────────────────────────────────────────────────
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCategoryChange = useCallback((c: string) => {
    const cat = categories.find(cat => cat.name === c);
    const slug = c === t("all") ? null : (cat?.slug ?? null);
    updateUrl({ collection: slug });
  }, [updateUrl, categories, t]);

  const handleSearchChange = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateUrl({ search: value });
    }, 300);
  }, [updateUrl]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleClearSearch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    updateUrl({ search: "" });
  }, [updateUrl]);

  const handleClearAll = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    updateUrl({ search: "", collection: null, minPrice: null, maxPrice: null, availability: false });
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

  function closeMobileDrawer() {
    filterButtonRef.current?.focus();
    setMobileOpen(false);
  }

  // ── focus trap for mobile drawer ─────────────────────────────────────────
  useEffect(() => {
    if (!mobileOpen) {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
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
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  // ── early return ──────────────────────────────────────────────────────────
  if (productsSafe.length === 0) {
    return (
      <section id="flavors" className="space-y-8">
        <div className="rounded-md border border-ivory/[0.06] bg-black-surface p-10 text-center">
          <p className="label-utility">{t("no_inventory")}</p>
          <h3 className="font-display mt-3 text-2xl text-ivory">{t("products_unavailable")}</h3>
          <p className="mt-3 text-sm text-ivory/40">{t("check_back_shortly")}</p>
        </div>
      </section>
    );
  }

  // ── render ───────────────────────────────────────────────────────────────
  return (
    <ShopErrorBoundary t={errorT}>
      <section id="flavors" className="space-y-6">
        {/* ── Category chips ──────────────────────────────────────────── */}
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide">
          <motion.button
            type="button"
            aria-pressed={collectionSlug === null}
            onClick={() => handleCategoryChange(t("all"))}
            whileTap={{ scale: 0.95 }}
              className={`shrink-0 rounded-md px-5 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] transition-all duration-200 ${
              collectionSlug === null
                ? "bg-burgundy text-ivory"
                : "border border-ivory/[0.06] bg-ivory/[0.02] text-ivory/40 hover:border-ivory/[0.12] hover:text-ivory/60"
            }`}
          >
            {t("all")}
          </motion.button>
          {categories.map((c) => (
            <motion.button
              key={c.slug}
              type="button"
              aria-pressed={collectionSlug === c.slug}
              onClick={() => handleCategoryChange(c.name)}
              whileTap={{ scale: 0.95 }}
              className={`shrink-0 rounded-md px-5 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] transition-all duration-200 ${
                collectionSlug === c.slug
                  ? "bg-burgundy text-ivory"
                  : "border border-ivory/[0.06] bg-ivory/[0.02] text-ivory/40 hover:border-ivory/[0.12] hover:text-ivory/60"
              }`}
            >
              {c.name}
            </motion.button>
          ))}
        </div>

        {/* ── Search + filter toggle ──────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xl">
            <svg aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t("search_drinks")}
              className="w-full rounded-md border border-ivory/[0.06] bg-ivory/[0.02] py-3 pl-11 pr-10 text-sm text-ivory placeholder:text-ivory/20 outline-none transition-colors focus:border-ivory/15 focus:ring-1 focus:ring-ivory/10"
            />
            {query ? (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label={t("clear_search")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-ivory/25 transition-colors hover:text-ivory"
              >
                <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ) : null}
          </div>

          <button
            ref={filterButtonRef}
            type="button"
            aria-expanded={mobileOpen}
            aria-controls="mobile-filter-drawer"
            onClick={() => setMobileOpen(true)}
            className="relative flex items-center gap-2 rounded-md border border-ivory/[0.06] bg-ivory/[0.02] px-5 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ivory/40 transition-all duration-200 hover:border-ivory/[0.12] hover:text-ivory/60"
          >
            <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M7 12h10M10 18h4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t("filter")}
            {activeFilterCount > 0 ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-burgundy px-1 text-[0.5rem] font-bold text-ivory">
                {activeFilterCount}
              </span>
            ) : null}
          </button>
        </div>

        {/* ── Active filter chips + product count ──────────────────────── */}
        <div className="flex flex-wrap items-center gap-2">
          <AnimatePresence>
            {normalizedSearch ? (
              <motion.span
                key="search"
                layout
                className="inline-flex items-center gap-1.5 rounded-full border border-ivory/[0.06] bg-ivory/[0.03] px-3 py-1.5 text-[0.65rem] text-ivory/60"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                {t("search")}: {query}
                <button type="button" onClick={handleClearSearch} aria-label={t("clear_search")} className="ml-1 text-ivory/30 transition-colors hover:text-burgundy">&times;</button>
              </motion.span>
            ) : null}
          </AnimatePresence>

          <AnimatePresence>
            {collectionSlug ? (
              <motion.span
                key="collection"
                layout
                className="inline-flex items-center gap-1.5 rounded-full border border-ivory/[0.06] bg-ivory/[0.03] px-3 py-1.5 text-[0.65rem] text-ivory/60"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                {CATEGORY_MAP[collectionSlug] ?? collectionSlug}
                <button type="button" onClick={handleClearCollection} aria-label={t("clear_collection")} className="ml-1 text-ivory/30 transition-colors hover:text-burgundy">&times;</button>
              </motion.span>
            ) : null}
          </AnimatePresence>

          <AnimatePresence>
            {minPrice != null || maxPrice != null ? (
              <motion.span
                key="price"
                layout
                className="inline-flex items-center gap-1.5 rounded-full border border-ivory/[0.06] bg-ivory/[0.03] px-3 py-1.5 text-[0.65rem] text-ivory/60"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                {t("price_label")}: {minPrice ?? ""}–{maxPrice ?? ""}
                <button type="button" onClick={() => updateUrl({ minPrice: null, maxPrice: null })} aria-label={t("clear_price")} className="ml-1 text-ivory/30 transition-colors hover:text-burgundy">&times;</button>
              </motion.span>
            ) : null}
          </AnimatePresence>

          <AnimatePresence>
            {availabilityOnly ? (
              <motion.span
                key="availability"
                layout
                className="inline-flex items-center gap-1.5 rounded-full border border-ivory/[0.06] bg-ivory/[0.03] px-3 py-1.5 text-[0.65rem] text-ivory/60"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                {t("in_stock")}
                <button type="button" onClick={() => updateUrl({ availability: false })} aria-label={t("clear_filters")} className="ml-1 text-ivory/30 transition-colors hover:text-burgundy">&times;</button>
              </motion.span>
            ) : null}
          </AnimatePresence>

          {filtersActive ? (
            <motion.button
              type="button"
              onClick={handleClearAll}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="ml-1 text-[0.65rem] text-ivory/30 underline decoration-ivory/15 underline-offset-2 transition-colors hover:text-burgundy hover:decoration-burgundy/30"
              aria-label={t("clear_filters")}
            >
              {t("clear_all")}
            </motion.button>
          ) : null}

          <div className="ml-auto text-[0.65rem] text-ivory/30">
            {filteredProducts.length === 1
              ? t("products_found", { count: String(filteredProducts.length) })
              : t("products_found_plural", { count: String(filteredProducts.length) })}
          </div>
        </div>

        {/* ── Product grid ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProducts.length
              ? filteredProducts.map((product: Product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ProductCard {...product} />
                  </motion.div>
                ))
              : (
                  <motion.div
                    className="col-span-2 md:col-span-3 lg:col-span-4"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="rounded-md border border-ivory/[0.06] bg-black-surface p-10 text-center">
                      <p className="label-utility">{t("no_matches")}</p>
                      <h3 className="font-display mt-3 text-2xl text-ivory">{t("no_matches_desc")}</h3>
                      <p className="mt-3 text-sm text-ivory/40">{t("no_results")}</p>
                      <button
                        type="button"
                        onClick={handleClearAll}
                        className="btn-secondary mt-6"
                      >
                        {t("clear_all")}
                      </button>
                    </div>
                  </motion.div>
                )}
          </AnimatePresence>
        </div>

        {/* ── Mobile filter drawer ─────────────────────────────────────── */}
        {mobileOpen ? (
          <div className="fixed inset-0 z-50 flex">
            <div aria-hidden="true" className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" onClick={closeMobileDrawer} />
            <aside
              id="mobile-filter-drawer"
              ref={mobileDrawerRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="filter-title"
              className="relative ml-auto flex h-full w-full max-w-sm flex-col bg-black shadow-2xl transition-transform duration-300"
              onKeyDown={(e) => { if (e.key === "Escape") closeMobileDrawer(); }}
            >
              <div className="flex items-center justify-between border-b border-ivory/[0.05] px-6 py-5">
                <h3 id="filter-title" className="font-display text-lg text-ivory">{t("filter")}</h3>
                <button type="button" onClick={closeMobileDrawer} aria-label={t("close")} className="rounded-md p-2 text-ivory/40 transition-colors hover:text-ivory">&times;</button>
              </div>
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
              <div className="border-t border-ivory/[0.05] px-6 py-4">
                <button
                  type="button"
                  onClick={closeMobileDrawer}
                  className="w-full rounded-md bg-burgundy py-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-burgundy/85"
                >
                  {t("show_results", { count: String(filteredProducts.length) })}
                </button>
              </div>
            </aside>
          </div>
        ) : null}
      </section>
    </ShopErrorBoundary>
  );
}
