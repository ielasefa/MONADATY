"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Product } from "@/types";
import { useCart } from "@/components/cart-context";
import { useWishlist } from "@/components/wishlist-context";
import { SafeImage } from "@/components/SafeImage";
import { ProductVisual, isPlaceholderImage } from "@/components/ProductVisual";
import { useTranslation } from "@/hooks/useTranslation";

type RelatedProductsProps = {
  products: Product[];
};

const EASE = [0.22, 1, 0.36, 1] as const;

function RelatedCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { contains, toggle } = useWishlist();
  const { t } = useTranslation("products");

  const isWishlisted = contains(product.id);

  return (
    <article className="group flex h-full flex-col">
      <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] shadow-[0_16px_48px_-24px_rgba(0,0,0,0.6)] transition-all duration-500 ease-premium group-hover:-translate-y-1.5 group-hover:scale-[1.02] group-hover:border-gold/25 group-hover:shadow-[0_32px_80px_-32px_rgba(0,0,0,0.85)]">
        <Link href={`/product/${product.id}`} className="block focus-visible:outline-none">
          <div className="relative aspect-[3/4] w-full">
            {!isPlaceholderImage(product.image) ? (
              <SafeImage
                src={product.image}
                alt={product.name}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-contain p-6 md:p-8 transition-transform duration-700 ease-premium group-hover:scale-[1.04]"
                fallback={
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="font-display text-3xl font-light text-white/10">
                      {product.name.charAt(0)}
                    </span>
                  </div>
                }
              />
            ) : product.visual ? (
              <div className="flex h-full w-full items-center justify-center p-6">
                <ProductVisual
                  name={product.name}
                  visual={product.visual}
                  accent={product.accent}
                  className="h-full w-auto max-w-full drop-shadow-[0_18px_30px_rgba(0,0,0,0.5)]"
                />
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="font-display text-3xl font-light text-white/10">
                  {product.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
        </Link>

        {/* Wishlist */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle(product.id);
          }}
          aria-label={
            isWishlisted
              ? `${t("remove_from_wishlist")} ${product.name}`
              : `${t("add_to_wishlist")} ${product.name}`
          }
          aria-pressed={isWishlisted}
          className={`absolute end-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-sm transition-all duration-300 ${
            isWishlisted
              ? "border-gold/40 bg-gold/10 text-gold"
              : "border-white/10 bg-[#0B0B0A]/40 text-white/40 opacity-100 hover:text-gold md:opacity-0 md:group-hover:opacity-100"
          }`}
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill={isWishlisted ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 10-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>

        {/* Add to cart */}
        <motion.button
          type="button"
          onClick={() => addItem(product, 1)}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.2, ease: EASE }}
          className="absolute inset-x-4 bottom-4 z-10 h-14 rounded-xl bg-rouge text-[0.6rem] font-medium uppercase tracking-[0.18em] text-white shadow-[0_16px_32px_-16px_rgba(110,31,42,0.7)] transition-all duration-300 hover:bg-rouge-hover hover:shadow-[0_20px_40px_-16px_rgba(110,31,42,0.8)] hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rouge/50 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
          aria-label={`${t("add_to_cart")} ${product.name}`}
        >
          {t("add_to_cart")}
        </motion.button>
      </div>

      <div className="mt-6 flex h-full flex-1 flex-col">
        {product.category && (
          <p className="line-clamp-1 text-[0.58rem] font-medium uppercase tracking-[0.24em] text-white/35">
            {product.category}
          </p>
        )}
        <h3 className="mt-2 line-clamp-2 min-h-[3rem] font-display text-lg leading-snug text-white transition-colors duration-300 group-hover:text-gold">
          <Link
            href={`/product/${product.id}`}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
          >
            {product.name}
          </Link>
        </h3>
        <p className="mt-3 font-display text-[0.95rem] font-light text-gold">{product.price}</p>
      </div>
    </article>
  );
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  const { t } = useTranslation("products");
  const { t: tb } = useTranslation("buttons");

  return (
    <div>
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <span className="h-px w-10 bg-gold/50" />
            <p className="text-[0.68rem] font-medium uppercase tracking-[0.3em] text-gold">
              {t("related_products")}
            </p>
          </div>
          <h2 className="font-display text-3xl leading-[1.05] tracking-[-0.01em] text-white md:text-4xl">
            {t("you_may_also_like")}
          </h2>
        </div>

        <Link
          href="/shop"
          className="group inline-flex shrink-0 items-center gap-3 text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-white/45 transition-colors duration-300 hover:text-gold"
        >
          {tb("view_all", "View All")}
          <svg
            aria-hidden="true"
            width={13}
            height={13}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
          >
            <path d="M5 12h14" />
            <path d="M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-x-4 gap-y-12 sm:grid-cols-2 md:gap-x-6 md:gap-y-16 lg:grid-cols-4">
        {products.map((product) => (
          <RelatedCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}