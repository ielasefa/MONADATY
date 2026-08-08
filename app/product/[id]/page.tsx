import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductOrderForm } from "@/components/ProductOrderForm";
import { ProductTabs } from "@/components/ProductTabs";
import { RelatedProducts } from "@/components/RelatedProducts";
import { getProductById, getRelatedProducts, getProducts } from "@/lib/db";
import { loadTranslations, getLanguage } from "@/lib/translations";
import { FadeIn } from "@/components/motion/FadeIn";
import { SlideUp } from "@/components/motion/SlideUp";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  try {
    return (await getProducts()).map((product) => ({ id: product.id }));
  } catch {
    return [];
  }
}

const CONTAINER = "mx-auto w-full max-w-[1400px] px-6 sm:px-8 lg:px-12";

const FORMAT_LABELS: Record<string, string> = {
  can: "Can",
  bottle: "Bottle",
  glass: "Glass",
};

function Stars() {
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className="h-3 w-3 text-gold"
        >
          <path d="M12 2l2.9 6.26L21 9.27l-4.5 4.38L17.8 20 12 16.77 6.2 20l1.3-6.35L3 9.27l6.1-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const lang = await getLanguage();
  const [productsTranslations, navbarTranslations, commonTranslations, buttonsTranslations] =
    await Promise.all([
      loadTranslations("products"),
      loadTranslations("navbar"),
      loadTranslations("common"),
      loadTranslations("buttons"),
    ]);
  const translations = {
    ...navbarTranslations,
    ...productsTranslations,
    ...commonTranslations,
    ...buttonsTranslations,
  };
  const relatedProducts = await getRelatedProducts(product.id, product.category, 4);

  // `gt` never renders a raw key: uses the DB translation when present,
  // otherwise the English fallback (some product keys are absent from the DB).
  const gt = (key: string, fallback: string) => {
    const entry = translations[key] as unknown as Record<string, string> | undefined;
    if (entry) {
      const value = entry[lang] || entry.fr || fallback;
      if (value && value.trim()) return value;
    }
    return fallback;
  };

  // `loc` provides full fr/en/ar fallbacks for strings missing from the DB.
  const loc = (key: string, fr: string, en: string, ar: string) => {
    const entry = translations[key] as unknown as Record<string, string> | undefined;
    if (entry) {
      const value = entry[lang] || entry.fr || en;
      if (value && value.trim()) return value;
    }
    return lang === "fr" ? fr : lang === "ar" ? ar : en;
  };

  const hasIngredients = Boolean(product.ingredients && product.ingredients.trim().length > 0);
  const hasNutrition = Boolean(product.nutrition && product.nutrition.trim().length > 0);
  const hasCompare = Boolean(
    product.comparePrice &&
      product.comparePrice.trim().length > 0 &&
      product.comparePrice !== product.price,
  );
  const hasStock = typeof product.stock === "number";
  const isOutOfStock = hasStock && product.stock <= 0;
  const primaryBadge = product.badges?.[0];

  return (
    <div className="bg-[#0B0B0A]">
      {/* Breadcrumb — restrained, generous top rhythm */}
      <div className={`${CONTAINER} pt-10 md:pt-16`}>
        <nav
          aria-label={gt("breadcrumb_aria_label", "Breadcrumb")}
          className="flex items-center gap-3 overflow-hidden text-[0.6rem] font-medium uppercase tracking-[0.24em] text-white/30"
        >
          <Link href="/" className="shrink-0 transition-colors duration-300 hover:text-white/80">
            {gt("home", "Home")}
          </Link>
          <span aria-hidden="true" className="text-white/15">
            /
          </span>
          <Link href="/shop" className="shrink-0 transition-colors duration-300 hover:text-white/80">
            {gt("shop", "Shop")}
          </Link>
          <span aria-hidden="true" className="text-white/15">
            /
          </span>
          <span className="truncate text-white/45">{product.category}</span>
          <span aria-hidden="true" className="text-white/15">
            /
          </span>
          <span className="truncate text-white/70">{product.name}</span>
        </nav>
      </div>

      {/* Hero — gallery 5 / information 7, composed with whitespace */}
      <section className={`${CONTAINER} pb-24 pt-8 md:pb-32 md:pt-12`}>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14 xl:gap-20">
          {/* Gallery — clean, never dominates */}
          <FadeIn delay={0.1} y={20} duration={0.6}>
            <div className="lg:col-span-5 mt-4 lg:mt-6">
              <ProductGallery
                name={product.name}
                gallery={product.gallery}
                image={product.image}
                visual={product.visual as "can" | "bottle" | "glass" | undefined}
                accent={product.accent}
              />
            </div>
          </FadeIn>

          {/* Information — the primary focus, sticky */}
          <SlideUp delay={0.15} y={20} duration={0.7}>
            <div className="lg:col-span-7 lg:sticky lg:top-24 lg:self-start lg:pt-2">
{/* Category eyebrow + badge */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <div className="flex items-center gap-4">
            <span className="h-px w-10 bg-gold/60" />
            <p className="text-[0.68rem] font-medium uppercase tracking-[0.3em] text-gold">
              {product.category || gt("artisan_collection", "Artisan Collection")}
            </p>
          </div>
          {primaryBadge && (
            <span className="inline-flex items-center rounded-full border border-white/10 px-3.5 py-1.5 text-[0.58rem] font-medium uppercase tracking-[0.2em] text-white/55">
              {primaryBadge}
            </span>
          )}
        </div>

        {/* Display title */}
        <h1 className="mt-4 max-w-[20ch] font-display text-4xl leading-[1.02] tracking-[-0.01em] text-white sm:text-5xl lg:text-[3.4rem]">
          {product.name}
        </h1>

            {/* Rating + stock */}
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Stars />
              {hasStock && (
                <p
                  className={`flex items-center gap-3 text-[0.62rem] font-medium uppercase tracking-[0.2em] ${
                    isOutOfStock ? "text-white/35" : "text-white/50"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 rounded-full ${
                      isOutOfStock ? "bg-white/20" : "bg-gold"
                    }`}
                  />
                  {isOutOfStock ? gt("out_of_stock", "Out of stock") : gt("in_stock", "In stock")}
                </p>
              )}
            </div>

{/* Luxury pricing block */}
        <div className="mt-5 flex flex-wrap items-end justify-between gap-6 border-y border-white/[0.08] py-8">
              <div>
                <p className="text-[0.6rem] font-medium uppercase tracking-[0.26em] text-white/35">
                  {loc("price_label", "Prix", "Price", "السعر")}
                </p>
                <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <p className="font-display text-[2rem] leading-none tracking-[-0.01em] text-gold md:text-[2.5rem]">
                    {product.price}
                  </p>
                  {hasCompare && (
                    <p className="text-sm font-medium text-white/30 line-through">
                      {product.comparePrice}
                    </p>
                  )}
                </div>
              </div>
            </div>

{/* Description */}
        {product.description && (
          <p className="mt-6 max-w-xl text-[0.95rem] leading-[1.85] text-white/55">
            {product.description}
          </p>
        )}

        {/* Purchase box */}
        <div className="mt-8">
          <ProductOrderForm product={product} />
        </div>

{/* Product information — premium metadata block */}
            <div className="mt-10 border-t border-gold/15 pt-10">
              <div className="grid grid-cols-1 gap-y-5 sm:grid-cols-3 sm:gap-x-8">
                <div>
                  <p className="text-[0.55rem] font-medium uppercase tracking-[0.3em] text-gold">
                    {gt("category", "CATEGORY")}
                  </p>
                  <p className="mt-2 text-[0.9rem] font-medium text-white/90">
                    {product.category || "—"}
                  </p>
                </div>
                <div className="sm:border-l sm:border-white/[0.08] sm:pl-8">
                  <p className="text-[0.55rem] font-medium uppercase tracking-[0.3em] text-gold">
                    {gt("collection", "COLLECTION")}
                  </p>
                  <p className="mt-2 text-[0.9rem] font-medium text-white/90">
                    {product.collection ? product.collection.replace(/-/g, " ") : "—"}
                  </p>
                </div>
                <div className="sm:border-l sm:border-white/[0.08] sm:pl-8">
                  <p className="text-[0.55rem] font-medium uppercase tracking-[0.3em] text-gold">
                    {gt("format_label", "FORMAT")}
                  </p>
                  <p className="mt-2 text-[0.9rem] font-medium text-white/90">
                    {product.visual ? FORMAT_LABELS[product.visual] : "—"}
                  </p>
                </div>
              </div>

              {/* Fabriqué au Maroc — centered, gold, premium label */}
              <div className="mt-8 flex items-center gap-4 border-t border-gold/15 pt-8">
                <span className="h-px flex-1 bg-gold/20" />
                <span className="text-[0.55rem] font-medium uppercase tracking-[0.35em] text-gold/80">
                  {gt("crafted_in_morocco_label", "FABRIQUÉ AU MAROC · 2024")}
                </span>
                <span className="h-px flex-1 bg-gold/20" />
              </div>
            </div>
            </div>
          </SlideUp>
        </div>
      </section>

      {/* Details tabs */}
      {(hasIngredients || hasNutrition) && (
        <FadeIn delay={0.2} y={20} duration={0.6}>
          <section className="border-t border-white/[0.06] bg-white/[0.01]">
            <div className={`${CONTAINER} py-20 md:py-24`}>
              <header className="mb-12 md:mb-14">
                <div className="flex items-center gap-4">
                  <span className="h-px w-10 bg-gold/50" />
                  <p className="text-[0.68rem] font-medium uppercase tracking-[0.3em] text-gold">
                    {gt("product_details", "Product Details")}
                  </p>
                </div>
              </header>
              <ProductTabs
                description={product.description}
                ingredients={product.ingredients}
                nutrition={product.nutrition}
              />
            </div>
          </section>
        </FadeIn>
      )}

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <FadeIn delay={0.25} y={20} duration={0.6}>
          <section className="border-t border-white/[0.06]">
            <div className={`${CONTAINER} py-20 md:py-24`}>
              <RelatedProducts products={relatedProducts} />
            </div>
          </section>
        </FadeIn>
      )}
    </div>
  );
}
