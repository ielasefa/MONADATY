"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { Product } from "@/types";
import { useWishlist } from "@/components/wishlist-context";
import { ProductCard } from "@/components/ProductCard";
import { useTranslation } from "@/hooks/useTranslation";

export function WishlistPageClient({ products }: { products: Product[] }) {
  const { t } = useTranslation("wishlist");
  const { items } = useWishlist();
  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const list = useMemo(
    () => items.map((id) => productMap.get(id)).filter(Boolean) as Product[],
    [items, productMap],
  );

  if (list.length === 0) {
    return (
      <div className="grid min-h-[50vh] place-items-center py-10">
        <section className="max-w-sm rounded-md border border-ivory/[0.06] bg-black-surface px-7 py-14 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-md border border-ivory/[0.06] bg-black-surface">
            <svg width={18} height={18} className="h-8 w-8 shrink-0 text-ivory/8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </div>
          <h2 className="text-base font-medium text-ivory">{t("wishlist_title")}</h2>
          <p className="mt-2 text-[0.68rem] text-ivory/25">{t("wishlist_empty")}</p>
          <Link href="/shop" className="btn-primary mt-5 inline-flex h-10 items-center justify-center rounded-md px-5 text-[0.55rem] font-semibold uppercase tracking-[0.14em]">
            {t("shop_drinks")}
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-[0.55rem] text-ivory/20">
          {list.length} {t("drinks_count") || "items"}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <ProductCard
            key={p.id}
            id={p.id}
            slug={p.slug ?? p.id}
            name={p.name}
            price={p.price}
            image={p.image}
            category={p.category}
            visual={p.visual}
            accent={p.accent}
          />
        ))}
      </div>
    </div>
  );
}
