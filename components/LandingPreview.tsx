/**
 * LandingPreview — Context-free preview components for the admin Landing CMS.
 *
 * The customer-facing HomepageCommerce components use useCart, useWishlist,
 * useTranslation, useRouter, and other client contexts that are NOT available
 * in the admin tree. Rendering them inside the admin preview would throw
 * "useCart must be used within CartProvider" (and similar errors) and crash
 * the entire admin dashboard.
 *
 * These preview components:
 *   - Render the same visual UI as the customer components
 *   - Have NO context dependencies (no useCart, useWishlist, useTranslation, useRouter)
 *   - Have disabled buttons (no Add to Cart, no Wishlist, no Checkout actions)
 *   - Have safe defaults for every optional field
 *   - Use optional chaining on all nested data
 *   - Never throw on missing/null/undefined data
 *
 * Note: <img> tags are used intentionally — the preview is a small iframe-like
 * container, so Next.js image optimization is unnecessary overhead.
 */

/* eslint-disable @next/next/no-img-element, react/no-array-index-key */

import Link from "next/link";

/* ── Safe defaults ──────────────────────────────────────────────── */

const DEFAULT_HERO = {
  title: "TASTE\nREDEFINED.",
  subtitle: "Premium Soda — Moroccan Craft",
  description: "A refined soda experience shaped in Morocco.",
  ctaText: "Shop MONADATY",
  ctaLink: "/shop",
  media: [] as string[],
};

const DEFAULT_FEATURED = { title: "Featured", subtitle: "SELECTED FLAVORS" };
const DEFAULT_COLLECTIONS = { title: "Shop by Collection", subtitle: "THE COLLECTIONS" };
const DEFAULT_BRAND = {
  title: "Our Story",
  subtitle: "BORN IN MOROCCO",
  description: "",
  image: "",
};
const DEFAULT_TESTIMONIALS = { title: "Testimonials", subtitle: "WHAT THEY SAY" };
const DEFAULT_MOROCCAN_MOMENT = {
  title: "Pour. Serve. Savor.",
  subtitle: "THE MONADATY MOMENT",
  description: "",
  image: "",
};
const DEFAULT_NEWSLETTER = {
  title: "STAY IN THE MONADATY CIRCLE",
  subtitle: "STAY CONNECTED",
  description: "",
  placeholder: "Your email",
  buttonText: "Join",
};
const DEFAULT_FINAL_CTA = {
  subtitle: "BEGIN THE POUR",
  title: "YOUR NEXT FAVORITE TASTE IS WAITING.",
  description: "Discover the MONADATY collection. Premium Moroccan refreshment, delivered to your door.",
  buttonText: "SHOP NOW",
  buttonLink: "/shop",
};

/* ── 01 Hero ────────────────────────────────────────────────────── */

type HeroPreviewProps = {
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  media?: string[];
};

export function HeroPreview({
  title = DEFAULT_HERO.title,
  subtitle = DEFAULT_HERO.subtitle,
  description = DEFAULT_HERO.description,
  ctaText = DEFAULT_HERO.ctaText,
  ctaLink: _ctaLink = DEFAULT_HERO.ctaLink,
  media = DEFAULT_HERO.media,
}: HeroPreviewProps) {
  const safeTitle = title || DEFAULT_HERO.title;
  const safeMedia = Array.isArray(media) ? media : [];
  return (
    <section className="relative w-full overflow-hidden bg-black">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-20 lg:px-16 lg:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 lg:items-center">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-gold" />
              <span className="label-utility tracking-[0.55em] text-gold/60">
                {subtitle || DEFAULT_HERO.subtitle}
             </span>
           </div>
            <h1 className="mt-6 whitespace-pre-line font-display text-[clamp(2.5rem,6.5vw,6.5rem)] leading-[0.85] tracking-[-0.05em] text-white">
              {safeTitle}
           </h1>
            {description && (
              <p className="mt-6 max-w-md text-[0.85rem] leading-[1.95] text-white/55">
                {description}
             </p>
            )}
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <span
                aria-disabled="true"
                className="pointer-events-none inline-flex h-12 cursor-not-allowed items-center justify-center bg-burgundy px-7 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-white opacity-60"
              >
                {ctaText || DEFAULT_HERO.ctaText}
             </span>
           </div>
         </div>
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-black-soft">
              {safeMedia.length > 0 && safeMedia[0] ? (
                <img
                  src={safeMedia[0]}
                  alt={subtitle || "Hero image"}
                  className="h-full w-full object-contain p-6"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="font-display text-[3rem] font-light tracking-[0.08em] text-white/[0.06]">
                    M
                 </span>
               </div>
              )}
           </div>
         </div>
       </div>
     </div>
   </section>
  );
}

