"use client";

import Link from "next/link";
import { SafeImage } from "@/components/SafeImage";
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

function ProductImageOrFallback(props: {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
}) {
  if (!props.src) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <span className="font-display text-[2.5rem] font-light tracking-[0.08em] text-ivory/[0.05]">
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
          <span className="font-display text-[2.5rem] font-light tracking-[0.08em] text-ivory/[0.05]">
            {props.alt}
        </span>
      </div>
      }
    />
  );
}

/* ============================================================
   STORY SCENE — editorial composition, NOT image|text
   Massive hero image extending beyond container
   "BORN IN MOROCCO" statement floats in white space
   Gold caption lives inside the image, not below it
   ============================================================ */

export function SectionAbout(props: {
  title: string;
  subtitle: string;
  description: string;
  image: string;
}) {
  const { t } = useTranslation("home");
  return (
    <section className="relative w-full overflow-hidden bg-black">
      <div className="mx-auto max-w-[1600px] px-6 py-28 md:px-10 md:py-40 lg:px-16 lg:py-56">
        {/* Top — chapter number left + eyebrow right */}
        <div className="flex items-start justify-between gap-8">
          <div className="flex items-baseline gap-5">
            <span className="font-display text-[4.5rem] font-light leading-none tracking-[-0.04em] text-ivory/[0.06] md:text-[6rem]">
              01
          </span>
            <span className="label-utility text-ivory/15">
              {t("story_caption")}
          </span>
        </div>

          <div className="flex items-end gap-3">
            <span className="h-px w-8 bg-gold/30" />
            <span className="label-utility tracking-[0.55em] text-ivory/25">
              {props.subtitle || t("story_chapter")}
          </span>
        </div>
      </div>

        {/* Massive editorial image — extends past right edge */}
        <div className="relative mt-16 md:mt-20 lg:mt-24">
          <div className="relative">
            <div className="relative aspect-[16/10] w-full max-w-[85%] overflow-hidden md:aspect-[16/9] lg:aspect-[21/10]">
              {props.image && props.image !== "/images/placeholder.svg" ? (
                <SafeImage
                  src={props.image}
                  alt={props.title}
                  className="object-cover transition-transform duration-[1600ms] ease-out hover:scale-[1.015]"
                  sizes="(min-width: 1024px) 85vw, 100vw"
                  fallback={
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="font-display text-[7rem] font-light tracking-[0.12em] text-ivory/[0.03] md:text-[10rem]">
                        M
                    </span>
                  </div>
                  }
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-black-soft">
                  <span className="font-display text-[7rem] font-light tracking-[0.12em] text-ivory/[0.03] md:text-[10rem]">
                    M
              </span>
            </div>
              )}

              {/* Tiny gold caption bottom-left, inside image */}
              <div className="absolute bottom-5 left-5 z-10 flex items-center gap-3 lg:bottom-7 lg:left-7">
                <span className="h-px w-10 bg-gold/35" />
                <span className="label-utility text-[0.4rem] tracking-[0.4em] text-ivory/40">
                  {t("story_photographed")}
            </span>
          </div>

              {/* Tiny editorial index top-right of image */}
              <div className="absolute top-5 right-5 z-10 hidden md:flex items-center gap-3">
                <span className="label-utility text-[0.4rem] tracking-[0.4em] text-ivory/40">
                  FRAME · 01
          </span>
                <span className="h-px w-8 bg-ivory/20" />
        </div>
      </div>

            {/* Editorial camera label — absolute, floating right */}
            <div className="absolute right-6 top-1/2 hidden -translate-y-1/2 xl:block">
              <div
                className="flex flex-col items-center gap-3 text-ivory/15"
                style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
              >
                <span className="h-8 w-px bg-ivory/15" />
                <span className="label-utility tracking-[0.55em]">STUDIO · 35MM</span>
                <span className="h-8 w-px bg-ivory/15" />
         </div>
       </div>
     </div>
    </div>

      {/* Statement + description — vertical separation */}
      <div className="mt-24 grid grid-cols-1 gap-12 md:mt-32 md:gap-16 lg:mt-44 lg:grid-cols-12 lg:gap-24">
        <h2 className="font-display text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.92] tracking-[-0.05em] text-ivory lg:col-span-7">
          {props.title}
      </h2>

        <div className="space-y-7 lg:col-span-4 lg:col-start-9 lg:pt-10">
          <div className="h-px w-10 bg-gold/30" />
          {props.description && (
            <p className="text-[0.82rem] leading-[2] text-ivory/30 whitespace-pre-line">
              {props.description}
        </p>
          )}
          <Link href="/about" className="btn-link">
            {t("learn_more")}
            <ArrowRight />
       </Link>
     </div>
   </div>
 </div>
</section>
  );
}

