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
  const { items } = useWishlist();
  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const list = useMemo(
    () => items.map((id) => productMap.get(id)).filter(Boolean) as Product[],
    [items, productMap],
  );

  if (list.length === 0) {
    return (
      <div className="grid min-h-[42vh] place-items-center py-6">
        <section className="storefront-empty w-full max-w-lg">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-gold/[0.16] bg-surface">
            <svg width={18} height={18} className="h-7 w-7 shrink-0 text-gold/55" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </div>
          <h2 className="font-display text-3xl text-white">{copy.wishlist.title}</h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-[1.75] text-white/58">{t("wishlist_empty")}</p>
          <Link href="/shop" className="btn-primary mt-7">
            {t("shop_drinks")}
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-7 flex items-center justify-between border-b border-gold/[0.16] pb-5">
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-white/45">
          {list.length} {t("drinks_count") || "items"}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {list.map((p, index) => (
          <Reveal key={p.id} delay={Math.min(index * 0.05, 0.2)} className="h-full">
            <ProductCard
              id={p.id}
              slug={p.slug ?? p.id}
              name={p.name}
              price={p.price}
              image={p.image}
              gallery={p.gallery}
              category={p.category}
              collection={p.collection}
              brand={p.brand}
              visual={p.visual}
              accent={p.accent}
            />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
