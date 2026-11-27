"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { Product } from "@/types";
import { useWishlist } from "@/components/wishlist-context";
import { ProductCard } from "@/components/ProductCard";
import { useTranslation } from "@/hooks/useTranslation";
import { Reveal } from "@/components/Reveal";

export function WishlistPageClient({ products }: { products: Product[] }) {
  const { t, lang } = useTranslation("wishlist");
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
      <div className="wishlist-empty-wrap">
        <section className="wishlist-empty-state" aria-labelledby="wishlist-empty-title">
          <div className="wishlist-empty-icon" aria-hidden="true">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </div>
          <div className="wishlist-empty-copy">
            <h2 id="wishlist-empty-title">{{ fr: "Gardez vos essentiels à portée de main", en: "Keep your essentials close", ar: "مشروباتك المفضلة في مكان واحد" }[lang]}</h2>
            <p>{{ fr: "Appuyez sur le cœur d’un produit pour le retrouver ici et préparer votre prochaine commande.", en: "Tap the heart on a product to save it here and prepare your next order.", ar: "اضغط على القلب بجانب أي منتج لحفظه هنا والرجوع إليه عند تحضير طلبك القادم." }[lang]}</p>
            <Link href="/shop" className="btn-primary wishlist-browse-link">
              {t("shop_drinks")}
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 10h13M10 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
          </div>
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
          <p className="wishlist-saved-count" role="status" aria-live="polite" aria-atomic="true">
            <span className="wishlist-count-value">{list.length}</span>
            <span>{{ fr: list.length === 1 ? "produit enregistré" : "produits enregistrés", en: list.length === 1 ? "saved product" : "saved products", ar: "في المفضلة" }[lang]}</span>
          </p>
        </div>
        <Link href="/shop" className="wishlist-shop-link">
          {{ fr: "Continuer mes achats", en: "Continue shopping", ar: "متابعة التسوق" }[lang]}
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
