"use client";

import Link from "next/link";
import { memo } from "react";

import type { Product } from "@/types";
import { useCart } from "@/components/cart-context";
import { useWishlist } from "@/components/wishlist-context";
import { SafeImage } from "@/components/SafeImage";
import { useTranslation } from "@/hooks/useTranslation";

type ProductCardProps = Pick<Product, "id" | "name" | "price" | "image" | "category" | "visual" | "accent"> & {
  shortDescription?: string;
};

export const ProductCard = memo(function ProductCard({
  id,
  name,
  price,
  image,
  category,
  visual,
  accent,
  shortDescription,
}: ProductCardProps) {
  const { addItem } = useCart();
  const { contains, toggle } = useWishlist();
  const { t } = useTranslation("products");



  const isWishlisted = contains(id);

  return (
    <article className="group flex flex-col">
      <div className="relative">
        <Link
          href={`/product/${id}`}
          aria-label={`${t("view_flavor")} ${name}`}
          className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-black-soft shadow-card transition-all duration-500 group-hover:shadow-premium group-hover:border group-hover:border-gold/15">
            {image ? (
              <SafeImage
                src={image}
                alt={name}
                fill
                sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 50vw"
                className="object-contain p-6 transition-transform duration-700 ease-premium group-hover:scale-[1.04]"
                fallback={
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="font-display text-[2.5rem] font-light tracking-[0.08em] text-white/[0.08]">
                      {name.charAt(0)}
                    </span>
                  </div>
                }
              />
            ) : visual ? (
              <div className="flex h-full w-full items-center justify-center">
                <span className="font-display text-[1.5rem] font-light text-white/[0.08]">
                  {visual.toUpperCase()}
                </span>
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="font-display text-[2.5rem] font-light text-white/[0.08]">
                  {name.charAt(0)}
                </span>
              </div>
            )}

            {/* Wishlist — subtle, top-right */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggle(id);
              }}
              aria-label={
                isWishlisted
                  ? `${t("remove_from_wishlist")} ${name}`
                  : `${t("add_to_wishlist")} ${name}`
              }
              aria-pressed={isWishlisted}
              className={`absolute end-2.5 top-2.5 z-20 inline-flex items-center justify-center rounded-full p-2 transition-all duration-300 ${
                isWishlisted
                  ? "text-gold opacity-100"
                  : "text-white/20 opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:text-gold"
              }`}
            >
              <svg
                aria-hidden="true"
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill={isWishlisted ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 10-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
              </svg>
            </button>

            {/* Premium badge — top-left */}
            <span className="absolute start-2.5 top-2.5 z-10 inline-flex items-center px-2 py-0.5 text-[0.32rem] font-semibold uppercase tracking-[0.2em] text-gold/70">
              Premium
            </span>
          </div>
        </Link>
      </div>

<div className="mt-4 space-y-2">
  {shortDescription ? (
    <p className="text-[0.6rem] font-medium uppercase tracking-[0.2em] text-muted">
      {shortDescription}
    </p>
  ) : category ? (
    <p className="text-[0.6rem] font-medium uppercase tracking-[0.2em] text-muted">
      {category}
    </p>
  ) : null}
        <h3 className="font-display text-base leading-[0.95] tracking-[-0.015em] text-white">
          <Link
            href={`/product/${id}`}
            className="transition-colors duration-300 hover:text-gold"
          >
            {name}
          </Link>
        </h3>
        <p className="font-display text-sm font-light text-gold">{price}</p>

        <button
          type="button"
          onClick={() =>
            addItem(
              {
                id,
                name,
                price,
                image,
                category,
                visual,
                accent,
                description: shortDescription ?? "",
                gallery: [],
              },
              1,
            )
          }
          className="btn-primary-sm w-full"
          aria-label={`${t("add_to_cart")} ${name}`}
        >
          {t("add_to_cart")}
        </button>
      </div>
    </article>
  );
});
