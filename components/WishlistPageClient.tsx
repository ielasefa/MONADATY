"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { Product } from "@/types";
import { useWishlist } from "@/components/wishlist-context";
import { ProductCard } from "@/components/ProductCard";
import { useTranslation } from "@/hooks/useTranslation";
import { getLandingCopy } from "@/lib/landing-copy";
import { Reveal } from "@/components/Reveal";

export function WishlistPageClient({ products }: { products: Product[] }) {
  const { t, lang } = useTranslation("wishlist");
  const copy = getLandingCopy(lang);
  const { items, hydrated } = useWishlist();
  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const list = useMemo(
    () => items.map((id) => productMap.get(id)).filter(Boolean) as Product[],
    [items, productMap],
  );

  if (!hydrated) {
    return (
      <div className="wishlist-loading-grid" role="status" aria-busy="true" aria-label={t("loading", "Loading favorites")}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="wishlist-loading-card" key={index}>
            <div className="wishlist-loading-image" />
            <div className="wishlist-loading-line wishlist-loading-line-wide" />
            <div className="wishlist-loading-line" />
            <div className="wishlist-loading-button" />
          </div>
        ))}
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <div className="wishlist-empty-wrap grid place-items-center py-8">
        <section className="storefront-empty wishlist-empty-state w-full">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-line bg-surface">
            <svg width={18} height={18} className="h-7 w-7 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </div>
          <h2 className="font-display text-3xl text-foreground">
            {{ fr: "Votre sélection commence ici", en: "Start your selection", ar: "ابدأ قائمتك المفضلة" }[lang]}
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-[1.75] text-secondary">{t("wishlist_empty")}</p>
          <Link href="/shop" className="btn-primary mt-7">
            {t("shop_drinks")}
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="wishlist-listing">
      <div className="wishlist-toolbar">
        <div className="flex min-w-0 items-center gap-3">
          <span className="wishlist-toolbar-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
            </svg>
          </span>
          <p className="min-w-0 text-sm font-semibold text-brand">
            {list.length} <span className="font-normal text-secondary">{t("drinks_count", "items")}</span>
          </p>
        </div>
        <Link href="/shop" className="wishlist-shop-link">
          {t("shop_drinks", "Shop drinks")}
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 10h13M10 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </Link>
      </div>
      <div className="wishlist-product-grid">
        {list.map((p, index) => (
          <Reveal key={p.id} delay={Math.min(index * 0.05, 0.2)} className="h-full">
            <ProductCard {...p} slug={p.slug ?? p.id} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