/* ============================================================
   COLLECTIONS — three visual chapters, not three cards
   Each chapter has its own composition. Asymmetric.
   No card backgrounds. No overlay-text-on-image pattern.
   ============================================================ */

export function SectionCollections(props: {
  collections: CollectionData[];
  title: string;
  subtitle: string;
}) {
  const { t } = useTranslation("home");
  if (props.collections.length === 0) return null;

  return (
    <section className="relative w-full overflow-hidden bg-black">
      <div className="mx-auto max-w-[1600px] px-6 py-28 md:px-10 md:py-40 lg:px-16 lg:py-52">
        {/* Editorial eyebrow — far left */}
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-gold/30" />
          <span className="label-utility tracking-[0.55em] text-gold/40">
            {props.subtitle}
        </span>
      </div>

        {/* Big section title — left */}
        <h2 className="mt-8 max-w-[16ch] font-display text-[clamp(2.2rem,5vw,4.5rem)] leading-[0.92] tracking-[-0.04em] text-ivory md:mt-10">
          {props.title}
      </h2>

        {/* Chapters — three different layouts */}
        <div className="mt-24 space-y-32 md:space-y-40 lg:mt-36 lg:space-y-56">
          {props.collections.slice(0, 3).map((col, idx) => (
            <CollectionChapter key={col.slug} collection={col} index={idx} t={t} />
          ))}
       </div>
    </div>
  </section>
  );
}

function CollectionChapter({
  collection,
  index,
  t,
}: {
  collection: CollectionData;
  index: number;
  t: (k: string) => string;
}) {
  // Three different layouts — alternating rhythm
  const layouts = [
    // CHAPTER 1 — image huge left, text offset right
    {
      imageCol: "lg:col-span-8 lg:col-start-1",
      imageSize: "aspect-[16/11]",
      textCol: "lg:col-span-3 lg:col-start-10 lg:pt-24",
      textAlign: "text-left",
    },
    // CHAPTER 2 — text first left, image offset right
    {
      imageCol: "lg:col-span-7 lg:col-start-6",
      imageSize: "aspect-[4/5]",
      textCol: "lg:col-span-4 lg:col-start-1 lg:pt-32",
      textAlign: "text-left",
    },
    // CHAPTER 3 — image huge right, text offset left
    {
      imageCol: "lg:col-span-8 lg:col-start-5",
      imageSize: "aspect-[16/10]",
      textCol: "lg:col-span-3 lg:col-start-1 lg:pt-16",
      textAlign: "text-left",
    },
  ];
  const layout = layouts[index % 3];

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-x-10">
      {/* Image */}
      <Link
        href={`/shop?category=${collection.slug}`}
        className={`group relative block overflow-hidden ${layout.imageCol}`}
      >
        <div className={`relative ${layout.imageSize} w-full overflow-hidden`}>
          <ProductImageOrFallback
            src={collection.image}
            alt={collection.title}
            sizes="(min-width: 1024px) 70vw, 100vw"
            className="object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.025]"
          />
          {/* Tiny chapter number */}
          <div className="absolute left-5 top-5 z-10 flex items-center gap-3 lg:left-7 lg:top-7">
            <span className="h-px w-6 bg-gold/35" />
            <span className="label-utility text-[0.4rem] text-ivory/30">
              {String(index + 1).padStart(2, "0")} / {t("chapter_label")}
          </span>
        </div>
      </div>
    </Link>

      {/* Text */}
      <div className={`space-y-7 ${layout.textCol}`}>
        <div className="h-px w-10 bg-gold/30" />
        <p className="label-utility text-gold/45">
          {collection.previewLabel || t("collection_label")}
      </p>
        <h3 className="font-display text-[clamp(2rem,4.4vw,4rem)] leading-[0.92] tracking-[-0.04em] text-ivory">
          {collection.title}
       </h3>
        {collection.description && (
          <p className="max-w-[24rem] text-[0.78rem] leading-[1.95] text-ivory/30">
            {collection.description}
        </p>
        )}
        <Link
          href={`/shop?category=${collection.slug}`}
          className="btn-link"
        >
          {t("view_collection")}
          <ArrowRight />
      </Link>
    </div>
  </div>
  );
}

