"use client";

import { memo, useState } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import Link from "next/link";
import type { Product } from "@/types";
import { useCart } from "@/components/cart-context";
import { useWishlist } from "@/components/wishlist-context";
import { ProductImage } from "@/components/ProductImage";
import { resolveDatabaseProductImage } from "@/lib/product-images";
import { useTranslation } from "@/hooks/useTranslation";
import { parseMoney } from "@/lib/money";
import { PREMIUM_EASE } from "@/lib/motion";

type ProductCardProps = Pick<
  Product,
  "id" | "slug" | "name" | "price" | "image" | "gallery" | "category" | "collection" | "brand" | "visual" | "accent" | "stock" | "available" | "comparePrice"
> & {
  shortDescription?: string;
  variant?: "default" | "editorial";
  isBestSeller?: boolean;
  badges?: string[];
};

export const ProductCard = memo(function ProductCard({
  id,
  slug,
  name,
  price,
  comparePrice,
  image,
  gallery,
  category,
  collection,
  brand,
  visual,
  accent,
  stock,
  available,
  shortDescription,
  isBestSeller,
  badges,
}: ProductCardProps) {
  const { addItem } = useCart();
  const hasOffer = Boolean(comparePrice && parseMoney(comparePrice) > parseMoney(price));
  const { contains, toggle } = useWishlist();
  const { t, lang } = useTranslation("products");
  const [quantity, setQuantity] = useState(1);
  const maxQuantity = Math.max(1, Math.min(99, stock ?? 99));
  const selectedQuantity = Math.min(quantity, maxQuantity);
  const outOfStock = available === false || (stock != null && stock <= 0);
  const quantityLabel = { fr: "Quantité", en: "Quantity", ar: "الكمية" }[lang];
  const shouldReduceMotion = useReducedMotion();
  const isWishlisted = contains(id);
  const imageSource = resolveDatabaseProductImage({ image, gallery });
  const imageProduct = { name, image, gallery, category, collection, brand, visual, accent };
  return (
    <motion.article
      initial={false}
      whileHover={shouldReduceMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.36, ease: PREMIUM_EASE }}
      className="market-product group flex h-full min-w-0 flex-col rounded-2xl p-2 transition-[border-color,box-shadow] duration-300 hover:border-line sm:p-3"
    >
      <div
        className="market-product-image relative aspect-square w-full overflow-hidden rounded-xl"
      >
        <Link
          href={`/product/${id}`}
          aria-label={`${t("view_flavor")} ${name}`}
          className="absolute inset-0 z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-inset"
        >
          <ProductImage
            product={imageProduct}
            alt={name}
            fill
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 31vw, 46vw"
            className="object-contain p-4 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100 sm:p-6"
          />
        </Link>

        {(isBestSeller || badges?.[0]) && (
          <span className="market-product-badge pointer-events-none absolute start-2 top-2 z-20 max-w-[calc(100%_-_3.25rem)] truncate rounded-full px-2 py-1 text-sm font-bold">
            {isBestSeller ? t("best_seller", "Best seller") : badges?.[0]}
          </span>
        )}

        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            toggle(id);
          }}
          aria-label={
            isWishlisted
              ? `${t("remove_from_wishlist")} ${name}`
              : `${t("add_to_wishlist")} ${name}`
          }
          aria-pressed={isWishlisted}
          className="market-product-favorite absolute end-1 top-1 z-30 inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-200"
        >
          <motion.svg
            aria-hidden="true"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill={isWishlisted ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.6"
            animate={
              shouldReduceMotion
                ? { scale: 1 }
                : isWishlisted
                  ? { scale: [1, 1.18, 1] }
                  : { scale: 1 }
            }
            transition={{ duration: shouldReduceMotion ? 0 : 0.38, ease: PREMIUM_EASE }}
          >
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 10-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
          </motion.svg>
        </button>
      </div>

      <div className="flex flex-1 flex-col px-1 pb-1 pt-4">
        <p className="line-clamp-1 min-h-4 text-xs font-medium text-secondary">
          {shortDescription || category || "MONADATY"}
        </p>
        <h3 className="mt-2 line-clamp-2 h-12 overflow-hidden text-sm font-semibold leading-6 text-foreground sm:text-base">
          <Link href={`/product/${id}`} className="transition-colors duration-300 hover:text-accent">
            {name}
          </Link>
        </h3>
        <div className="mb-3 mt-1 flex flex-wrap items-baseline gap-x-2">
          <p className="market-product-price text-lg tabular-nums">{price}</p>
          {hasOffer && <s className="text-xs text-secondary">{comparePrice}</s>}
        </div>
        {outOfStock && <p className="mb-2 text-xs font-semibold text-brand">{t("out_of_stock")}</p>}
        <div className={`market-product-actions mt-auto grid items-center gap-2 ${outOfStock ? "grid-cols-1" : "grid-cols-[48px_minmax(0,1fr)]"}`}>
          {!outOfStock && (
            <input
              type="number"
              min={1}
              max={maxQuantity}
              step={1}
              inputMode="numeric"
              value={selectedQuantity}
              aria-label={`${quantityLabel} · ${name}`}
              onChange={(event) => setQuantity(Math.max(1, Math.floor(event.target.valueAsNumber || 1)))}
              className="h-11 w-[3.75rem] rounded-lg border border-[#E8E1D8] px-2 text-center text-sm"
            />
          )}
          <motion.button
            type="button"
            disabled={outOfStock}
            onClick={() =>
              addItem(
                {
                  id,
                  slug,
                  name,
                  price,
                  image: imageSource,
                  category,
                  collection,
                  brand,
                  visual,
                  accent,
                  stock,
                  available,
                  description: shortDescription ?? "",
                  gallery: gallery || [],
                },
                selectedQuantity,
              )
            }
            className="btn-primary min-h-11 min-w-0 px-2 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={`${t("add_to_cart")} ${name}`}
            initial={false}
            whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.01 }}
            whileTap={shouldReduceMotion ? undefined : { y: 0, scale: 0.98 }}
            transition={{ duration: 0.24, ease: PREMIUM_EASE }}
          >
            <span>{{ fr: "Ajouter", en: "Add", ar: "أضف" }[lang]}</span>
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
});
