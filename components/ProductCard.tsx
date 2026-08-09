"use client";

import { memo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { Product } from "@/types";
import { useCart } from "@/components/cart-context";
import { useWishlist } from "@/components/wishlist-context";
import { ProductImage } from "@/components/ProductImage";
import { resolveDatabaseProductImage } from "@/lib/product-images";
import { useTranslation } from "@/hooks/useTranslation";
import { PREMIUM_EASE } from "@/lib/motion";

type ProductCardProps = Pick<
  Product,
  "id" | "slug" | "name" | "price" | "image" | "gallery" | "category" | "collection" | "brand" | "visual" | "accent"
> & {
  shortDescription?: string;
  variant?: "default" | "editorial";
};

export const ProductCard = memo(function ProductCard({
  id,
  slug,
  name,
  price,
  image,
  gallery,
  category,
  collection,
  brand,
  visual,
  accent,
  shortDescription,
}: ProductCardProps) {
  const { addItem } = useCart();
  const { contains, toggle } = useWishlist();
  const { t } = useTranslation("products");
  const shouldReduceMotion = useReducedMotion();
  const isWishlisted = contains(id);
  const imageSource = resolveDatabaseProductImage({ image, gallery });
  const imageProduct = { name, image, gallery, category, collection, brand, visual, accent };
  return (
    <motion.article
      initial={false}
      whileHover={shouldReduceMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.36, ease: PREMIUM_EASE }}
      className="group flex h-full min-w-0 flex-col rounded-2xl border border-white/[0.08] bg-[#171714] p-3 shadow-[0_18px_50px_rgba(0,0,0,0.18)] transition-[border-color,box-shadow] duration-300 hover:border-gold/25 hover:shadow-[0_24px_64px_rgba(0,0,0,0.32)] sm:p-4"
    >
      <div
        className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-white/[0.07] bg-[#0B0B0A] transition-[border-color,box-shadow] duration-500 group-hover:border-gold/20 group-hover:shadow-[0_22px_60px_rgba(0,0,0,.25)]"
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

        <span className="pointer-events-none absolute start-3 top-3 z-20 rounded-full border border-white/[0.08] bg-black/55 px-2.5 py-1 text-[0.48rem] font-medium uppercase tracking-[0.18em] text-gold backdrop-blur-md">
          {t("premium", "Popular")}
        </span>

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
          className={`absolute end-3 top-3 z-30 inline-flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 ${
            isWishlisted
              ? "border-gold/35 bg-gold/15 text-gold"
              : "border-white/10 bg-black/45 text-white/55 hover:border-gold/30 hover:text-gold"
          }`}
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
        <p className="line-clamp-1 h-4 text-[0.54rem] font-medium uppercase tracking-[0.2em] text-gold/75">
          {shortDescription || category || "MONADATY"}
        </p>
        <h3 className="mt-2 line-clamp-2 h-[2.8rem] overflow-hidden font-display text-base font-normal leading-[1.3] tracking-[-0.015em] text-white sm:h-[3rem] sm:text-lg">
          <Link href={`/product/${id}`} className="transition-colors duration-300 hover:text-gold-light">
            {name}
          </Link>
        </h3>
        <p className="mb-4 mt-2 h-6 origin-start font-display text-base font-normal text-gold transition-[color,transform] duration-300 group-hover:scale-[1.035] group-hover:text-gold-light motion-reduce:transition-none motion-reduce:group-hover:scale-100">{price}</p>
        <motion.button
          type="button"
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
                description: shortDescription ?? "",
                gallery: gallery || [],
              },
              1,
            )
          }
          className="btn-primary mt-auto h-11 w-full px-3 text-[0.54rem] sm:px-4 sm:text-[0.58rem]"
          aria-label={`${t("add_to_cart")} ${name}`}
          initial={false}
          whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.01 }}
          whileTap={shouldReduceMotion ? undefined : { y: 0, scale: 0.98 }}
          transition={{ duration: 0.24, ease: PREMIUM_EASE }}
        >
          <span>{t("add_to_cart")}</span>
          <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5">→</span>
        </motion.button>
      </div>
    </motion.article>
  );
});