/* ============================================================
   FEATURED PRODUCTS — product exhibition, NOT 3x3 grid
   Nine products with intentionally varied scales, offsets, alignments.
   Each has a different visual role.
   ============================================================ */

const FEATURED_LAYOUTS: Array<{
  col: string;
  aspect: string;
  size: string;
  align: string;
  showNumber: string;
  number: string;
}> = [
  // 01 — HUGE, anchors left, dominant
  {
    col: "lg:col-span-7 lg:col-start-1",
    aspect: "aspect-[3/4]",
    size: "lg:h-[78vh]",
    align: "lg:text-left",
    showNumber: "lg:text-[12rem] xl:text-[15rem]",
    number: "01",
  },
  // 02 — small, offset right, secondary
  {
    col: "lg:col-span-3 lg:col-start-10 lg:pt-32",
    aspect: "aspect-[3/4]",
    size: "lg:h-[40vh]",
    align: "lg:text-left",
    showNumber: "lg:text-[5rem]",
    number: "02",
  },
  // 03 — medium, centered horizontally
  {
    col: "lg:col-span-4 lg:col-start-5",
    aspect: "aspect-[3/4]",
    size: "lg:h-[55vh]",
    align: "lg:text-center",
    showNumber: "lg:text-[7rem]",
    number: "03",
  },
  // 04 — wide, dramatic
  {
    col: "lg:col-span-8 lg:col-start-2 lg:pt-20",
    aspect: "aspect-[16/10]",
    size: "lg:h-[60vh]",
    align: "lg:text-left",
    showNumber: "lg:text-[10rem]",
    number: "04",
  },
  // 05 — small, far right
  {
    col: "lg:col-span-3 lg:col-start-10",
    aspect: "aspect-[3/4]",
    size: "lg:h-[44vh]",
    align: "lg:text-left",
    showNumber: "lg:text-[5rem]",
    number: "05",
  },
  // 06 — medium tall, offset
  {
    col: "lg:col-span-4 lg:col-start-1 lg:-mt-12",
    aspect: "aspect-[4/5]",
    size: "lg:h-[60vh]",
    align: "lg:text-left",
    showNumber: "lg:text-[7rem]",
    number: "06",
  },
  // 07 — HUGE again, dominant
  {
    col: "lg:col-span-7 lg:col-start-6",
    aspect: "aspect-[3/4]",
    size: "lg:h-[80vh]",
    align: "lg:text-left",
    showNumber: "lg:text-[12rem] xl:text-[15rem]",
    number: "07",
  },
  // 08 — small, far left, anchors
  {
    col: "lg:col-span-3 lg:col-start-1 lg:pt-40",
    aspect: "aspect-[3/4]",
    size: "lg:h-[40vh]",
    align: "lg:text-left",
    showNumber: "lg:text-[5rem]",
    number: "08",
  },
  // 09 — wide, centered horizontal end-piece
  {
    col: "lg:col-span-10 lg:col-start-2",
    aspect: "aspect-[16/7]",
    size: "lg:h-[44vh]",
    align: "lg:text-center",
    showNumber: "lg:text-[8rem]",
    number: "09",
  },
];