/* ── 02 Featured Products ───────────────────────────────────────── */

type FeaturedProduct = {
  id: string;
  name: string;
  slug: string;
  price: string;
  image: string;
};

type FeaturedPreviewProps = {
  title?: string;
  subtitle?: string;
  products?: FeaturedProduct[];
  t?: (key: string, fallback?: string) => string;
};

export function FeaturedPreview({
  title = DEFAULT_FEATURED.title,
  subtitle = DEFAULT_FEATURED.subtitle,
  products = [],
  t = (key, fb) => fb || key,
}: FeaturedPreviewProps) {
  const safeProducts = Array.isArray(products) ? products.filter(Boolean) : [];
  return (
    <section className="relative w-full overflow-hidden bg-black-soft">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-20 lg:px-16 lg:py-24">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="label-utility tracking-[0.55em] text-gold/60">
              {subtitle}
           </span>
            <h2 className="mt-4 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[0.95] tracking-[-0.03em] text-white">
              {title}
           </h2>
         </div>
          <span className="hidden items-center gap-2 text-[0.42rem] font-semibold uppercase tracking-[0.2em] text-white/30 md:flex">
            SHOP THE RANGE
         </span>
       </div>

        {safeProducts.length === 0 ? (
          <div className="mt-12 grid place-items-center border border-dashed border-white/[0.06] py-20">
            <p className="text-[0.78rem] text-white/30">{t("no_products_selected", "No featured products selected")}</p>
         </div>
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6 md:gap-y-12">
            {safeProducts.map((product) => (
              <FeaturedCardPreview key={product.id} product={product} />
            ))}
         </div>
        )}
     </div>
   </section>
  );
}

function FeaturedCardPreview({ product }: { product: FeaturedProduct }) {
  return (
    <div className="group flex flex-col">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-black-soft">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name || "Product"}
            className="h-full w-full object-contain p-6"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-[2.5rem] font-light tracking-[0.08em] text-white/[0.06]">
              {(product.name || "?").charAt(0)}
           </span>
         </div>
        )}
     </div>
      <h3 className="mt-4 font-display text-base leading-[0.95] tracking-[-0.015em] text-white">
        {product.name || "Untitled"}
     </h3>
      <p className="font-display text-sm font-light text-gold">{product.price || ""}</p>
      <span
        aria-disabled="true"
        className="pointer-events-none mt-3 inline-flex h-10 w-full cursor-not-allowed items-center justify-center bg-burgundy px-5 text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-white opacity-60"
      >
        Add to Cart
     </span>
   </div>
  );
}

/* ── 03 Collections Showcase ────────────────────────────────────── */

type CollectionPreviewItem = {
  slug: string;
  name: string;
  image: string;
};

type CollectionsPreviewProps = {
  title?: string;
  subtitle?: string;
  collections?: CollectionPreviewItem[];
  t?: (key: string, fallback?: string) => string;
};

