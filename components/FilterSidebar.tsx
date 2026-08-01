"use client";

import { memo, useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

type FilterSidebarProps = {
  activeCategory: string;
  onCategoryChange: (c: string) => void;
  minPrice: number;
  maxPrice: number;
  onPriceChange: (min: number, max: number) => void;
  availabilityOnly: boolean;
  onAvailabilityChange: (v: boolean) => void;
  categories: { name: string; slug: string }[];
};

export const FilterSidebar = memo(function FilterSidebar({
  activeCategory,
  onCategoryChange,
  minPrice,
  maxPrice,
  onPriceChange,
  availabilityOnly,
  onAvailabilityChange,
  categories,
}: FilterSidebarProps) {
  const { t } = useTranslation("shop");
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
        <p className="label-utility tracking-[0.55em] text-gold/60">{t("filter")}</p>
        <h4 className="font-display mt-2 text-lg tracking-wide text-white">
          {t("refine", "Refine")}
        </h4>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      {/* Category */}
      <div role="group" aria-labelledby="filter-category" className="space-y-3">
        <p id="filter-category" className="label-utility tracking-[0.22em] text-white/40">
          {t("category")}
        </p>
        <div className="flex flex-col gap-1.5">
          {[t("all"), ...categories.map(c => c.name)].map(c => (
            <button
              key={c}
              type="button"
              aria-pressed={activeCategory === c}
              onClick={() => onCategoryChange(c)}
              className={`inline-flex h-9 w-full items-center rounded-input px-4 text-[0.65rem] font-medium transition-all duration-200 ${
                activeCategory === c
                  ? "bg-burgundy text-white"
                  : "border border-white/[0.06] bg-transparent text-white/50 hover:border-white/[0.14] hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="space-y-3">
        <p className="label-utility tracking-[0.22em] text-white/40">{t("price")}</p>
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              aria-label="Minimum price"
              value={localMin || ""}
              onChange={(e) => setLocalMin(Number(e.target.value))}
              className="h-10 w-full rounded-input border border-white/[0.08] bg-[#1E1E1E] px-3 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/35 focus:border-gold/50 focus:ring-1 focus:ring-gold/20 caret-white"
              style={{ WebkitTextFillColor: "#FFFFFF", caretColor: "#FFFFFF" }}
            />
          </div>
          <span className="text-white/35">—</span>
          <div className="relative flex-1">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              aria-label="Maximum price"
              value={localMax || ""}
              onChange={(e) => setLocalMax(Number(e.target.value))}
              className="h-10 w-full rounded-input border border-white/[0.08] bg-[#1E1E1E] px-3 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/35 focus:border-gold/50 focus:ring-1 focus:ring-gold/20 caret-white"
              style={{ WebkitTextFillColor: "#FFFFFF", caretColor: "#FFFFFF" }}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => onPriceChange(localMin, localMax)}
          className="btn-secondary h-9 w-full text-[0.55rem] font-semibold uppercase tracking-[0.14em]"
          aria-label="Apply price filter"
        >
          {t("apply")}
        </button>
      </div>

      {/* Availability */}
      <div className="space-y-3">
        <p className="label-utility tracking-[0.22em] text-white/40">{t("availability")}</p>
        <label className="inline-flex items-center gap-3 cursor-pointer select-none">
          <div className="relative flex h-5 w-9 items-center">
            <input
              type="checkbox"
              checked={availabilityOnly}
              onChange={(e) => onAvailabilityChange(e.target.checked)}
              className="peer sr-only"
            />
            <div className="h-full w-full rounded-full border border-white/[0.1] bg-surface transition-colors duration-200 peer-checked:border-burgundy peer-checked:bg-burgundy" />
            <div className="absolute inset-y-0 start-0.5 m-auto h-3 w-3 rounded-full bg-white/50 transition-all duration-200 peer-checked:translate-x-4 peer-checked:bg-white" />
          </div>
          <span className="text-[0.68rem] text-white/55">{t("in_stock_only")}</span>
        </label>
      </div>
    </aside>
  );
});