export function SectionFeatured(props: {
  featuredProducts: ProductData[];
  title: string;
  subtitle: string;
}) {
  const { t } = useTranslation("home");
  if (props.featuredProducts.length === 0) return null;
  const products = props.featuredProducts;

  return (
    <section id="products" className="relative w-full overflow-hidden bg-black scroll-mt-24">
      <div className="mx-auto max-w-[1600px] px-6 py-28 md:px-10 md:py-40 lg:px-16 lg:py-52">
        {/* Eyebrow — right, asymmetric */}
        <div className="flex items-end justify-end gap-3">
          <span className="h-px w-8 bg-gold/30" />
          <span className="label-utility tracking-[0.55em] text-gold/40">
            {props.subtitle}
        </span>
      </div>

        {/* Title — far left, huge */}
        <h2 className="mt-8 max-w-[14ch] font-display text-[clamp(2.5rem,6.5vw,6rem)] leading-[0.85] tracking-[-0.055em] text-ivory md:mt-10">
          {props.title}
      </h2>

        {/* Product exhibition — staggered, varied */}
        <div className="mt-24 space-y-32 md:space-y-44 lg:mt-32 lg:space-y-56">
          {products.slice(0, 9).map((product, idx) => {
            const layout = FEATURED_LAYOUTS[idx % FEATURED_LAYOUTS.length];
            return (
              <FeaturedExhibit
                key={product.id}
                product={product}
                layout={layout}
                globalIdx={idx}
                t={t}
              />
            );
          })}
       </div>
    </div>
  </section>
  );
}

function FeaturedExhibit({
  product,
  layout,
}: {
  product: ProductData;
  layout: (typeof FEATURED_LAYOUTS)[number];
  globalIdx: number;
  t: (k: string) => string;
}) {
  const { addItem } = useCart();
  const { contains, toggle } = useWishlist();
  const isWishlisted = contains(product.id);
  const { t } = useTranslation("home");
  const tp = useTranslation("products").t;

  return (
    <div className={`grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-x-10 ${layout.col}`}>
      {/* Number — partial crop, asymmetric */}
      <div className="relative">
        <span
          aria-hidden
          className={`block select-none font-display font-light leading-[0.78] tracking-[-0.05em] text-ivory/[0.04] ${layout.showNumber}`}
        >
          {layout.number}
      </span>

        {/* Image wrapper */}
        <Link
          href={`/product/${product.id}`}
          className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          <div className={`relative ${layout.aspect} ${layout.size} w-full overflow-visible`}>
            {/* Wishlist heart */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggle(product.id);
              }}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              aria-pressed={isWishlisted}
              className={`absolute right-3 top-3 z-20 inline-flex items-center justify-center transition-all duration-300 ${
                isWishlisted ? "text-burgundy opacity-100" : "text-ivory/25 opacity-0 group-hover:opacity-100"
              }`}
            >
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 10-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
            </svg>
          </button>

            <div className="relative z-10 flex h-full w-full items-center justify-center transition-transform duration-[1400ms] ease-out group-hover:translate-y-[-6px]">
              <ProductImageOrFallback
                src={product.image}
                alt={product.name}
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
              />
          </div>
        </div>
      </Link>

        {/* Info — restrained, asymmetric */}
        <div className={`mt-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between ${layout.align}`}>
          <div className="space-y-1.5">
            <p className="label-utility text-[0.4rem] tracking-[0.4em] text-ivory/20">
              {product.category || t("drink_label")}
          </p>
            <h3 className="font-display text-2xl leading-[0.95] tracking-[-0.02em] text-ivory transition-colors duration-300 hover:text-gold/80 md:text-3xl">
              <Link href={`/product/${product.id}`}>{product.name</Link>
          </h3>
        </div>
          <div className="flex items-center gap-5">
            <p className="font-display text-lg font-light text-gold md:text-xl">
              {product.price}
          </p>
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
                  1
                )
              }
              className="btn-primary h-9 !px-5 !text-[0.42rem] !tracking-[0.2em]"
              aria-label={`${tp("add_to_cart")} ${product.name}`}
            >
              {tp("add_to_cart")}
          </button>
        </div>
      </div>
    </div>
  </div>
  );
}

