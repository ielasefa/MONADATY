"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { useState } from "react";
import { SafeImage } from "@/components/SafeImage";
import { ProductImage } from "@/components/ProductImage";
import { CollectionArtwork } from "@/components/CollectionArtwork";
import { Reveal } from "@/components/Reveal";
import { useTranslation } from "@/hooks/useTranslation";
import { useCart } from "@/components/cart-context";
import type { ProductData, CollectionData } from "@/types";
import type { CollectionShowcaseEntry } from "@/lib/db";
import { getLandingCopy } from "@/lib/landing-copy";
import { ProductCard } from "@/components/ProductCard";

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
        <span className="font-display text-[2.5rem] font-light tracking-[0.08em] text-secondary">
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
            <span className="font-display text-[2.5rem] font-light tracking-[0.08em] text-secondary">
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
    <section className="relative w-full overflow-hidden bg-canvas">
      <div className="mx-auto max-w-[1400px] px-6 py-20 md:px-10 md:py-24 lg:px-16 lg:py-28">
        <Reveal>
          <div className="flex flex-col items-start gap-5">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-gold" />
              <span className="label-utility tracking-[0.08em] text-accent">
                {t("brand_statement_eyebrow")}
              </span>
            </div>
            <motion.h2
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
              className="max-w-[16ch] font-display text-[clamp(2rem,4.5vw,3.5rem)] leading-[0.92] tracking-[-0.04em] text-foreground whitespace-pre-line"
            >
              {t("brand_statement_headline", "ROOTED IN MOROCCO.\nCRAFTED FOR TODAY.")}
            </motion.h2>
            <p className="mt-2 max-w-lg text-sm leading-[1.85] text-secondary">
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
  const { lang } = useTranslation("home");
  const copy = getLandingCopy(lang);
  if (products.length === 0) return null;

  return (
    <section className="market-featured market-container" id="shop">
      <div className="market-section-heading">
        <h2>{{ fr: "Produits populaires", en: "Popular products", ar: "المنتجات الرائجة" }[lang]}</h2>
        <Link href="/shop">{copy.featured.cta}<ArrowRight /></Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
        {products.slice(0, 4).map((product, index) => (
          <Reveal key={product.id} delay={0.05 * index} className="h-full">
            <ProductCard {...product} variant="editorial" />
          </Reveal>
        ))}
      </div>
    </section>
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

  return (
    <article className="group flex flex-col">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-line bg-canvas transition-[transform,border-color,box-shadow] duration-300 group-hover:-translate-y-1 group-hover:border-[#D6B35A]/20 group-hover:shadow-[var(--market-shadow)]">
        <Link
          href={`/product/${product.id}`}
          aria-label={`${t("view_flavor")} ${product.name}`}
          className="block h-full w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D6B35A]/50"
        >
          <motion.div
            initial={false}
            whileHover={{ scale: 1.04, transition: { duration: 0.6, ease: EASE } }}
            transition={{ duration: 0.6, ease: EASE }}
            className="h-full w-full"
          >
            <ProductImage
              product={product}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-contain p-6"
            />
          </motion.div>
        </Link>

        {product.available === false ? (
          <span className="market-image-caption absolute start-2.5 top-2.5 inline-flex items-center rounded-full bg-brand-dark/90 px-2.5 py-1 text-sm font-semibold uppercase tracking-[0.08em] text-secondary backdrop-blur">
            {t("out_of_stock")}
          </span>
        ) : (
          <span className="absolute start-2.5 top-2.5 inline-flex items-center rounded-full bg-[#D6B35A]/[0.12] px-2.5 py-1 text-sm font-medium uppercase tracking-[0.08em] text-accent backdrop-blur">
            {collectionLabel}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-1 flex-col space-y-2">
        <p className="line-clamp-1 text-sm font-medium uppercase tracking-[0.08em] text-secondary">
          {collectionLabel}
        </p>
        <h3 className="line-clamp-2 min-h-[2.75rem] font-display text-base leading-snug tracking-[-0.015em] text-foreground">
          <Link
            href={`/product/${product.id}`}
            className="transition-colors duration-300 hover:text-accent"
          >
            {product.name}
          </Link>
        </h3>
        <p className="font-display text-sm font-light text-accent">{product.price}</p>
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
                  collection: product.collection,
                  brand: product.brand,
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
            className="inline-flex h-9 flex-1 items-center justify-center rounded-lg border border-[#D6B35A]/40 px-4 text-sm font-medium uppercase tracking-[0.08em] text-accent transition-all duration-300 hover:border-[#E6CC88]/60 hover:bg-[#D6B35A]/[0.06]"
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
  const { lang } = useTranslation("home");
  const copy = getLandingCopy(lang);
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
    <section className="relative w-full overflow-hidden bg-canvas" id="collections">
      <div className="landing-section">
        <Reveal>
          <div className="landing-eyebrow">{copy.collections.eyebrow}</div>
          <h2 className="landing-title mt-5 max-w-[15ch]">
            {copy.collections.title}
          </h2>
          <p className="landing-body mt-5 max-w-[640px]">
            {copy.collections.description}
          </p>
        </Reveal>

        <div className="mt-10 w-full md:mt-12 lg:mt-16">
          <div dir="ltr" className="grid w-full grid-cols-1 items-stretch gap-5 md:grid-cols-[minmax(0,1.85fr)_minmax(260px,1fr)] md:gap-5 lg:grid-cols-[minmax(0,1.9fr)_minmax(320px,1fr)] lg:gap-6">
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
                      className={`group relative h-[410px] w-full overflow-hidden rounded-2xl transition-[box-shadow,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:h-[460px] md:h-[480px] lg:h-[540px] xl:h-[600px] ${
                        isActive
                          ? "shadow-[var(--market-shadow)] ring-1 ring-[#D6B35A]/45"
                          : "shadow-[var(--market-shadow)] ring-1 ring-white/[0.07] hover:shadow-[var(--market-shadow)] hover:ring-[#D6B35A]/20"
                      }`}
                    >
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                      <CollectionArtwork
                        image={col.image}
                        title={col.title}
                        accent={col.accent}
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        className="object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        monogramSize="text-[7rem] md:text-[9rem] lg:text-[11rem]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0A] via-black/25 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#D6B35A]/[0.08] via-transparent to-transparent" />
                      <div className="absolute inset-0 bg-[rgb(0_0_0/.15)] opacity-0 transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100 motion-reduce:transition-none" />
                      <div dir="auto" className="market-image-caption market-collection-caption absolute inset-x-0 bottom-0 flex flex-col justify-end p-6 sm:p-8 lg:p-10">
                        <p className="text-sm font-medium uppercase tracking-[0.08em] text-accent">
                          {col.previewLabel || copy.collections.label}
                        </p>
                        <h3 className="mt-3 max-w-[14ch] translate-y-1 font-display text-[2rem] font-normal leading-[0.98] tracking-[-0.03em] text-foreground transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 motion-reduce:transform-none motion-reduce:transition-none sm:text-[2.4rem] lg:text-[3rem]">
                          {col.title}
                        </h3>
                        {col.description && (
                          <p className="mt-4 line-clamp-2 max-w-lg text-sm leading-[1.75] text-secondary">
                            {col.description}
                          </p>
                        )}
                        <span aria-hidden="true" className="mt-5 h-px w-16 origin-left scale-x-[0.625] bg-[#D6B35A] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 motion-reduce:transform-none motion-reduce:transition-none rtl:origin-right" />
                        {hasShowcase && (
                          <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.08em] text-accent transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none rtl:group-hover:-translate-x-1 lg:opacity-0 lg:group-hover:opacity-100 motion-reduce:lg:opacity-100">
                            {isActive
                              ? copy.collections.close
                              : copy.collections.viewProducts}
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
                          className="absolute end-4 top-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#D6B35A] text-black shadow-[var(--market-shadow)]"
                          aria-hidden
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        </motion.span>
                      )}
                      {!isActive && hasShowcase && (
                        <span className="absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-[#D6B35A]/20 to-transparent sm:inset-x-7 lg:inset-x-9" />
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
                      aria-label={`${copy.collections.viewProducts} ${col.title}`}
                      className="group block h-full w-full text-start focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D6B35A]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0A]"
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
                          className={`group relative h-[260px] w-full overflow-hidden rounded-2xl transition-[box-shadow,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:h-[230px] lg:h-[258px] xl:h-[288px] ${
                            isActive
                              ? "shadow-[var(--market-shadow)] ring-1 ring-[#D6B35A]/45"
                              : "shadow-[var(--market-shadow)] ring-1 ring-white/[0.07] hover:shadow-[var(--market-shadow)] hover:ring-[#D6B35A]/20"
                          }`}
                        >
                          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                          <CollectionArtwork
                            image={col.image}
                            title={col.title}
                            accent={col.accent}
                            sizes="(min-width: 1024px) 25vw, 100vw"
                            className="object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                            monogramSize="text-[4rem] md:text-[5rem] lg:text-[6rem]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0A] via-black/25 to-transparent" />
                          <div className="absolute inset-0 bg-gradient-to-tr from-[#D6B35A]/[0.08] via-transparent to-transparent" />
                          <div className="absolute inset-0 bg-[rgb(0_0_0/.15)] opacity-0 transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100 motion-reduce:transition-none" />
                          <div dir="auto" className="market-image-caption market-collection-caption absolute inset-x-0 bottom-0 flex flex-col justify-end p-5 sm:p-6">
                            <p className="text-sm font-medium uppercase tracking-[0.08em] text-accent">
                              {col.previewLabel || copy.collections.label}
                            </p>
                            <h3 className="mt-2 translate-y-1 font-display text-[1.35rem] font-normal leading-[1.04] tracking-[-0.02em] text-foreground transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 motion-reduce:transform-none motion-reduce:transition-none sm:text-[1.5rem] lg:text-[1.75rem]">
                              {col.title}
                            </h3>
                            <span aria-hidden="true" className="mt-4 h-px w-12 origin-left scale-x-2/3 bg-[#D6B35A] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 motion-reduce:transform-none motion-reduce:transition-none rtl:origin-right" />
                            {hasShowcase && (
                              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium uppercase tracking-[0.08em] text-accent transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none rtl:group-hover:-translate-x-1 lg:opacity-0 lg:group-hover:opacity-100 motion-reduce:lg:opacity-100">
                                {isActive
                                  ? copy.collections.close
                                  : copy.collections.viewProducts}
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
                              className="absolute end-3 top-3 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#D6B35A] text-black shadow-[var(--market-shadow)]"
                              aria-hidden
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6L9 17l-5-5" />
                              </svg>
                            </motion.span>
                          )}
                          {!isActive && hasShowcase && (
                            <span className="absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-transparent via-[#D6B35A]/20 to-transparent lg:inset-x-6" />
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
                          aria-label={`${copy.collections.viewProducts} ${col.title}`}
                          className="group block h-full w-full text-start focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D6B35A]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0A]"
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
              className="relative mt-12 overflow-hidden rounded-2xl border border-line bg-black-soft/60 shadow-[var(--market-shadow)]"
            >
              <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#6E1F2A] via-[#D6B35A]/60 to-transparent" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.08em] text-accent">
                    {activeCollection.previewLabel || copy.collections.label}
                  </p>
                  <h3 className="mt-2 font-display text-[clamp(1.375rem,3vw,2rem)] leading-[1.0] tracking-[-0.02em] text-foreground">
                    {activeCollection.title}
                  </h3>
                  <p className="mt-2 text-sm text-secondary">
                    {copy.collections.productCount}
                  </p>
                </div>
                <Link
                  href={`/shop?category=${activeCollection.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.08em] text-secondary transition-colors duration-200 hover:text-accent"
                >
                  {copy.collections.viewCollection}
                  <ArrowRight />
                </Link>
              </div>

              {activeProducts.length === 0 ? (
                <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line py-16 text-center">
                  <p className="font-display text-lg text-secondary">
                    {copy.collections.empty}
                  </p>
                  <Link
                    href={`/shop?category=${activeCollection.slug}`}
                    className="btn-secondary mt-2"
                  >
                    {copy.collections.viewCollection}
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
  image,
  title,
  description,
}: {
  title: string;
  description: string;
  image: string;
}) {
  const { lang } = useTranslation("home");
  const copy = getLandingCopy(lang);
  const [intro, ...benefitLines] = copy.value.description.split("\n");
  const benefits = benefitLines.map((line) => {
    const [title, ...description] = line.split(" — ");
    return { title, description: description.join(" — ") };
  });

  return (
    <section className="relative w-full overflow-hidden border-y border-line bg-surface">
      <div aria-hidden="true" className="absolute -start-48 top-1/4 h-96 w-96 rounded-full bg-[#6E1F2A]/[0.08] blur-[140px]" />
      <div className="landing-section">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-14 xl:gap-20">
          <Reveal className="lg:col-span-5">
            <div className="landing-eyebrow">{copy.value.eyebrow}</div>
            <h2 className="landing-title mt-6 max-w-[12ch]">
              {title && title !== "Our Story" ? title : copy.value.title}
            </h2>
            <p className="landing-body mt-6 max-w-lg">{description || intro}</p>

            <div className="mt-8 grid grid-cols-1 border-b border-line sm:grid-cols-2">
              {benefits.map((benefit, index) => (
                <div
                  key={benefit.title}
                  className={`border-t border-line py-4 ${
                    index % 2 === 0 ? "sm:pe-5" : "sm:border-s sm:ps-5"
                  }`}
                >
                  <p className="text-sm font-medium uppercase tracking-[0.08em] text-accent">
                    {benefit.title}
                  </p>
                  {benefit.description ? (
                    <p className="mt-2 text-sm font-normal leading-[1.7] text-secondary">
                      {benefit.description}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>

            <Link href="/about" className="landing-secondary group mt-8">
              {copy.value.cta}
              <ArrowRight />
            </Link>
          </Reveal>

          <Reveal delay={0.12} className="lg:col-span-7">
            <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line bg-canvas">
              {image && image !== "/images/placeholder.svg" ? (
                <ProductImageOrFallback
                  src={image}
                  alt={copy.value.title}
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_50%_35%,rgba(214,179,90,.1),transparent_55%)]">
                  <span className="font-display text-[8rem] font-normal text-accent/15 sm:text-[11rem]">
                    {copy.value.title.charAt(0)}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              <div className="market-image-caption absolute bottom-5 start-5 sm:bottom-7 sm:start-7">
                <span className="text-sm font-medium uppercase tracking-[0.08em] text-secondary">
                  {copy.value.imageLabel}
                </span>
              </div>
            </div>
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
    <section className="relative w-full overflow-hidden bg-canvas">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-20 lg:px-16 lg:py-24">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-gold" />
            <span className="label-utility tracking-[0.08em] text-accent">
              {t("bestsellers_eyebrow", "TOP PICKS")}
            </span>
          </div>
          <div className="mt-3 flex items-end justify-between gap-6">
            <div>
              <h2 className="font-display text-[clamp(1.875rem,3.5vw,2.5rem)] leading-[0.95] tracking-[-0.03em] text-foreground">
                {t("bestsellers_title", "BEST SELLERS")}
              </h2>
              <p className="mt-3 max-w-md text-sm leading-[1.7] text-secondary">
                {t(
                  "bestsellers_desc",
                  "The products our customers keep coming back for.",
                )}
              </p>
            </div>
            <Link
              href="/shop"
              className="hidden items-center gap-2 label-utility text-sm tracking-[0.08em] text-secondary transition-colors duration-200 hover:text-accent md:flex"
            >
              {t("shop_the_range", "SHOP THE RANGE")}
              <ArrowRight />
            </Link>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6 md:gap-y-12">
          {displayProducts.map((product, i) => (
            <Reveal key={product.id} delay={0.06 * i}>
              <ProductCard {...product} />
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
    <section className="relative w-full overflow-hidden bg-surface">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-20 lg:px-16 lg:py-24">
        {/* Intro */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold" />
            <span className="label-utility tracking-[0.08em] text-accent">
              {t("bundle_eyebrow", "THE MONADATY EDIT")}
            </span>
            <span className="h-px w-8 bg-gold" />
          </div>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-[1.85] text-secondary">
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
                  ? "border-line bg-gold/[0.04]"
                  : "border-line bg-card hover:border-line"
              }`}
            >
              <span className="text-sm font-semibold uppercase tracking-[0.08em] text-secondary">
                {opt.label}
              </span>
              {opt.discount && (
                <span className="text-sm font-bold uppercase tracking-[0.08em] text-rouge">
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
                          ? "border-line bg-gold/[0.03]"
                          : "border-line bg-card hover:border-line"
                      }`}
                    >
                      <div className="relative aspect-square w-full max-w-[120px]">
                        <ProductImage
                          product={product}
                          alt={product.name}
                          fill
                          sizes="120px"
                          className="object-contain p-3"
                        />
                      </div>
                      <p className="mt-3 text-sm font-medium text-secondary line-clamp-2">
                        {product.name}
                      </p>
                      <p className="mt-1 text-sm font-light text-accent">
                        {product.price}
                      </p>
                      <AnimatePresence>
                        {isSelected && (
                          <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.32, ease: EASE }}
                            className="absolute -top-2 -end-2 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-foreground"
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
                    <div className="rounded-xl border border-line bg-card p-6 shadow-[var(--market-shadow)]">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm uppercase tracking-[0.08em] text-secondary">
                            {t("bundle_selected", "SELECTED")} ·{" "}
                            {selected.size} / {packSize}
                          </p>
                          <p className="mt-1 font-display text-lg text-foreground">
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
    <section className="relative w-full overflow-hidden bg-canvas border-t border-line">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-20 lg:px-16 lg:py-24">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8 lg:gap-14">
          {steps.map((step, i) => (
            <Reveal key={step.num} delay={0.1 * i}>
              <div className="relative text-center">
                <motion.span
                  initial={false}
                  whileHover={{ scale: 1.08, y: -2 }}
                  transition={{ duration: 0.22, ease: EASE }}
                  className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-line bg-gold/[0.04] font-display text-lg text-accent"
                >
                  {step.num}
                </motion.span>
                <h3 className="mt-5 font-display text-lg leading-[0.95] tracking-[-0.01em] text-foreground">
                  {t(step.key + "_title", step.title)}
                </h3>
                <p className="mt-2 mx-auto max-w-xs text-sm leading-[1.8] text-secondary">
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
}: {
  testimonials: Testimonial[];
  title: string;
  subtitle: string;
}) {
  const { lang } = useTranslation("home");
  const copy = getLandingCopy(lang);
  if (testimonials.length === 0) return null;

  const displayTestimonials = testimonials.slice(0, 3);

  return (
    <section className="relative w-full overflow-hidden bg-canvas">
      <div aria-hidden="true" className="absolute end-[-10rem] top-[-8rem] h-[28rem] w-[28rem] rounded-full bg-[#D6B35A]/[0.04] blur-[140px]" />
      <div className="landing-section">
        <Reveal>
          <div className="grid gap-5 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <div className="landing-eyebrow">{copy.social.eyebrow}</div>
              <h2 className="mt-4 max-w-[18ch] font-display text-[clamp(2.1rem,3.8vw,3.5rem)] font-normal leading-[0.98] tracking-[-0.035em] text-foreground">
                {copy.social.title}
              </h2>
            </div>
            <p className="max-w-sm text-sm font-normal leading-[1.75] text-secondary lg:col-span-4 lg:justify-self-end">
              {copy.social.intro}
            </p>
          </div>
        </Reveal>

        <div className="mt-8 grid grid-cols-1 gap-4 md:mt-10 md:grid-cols-3 md:gap-5">
          {displayTestimonials.map((item, index) => (
            <Reveal key={item.id} delay={0.07 * index} className="h-full">
              <motion.blockquote
                initial={false}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="relative flex h-full min-h-[220px] flex-col rounded-2xl border border-line bg-surface p-6 transition-[border-color,box-shadow] duration-300 hover:border-[#D6B35A]/20 hover:shadow-[var(--market-shadow)] sm:p-7"
              >
                <p className="mb-6 font-display text-lg font-normal leading-[1.45] tracking-[-0.015em] text-secondary">
                  “{item.content}”
                </p>
                <footer className="mt-auto border-t border-line pt-5">
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  {item.role ? <p className="mt-1 text-sm uppercase tracking-[0.08em] text-accent">{item.role}</p> : null}
                </footer>
              </motion.blockquote>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   MOROCCAN MOMENT
   ============================================================ */
export function MoroccanMoment({ product }: { product?: ProductData }) {
  const { lang } = useTranslation("home");
  const copy = getLandingCopy(lang);
  const { t: tProducts } = useTranslation("products");
  const { addItem } = useCart();
  return (
    <section className="relative w-full overflow-hidden border-y border-line bg-surface">
      <div className="landing-section">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-12 xl:gap-16">
          <Reveal className="lg:col-span-7">
            <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line bg-card sm:aspect-[16/11] lg:aspect-[6/5]">
              <div aria-hidden="true" className="absolute inset-[14%] rounded-full bg-[#D6B35A]/10 blur-[90px]" />
              {product ? (
                <ProductImage
                  product={product}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="object-contain p-8 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100 sm:p-12 lg:p-14"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <BrandLogo width={240} height={80} className="opacity-40" />
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#6E1F2A]/10 via-transparent to-[#D6B35A]/[0.06]" />

            </div>
          </Reveal>
          <Reveal delay={0.12} className="lg:col-span-4 lg:col-start-9">
            <div className="landing-eyebrow">{copy.discovery.eyebrow}</div>
            <h2 className="landing-title mt-6 max-w-[12ch]">
              {product?.name || copy.discovery.eyebrow}
            </h2>
            <p className="landing-body mt-6 max-w-lg">
              {copy.discovery.description}
            </p>
            {product ? <p className="mt-6 font-display text-2xl font-normal text-accent">{product.price}</p> : null}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              {product && product.available !== false ? (
                <motion.button
                  type="button"
                  onClick={() => addItem(product, 1)}
                  whileHover={{ y: -1, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="landing-primary min-w-[172px]"
                >
                  {tProducts("add_to_cart")}
                </motion.button>
              ) : null}
              <Link
                href={product ? `/product/${product.id}` : "/shop"}
                className="landing-secondary group"
              >
                {product ? tProducts("view_product", "VIEW PRODUCT") : copy.discovery.explore}
                <ArrowRight />
              </Link>
            </div>
          </Reveal>
        </div>
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
      <section className="relative w-full overflow-hidden bg-canvas border-t border-line">
        <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-20 lg:px-16 lg:py-24">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <span className="label-utility tracking-[0.08em] text-accent">
                {t("faq_title", "FAQ")}
              </span>
              <h2 className="mt-3 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[0.95] tracking-[-0.03em] text-foreground">
                {t("faq_subtitle", "Frequently asked questions")}
              </h2>
            </Reveal>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full overflow-hidden bg-canvas border-t border-line">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-20 lg:px-16 lg:py-24">
        {/* Wide title wrapper */}
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="label-utility tracking-[0.08em] text-accent">
              {t("faq_title", "FAQ")}
            </span>
            <h2 className="mt-3 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[0.95] tracking-[-0.03em] text-foreground">
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
    <div className={isFirst ? "" : "border-t border-line"}>
      <motion.button
        type="button"
        onClick={() => setOpen(!open)}
        whileTap={{ scale: 0.995 }}
        transition={{ duration: 0.13 }}
        className="flex w-full items-center justify-between py-5 text-left transition-colors duration-200 hover:text-accent"
        aria-expanded={open}
      >
        <span className="pr-6 text-sm font-medium text-foreground">
          {question}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="shrink-0 text-secondary"
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
        className="overflow-hidden text-sm leading-[1.9] text-secondary"
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
  const { lang } = useTranslation("home");
  const copy = getLandingCopy(lang);
  return (
    <section className="relative w-full overflow-hidden border-t border-line bg-canvas">
      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[32rem] w-[58rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6E1F2A]/[0.16] blur-[150px]" />
        <div className="absolute bottom-[-18rem] left-1/2 h-[28rem] w-[52rem] -translate-x-1/2 rounded-full bg-[#D6B35A]/[0.07] blur-[140px]" />
        <div className="absolute inset-x-[5%] top-0 h-px bg-gradient-to-r from-transparent via-[#D6B35A]/30 to-transparent" />
      </div>
      <div className="landing-section relative lg:py-32">
        <Reveal>
          <div className="mx-auto max-w-4xl text-center">
            <div className="flex items-center justify-center gap-3 text-sm font-medium uppercase tracking-[0.08em] text-accent">
              <span className="h-px w-9 bg-[#D6B35A]" aria-hidden="true" />
              <span>
                {copy.finalCta.eyebrow}
              </span>
              <span className="h-px w-9 bg-[#D6B35A]" aria-hidden="true" />
            </div>
            <h2 className="mx-auto mt-8 max-w-[16ch] font-display text-[clamp(2.5rem,5.2vw,5rem)] font-normal leading-[0.94] tracking-[-0.045em] text-foreground">
              {copy.finalCta.title}
            </h2>
            <p className="landing-body mx-auto mt-7 max-w-xl sm:text-base">
              {copy.finalCta.description}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/shop" className="landing-primary w-full min-w-[180px] sm:w-auto">
                {copy.finalCta.primary} <ArrowRight />
              </Link>
              <Link href="/about" className="landing-secondary w-full sm:w-auto">
                {copy.finalCta.secondary}
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
