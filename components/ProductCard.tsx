"use client";

import Link from "next/link";
import { memo } from "react";
import { SodaCan } from "@/components/visuals/SodaCan";
import { SodaBottle } from "@/components/visuals/SodaBottle";
import { GlassDrink } from "@/components/visuals/GlassDrink";
import type { Product } from "@/types";
import { useCart } from "@/components/cart-context";
import { useWishlist } from "@/components/wishlist-context";
import { SafeImage } from "@/components/SafeImage";
import { useTranslation } from "@/hooks/useTranslation";

/* ============================================================
   PRODUCT CARD — editorial product presentation
   Product floats on black canvas
   No card backgrounds, generous whitespace
   DM Serif product name, champagne gold price
   Burgundy CTA, subtle hover interaction
   ============================================================ */

type ProductCardProps = Pick<Product, "id" | "name" | "price" | "image" | "category" | "visual" | "accent">;
type ProductCardPropsWithBadge = ProductCardProps & {
  badge?: string;
};

export const ProductCard = memo(function ProductCard({
  id, name, price, image, category, visual, accent, badge,
}: ProductCardPropsWithBadge) {
  const { addItem } = useCart();
  const { contains, toggle } = useWishlist();
  const { t } = useTranslation("products");

  const cartProduct: Product = {
    id, name, price, image, category, visual, accent, description: "", gallery: [],
  };

  const initials = name.split(" ").slice(0, 2).map((part) => part[0]).join("");
  const isWishlisted = contains(id);

  return (
    <article data-product-id={id} className="group relative flex flex-col">
      <Link
        href={`/product/${id}`}
        aria-label={`${t("view_flavor")} ${name}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        <div className="relative aspect-[3/4] overflow-visible">
          {/* Wishlist heart — appears on hover */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle(id);
            }}
            aria-label={isWishlisted ? `${t("remove_from_wishlist")} ${name}` : `${t("add_to_wishlist")} ${name}`}
            aria-pressed={isWishlisted}
            className={`absolute left-3 top-3 z-20 inline-flex items-center justify-center p-2.5 transition-all duration-300 ${
              isWishlisted
                ? "text-burgundy opacity-100"
                : "text-ivory/15 opacity-100 md:opacity-0 md:group-hover:opacity-100"
            }`}
          >
            <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 10-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>

          {/* Badge — gold if present */}
          {badge && (
            <span className="absolute right-3 top-3 z-10 inline-flex items-center px-2 py-0.5 text-[0.32rem] font-semibold uppercase tracking-[0.2em] text-gold/70">
              {badge}
            </span>
          )}

          <div className="relative z-10 flex h-full w-full items-center justify-center p-10 transition-all duration-[1200ms] ease-out group-hover:-translate-y-2">
            {image ? (
              <SafeImage
                src={image}
                alt={name}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                className="object-contain drop-shadow-[0_24px_64px_rgba(0,0,0,0.55)] transition-all duration-[1200ms] ease-out group-hover:drop-shadow-[0_36px_90px_rgba(0,0,0,0.7)]"
                fallback={
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-sm font-medium text-ivory/[0.05]">{initials}</span>
                </div>
                }
              />
            ) : visual ? (
  <div className="max-h-full max-w-full transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]">
    {visual === "can" && <SodaCan width={180} height={240} accent={accent} label={name} />}
    {visual === "bottle" && <SodaBottle width={170} height={260} accent={accent} label={name} />}
    {visual === "glass" && <GlassDrink width={200} height={220} accent={accent} label={name} />}
  </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-sm font-medium text-ivory/[0.05]">{initials}</span>
              </div>
            )}
          </div>
        </div>
      </Link>

      <div className="mt-7 space-y-2">
        {category && (
          <p className="label-utility tracking-[0.35em] text-ivory/12">
            {category}
          </p>
        )}
        <h3 className="font-display text-xl leading-[0.95] tracking-[-0.015em] text-ivory transition-colors duration-300 group-hover:text-gold/80">
          <Link href={`/product/${id}`}>{name}</Link>
        </h3>
        <p className="font-display text-base font-light tracking-wide text-gold">{price}</p>
      </div>

      <div className="mt-6">
  <button
    type="button"
    onClick={() => addItem(cartProduct, 1)}
    className="btn-primary-sm w-full"
    aria-label={`${t("add_to_cart")} ${name}`}
  >
    {t("add_to_cart")}
  </button>
      </div>
    </article>
  );
});