/* ============================================================
   TESTIMONIALS — one giant voice, no cards
   Huge quotation mark, huge serif quote, tiny customer details.
   ============================================================ */

export function SectionTestimonials(props: {
  testimonials: Testimonial[];
  title: string;
  subtitle: string;
}) {
  if (props.testimonials.length === 0) return null;
  const primary = props.testimonials[0];
  const others = props.testimonials.slice(1, 3);

  return (
    <section id="reviews" className="relative w-full overflow-hidden bg-black scroll-mt-24">
      {/* Very subtle burgundy glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[60%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(116,24,39,0.05)_0%,transparent_65%)] blur-3xl"
      />
      <div className="relative mx-auto max-w-[1600px] px-6 py-28 md:px-10 md:py-40 lg:px-16 lg:py-56">
        {/* Eyebrow far left */}
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-gold/30" />
          <span className="label-utility tracking-[0.55em] text-gold/40">
            {props.subtitle}
        </span>
      </div>

        {/* Tiny section number top-right */}
        <div className="flex items-end justify-end">
          <span className="font-display text-[5rem] font-light leading-none tracking-[-0.04em] text-ivory/[0.05] md:text-[7rem]">
            02
        </span>
      </div>

        {/* ONE GIANT QUOTE — dominates scene */}
        <div className="mt-12 grid grid-cols-1 gap-12 md:mt-16 lg:mt-20 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-2" />
          <div className="lg:col-span-8">
            {/* Giant quotation mark */}
            <div
              aria-hidden
              className="font-display text-[10rem] leading-[0.35] tracking-[-0.06em] text-gold/[0.08] md:text-[16rem] lg:text-[20rem]"
            >
              &ldquo;
          </div>

            {/* Massive serif quote */}
            <blockquote className="-mt-10 font-display text-[clamp(2.4rem,5vw,5rem)] leading-[1.02] tracking-[-0.04em] text-ivory md:-mt-14 lg:-mt-16">
              {primary.content}
          </blockquote>

            {/* Tiny attribution */}
            <figcaption className="mt-10 flex items-center gap-4 md:mt-14">
              <span className="h-px w-10 bg-gold/40" />
              <div>
                <p className="text-[0.5rem] font-semibold uppercase tracking-[0.3em] text-ivory/65">
                  — {primary.name}
            </p>
                {primary.role && (
                  <p className="mt-1.5 text-[0.38rem] uppercase tracking-[0.4em] text-ivory/22">
                    {primary.role}
              </p>
                )}
          </div>
        </figcaption>
      </div>
    </div>

        {/* Secondary testimonials — small, two columns, no cards */}
        {others.length > 0 && (
          <div className="mt-24 grid grid-cols-1 gap-12 border-t border-ivory/[0.04] pt-16 md:mt-32 md:grid-cols-2 md:gap-16 lg:mt-44 lg:gap-24">
            {others.map((tm) => (
              <figure key={tm.id}>
                <div
                  aria-hidden
                  className="font-display text-[4rem] leading-none text-gold/[0.08]"
                >
                  &ldquo;
            </div>
                <blockquote className="font-display text-xl leading-[1.4] tracking-[-0.015em] text-ivory/65 md:text-2xl">
                  {tm.content}
            </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="h-px w-6 bg-gold/25" />
                  <p className="label-utility tracking-[0.32em] text-ivory/40">
                    {tm.name}
            </p>
                  {tm.role && (
                    <span className="text-[0.42rem] uppercase tracking-[0.32em] text-ivory/20">
                      — {tm.role}
              </span>
                  )}
          </figcaption>
        </figure>
            ))}
        </div>
        )}
    </div>
  </section>
  );
}

