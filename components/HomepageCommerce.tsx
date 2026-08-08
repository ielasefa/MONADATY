"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { SafeImage } from "@/components/SafeImage";
import { CollectionArtwork } from "@/components/CollectionArtwork";
import { ProductVisual, isPlaceholderImage } from "@/components/ProductVisual";
import { Reveal } from "@/components/Reveal";
import { useTranslation } from "@/hooks/useTranslation";
import { useCart } from "@/components/cart-context";
import { useWishlist } from "@/components/wishlist-context";
import type { ProductData, CollectionData } from "@/types";
import type { CollectionShowcaseEntry } from "@/lib/db";

type Testimonial = {
  id: string;
  name: string;
  role: string;
  content: string;
};

function ArrowRight() {
  return (
    <motion.span
      className="rtl:rotate-180 inline-block"
      initial={false}
      whileHover={{ x: 3 }}
      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
    >
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14" />
        <path d="M12 5l7 7-7 7" />
      </svg>
    </motion.span>
  );
}

function ProductImageOrFallback({
  src,
  alt,
  sizes,
  className,
  fallback,
}: {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  fallback?: React.ReactNode;
}) {
  if (!src) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="flex h-full w-full items-center justify-center">
        <span className="font-display text-[2.5rem] font-light tracking-[0.08em] text-white/[0.06]">
          {alt}
        </span>
      </div>
    );
  }
  return (
    <SafeImage
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      fallback={
        fallback || (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-[2.5rem] font-light tracking-[0.08em] text-white/[0.06]">
              {alt}
            </span>
          </div>
        )
      }
    />
  );
}

const EASE = [0.22, 1, 0.36, 1] as const;

/* ============================================================
   BRAND STATEMENT
   ============================================================ */
