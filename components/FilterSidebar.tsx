"use client";

import { categoryLabel } from "@/lib/category-label";
import { memo, useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

type FilterSidebarProps = {
  activeCategorySlug: string | null;
  onCategoryChange: (c: string) => void;
  minPrice: number;
  maxPrice: number;
  onPriceChange: (min: number, max: number) => void;
  availabilityOnly: boolean;
  onAvailabilityChange: (v: boolean) => void;
  categories: { name: string; slug: string }[];
};

export const FilterSidebar = memo(function FilterSidebar({
  activeCategorySlug,
  onCategoryChange,
  minPrice,
  maxPrice,
  onPriceChange,
  availabilityOnly,
  onAvailabilityChange,
  categories,
}: FilterSidebarProps) {
  const { t, lang } = useTranslation("shop");
  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);

  useEffect(() => {
    setLocalMin(minPrice);
    setLocalMax(maxPrice);
  }, [minPrice, maxPrice]);

  return (
    <aside aria-label={t("filter")} className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <p className="label-utility tracking-[0.08em] text-accent">{t("filter")}</p>
        <h4 className="font-display mt-2 text-lg tracking-wide text-foreground">
          {t("refine", "Refine")}
        </h4>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      {/* Category */}
      <div role="group" aria-labelledby="filter-category" className="space-y-3">
        <p id="filter-category" className="label-utility tracking-[0.08em] text-secondary">
          {t("category")}
        </p>
        <div className="flex flex-col gap-1.5">
          {["all", ...categories.map(c => c.name)].map(c => {
            const cat = categories.find(cat => cat.name === c);
            const slug = c === "all" ? null : cat?.slug ?? null;
            return (
              <button
                key={c}
                type="button"
                aria-pressed={activeCategorySlug === slug}
                onClick={() => onCategoryChange(c)}
                className={`inline-flex h-9 w-full items-center rounded-input px-4 text-sm font-medium transition-all duration-200 ${
                  activeCategorySlug === slug
                    ? "bg-burgundy text-foreground"
                    : "border border-line bg-transparent text-secondary hover:border-line hover:text-foreground"
                }`}
              >
                {c === "all" ? t("all") : categoryLabel(c, lang)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price */}
      <div className="space-y-3">
        <p className="label-utility tracking-[0.08em] text-secondary">{t("price")}</p>
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              aria-label={t("min_price", "Minimum price")}
              value={localMin || ""}
              onChange={(e) => setLocalMin(Number(e.target.value))}
              className="storefront-input"
            />
          </div>
          <span className="text-secondary">—</span>
          <div className="relative flex-1">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              aria-label={t("max_price", "Maximum price")}
              value={localMax || ""}
              onChange={(e) => setLocalMax(Number(e.target.value))}
              className="storefront-input"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => onPriceChange(localMin, localMax)}
          className="btn-secondary h-9 w-full text-sm font-semibold uppercase tracking-[0.08em]"
          aria-label={t("apply_price_filter", "Apply price filter")}
        >
          {t("apply")}
        </button>
      </div>

      {/* Availability */}
      <div className="space-y-3">
        <p className="label-utility tracking-[0.08em] text-secondary">{t("availability")}</p>
        <label className="inline-flex items-center gap-3 cursor-pointer select-none">
          <div className="relative flex h-5 w-9 items-center">
            <input
              type="checkbox"
              checked={availabilityOnly}
              onChange={(e) => onAvailabilityChange(e.target.checked)}
              className="peer sr-only"
            />
            <div className="h-full w-full rounded-full border border-line bg-surface transition-colors duration-200 peer-checked:border-burgundy peer-checked:bg-burgundy" />
            <div className="absolute inset-y-0 start-0.5 m-auto h-3 w-3 rounded-full bg-white/50 transition-all duration-200 peer-checked:translate-x-4 peer-checked:bg-white" />
          </div>
          <span className="text-sm text-secondary">{t("in_stock_only")}</span>
        </label>
      </div>
    </aside>
  );
});