/* ============================================================
   NEWSLETTER — minimal, no box, no container
   Small "THE INNER CIRCLE", huge "STAY CLOSE...", simple email/join line.
   ============================================================ */

export function SectionNewsletter(props: {
  title: string;
  subtitle: string;
  description: string;
  placeholder: string;
  buttonText: string;
}) {
  const { t } = useTranslation("home");
  return (
    <section className="relative w-full overflow-hidden bg-black">
      <div className="mx-auto max-w-[1600px] px-6 py-28 md:px-10 md:py-40 lg:px-16 lg:py-52">
        {/* Eyebrow far right */}
        <div className="flex items-end justify-end gap-3">
          <span className="h-px w-8 bg-gold/30" />
          <span className="label-utility tracking-[0.55em] text-gold/40">
            {props.subtitle || t("inner_circle")}
        </span>
      </div>

        {/* Title — left aligned, big */}
        <h2 className="mt-8 max-w-[16ch] font-display text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.88] tracking-[-0.05em] text-ivory md:mt-10">
          {props.title || t("newsletter_title")}
       </h2>

        {props.description && (
          <p className="mt-6 max-w-md text-[0.78rem] leading-[2] text-ivory/30">
            {props.description}
        </p>
        )}

        {/* Email + JOIN — one line, no box, no border around whole thing */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className="mt-12 max-w-xl"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-6">
            <label htmlFor="newsletter-email" className="sr-only">
              {props.placeholder || t("newsletter_label")}
          </label>
            <input
              id="newsletter-email"
              type="email"
              placeholder={props.placeholder || t("newsletter_label")}
              className="h-12 w-full border-0 border-b border-ivory/[0.1] bg-transparent pb-2 text-[0.85rem] tracking-[0.05em] text-ivory outline-none transition-all duration-300 placeholder:text-ivory/15 focus:border-gold/45 sm:flex-1"
            />
            <button
              type="submit"
              className="btn-primary h-12 !px-7 !text-[0.52rem] !tracking-[0.28em]"
            >
              <span>{props.buttonText || t("join")</span>
              <ArrowRight />
          </button>
        </div>
      </form>
    </div>
  </section>
  );
}

/* ============================================================
   FINAL CTA — near-empty black scene
   Large statement, one burgundy button, thin champagne line.
   Emptiness is intentional.
   ============================================================ */

export function SectionCTA() {
  const { t } = useTranslation("home");
  return (
    <section className="relative w-full overflow-hidden bg-black">
      <div className="mx-auto max-w-[1600px] px-6 py-32 md:px-10 md:py-44 lg:px-16 lg:py-60">
        {/* Top thin champagne line, far left */}
        <div className="h-px w-16 bg-gold/35" />

        {/* Statement — far from center, asymmetric */}
        <div className="mt-20 grid grid-cols-1 gap-12 lg:mt-28 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-2" />
          <h2 className="font-display text-[clamp(2.4rem,5.6vw,5rem)] leading-[0.95] tracking-[-0.045em] text-ivory lg:col-span-8">
            {t("cta_title")}
        </h2>
      </div>

        {/* CTA — offset right */}
        <div className="mt-16 flex justify-end lg:mt-20">
          <Link
            href="/shop"
            className="btn-primary h-12 px-9"
          >
            <span>{t("cta_button")</span>
            <ArrowRight />
        </Link>
      </div>

        {/* Tiny bottom marker */}
        <div className="mt-32 flex items-center justify-center gap-3 lg:mt-44">
          <span className="h-px w-12 bg-ivory/[0.1]" />
          <span className="label-utility tracking-[0.5em] text-ivory/20">
            {t("cta_marker")}
        </span>
          <span className="h-px w-12 bg-ivory/[0.1]" />
      </div>
    </div>
  </section>
  );
}
