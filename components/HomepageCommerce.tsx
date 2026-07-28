"use client";

import Link from "next/link";
import { useState } from "react";
import { SafeImage } from "@/components/SafeImage";
import { Reveal } from "@/components/Reveal";
import { useTranslation } from "@/hooks/useTranslation";
import { useCart } from "@/components/cart-context";
import { useWishlist } from "@/components/wishlist-context";
import type { ProductData, CollectionData } from "@/types";

type Testimonial = {
  id: string;
  name: string;
  role: string;
  content: string;
};

function ArrowRight() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="rtl:rotate-180"
    >
      <path d="M5 12h14" />
      <path d="M12 5l7 7-7 7" />
    </svg>
  );
}

function ProductImageOrFallback(props: { src: string; alt: string; sizes?: string; className?: string }) {
  if (!props.src) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <span className="font-display text-[2.5rem] font-light tracking-[0.08em] text-white/[0.06]">
          {props.alt}
        </span>
      </div>
    );
  }
  return (
    <SafeImage
      src={props.src}
      alt={props.alt}
      fill
      sizes={props.sizes}
      className={props.className}
      fallback={
        <div className="flex h-full w-full items-center justify-center">
          <span className="font-display text-[2.5rem] font-light tracking-[0.08em] text-white/[0.06]">
            {props.alt}
          </span>
        </div>
      }
    />
  );
}