export function BrandStatement() {
  const { t } = useTranslation("home");
  return (
    <section className="relative w-full overflow-hidden bg-black">
      <div className="mx-auto max-w-[1400px] px-6 py-20 md:px-10 md:py-24 lg:px-16 lg:py-28">
        <Reveal>
          <div className="flex flex-col items-start gap-5">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-gold" />
              <span className="label-utility tracking-[0.55em] text-gold/60">
                {t("brand_statement_eyebrow")}
              </span>
            </div>
            <motion.h2
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
              className="max-w-[16ch] font-display text-[clamp(2rem,4.5vw,3.5rem)] leading-[0.92] tracking-[-0.04em] text-white whitespace-pre-line"
            >
              {t("brand_statement_headline", "ROOTED IN MOROCCO.\nCRAFTED FOR TODAY.")}
            </motion.h2>
            <p className="mt-2 max-w-lg text-[0.82rem] leading-[1.85] text-white/55">
              {t(
                "brand_statement_desc",
                "A modern Moroccan beverage brand built around exceptional ingredients, masterful craft, and the hospitality that makes Morocco extraordinary.",
              )}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   FEATURED PRODUCTS
   ============================================================ */
export function FeaturedProducts({ products }: { products: ProductData[] }) {
  const { t } = useTranslation("home");
  const displayProducts = products;
  if (displayProducts.length === 0) return null;

  return (
    <section
      className="relative w-full overflow-hidden bg-black-soft"
      id="shop"
    >
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-20 lg:px-16 lg:py-24">
        <Reveal>
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-gold" />
                <span className="label-utility tracking-[0.55em] text-gold/60">
                  {t("shop_the_drinks_title", "FEATURED PRODUCTS")}
                </span>
              </div>
              <h2 className="mt-3 font-display text-[clamp(1.875rem,3.5vw,2.5rem)] leading-[0.95] tracking-[-0.03em] text-white">
                {t("shop_the_drinks_headline", "Signature selection")}
              </h2>
              <p className="mt-3 max-w-md text-[0.78rem] leading-[1.7] text-white/50">
                {t(
                  "shop_the_drinks_desc",
                  "Discover our signature selection, crafted with premium ingredients from Morocco.",
                )}
              </p>
            </div>
            <Link
              href="/shop"
              className="hidden items-center gap-2 label-utility text-[0.42rem] tracking-[0.2em] text-white/40 transition-colors duration-200 hover:text-gold md:flex"
            >
              {t("view_all_drinks", "VIEW ALL PRODUCTS")}
              <ArrowRight />
            </Link>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6 md:gap-y-12">
          {displayProducts.map((product, i) => (
            <Reveal key={product.id} delay={0.06 * i}>
              <ProductCardLite product={product} />
            </Reveal>
          ))}
        </div>

        <div className="mt-10 md:hidden">
          <Link
            href="/shop"
            className="btn-secondary flex w-full items-center justify-center gap-2"
          >
            {t("view_all_drinks", "VIEW ALL PRODUCTS")}
            <ArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProductCardLite({ product }: { product: ProductData }) {
  const { addItem } = useCart();
  const { contains, toggle } = useWishlist();
  const { t } = useTranslation("products");

  const isWishlisted = contains(product.id);
  const productImage =
    product.image?.trim() ||
    (product.gallery?.[0]?.trim() ?? "") ||
    "";

  return (
  
    <article className="group flex flex-col">
      <div className="relative">
        <Link
          href={`/product/${product.id}`}
          aria-label={`${t("view_flavor")} ${product.name}`}
          className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          <motion.div
            initial={false}
            whileHover={{ y: -6, transition: { duration: 0.22, ease: EASE } }}
            transition={{ duration: 0.22, ease: EASE }}
            className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-black-soft shadow-card transition-shadow duration-500 ease-premium group-hover:shadow-card-hover group-hover:border group-hover:border-gold/12"
          >
            {/* Shimmer sweep on hover */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-20 opacity-0"
              initial={false}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
            >
              <div className="h-full w-full bg-gradient-to-r from-transparent via-gold/[0.07] to-transparent animate-shimmer-wave" />
            </motion.div>

            {/* Inner highlight on hover */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-10 rounded-xl opacity-0"
              initial={false}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              style={{
                boxShadow:
                  "inset 0 0 0 1px rgba(184,155,94,0.12), inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            />

            {!isPlaceholderImage(productImage) ? (
              <motion.div
                initial={false}
                whileHover={{ scale: 1.04, transition: { duration: 0.6, ease: EASE } }}
                transition={{ duration: 0.6, ease: EASE }}
                className="h-full w-full"
              >
                <SafeImage
                  src={productImage}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 50vw"
                  className="object-contain p-6"
                  fallback={null}
                />
              </motion.div>
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
                <span className="font-display text-[2.5rem] font-light text-white/[0.08]">
                  {product.name.charAt(0)}
                </span>
              </div>
            )}

            {/* Wishlist */}
            <motion.button
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
              initial={false}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.13 }}
              className={`absolute end-2.5 top-2.5 z-20 inline-flex items-center justify-center rounded-full p-2 transition-colors duration-200 ${
                isWishlisted
                  ? "text-gold"
                  : "text-white/25 opacity-0 md:opacity-0 md:group-hover:opacity-100"
              }`}
            >
              <motion.svg
                aria-hidden="true"
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill={isWishlisted ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.6"
                animate={isWishlisted ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                transition={{
                  duration: 0.45,
                  ease: EASE,
                }}
              >
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 10-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
              </motion.svg>
            </motion.button>

            {/* Premium badge */}
            <span className="absolute start-2.5 top-2.5 z-10 inline-flex items-center px-2 py-0.5 text-[0.32rem] font-semibold uppercase tracking-[0.2em] text-gold/80 transition-opacity duration-300 group-hover:opacity-100">
              {t("premium_badge", "Premium")}
            </span>
          </motion.div>
        </Link>
      </div>

      <div className="mt-4 flex flex-1 flex-col space-y-2">
        {product.shortDescription ? (
          <p className="line-clamp-1 text-[0.6rem] font-medium uppercase tracking-[0.2em] text-white/45">
            {product.shortDescription}
          </p>
        ) : product.category ? (
          <p className="line-clamp-1 text-[0.6rem] font-medium uppercase tracking-[0.2em] text-white/45">
            {product.category}
          </p>
        ) : null}
        <h3 className="line-clamp-2 min-h-[2.75rem] font-display text-base leading-snug tracking-[-0.015em] text-white">
          <Link
            href={`/product/${product.id}`}
            className="transition-colors duration-300 hover:text-gold"
          >
            {product.name}
          </Link>
        </h3>
        <p className="font-display text-sm font-light text-gold">{product.price}</p>
        <motion.button
          type="button"
          onClick={() =>
            addItem(
              {
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.image,
                category: product.category,
                visual: product.visual,
                accent: product.accent,
                description: product.description,
                gallery: product.gallery,
              },
              1,
            )
          }
          className="btn-primary-sm mt-auto w-full"
          aria-label={`${t("add_to_cart")} ${product.name}`}
          initial={false}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.18, ease: EASE }}
        >
          {t("add_to_cart")}
        </motion.button>
      </div>
    </article>
  );
}

/* ============================================================
   COLLECTIONS SHOWCASE
   ============================================================ */
function ShowcaseProductCard({
  product,
  collectionLabel,
}: {
  product: ProductData;
  collectionLabel: string;
}) {
  const { addItem } = useCart();
  const { t } = useTranslation("products");

  const productImage =
    product.image?.trim() ||
    product.gallery?.[0]?.trim() ||
    "";

  return (
    <article className="group flex flex-col">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-black-soft shadow-card transition-shadow duration-500 ease-premium group-hover:shadow-card-hover group-hover:border group-hover:border-gold/12">
        {!isPlaceholderImage(productImage) ? (
          <Link
            href={`/product/${product.id}`}
            aria-label={`${t("view_flavor")} ${product.name}`}
            className="block h-full w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
          >
            <motion.div
              initial={false}
              whileHover={{ scale: 1.04, transition: { duration: 0.6, ease: EASE } }}
              transition={{ duration: 0.6, ease: EASE }}
              className="h-full w-full"
            >
              <SafeImage
                src={productImage}
                alt={product.name}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                className="object-contain p-6"
                fallback={null}
              />
            </motion.div>
          </Link>
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
            <span className="font-display text-[2.5rem] font-light text-white/[0.08]">
              {product.name.charAt(0)}
            </span>
          </div>
        )}

        {product.available === false ? (
          <span className="absolute start-2.5 top-2.5 inline-flex items-center rounded-full bg-black/80 px-2.5 py-1 text-[0.5rem] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur">
            {t("out_of_stock")}
          </span>
        ) : (
          <span className="absolute start-2.5 top-2.5 inline-flex items-center rounded-full bg-gold/[0.12] px-2.5 py-1 text-[0.5rem] font-semibold uppercase tracking-[0.18em] text-gold-dark backdrop-blur">
            {collectionLabel}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-1 flex-col space-y-2">
        <p className="line-clamp-1 text-[0.6rem] font-medium uppercase tracking-[0.2em] text-white/40">
          {collectionLabel}
        </p>
        <h3 className="line-clamp-2 min-h-[2.75rem] font-display text-base leading-snug tracking-[-0.015em] text-white">
          <Link
            href={`/product/${product.id}`}
            className="transition-colors duration-300 hover:text-gold"
          >
            {product.name}
          </Link>
        </h3>
        <p className="font-display text-sm font-light text-gold">{product.price}</p>
        <div className="mt-auto flex gap-2 pt-2">
          <motion.button
            type="button"
            onClick={() =>
              addItem(
                {
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                  category: product.category,
                  visual: product.visual,
                  accent: product.accent,
                  description: product.description,
                  gallery: product.gallery,
                },
                1,
              )
            }
            className="btn-primary-sm flex-1"
            aria-label={`${t("add_to_cart")} ${product.name}`}
            initial={false}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.18, ease: EASE }}
          >
            {t("add_to_cart")}
          </motion.button>
          <Link
            href={`/product/${product.id}`}
            className="inline-flex h-9 flex-1 items-center justify-center rounded-btn border border-gold/40 px-4 text-[0.5rem] font-semibold uppercase tracking-[0.18em] text-gold transition-all duration-300 hover:bg-gold/[0.06] hover:border-gold/60"
          >
            {t("view_product", "View Product")}
          </Link>
        </div>
      </div>
    </article>
  );
}

export function CollectionsShowcase({
  collections,
  showcase = [],
}: {
  collections: CollectionData[];
  showcase?: CollectionShowcaseEntry[];
}) {
  const { t } = useTranslation("home");
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  // Deduplicate collections by stable slug to prevent rendering duplicates
  const uniqueCollections = Array.from(
    new Map(collections.map((c) => [c.slug, c])).values()
  );
  if (uniqueCollections.length === 0) return null;

  const showcaseBySlug = new Map(showcase.map((s) => [s.collectionSlug, s]));
  const active = activeSlug ? showcaseBySlug.get(activeSlug) : undefined;
  const activeCollection = activeSlug
    ? uniqueCollections.find((c) => c.slug === activeSlug) ?? null
    : null;
  const activeProducts = active?.products ?? [];

  return (
    <section className="relative w-full overflow-hidden bg-black" id="collections">
      <div className="mx-auto max-w-[1080px] px-6 py-16 md:px-10 md:py-20 lg:px-16 lg:py-24">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-gold" />
            <span className="label-utility tracking-[0.55em] text-gold/60">
              {t("collection_showcase_eyebrow", "CURATED COLLECTIONS")}
            </span>
          </div>
          <motion.h2
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
            className="mt-5 font-display text-[clamp(1.75rem,4vw,3rem)] leading-[1.0] tracking-[-0.02em] text-white"
          >
            {t("collection_showcase_title", "OUR COLLECTIONS")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
            className="mt-3 max-w-[600px] text-[0.9rem] leading-[1.6] text-white/60"
          >
            {t(
              "collection_showcase_desc",
              "Select a collection to explore the three signature products curated by our team.",
            )}
          </motion.p>
        </Reveal>

        <div className="mt-12 w-full">
          <div className="grid w-full grid-cols-1 items-stretch gap-5 md:grid-cols-[minmax(0,2fr)_minmax(220px,1fr)] md:gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] lg:gap-6">
            {/* Large card: first collection (left) */}
            {uniqueCollections[0] && (
              <Reveal
                key={uniqueCollections[0].slug}
                delay={0.08}
                className={`min-w-0 ${uniqueCollections.length === 1 ? "md:col-span-2" : ""}`}
              >
                {(() => {
                  const col = uniqueCollections[0];
                  const hasShowcase = (showcaseBySlug.get(col.slug)?.products.length ?? 0) > 0;
                  const isActive = activeSlug === col.slug;

                  const cardContent = (
                    <motion.div
                      initial={false}
                      className={`group relative h-[360px] w-full overflow-hidden rounded-2xl transition-shadow duration-500 ease-premium sm:h-[400px] md:h-[420px] lg:h-[460px] ${
                        isActive
                          ? "shadow-luxury ring-1 ring-gold/50"
                          : "shadow-card ring-1 ring-white/[0.05] hover:shadow-card-hover"
                      }`}
                    >
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                      <CollectionArtwork
                        image={col.image}
                        title={col.title}
                        accent={col.accent}
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        className="object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        monogramSize="text-[7rem] md:text-[9rem] lg:text-[11rem]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-tr from-gold/[0.06] via-transparent to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-6 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1.5 motion-reduce:transition-none sm:p-7 lg:p-9">
                        <p className="text-[0.55rem] font-semibold uppercase tracking-[0.22em] text-gold/90">
                          {col.previewLabel || t("collection_label", "COLLECTION")}
                        </p>
                        <h3 className="mt-2 font-display text-2xl leading-[0.98] tracking-[-0.01em] text-white sm:text-[1.625rem] lg:text-[1.875rem]">
                          {col.title}
                        </h3>
                        {col.description && (
                          <p className="mt-3 line-clamp-2 max-w-md text-[0.78rem] leading-[1.7] text-white/55">
                            {col.description}
                          </p>
                        )}
                        {hasShowcase && (
                          <span className="mt-4 inline-flex items-center gap-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-gold transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none lg:opacity-0 lg:group-hover:opacity-100 motion-reduce:lg:opacity-100">
                            {isActive
                              ? t("showcase_close", "CLOSE")
                              : t("showcase_view_products", "VIEW PRODUCTS")}
                            {isActive ? (
                              <span aria-hidden>✕</span>
                            ) : (
                              <ArrowRight />
                            )}
                          </span>
                        )}
                      </div>
                      {isActive && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.25, ease: EASE }}
                          className="absolute end-4 top-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gold text-black shadow-gold-focus"
                          aria-hidden
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        </motion.span>
                      )}
                      {!isActive && hasShowcase && (
                        <span className="absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent sm:inset-x-7 lg:inset-x-9" />
                      )}
                    </motion.div>
                  );

                  if (!hasShowcase) {
                    return (
                      <Link
                        href={`/shop?category=${col.slug}`}
                        className="group block h-full"
                      >
                        {cardContent}
                      </Link>
                    );
                  }

                  return (
                    <button
                      type="button"
                      onClick={() => setActiveSlug(isActive ? null : col.slug)}
                      aria-expanded={isActive}
                      aria-label={`${t("showcase_view_products", "View products")} ${col.title}`}
                      className="group block h-full w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                    >
                      {cardContent}
                    </button>
                  );
                })()}
              </Reveal>
            )}

            {/* Right column: second and third collections stacked */}
            {uniqueCollections.length > 1 && (
              <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-1 lg:gap-6">
                {uniqueCollections.slice(1, 3).map((col, idx) => (
                  <Reveal key={col.slug} delay={0.08 * (idx + 2)} className="h-full">
                    {(() => {
                      const hasShowcase = (showcaseBySlug.get(col.slug)?.products.length ?? 0) > 0;
                      const isActive = activeSlug === col.slug;

                      const cardContent = (
                        <motion.div
                          initial={false}
                          className={`group relative h-[220px] w-full overflow-hidden rounded-2xl transition-shadow duration-500 ease-premium md:h-[200px] lg:h-[218px] ${
                            isActive
                              ? "shadow-luxury ring-1 ring-gold/50"
                              : "shadow-card ring-1 ring-white/[0.07] hover:shadow-luxury hover:ring-gold/20"
                          }`}
                        >
                          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                          <CollectionArtwork
                            image={col.image}
                            title={col.title}
                            accent={col.accent}
                            sizes="(min-width: 1024px) 25vw, 100vw"
                            className="object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                            monogramSize="text-[4rem] md:text-[5rem] lg:text-[6rem]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
                          <div className="absolute inset-0 bg-gradient-to-tr from-gold/[0.05] via-transparent to-transparent" />
                          <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1 motion-reduce:transition-none sm:p-6">
                            <p className="text-[0.5rem] font-semibold uppercase tracking-[0.2em] text-gold/90">
                              {col.previewLabel || t("collection_label", "COLLECTION")}
                            </p>
                            <h3 className="mt-1.5 font-display text-[1.05rem] leading-[1.05] tracking-[-0.01em] text-white sm:text-[1.15rem] lg:text-[1.25rem]">
                              {col.title}
                            </h3>
                            {hasShowcase && (
                              <span className="mt-2.5 inline-flex items-center gap-1.5 text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-gold transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none lg:opacity-0 lg:group-hover:opacity-100 motion-reduce:lg:opacity-100">
                                {isActive
                                  ? t("showcase_close", "CLOSE")
                                  : t("showcase_view_products", "VIEW PRODUCTS")}
                                {isActive ? (
                                  <span aria-hidden>✕</span>
                                ) : (
                                  <ArrowRight />
                                )}
                              </span>
                            )}
                          </div>
                          {isActive && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.25, ease: EASE }}
                              className="absolute end-3 top-3 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-gold text-black shadow-gold-focus"
                              aria-hidden
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6L9 17l-5-5" />
                              </svg>
                            </motion.span>
                          )}
                          {!isActive && hasShowcase && (
                            <span className="absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent lg:inset-x-6" />
                          )}
                        </motion.div>
                      );

                      if (!hasShowcase) {
                        return (
                          <Link
                            href={`/shop?category=${col.slug}`}
                            className="group block h-full"
                          >
                            {cardContent}
                          </Link>
                        );
                      }

                      return (
                        <button
                          type="button"
                          onClick={() => setActiveSlug(isActive ? null : col.slug)}
                          aria-expanded={isActive}
                          aria-label={`${t("showcase_view_products", "View products")} ${col.title}`}
                          className="group block h-full w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                        >
                          {cardContent}
                        </button>
                      );
                    })()}
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeCollection && (
            <motion.div
              key={activeCollection.slug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="relative mt-12 overflow-hidden rounded-2xl border border-white/[0.08] bg-black-soft/60 shadow-luxury"
            >
              <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-rouge via-gold/60 to-transparent" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="label-utility tracking-[0.55em] text-gold/60">
                    {activeCollection.previewLabel || t("collection_label", "COLLECTION")}
                  </p>
                  <h3 className="mt-2 font-display text-[clamp(1.375rem,3vw,2rem)] leading-[1.0] tracking-[-0.02em] text-white">
                    {activeCollection.title}
                  </h3>
                  <p className="mt-2 text-[0.72rem] text-white/40">
                    {t("showcase_three_products", "3 signature products curated for this collection")}
                  </p>
                </div>
                <Link
                  href={`/shop?category=${activeCollection.slug}`}
                  className="inline-flex items-center gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-white/60 transition-colors duration-200 hover:text-gold"
                >
                  {t("view_collection", "VIEW COLLECTION")}
                  <ArrowRight />
                </Link>
              </div>

              {activeProducts.length === 0 ? (
                <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/[0.08] py-16 text-center">
                  <p className="font-display text-lg text-white/70">
                    {t("showcase_empty", "This collection is being curated.")}
                  </p>
                  <Link
                    href={`/shop?category=${activeCollection.slug}`}
                    className="btn-secondary mt-2"
                  >
                    {t("view_collection", "VIEW COLLECTION")}
                  </Link>
                </div>
              ) : (
                <div className="mt-10 grid grid-cols-1 gap-x-4 gap-y-10 md:grid-cols-2 md:gap-x-6 lg:grid-cols-3">
                  {activeProducts.slice(0, 3).map((product, idx) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: EASE, delay: 0.06 * idx }}
                    >
                      <ShowcaseProductCard
                        product={product}
                        collectionLabel={activeCollection.title}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ============================================================
   BRAND STORY / ABOUT
   ============================================================ */
export function BrandStory({
  title,
  description,
  image,
}: {
  title: string;
  description: string;
  image: string;
}) {
  const { t } = useTranslation("home");
  return (
    <section className="relative w-full overflow-hidden bg-black">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-20 lg:px-16 lg:py-24">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-gold" />
                <span className="label-utility tracking-[0.55em] text-gold/60">
                  {t("from_morocco", "FROM MOROCCO")}
                </span>
              </div>
              <h2 className="mt-5 font-display text-[clamp(1.875rem,3.5vw,2.75rem)] leading-[0.95] tracking-[-0.03em] text-white">
                {title || t("our_story", "OUR STORY")}
              </h2>
              {description && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
                  className="mt-6 max-w-md text-[0.82rem] leading-[1.85] text-white/55"
                >
                  {(description || "")
                    .split("\n")
                    .map((line, i, arr) => (
                      <p
                        key={line.trim() + String(i)}
                        className={i < arr.length - 1 ? "mb-3" : ""}
                      >
                        {line}
                      </p>
                    ))}
                </motion.div>
              )}
              <div className="mt-7">
                <Link
                  href="/about"
                  className="btn-link text-white/50 hover:text-gold"
                >
                  {t("our_story_link", "DISCOVER OUR STORY")}{" "}
                  <ArrowRight />
                </Link>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.15} className="lg:col-span-6 lg:col-start-7">
            <motion.div
              initial={false}
              whileHover={{ scale: 1.01, transition: { duration: 0.5, ease: EASE } }}
              transition={{ duration: 0.5, ease: EASE }}
              className="relative aspect-[4/5] w-full overflow-hidden rounded-xl md:aspect-[16/11]"
            >
              {image && image !== "/images/placeholder.svg" ? (
                <ProductImageOrFallback
                  src={image}
                  alt={title}
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-black-soft">
                  <span className="font-display text-[6rem] font-light text-white/[0.04]">
                    {title ? title.charAt(0) : "M"}
                  </span>
                </div>
              )}
              <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6">
                <span className="label-utility text-[0.38rem] tracking-[0.35em] text-ivory/80 mix-blend-difference">
                  {t("crafted_in_morocco", "CRAFTED IN MOROCCO · 2024")}
                </span>
              </div>
            </motion.div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   BEST SELLERS
   ============================================================ */
export function BestSellers({ products }: { products: ProductData[] }) {
  const { t } = useTranslation("home");
  const displayProducts = products.slice(0, 4);
  if (displayProducts.length === 0) return null;

  return (
    <section className="relative w-full overflow-hidden bg-black">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-20 lg:px-16 lg:py-24">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-gold" />
            <span className="label-utility tracking-[0.55em] text-gold/60">
              {t("bestsellers_eyebrow", "TOP PICKS")}
            </span>
          </div>
          <div className="mt-3 flex items-end justify-between gap-6">
            <div>
              <h2 className="font-display text-[clamp(1.875rem,3.5vw,2.5rem)] leading-[0.95] tracking-[-0.03em] text-white">
                {t("bestsellers_title", "BEST SELLERS")}
              </h2>
              <p className="mt-3 max-w-md text-[0.78rem] leading-[1.7] text-white/50">
                {t(
                  "bestsellers_desc",
                  "The products our customers keep coming back for.",
                )}
              </p>
            </div>
            <Link
              href="/shop"
              className="hidden items-center gap-2 label-utility text-[0.42rem] tracking-[0.2em] text-white/30 transition-colors duration-200 hover:text-gold md:flex"
            >
              {t("shop_the_range", "SHOP THE RANGE")}
              <ArrowRight />
            </Link>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6 md:gap-y-12">
          {displayProducts.map((product, i) => (
            <Reveal key={product.id} delay={0.06 * i}>
              <ProductCardLite product={product} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   BUILD YOUR BOX
   ============================================================ */
export function BuildYourBox({ products }: { products: ProductData[] }) {
  const { t } = useTranslation("home");
  const { addItem } = useCart();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [packSize, setPackSize] = useState<number>(4);
  const displayProducts = products.slice(0, 8);
  const bundleProducts = displayProducts.filter((p) => selected.has(p.id));

  const toggleProduct = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 6) next.add(id);
      return next;
    });
  };

  const handleAddBundle = () => {
    bundleProducts.forEach((p) => addItem(p, 1));
  };

  return (
    <section className="relative w-full overflow-hidden bg-black-soft">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-20 lg:px-16 lg:py-24">
        {/* Intro */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold" />
            <span className="label-utility tracking-[0.55em] text-gold/60">
              {t("bundle_eyebrow", "THE MONADATY EDIT")}
            </span>
            <span className="h-px w-8 bg-gold" />
          </div>
          <p className="mx-auto mt-3 max-w-lg text-[0.82rem] leading-[1.85] text-white/40">
            {t(
              "bundle_desc",
              "Choose your favorites, build your selection, and enjoy more of what you love.",
            )}
          </p>
        </div>

        {/* Pack size selector */}
        <div className="mt-8 flex items-center justify-center gap-3">
          {[
            { size: 4, label: t("pack_4", "4-PACK"), discount: "" },
            { size: 6, label: t("pack_6", "6-PACK"), discount: "-10%" },
            { size: 8, label: t("pack_8", "8-PACK"), discount: "-20%" },
          ].map((opt) => (
            <motion.button
              key={opt.size}
              type="button"
              onClick={() => setPackSize(opt.size)}
              initial={false}
              whileHover={{ y: -2, transition: { duration: 0.18, ease: EASE } }}
              whileTap={{ scale: 0.97, transition: { duration: 0.13 } }}
              transition={{ duration: 0.18, ease: EASE }}
              className={`relative flex flex-col items-center gap-1 rounded-lg border px-5 py-3 transition-colors duration-200 ${
                packSize === opt.size
                  ? "border-gold/60 bg-gold/[0.04]"
                  : "border-white/[0.08] bg-black-surface hover:border-white/15"
              }`}
            >
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-white/50">
                {opt.label}
              </span>
              {opt.discount && (
                <span className="text-[0.5rem] font-bold uppercase tracking-[0.15em] text-rouge">
                  {opt.discount}
                </span>
              )}
            </motion.button>
          ))}
        </div>

        {/* Two-column: products + summary */}
        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Selection grid */}
          <div className="lg:col-span-8">
            <p className="label-utility mb-5 text-center lg:text-start">
              {t("bundle_select", "CHOOSE YOUR SELECTION")}
            </p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {displayProducts.map((product) => {
                const isSelected = selected.has(product.id);
                return (
                  <Reveal key={product.id}>
                    <motion.button
                      type="button"
                      onClick={() => toggleProduct(product.id)}
                      initial={false}
                      whileTap={{ scale: 0.96 }}
                      transition={{ duration: 0.13 }}
                      className={`group relative flex flex-col items-center rounded-xl border p-5 text-center transition-colors duration-200 ${
                        isSelected
                          ? "border-gold/50 bg-gold/[0.03]"
                          : "border-white/[0.08] bg-black-surface hover:border-white/15"
                      }`}
                    >
                      {!isPlaceholderImage(product.image) ? (
                        <div className="relative aspect-square w-full max-w-[120px]">
                          <SafeImage
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-contain p-3"
                          />
                        </div>
                      ) : product.visual ? (
                        <div className="aspect-square w-full max-w-[120px] flex items-center justify-center">
                          <ProductVisual
                            name={product.name}
                            visual={product.visual}
                            accent={product.accent}
                            compact
                          />
                        </div>
                      ) : (
                        <div className="aspect-square w-full max-w-[120px] flex items-center justify-center">
                          <span className="font-display text-xl text-white/[0.08]">
                            {product.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <p className="mt-3 text-[0.6rem] font-medium text-white/40 line-clamp-2">
                        {product.name}
                      </p>
                      <p className="mt-1 text-[0.65rem] font-light text-gold">
                        {product.price}
                      </p>
                      <AnimatePresence>
                        {isSelected && (
                          <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 450,
                              damping: 22,
                            }}
                            className="absolute -top-2 -end-2 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-white"
                          >
                            <svg
                              width="8"
                              height="8"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                            >
                              <path
                                d="M20 6L9 17l-5-5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </Reveal>
                );
              })}
            </div>
          </div>

          {/* Summary bar — sticky on desktop */}
          <AnimatePresence>
            {selected.size > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="lg:col-span-4"
              >
                <div className="lg:sticky lg:top-24">
                  <Reveal>
                    <div className="rounded-xl border border-gold/20 bg-black-surface p-6 shadow-premium">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[0.6rem] uppercase tracking-[0.2em] text-white/40">
                            {t("bundle_selected", "SELECTED")} ·{" "}
                            {selected.size} / {packSize}
                          </p>
                          <p className="mt-1 font-display text-lg text-white">
                            {t("bundle_savings", "SAVE UP TO 20%")}
                          </p>
                        </div>
                        <motion.button
                          type="button"
                          onClick={handleAddBundle}
                          whileHover={{ scale: 1.02, y: -1 }}
                          whileTap={{ scale: 0.97 }}
                          transition={{ duration: 0.18, ease: EASE }}
                          className="btn-primary h-10 px-6"
                        >
                          {t("add_bundle", "ADD BUNDLE TO CART")}
                        </motion.button>
                      </div>
                    </div>
                  </Reveal>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   HOW IT WORKS
   ============================================================ */
export function HowItWorks() {
  const { t } = useTranslation("home");
  const steps = [
    { num: "01", key: "step_1", title: "DISCOVER", desc: "Explore our carefully curated selection." },
    { num: "02", key: "step_2", title: "CHOOSE", desc: "Pick the products that match your taste." },
    { num: "03", key: "step_3", title: "ENJOY", desc: "Receive your MONADATY selection and enjoy it at home." },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-black border-t border-white/[0.06]">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-20 lg:px-16 lg:py-24">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8 lg:gap-14">
          {steps.map((step, i) => (
            <Reveal key={step.num} delay={0.1 * i}>
              <div className="relative text-center">
                <motion.span
                  initial={false}
                  whileHover={{ scale: 1.08, y: -2 }}
                  transition={{ duration: 0.22, ease: EASE }}
                  className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-gold/25 bg-gold/[0.04] font-display text-lg text-gold"
                >
                  {step.num}
                </motion.span>
                <h3 className="mt-5 font-display text-lg leading-[0.95] tracking-[-0.01em] text-white">
                  {t(step.key + "_title", step.title)}
                </h3>
                <p className="mt-2 mx-auto max-w-xs text-[0.72rem] leading-[1.8] text-white/40">
                  {t(step.key + "_desc", step.desc)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   TESTIMONIALS / SOCIAL PROOF
   ============================================================ */
export function SocialProof({
  testimonials,
  title,
  subtitle,
}: {
  testimonials: Testimonial[];
  title: string;
  subtitle: string;
}) {
  const { t } = useTranslation("home");
  if (testimonials.length === 0) return null;

  const displayTestimonials = testimonials.slice(0, 3);

  return (
    <section className="relative w-full overflow-hidden bg-black-soft">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-20 lg:px-16 lg:py-24">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-gold" />
            <span className="text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-gold/80">
              {subtitle || t("what_customers_say", "WHAT THEY SAY")}
            </span>
          </div>
          <motion.h2
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
            className="mt-5 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[0.95] tracking-[-0.03em] text-white"
          >
            {title || t("customer_notes", "Loved by customers across Morocco.")}
          </motion.h2>
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <motion.div
            layout
            className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6"
          >
            {displayTestimonials.map((tItem) => (
              <motion.div
                key={tItem.id}
                layout
                initial={false}
                whileHover={{
                  y: -4,
                  borderColor: "rgba(184,155,94,0.12)",
                  transition: { duration: 0.22, ease: EASE },
                }}
                transition={{ duration: 0.22, ease: EASE }}
                className="flex flex-col rounded-xl border border-white/[0.06] bg-black-surface p-7 md:p-8"
              >
                <span className="text-[1rem] tracking-[0.1em] text-gold/80 leading-none transition-opacity duration-300">
                  ★★★★★
                </span>
                <p className="mt-4 flex-1 text-[1rem] leading-[1.6] text-white">
                  {tItem.content}
                </p>
                <div className="mt-5 space-y-0.5">
                  <p className="text-[0.85rem] font-semibold leading-none text-white">
                    {tItem.name}
                  </p>
                  {tItem.role && (
                    <p className="text-[0.75rem] leading-none text-gold/80">
                      {tItem.role}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   MOROCCAN MOMENT
   ============================================================ */
export function MoroccanMoment() {
  const { t } = useTranslation("home");
  return (
    <section className="relative w-full overflow-hidden bg-black">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-20 lg:px-16 lg:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 lg:items-center">
          <Reveal className="lg:col-span-7">
            <motion.div
              initial={false}
              whileHover={{ scale: 1.01, transition: { duration: 0.5, ease: EASE } }}
              transition={{ duration: 0.5, ease: EASE }}
              className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-black-soft flex items-center justify-center"
            >
              <div className="text-center">
                <span className="label-utility tracking-[0.5em] text-white/40">
                  {t("pour_serve_savor", "POUR · SERVE · SAVOR")}
                </span>
              </div>
            </motion.div>
          </Reveal>
          <Reveal delay={0.15} className="lg:col-span-4 lg:col-start-9">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-gold" />
              <span className="label-utility tracking-[0.55em] text-gold/60">
                {t("the_moment_label", "THE MONADATY MOMENT")}
              </span>
            </div>
            <h2 className="mt-6 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[0.95] tracking-[-0.03em] text-white">
              {t("the_moment_title", "Pour. Serve. Savor.")}
            </h2>
            <p className="mt-5 text-[0.78rem] leading-[1.85] text-white/55">
              {t(
                "the_moment_desc",
                "MONADATY is designed for the good moments — around a table with friends, chilled and ready to share. Welcome to genuine Moroccan hospitality.",
              )}
            </p>
            <div className="mt-8">
              <Link
                href="/shop"
                className="btn-link text-white/50 hover:text-gold"
              >
                {t("explore_drinks", "EXPLORE DRINKS")} <ArrowRight />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   NEWSLETTER
   ============================================================ */
export function Newsletter({
  title,
  description,
  placeholder,
  buttonText,
}: {
  title: string;
  description: string;
  placeholder: string;
  buttonText: string;
}) {
  const { t } = useTranslation("home");
  return (
    <section className="relative w-full overflow-hidden bg-rouge-dark">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-20 lg:px-16 lg:py-24">
        <Reveal>
          <div className="mx-auto max-w-lg text-center">
            <div className="flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-gold/50" />
              <span className="label-utility tracking-[0.55em] text-gold/60">
                {t("newsletter_subtitle", "STAY CONNECTED")}
              </span>
              <span className="h-px w-8 bg-gold/50" />
            </div>
            <h2 className="mt-6 font-display text-[clamp(1.5rem,2.5vw,2rem)] leading-[0.95] tracking-[-0.02em] text-white">
              {title || t("newsletter_headline", "STAY IN THE MONADATY CIRCLE")}
            </h2>
            {description && (
              <p className="mx-auto mt-4 max-w-sm text-[0.72rem] leading-relaxed text-white/55">
                {description}
              </p>
            )}
            <form
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
              onSubmit={(e) => e.preventDefault()}
            >
              <label className="flex-1 max-w-xs">
                <span className="sr-only">
                  {placeholder || t("newsletter_label", "Your email")}
                </span>
                <motion.input
                  type="email"
                  placeholder={
                    placeholder || t("newsletter_label", "Your email")
                  }
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2, ease: EASE }}
                  className="h-11 w-full border-0 border-b border-white/[0.15] bg-transparent px-0 text-[0.82rem] text-white outline-none transition-all duration-200 placeholder:text-white/40 focus:border-gold/50"
                  style={{ WebkitTextFillColor: "#FFFFFF", caretColor: "#FFFFFF" }}
                />
              </label>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.18, ease: EASE }}
                className="btn-primary"
              >
                {buttonText || t("join", "JOIN US")}
              </motion.button>
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   FAQ
   ============================================================ */
export function FAQSection({
  faqs,
}: {
  faqs: { question: string; answer: string }[];
}) {
  const { t } = useTranslation("home");

  if (!faqs || faqs.length === 0) {
    return (
      <section className="relative w-full overflow-hidden bg-black border-t border-white/[0.06]">
        <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-20 lg:px-16 lg:py-24">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <span className="label-utility tracking-[0.55em] text-gold/60">
                {t("faq_title", "FAQ")}
              </span>
              <h2 className="mt-3 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[0.95] tracking-[-0.03em] text-white">
                {t("faq_subtitle", "Frequently asked questions")}
              </h2>
            </Reveal>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full overflow-hidden bg-black border-t border-white/[0.06]">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-20 lg:px-16 lg:py-24">
        {/* Wide title wrapper */}
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="label-utility tracking-[0.55em] text-gold/60">
              {t("faq_title", "FAQ")}
            </span>
            <h2 className="mt-3 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[0.95] tracking-[-0.03em] text-white">
              {t("faq_subtitle", "Frequently asked questions")}
            </h2>
          </Reveal>
        </div>

        {/* Accordion */}
        <div className="mx-auto mt-10 max-w-2xl">
          <Reveal delay={0.1}>
            <div className="space-y-0">
              {faqs.map((faq, i) => (
                <FAQItem
                  key={faq.question + faq.answer}
                  question={faq.question}
                  answer={faq.answer}
                  isFirst={i === 0}
                />
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function FAQItem({
  question,
  answer,
  isFirst,
}: {
  question: string;
  answer: string;
  isFirst: boolean;
}) {
  const [open, setOpen] = useState(isFirst);

  return (
    <div className={isFirst ? "" : "border-t border-white/[0.06]"}>
      <motion.button
        type="button"
        onClick={() => setOpen(!open)}
        whileTap={{ scale: 0.995 }}
        transition={{ duration: 0.13 }}
        className="flex w-full items-center justify-between py-5 text-left transition-colors duration-200 hover:text-gold"
        aria-expanded={open}
      >
        <span className="pr-6 text-[0.82rem] font-medium text-white">
          {question}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="shrink-0 text-white/25"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </motion.span>
      </motion.button>
      <motion.div
        initial={false}
        animate={
          open
            ? { height: "auto", opacity: 1 }
            : { height: 0, opacity: 0 }
        }
        transition={{ duration: 0.3, ease: EASE }}
        className="overflow-hidden text-[0.78rem] leading-[1.9] text-white/40"
      >
        <div className="pb-5">{answer}</div>
      </motion.div>
    </div>
  );
}

/* ============================================================
   FINAL CTA
   ============================================================ */
export function FinalCTA() {
  const { t } = useTranslation("home");
  return (
    <section className="relative w-full overflow-hidden bg-black border-t border-white/[0.06]">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-20 lg:px-16 lg:py-24">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <div className="flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-gold" />
              <span className="label-utility tracking-[0.55em] text-gold/60">
                {t("final_cta_subtitle", "BEGIN THE POUR")}
              </span>
              <span className="h-px w-8 bg-gold" />
            </div>
            <h2 className="mt-7 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[0.95] tracking-[-0.02em] text-white">
              {t("final_cta_title", "YOUR NEXT FAVORITE TASTE IS WAITING.")}
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[0.78rem] leading-[1.7] text-white/55">
              {t(
                "final_cta_description",
                "Discover the MONADATY collection. Premium Moroccan refreshment, delivered to your door.",
              )}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/shop" className="btn-primary">
                {t("shop_now", "SHOP NOW")} <ArrowRight />
              </Link>
              <Link href="/about" className="btn-link text-white/50 hover:text-gold">
                {t("our_story", "OUR STORY")}
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
