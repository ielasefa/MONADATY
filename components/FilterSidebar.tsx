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
      <div>
        <p className="label-utility tracking-[0.28em] text-ivory/20">{t("filter")}</p>
        <h4 className="font-display mt-1.5 text-base text-ivory">{t("refine")}</h4>
      </div>

      <div className="h-px bg-ivory/[0.03]" />

      <div role="group" aria-labelledby="filter-category" className="space-y-2.5">
        <p id="filter-category" className="label-utility tracking-[0.22em] text-ivory/20">
          {t("category")}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {[t("all"), ...categories.map((c) => c.name)].map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={activeCategory === c}
              onClick={() => onCategoryChange(c)}
              className={`px-3 py-1.5 text-[0.58rem] font-medium transition-all duration-200 ${
                activeCategory === c
                  ? "bg-burgundy text-ivory"
                  : "text-ivory/30 hover:text-ivory/50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        <p className="label-utility tracking-[0.22em] text-ivory/20">
          {t("price")}
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            aria-label="Minimum price"
            value={localMin || ""}
            onChange={(e) => setLocalMin(Number(e.target.value))}
            className="l-input h-9 w-20 text-[0.65rem]"
          />
          <span className="text-ivory/8">—</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            aria-label="Maximum price"
            value={localMax || ""}
            onChange={(e) => setLocalMax(Number(e.target.value))}
            className="l-input h-9 w-20 text-[0.65rem]"
          />
        </div>
        <button
          type="button"
          onClick={() => onPriceChange(localMin, localMax)}
          className="btn-secondary h-9 w-full text-[0.52rem] font-semibold uppercase tracking-[0.1em]"
          aria-label="Apply price filter"
        >
          {t("apply")}
        </button>
      </div>

      <div className="space-y-2.5">
        <p className="label-utility tracking-[0.22em] text-ivory/20">
          {t("availability")}
        </p>
        <label className="inline-flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={availabilityOnly}
            onChange={(e) => onAvailabilityChange(e.target.checked)}
            className="accent-burgundy"
          />
          <span className="text-[0.68rem] text-ivory/35">{t("in_stock_only")}</span>
        </label>
      </div>
    </aside>
  );
});