export function CollectionsPreview({
  title = DEFAULT_COLLECTIONS.title,
  subtitle = DEFAULT_COLLECTIONS.subtitle,
  collections = [],
  t = (key, fb) => fb || key,
}: CollectionsPreviewProps) {
  const safeCollections = Array.isArray(collections) ? collections.filter(Boolean) : [];
  return (
    <section className="relative w-full overflow-hidden bg-black">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-20 lg:px-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold" />
            <span className="label-utility tracking-[0.55em] text-gold/60">
              {subtitle}
           </span>
            <span className="h-px w-8 bg-gold" />
         </div>
          <h2 className="mt-6 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[0.95] tracking-[-0.03em] text-white">
            {title}
         </h2>
       </div>

        {safeCollections.length === 0 ? (
          <div className="mt-12 grid place-items-center border border-dashed border-white/[0.06] py-20">
            <p className="text-[0.78rem] text-white/30">{t("no_collections_selected", "No collections enabled")}</p>
         </div>
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3">
            {safeCollections.slice(0, 6).map((collection) => (
              <div
                key={collection.slug}
                className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-black-soft"
              >
                {collection.image ? (
                  <img
                    src={collection.image}
                    alt={collection.name || "Collection"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="font-display text-[2.5rem] font-light text-white/[0.06]">
                      {(collection.name || "?").charAt(0)}
                    </span>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <p className="font-display text-sm font-medium text-white">
                    {collection.name || "Untitled"}
                 </p>
               </div>
             </div>
            ))}
         </div>
        )}
     </div>
   </section>
  );
}

/* ── 04 Brand Story ─────────────────────────────────────────────── */

type BrandStoryPreviewProps = {
  title?: string;
  description?: string;
  image?: string;
};

export function BrandStoryPreview({
  title = DEFAULT_BRAND.title,
  description = DEFAULT_BRAND.description,
  image = DEFAULT_BRAND.image,
}: BrandStoryPreviewProps) {
  return (
    <section className="relative w-full overflow-hidden bg-black-soft">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-20 lg:px-16 lg:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-7">
            {image ? (
              <img
                src={image}
                alt={title || "Brand story"}
                className="aspect-[4/3] w-full rounded-xl object-cover"
              />
            ) : (
              <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-black-soft">
                <span className="font-display text-[3rem] font-light text-white/[0.06]">
                  M
               </span>
             </div>
            )}
         </div>
          <div className="lg:col-span-5">
            <span className="label-utility tracking-[0.55em] text-gold/60">
              BORN IN MOROCCO
           </span>
            <h2 className="mt-6 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[0.95] tracking-[-0.03em] text-white">
              {title || DEFAULT_BRAND.title}
           </h2>
            {description && (
              <p className="mt-5 whitespace-pre-line text-[0.82rem] leading-[1.85] text-white/55">
                {description}
             </p>
            )}
            <div className="mt-8">
              <span
                aria-disabled="true"
                className="pointer-events-none inline-flex h-12 cursor-not-allowed items-center justify-center border border-gold/30 bg-transparent px-7 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-gold opacity-60"
              >
                Read Our Story
             </span>
           </div>
         </div>
       </div>
     </div>
   </section>
  );
}

/* ── 05 Social Proof (Testimonials) ────────────────────────────── */

type TestimonialItem = {
  id: string;
  name: string;
  role: string;
  content: string;
};

type SocialProofPreviewProps = {
  title?: string;
  subtitle?: string;
  testimonials?: TestimonialItem[];
  t?: (key: string, fallback?: string) => string;
};

export function SocialProofPreview({
  title = DEFAULT_TESTIMONIALS.title,
  subtitle = DEFAULT_TESTIMONIALS.subtitle,
  testimonials = [],
  t = (key, fb) => fb || key,
}: SocialProofPreviewProps) {
  const safeTestimonials = Array.isArray(testimonials) ? testimonials.filter(Boolean) : [];
  return (
    <section className="relative w-full overflow-hidden bg-black">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-20 lg:px-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold" />
            <span className="label-utility tracking-[0.55em] text-gold/60">
              {subtitle}
           </span>
            <span className="h-px w-8 bg-gold" />
         </div>
          <h2 className="mt-6 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[0.95] tracking-[-0.03em] text-white">
            {title}
         </h2>
       </div>

        {safeTestimonials.length === 0 ? (
          <div className="mt-12 grid place-items-center border border-dashed border-white/[0.06] py-20">
            <p className="text-[0.78rem] text-white/30">{t("no_results", "No testimonials available")}</p>
         </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {safeTestimonials.slice(0, 6).map((t) => (
              <article
                key={t.id}
                className="flex flex-col rounded-xl border border-white/[0.06] bg-black-soft p-6"
              >
                <p className="text-[0.82rem] leading-[1.85] text-white/55">
                  &ldquo;{t.content || ""}&rdquo;
               </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 font-display text-sm font-light text-gold">
                    {(t.name || "?").charAt(0).toUpperCase()}
                 </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {t.name || "Anonymous"}
                  </p>
                    {t.role && (
                      <p className="text-[0.65rem] text-white/40">{t.role}</p>
                    )}
                </div>
               </div>
             </article>
            ))}
         </div>
        )}
     </div>
   </section>
  );
}

/* ── 06 Moroccan Moment ─────────────────────────────────────────── */

type MoroccanMomentPreviewProps = {
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
};

export function MoroccanMomentPreview({
  title = DEFAULT_MOROCCAN_MOMENT.title,
  subtitle = DEFAULT_MOROCCAN_MOMENT.subtitle,
  description = DEFAULT_MOROCCAN_MOMENT.description,
  image = DEFAULT_MOROCCAN_MOMENT.image,
}: MoroccanMomentPreviewProps) {
  return (
    <section className="relative w-full overflow-hidden bg-black">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-20 lg:px-16 lg:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-7">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-black-soft">
              {image ? (
                <img
                  src={image}
                  alt={title || "Moroccan moment"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="label-utility tracking-[0.5em] text-white/40">
                    POUR · SERVE · SAVOR
                 </span>
               </div>
              )}
           </div>
         </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-gold" />
              <span className="label-utility tracking-[0.55em] text-gold/60">
                {subtitle || DEFAULT_MOROCCAN_MOMENT.subtitle}
             </span>
           </div>
            <h2 className="mt-6 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[0.95] tracking-[-0.03em] text-white">
              {title || DEFAULT_MOROCCAN_MOMENT.title}
            </h2>
            {description && (
              <p className="mt-5 text-[0.78rem] leading-[1.85] text-white/55">
                {description}
             </p>
            )}
         </div>
       </div>
     </div>
   </section>
  );
}

/* ── 07 Newsletter ──────────────────────────────────────────────── */

type NewsletterPreviewProps = {
  title?: string;
  subtitle?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
  t?: (key: string, fallback?: string) => string;
};

export function NewsletterPreview({
  title = DEFAULT_NEWSLETTER.title,
  subtitle = DEFAULT_NEWSLETTER.subtitle,
  description = DEFAULT_NEWSLETTER.description,
  placeholder = DEFAULT_NEWSLETTER.placeholder,
  buttonText = DEFAULT_NEWSLETTER.buttonText,
  t = (key, fb) => fb || key,
}: NewsletterPreviewProps) {
  return (
    <section className="relative w-full overflow-hidden bg-rouge-dark">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-20 lg:px-16 lg:py-24">
        <div className="mx-auto max-w-lg text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold/50" />
            <span className="label-utility tracking-[0.55em] text-gold/60">
              {subtitle}
           </span>
            <span className="h-px w-8 bg-gold/50" />
         </div>
          <h2 className="mt-6 font-display text-[clamp(1.5rem,2.5vw,2rem)] leading-[0.95] tracking-[-0.02em] text-white">
            {title}
         </h2>
          {description && (
            <p className="mx-auto mt-4 max-w-sm text-[0.72rem] leading-relaxed text-white/55">
              {description}
           </p>
          )}
          <form
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
            onSubmit={(e) => e.preventDefault()}
            aria-label={t("newsletter_preview_disabled", "Newsletter preview (disabled)")}
          >
            <label className="flex-1 max-w-xs">
              <span className="sr-only">{placeholder}</span>
              <input
                type="email"
                placeholder={placeholder}
                disabled
                aria-disabled="true"
                className="h-11 w-full border-0 border-b border-white/[0.15] bg-transparent px-0 text-[0.82rem] text-white/40 outline-none transition-all duration-200 placeholder:text-white/40 focus:border-gold caret-white"
                style={{ WebkitTextFillColor: "#FFFFFF" }}
              />
           </label>
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="pointer-events-none inline-flex h-11 cursor-not-allowed items-center justify-center bg-burgundy px-7 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-white opacity-60"
            >
              {buttonText}
           </button>
         </form>
          <p className="mt-3 text-[0.55rem] uppercase tracking-[0.2em] text-white/25">
            Preview only — form is disabled
         </p>
       </div>
     </div>
   </section>
  );
}

/* ── 08 Final CTA ───────────────────────────────────────────────── */

type FinalCtaPreviewProps = {
  subtitle?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
};

export function FinalCtaPreview({
  subtitle = DEFAULT_FINAL_CTA.subtitle,
  title = DEFAULT_FINAL_CTA.title,
  description = DEFAULT_FINAL_CTA.description,
  buttonText = DEFAULT_FINAL_CTA.buttonText,
  buttonLink = DEFAULT_FINAL_CTA.buttonLink,
}: FinalCtaPreviewProps) {
  return (
    <section className="relative w-full overflow-hidden border-t border-white/[0.06] bg-black">
      <div className="mx-auto max-w-[1400px] px-6 py-16 md:px-10 md:py-20 lg:px-16 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gold" />
            <span className="label-utility tracking-[0.55em] text-gold/60">
              {subtitle}
           </span>
            <span className="h-px w-8 bg-gold" />
         </div>
          <h2 className="mt-7 font-display text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[0.95] tracking-[-0.02em] text-white">
            {title}
         </h2>
          {description && (
            <p className="mx-auto mt-4 max-w-md text-[0.78rem] leading-[1.7] text-white/55">
              {description}
           </p>
          )}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={buttonLink || "/shop"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center bg-burgundy px-7 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-white transition-all duration-300 hover:bg-burgundy-dark"
            >
              {buttonText}
           </Link>
            <Link
              href="/about"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-white/50 transition-colors hover:text-gold"
            >
              OUR STORY
           </Link>
         </div>
          <p className="mt-3 text-[0.55rem] uppercase tracking-[0.2em] text-white/25">
            Preview — links open in new tab
         </p>
       </div>
     </div>
   </section>
  );
}
