import Link from "next/link";
import { categoryLabel } from "@/lib/category-label";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductOrderForm } from "@/components/ProductOrderForm";
import { ProductTabs } from "@/components/ProductTabs";
import { RelatedProducts } from "@/components/RelatedProducts";
import { getProductById, getRelatedProducts } from "@/lib/db";
import { loadTranslations, getLanguage } from "@/lib/translations";
import { FadeIn } from "@/components/motion/FadeIn";
import "../product.css";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

const CONTAINER = "storefront-container";

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const lang = await getLanguage();
  const formatLabels: Record<string, string> = {
    fr: { can: "Canette", bottle: "Bouteille", glass: "Verre" },
    en: { can: "Can", bottle: "Bottle", glass: "Glass" },
    ar: { can: "علبة", bottle: "زجاجة", glass: "كأس" },
  }[lang];
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
  const isOutOfStock = product.available === false || (hasStock && product.stock <= 0);
  const primaryBadge = product.badges?.[0];

  return (
    <div className="market-product-detail bg-canvas">
      {/* Breadcrumb — restrained, generous top rhythm */}
      <div className={`${CONTAINER} product-breadcrumb`}>
        <nav
          aria-label={gt("breadcrumb_aria_label", "Breadcrumb")}
          className="product-breadcrumb-links"
        >
          <Link href="/" className="shrink-0 transition-colors duration-300 hover:text-secondary">
            {gt("home", "Home")}
          </Link>
          <span aria-hidden="true" className="text-secondary">
            /
          </span>
          <Link href="/shop" className="shrink-0 transition-colors duration-300 hover:text-secondary">
            {gt("shop", "Shop")}
          </Link>
          <span aria-hidden="true" className="text-secondary">
            /
          </span>
          <span className="truncate text-secondary">{categoryLabel(product.category, lang)}</span>
          <span aria-hidden="true" className="text-secondary">
            /
          </span>
          <span className="truncate text-secondary" aria-current="page" dir="auto">{product.name}</span>
        </nav>
      </div>

      {/* Hero — gallery 5 / information 7, composed with whitespace */}
      <section className={`${CONTAINER} product-hero`}>
        <div className="product-hero-grid">
          {/* Gallery — clean, never dominates */}
          <FadeIn delay={0.1} y={20} duration={0.6} className="min-w-0">
            <div className="product-gallery-sticky">
              <ProductGallery
                name={product.name}
                gallery={product.gallery}
                image={product.image}
                brand={product.brand}
                category={categoryLabel(product.category, lang)}
                collection={product.collection}
                visual={product.visual as "can" | "bottle" | "glass" | undefined}
                accent={product.accent}
              />
            </div>
          </FadeIn>

          {/* Information — the primary focus, sticky */}
          <div className="product-information min-w-0">
            <div>
{/* Category eyebrow + badge */}
        <FadeIn delay={0.14} y={16} duration={0.6}>
        <div className="product-heading-category flex flex-wrap items-center gap-x-6 gap-y-4">
          <div className="flex items-center gap-4">
            <span className="h-px w-10 bg-gold/60" />
            <p className="text-sm font-medium uppercase tracking-[0.08em] text-accent">
              {categoryLabel(product.category || gt("artisan_collection", "Artisan Collection"), lang)}
            </p>
          </div>
          {primaryBadge && (
            <span className="market-product-badge inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-bold">
              {primaryBadge}
            </span>
          )}
        </div>
        </FadeIn>

        {/* Display title */}
        <FadeIn delay={0.22} y={18} duration={0.62}>
        <h1 className="market-product-title product-detail-title">
          {product.name}
        </h1>
        </FadeIn>

            {/* Rating + stock */}
            <FadeIn delay={0.3} y={14} duration={0.58}>
            <div className="product-stock-line">
              {(hasStock || isOutOfStock) && (
                <p
                  className={`flex items-center gap-3 text-sm font-medium uppercase tracking-[0.08em] ${
                    isOutOfStock ? "text-secondary" : "text-secondary"
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
            </FadeIn>

{/* Luxury pricing block */}
        <FadeIn delay={0.38} y={14} duration={0.58}>
        <div className="product-price-block">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.08em] text-secondary">
                  {loc("price_label", "Prix", "Price", "السعر")}
                </p>
                <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <p className="market-product-price text-[2rem] leading-none tracking-[-0.01em] md:text-[2.5rem]" dir="ltr">
                    {product.price}
                  </p>
                  {hasCompare && (
                    <p className="text-sm font-medium text-secondary line-through" dir="ltr">
                      {product.comparePrice}
                    </p>
                  )}
                </div>
              </div>
            </div>
        </FadeIn>

{/* Description */}
        {product.description && (
          <FadeIn delay={0.46} y={14} duration={0.58}>
            <p className="product-description" dir="auto">
              {product.description}
            </p>
          </FadeIn>
        )}

        {/* Purchase box */}
        <FadeIn delay={0.54} y={14} duration={0.58}>
        <div className="product-purchase">
          <ProductOrderForm product={product} />
        </div>
        </FadeIn>

{/* Product information — premium metadata block */}
            <FadeIn delay={0.62} y={14} duration={0.58}>
            <div className="product-metadata">
              <div className="grid grid-cols-1 gap-y-5 sm:grid-cols-3 sm:gap-x-8">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.08em] text-accent">
                    {gt("category", "CATEGORY")}
                  </p>
                  <p className="mt-2 text-[0.9rem] font-medium text-secondary">
                    {categoryLabel(product.category, lang) || "—"}
                  </p>
                </div>
                <div className="sm:border-s sm:border-line sm:ps-8">
                  <p className="text-sm font-medium uppercase tracking-[0.08em] text-accent">
                    {gt("collection", "COLLECTION")}
                  </p>
                  <p className="mt-2 text-[0.9rem] font-medium text-secondary">
                    {product.collection ? product.collection.replace(/-/g, " ") : "—"}
                  </p>
                </div>
                <div className="sm:border-s sm:border-line sm:ps-8">
                  <p className="text-sm font-medium uppercase tracking-[0.08em] text-accent">
                    {loc("format_label", "Format", "Format", "الشكل")}
                  </p>
                  <p className="mt-2 text-[0.9rem] font-medium text-secondary">
                    {product.visual ? formatLabels[product.visual] : "—"}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-4 border-t border-line pt-5">
                <span className="h-px flex-1 bg-gold/20" />
                <span className="text-center text-sm font-medium uppercase tracking-[0.08em] text-accent">
                  {loc(
                    "retail_service_label",
                    "MONADATY · VOS BOISSONS EN GROS",
                    "MONADATY · WHOLESALE BEVERAGES",
                    "موناداتي · مشروبات بالجملة للمهنيين",
                  )}
                </span>
                <span className="h-px flex-1 bg-gold/20" />
              </div>
            </div>
            </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Details tabs */}
      {(hasIngredients || hasNutrition) && (
        <FadeIn delay={0.2} y={20} duration={0.6}>
          <section className="border-t border-line bg-white/[0.01]">
            <div className={`${CONTAINER} py-20 md:py-24`}>
              <header className="mb-12 md:mb-14">
                <div className="flex items-center gap-4">
                  <span className="h-px w-10 bg-gold/50" />
                  <p className="text-sm font-medium uppercase tracking-[0.08em] text-accent">
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
          <section className="border-t border-line">
            <div className={`${CONTAINER} py-20 md:py-24`}>
              <RelatedProducts products={relatedProducts} />
            </div>
          </section>
        </FadeIn>
      )}
    </div>
  );
}