/* ============================================================
03 — TRUST / BENEFITS STRIP
============================================================ */
export function TrustStrip() {
  const { t } = useTranslation("home");
  const items = [
    { icon: "✦", key: "benefit_1", fallback: "PREMIUM MOROCCAN SELECTION" },
    { icon: "✦", key: "benefit_2", fallback: "CAREFULLY CURATED QUALITY" },
    { icon: "✦", key: "benefit_3", fallback: "FAST DELIVERY ACROSS MOROCCO" },
    { icon: "✦", key: "benefit_4", fallback: "SECURE & EASY CHECKOUT" },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-black border-b border-white/[0.06]">
      <div className="mx-auto max-w-[1400px] px-6 py-6 md:px-10 lg:px-16">
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 lg:gap-14">
          {items.map((item, i) => (
            <Reveal key={item.key} delay={0.05 * i}>
              <div className="flex items-center gap-2.5">
                <span className="text-[0.5rem] text-gold">{item.icon}</span>
                <span className="text-[0.6rem] font-medium uppercase tracking-[0.2em] text-white/40">
                  {t(item.key, item.fallback)}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
BRAND STATEMENT — editorial brand positioning
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
            <h2 className="max-w-[16ch] font-display text-[clamp(2rem,4.5vw,3.5rem)] leading-[0.92] tracking-[-0.04em] text-white whitespace-pre-line">
              {t("brand_statement_headline", "ROOTED IN MOROCCO.\nCRAFTED FOR TODAY.")}
            </h2>
            <p className="mt-2 max-w-lg text-[0.82rem] leading-[1.85] text-white/40">
              {t("brand_statement_desc", "A modern Moroccan beverage brand built around exceptional ingredients, masterful craft, and the hospitality that makes Morocco extraordinary.")}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
04 — FEATURED PRODUCTS
============================================================ */
export function FeaturedProducts({ products }: { products: ProductData[] }) {
  const { t } = useTranslation("home");
  const displayProducts = products.slice(0, 4);
  if (displayProducts.length === 0) return null;

  return (
    <section className="relative w-full overflow-hidden bg-black-soft" id="shop">
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
              <p className="mt-3 max-w-md text-[0.78rem] leading-[1.7] text-white/35">
                {t("shop_the_drinks_desc", "Discover our signature selection, crafted with premium ingredients from Morocco.")}
              </p>
            </div>
            <Link
              href="/shop"
              className="hidden items-center gap-2 label-utility text-[0.42rem] tracking-[0.2em] text-white/30 transition-colors duration-300 hover:text-gold md:flex"
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

  return (
    <article className="group flex flex-col">
      <div className="relative">
        <Link
          href={`/product/${product.id}`}
          className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-black-soft shadow-card transition-all duration-500 group-hover:shadow-premium group-hover:border group-hover:border-gold/15">
            {product.image ? (
              <SafeImage
                src={product.image}
                alt={product.name}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 50vw"
                className="object-contain p-6 transition-transform duration-700 ease-premium group-hover:scale-[1.04]"
                fallback={
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="font-display text-[2.5rem] font-light tracking-[0.08em] text-white/[0.08]">
                      {product.name.charAt(0)}
                    </span>
                  </div>
                }
              />
            ) : product.visual ? (
              <div className="flex h-full w-full items-center justify-center">
                <span className="font-display text-[1.5rem] font-light text-white/[0.08]">
                  {product.visual.toUpperCase()}
                </span>
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="font-display text-[2.5rem] font-light text-white/[0.08]">
                  {product.name.charAt(0)}
                </span>
              </div>
            )}

            {/* Wishlist */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggle(product.id);
              }}
              aria-label={isWishlisted ? `${t("remove_from_wishlist")} ${product.name}` : `${t("add_to_wishlist")} ${product.name}`}
              aria-pressed={isWishlisted}
              className={`absolute end-2.5 top-2.5 z-20 inline-flex items-center justify-center rounded-full p-2 transition-all duration-300 ${
                isWishlisted
                  ? "text-gold opacity-100"
                  : "text-white/20 opacity-0 group-hover:opacity-100 hover:text-gold"
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

            {/* Premium badge */}
            <span className="absolute start-2.5 top-2.5 z-10 inline-flex items-center px-2 py-0.5 text-[0.32rem] font-semibold uppercase tracking-[0.2em] text-gold/70">
              Premium
            </span>
          </div>
        </Link>
      </div>

      <div className="mt-4 space-y-2">
        {product.shortDescription ? (
          <p className="text-[0.6rem] font-medium uppercase tracking-[0.2em] text-white/30">
            {product.shortDescription}
          </p>
        ) : product.category ? (
          <p className="text-[0.6rem] font-medium uppercase tracking-[0.2em] text-white/30">{product.category}</p>
        ) : null}
        <h3 className="font-display text-base leading-[0.95] tracking-[-0.015em] text-white">
          <Link
            href={`/product/${product.id}`}
            className="transition-colors duration-300 hover:text-gold"
          >
            {product.name}
          </Link>
        </h3>
        <p className="font-display text-sm font-light text-gold">{product.price}</p>
        <button
          type="button"
          onClick={() =>
            addItem(
              {
                id: product.id,
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
          className="btn-primary-sm w-full"
          aria-label={`${t("add_to_cart")} ${product.name}`}
        >
          {t("add_to_cart")}
        </button>
        <Link
          href={`/product/${product.id}`}
          className="btn-link w-full justify-center text-white/35 hover:text-gold"
        >
          {t("view_product", "VIEW PRODUCT")}
          <ArrowRight />
        </Link>
      </div>
    </article>
  );
}

/* ============================================================
05 — COLLECTIONS
============================================================ */
export function CollectionsShowcase({ collections }: { collections: CollectionData[] }) {
  const { t } = useTranslation("home");
  if (collections.length === 0) return null;

  const featured = collections[0];
  const secondary = collections.slice(1, 3);

  return (
    <section className="relative w-full overflow-hidden bg-black">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-20 lg:px-16 lg:py-24">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-gold" />
            <span className="label-utility tracking-[0.55em] text-gold/60">
              {t("explore_label", "EXPLORE")}
            </span>
          </div>
          <h2 className="mt-5 font-display text-[clamp(1.875rem,3.5vw,2.75rem)] leading-[0.95] tracking-[-0.03em] text-white">
            {t("collections_title", "OUR COLLECTIONS")}
          </h2>
          <p className="mt-3 max-w-lg text-[0.78rem] leading-[1.7] text-white/35">
            {t("collections_desc", "Curated selections made for every taste and occasion.")}
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          {featured && (
            <Reveal className="lg:col-span-7">
              <Link href={`/shop?category=${featured.slug}`} className="group block">
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl">
                  {featured.image ? (
                    <ProductImageOrFallback
                      src={featured.image}
                      alt={featured.title}
                      sizes="(min-width: 1024px) 60vw, 100vw"
                      className="object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-black/[0.02]">
                      <span className="font-display text-[6rem] font-light text-white/[0.06]">{featured.title.charAt(0)}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8">
                    <p className="label-utility text-[0.4rem] tracking-[0.4em] text-ivory/60">
                      {featured.previewLabel || t("collection_label", "COLLECTION")}
                    </p>
                    <h3 className="mt-2 font-display text-2xl leading-[0.95] tracking-[-0.02em] text-ivory md:text-3xl">{featured.title}</h3>
                    {featured.description && (
                      <p className="mt-2 max-w-md text-[0.75rem] leading-relaxed text-ivory/50">{featured.description}</p>
                    )}
                    <span className="mt-4 inline-flex items-center gap-2 label-utility text-[0.42rem] tracking-[0.2em] text-ivory/50 transition-colors duration-300 group-hover:text-gold">
                      {t("view_collection", "VIEW COLLECTION")} <ArrowRight />
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          )}

          {secondary.length > 0 && (
            <div className="flex flex-col gap-8 lg:col-span-5 lg:gap-10">
              {secondary.map((col, i) => (
                <Reveal key={col.slug} delay={0.08 * (i + 1)}>
                  <Link href={`/shop?category=${col.slug}`} className="group flex flex-1">
                    <div className="relative flex flex-1 overflow-hidden rounded-xl">
                      {col.image ? (
                        <ProductImageOrFallback
                          src={col.image}
                          alt={col.title}
                          sizes="(min-width: 1024px) 40vw, 100vw"
                          className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-black/[0.02]">
                          <span className="font-display text-[3rem] font-light text-white/[0.06]">{col.title.charAt(0)}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
                      <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-6">
                        <p className="label-utility text-[0.38rem] tracking-[0.35em] text-ivory/40">
                          {col.previewLabel || t("collection_label", "COLLECTION")}
                        </p>
                        <h3 className="mt-1.5 font-display text-lg leading-[0.95] tracking-[-0.015em] text-ivory md:text-xl">{col.title}</h3>
                        <span className="mt-2 inline-flex items-center gap-1.5 label-utility text-[0.38rem] tracking-[0.2em] text-ivory/35 transition-colors duration-300 group-hover:text-gold">
                          {t("view_collection", "VIEW")} <ArrowRight />
                        </span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
06 — BRAND STORY / ABOUT
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
                <div
                  className="mt-6 max-w-md text-[0.82rem] leading-[1.85] text-white/40"
                  dangerouslySetInnerHTML={{ __html: description.replace(/\n/g, "<br/>") }}
                />
              )}
              <div className="mt-7">
                <Link href="/about" className="btn-link text-white/40 hover:text-gold">
                  {t("our_story_link", "DISCOVER OUR STORY")} <ArrowRight />
                </Link>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.15} className="lg:col-span-6 lg:col-start-7">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl md:aspect-[16/11]">
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
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
07 — BEST SELLERS
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
              <p className="mt-3 max-w-md text-[0.78rem] leading-[1.7] text-white/35">
                {t("bestsellers_desc", "The products our customers keep coming back for.")}
              </p>
            </div>
            <Link
              href="/shop"
              className="hidden items-center gap-2 label-utility text-[0.42rem] tracking-[0.2em] text-white/30 transition-colors duration-300 hover:text-gold md:flex"
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
08 — BUILD YOUR BOX
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
            {t("bundle_desc", "Choose your favorites, build your selection, and enjoy more of what you love.")}
          </p>
        </div>

        {/* Pack size selector */}
        <div className="mt-8 flex items-center justify-center gap-3">
          {[
            { size: 4, label: "4-PACK", discount: "" },
            { size: 6, label: "6-PACK", discount: "-10%" },
            { size: 8, label: "8-PACK", discount: "-20%" },
          ].map((opt) => (
            <button
              key={opt.size}
              type="button"
              onClick={() => setPackSize(opt.size)}
              className={`relative flex flex-col items-center gap-1 rounded-lg border px-5 py-3 transition-all duration-300 ${
                packSize === opt.size
                  ? "border-gold/60 bg-gold/[0.04]"
                  : "border-white/[0.08] bg-black-surface hover:border-white/15"
              }`}
            >
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-white/40">{opt.label}</span>
              {opt.discount && (
                <span className="text-[0.5rem] font-bold uppercase tracking-[0.15em] text-rouge">{opt.discount}</span>
              )}
            </button>
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
                    <button
                      type="button"
                      onClick={() => toggleProduct(product.id)}
                      className={`group relative flex flex-col items-center rounded-xl border p-5 text-center transition-all duration-300 ${
                        isSelected
                          ? "border-gold/50 bg-gold/[0.03]"
                          : "border-white/[0.08] bg-black-surface hover:border-white/15"
                      }`}
                    >
                      {product.image ? (
                        <div className="relative aspect-square w-full max-w-[120px]">
                          <SafeImage
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-contain p-3"
                          />
                        </div>
                      ) : (
                        <div className="aspect-square w-full max-w-[120px] flex items-center justify-center">
                          <span className="font-display text-xl text-white/[0.08]">{product.name.charAt(0)}</span>
                        </div>
                      )}
                      <p className="mt-3 text-[0.6rem] font-medium text-white/35 line-clamp-2">{product.name}</p>
                      <p className="mt-1 text-[0.65rem] font-light text-gold">{product.price}</p>
                      {isSelected && (
                        <span className="absolute -top-2 -end-2 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-white">
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      )}
                    </button>
                  </Reveal>
                );
              })}
            </div>
          </div>

          {/* Summary bar — sticky on desktop */}
          {selected.size > 0 && (
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-24">
                <Reveal>
                  <div className="rounded-xl border border-gold/20 bg-black-surface p-6 shadow-premium">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[0.6rem] uppercase tracking-[0.2em] text-white/40">
                          {t("bundle_selected", "SELECTED")} · {selected.size} / {packSize}
                        </p>
                        <p className="mt-1 font-display text-lg text-white">
                          {t("bundle_savings", "SAVE UP TO 20%")}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddBundle}
                        className="btn-primary h-10 px-6"
                      >
                        {t("add_bundle", "ADD BUNDLE TO CART")}
                      </button>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
09 — HOW IT WORKS
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
                <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-gold/25 bg-gold/[0.04] font-display text-lg text-gold">
                  {step.num}
                </span>
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
10 — CUSTOMER NOTES / TESTIMONIALS
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

  const primary = testimonials[0];
  const others = testimonials.slice(1, 4);

  return (
    <section className="relative w-full overflow-hidden bg-black-soft">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-20 lg:px-16 lg:py-24">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-gold" />
              <span className="label-utility tracking-[0.55em] text-gold/60">
                {subtitle || t("what_customers_say", "CUSTOMER NOTES")}
              </span>
            </div>
            <h2 className="mt-6 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[0.95] tracking-[-0.03em] text-white">
              {title || t("customer_notes", "Loved by customers across Morocco.")}
            </h2>
          </Reveal>

          <Reveal delay={0.1} className="mt-12">
            <div className="relative rounded-xl border border-white/[0.06] bg-black-surface p-8 md:p-10 shadow-premium">
              <p className="max-w-[680px] text-[1rem] leading-[1.7] tracking-[-0.01em] text-white">
                {primary.content}
              </p>
              <div className="mt-6 flex items-center gap-3">
                <span className="text-[0.55rem] tracking-[0.15em] text-gold">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
                <span className="h-px w-4 bg-white/[0.08]" />
                <span className="text-[0.65rem] tracking-[0.15em] text-white/50">{primary.name}</span>
                {primary.role && (
                  <>
                    <span className="text-[0.65rem] text-white/20">·</span>
                    <span className="text-[0.65rem] tracking-[0.15em] text-white/40">{primary.role}</span>
                  </>
                )}
              </div>
            </div>

            {others.length > 0 && (
              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                {others.map((tItem) => (
                  <div key={tItem.id} className="rounded-xl border border-white/[0.06] bg-black-surface p-6 shadow-premium">
                    <p className="text-[0.72rem] leading-[1.8] text-white/40">&ldquo;{tItem.content}&rdquo;</p>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-[0.55rem] tracking-[0.15em] text-gold/70">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
                      <span className="text-[0.6rem] tracking-[0.15em] text-white/40">{tItem.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
11 — MOROCCAN MOMENT
============================================================ */
export function MoroccanMoment() {
  const { t } = useTranslation("home");
  return (
    <section className="relative w-full overflow-hidden bg-black">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-20 lg:px-16 lg:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 lg:items-center">
          <Reveal className="lg:col-span-7">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-black-soft flex items-center justify-center">
              <div className="text-center">
                <span className="label-utility tracking-[0.5em] text-white/[0.1]">
                  {t("pour_serve_savor", "POUR · SERVE · SAVOR")}
                </span>
              </div>
            </div>
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
            <p className="mt-5 text-[0.78rem] leading-[1.85] text-white/40">
              {t(
                "the_moment_desc",
                "MONADATY is designed for the good moments — around a table with friends, chilled and ready to share. Welcome to genuine Moroccan hospitality.",
              )}
            </p>
            <div className="mt-8">
              <Link href="/shop" className="btn-link text-white/40 hover:text-gold">
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
12 — NEWSLETTER
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
                <span className="sr-only">{placeholder || t("newsletter_label", "Your email")}</span>
                <input
                  type="email"
                  placeholder={placeholder || t("newsletter_label", "Your email")}
                  className="h-11 w-full border-0 border-b border-white/[0.15] bg-transparent px-0 text-[0.82rem] text-white outline-none transition-all duration-200 placeholder:text-white/30 focus:border-gold"
                />
              </label>
              <button
                type="submit"
                className="btn-primary"
              >
                {buttonText || t("join", "JOIN US")}
              </button>
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
13 — FAQ
============================================================ */
export function FAQSection({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const { t } = useTranslation("home");

  if (!faqs || faqs.length === 0) {
    return (
      <section className="relative w-full overflow-hidden bg-black border-t border-white/[0.06]">
        <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-20 lg:px-16 lg:py-24">
          <div className="mx-auto max-w-2xl">
            <Reveal>
              <span className="label-utility tracking-[0.55em] text-gold/60">{t("faq_title", "FAQ")}</span>
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
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <span className="label-utility tracking-[0.55em] text-gold/60">{t("faq_title", "FAQ")}</span>
            <h2 className="mt-3 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[0.95] tracking-[-0.03em] text-white">
              {t("faq_subtitle", "Frequently asked questions")}
            </h2>
          </Reveal>

          <Reveal delay={0.1} className="mt-10">
            <div className="space-y-0">
              {faqs.map((faq, i) => (
                <FAQItem key={i} question={faq.question} answer={faq.answer} isFirst={i === 0} />
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function FAQItem({ question, answer, isFirst }: { question: string; answer: string; isFirst: boolean }) {
  const [open, setOpen] = useState(isFirst);

  return (
    <div className={isFirst ? "" : "border-t border-white/[0.06]"}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left transition-colors duration-200 hover:text-gold"
        aria-expanded={open}
      >
        <span className="pr-6 text-[0.82rem] font-medium text-white">{question}</span>
        <span className={`shrink-0 text-white/25 transition-transform duration-300 ${open ? "rotate-180" : ""}`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>
      <div
        className={`text-[0.78rem] leading-[1.9] text-white/40 transition-all duration-300 ${
          open ? "pb-5 opacity-100" : "max-h-0 pb-0 opacity-0 overflow-hidden"
        }`}
        style={{ maxHeight: open ? "200px" : "0" }}
      >
        {answer}
      </div>
    </div>
  );
}

/* ============================================================
14 — FINAL CTA
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
                {t("cta_marker", "BEGIN THE POUR")}
              </span>
              <span className="h-px w-8 bg-gold" />
            </div>
            <h2 className="mt-7 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[0.95] tracking-[-0.02em] text-white">
              {t("cta_headline", "YOUR NEXT FAVORITE TASTE IS WAITING.")}
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[0.78rem] leading-[1.7] text-white/40">
              {t(
                "cta_desc",
                "Discover the MONADATY collection. Premium Moroccan refreshment, delivered to your door.",
              )}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/shop" className="btn-primary">
                {t("cta_button", "SHOP NOW")} <ArrowRight />
              </Link>
              <Link href="/about" className="btn-link text-white/40 hover:text-gold">
                {t("our_story", "OUR STORY")}
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
