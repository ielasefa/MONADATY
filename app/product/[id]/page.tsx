import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductOrderForm } from "@/components/ProductOrderForm";
import { RelatedProducts } from "@/components/RelatedProducts";
import { getProductById, getRelatedProducts, getProducts } from "@/lib/db";
import { loadTranslations, t, getLanguage } from "@/lib/translations";

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

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const lang = await getLanguage();
  const translations = await loadTranslations("products");
  const relatedProducts = await getRelatedProducts(product.id, product.category);

  const hasIngredients = Boolean(product.ingredients && product.ingredients.trim().length > 0);
  const hasNutrition = Boolean(product.nutrition && product.nutrition.trim().length > 0);

  return (
    <div className="min-h-screen bg-black">
      {/* Breadcrumb — minimal editorial */}
      <div className="container-premium pt-8 md:pt-10">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 label-utility tracking-[0.32em] text-ivory/12">
          <Link href="/shop" className="transition-colors hover:text-ivory/35">
            {t(translations, "back_to_drinks", lang)}
         </Link>
          <span aria-hidden="true" className="text-ivory/6">/</span>
          <span className="text-ivory/15">{product.category}</span>
          <span aria-hidden="true" className="text-ivory/6">/</span>
          <span className="text-ivory/25">{product.name}</span>
       </nav>
     </div>

      {/* Hero — asymmetric gallery / sticky info */}
      <section className="container-premium py-12 md:py-20 lg:py-28">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr] lg:items-start lg:gap-16 xl:gap-24">
          {/* Gallery — large floating product */}
          <div className="relative">
            <ProductGallery
              name={product.name}
              gallery={product.gallery}
              image={product.image}
              visual={product.visual as "can" | "bottle" | "glass" | undefined}
              accent={product.accent}
            />
         </div>

          {/* Sticky info column */}
          <div className="lg:sticky lg:top-32 space-y-10 lg:pt-8">
            {/* Eyebrow — category */}
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-gold/30" />
              <p className="label-utility tracking-[0.55em] text-gold/35">
                {product.category}
             </p>
           </div>

            {/* Editorial number indicator */}
            <div className="flex items-center gap-4">
              <span className="label-utility tracking-[0.4em] text-ivory/12">
                N° {String(product.id).slice(-3).padStart(3, "0")}
             </span>
              <span className="h-px w-8 bg-ivory/10" />
           </div>

            {/* Product name — massive display */}
            <h1 className="font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.88] tracking-[-0.035em] text-ivory">
              {product.name}
           </h1>

            {/* Price — champagne gold */}
            <div className="flex items-baseline gap-4">
              <p className="font-display text-2xl font-light text-gold md:text-3xl">
                {product.price}
             </p>
           </div>

            {/* Thin gold divider */}
            <div className="h-px w-16 bg-gold/20" />

            {product.description && (
              <p className="max-w-md text-[0.85rem] leading-[2] text-ivory/25">
                {product.description}
             </p>
            )}

            {/* Order form — sticky CTAs */}
            <div className="pt-4">
              <ProductOrderForm product={product} />
           </div>

            {/* Trust signature — editorial micro-mark */}
            <div className="pt-6 flex items-center gap-3">
              <span className="h-px w-10 bg-ivory/[0.04]" />
              <span className="label-utility tracking-[0.4em] text-ivory/12">
                CRAFTED IN MOROCCO · 2024
             </span>
           </div>
         </div>
       </div>
     </section>

      {/* Editorial section divider */}
      {(hasIngredients || hasNutrition) && (
        <section className="container-premium py-16 md:py-24 lg:py-32">
          <div className="space-y-12">
            {/* Section eyebrow */}
            <div className="flex items-baseline justify-between">
              <p className="label-utility tracking-[0.55em] text-gold/35">
                {t(translations, "ingredients", lang)}
             </p>
              <span className="font-display text-[3rem] font-light leading-none tracking-[-0.04em] text-ivory/[0.04] md:text-[4rem]">
                02
             </span>
           </div>
            <div className="h-px w-full bg-ivory/[0.03]" />

            <div className="grid gap-12 md:grid-cols-2 lg:gap-20">
              {hasIngredients && (
                <div className="space-y-5">
                  <p className="label-utility tracking-[0.4em] text-ivory/18">
                    {t(translations, "ingredients", lang)}
                 </p>
                  <p className="text-[0.88rem] leading-[2] text-ivory/25">
                    {product.ingredients}
                 </p>
               </div>
              )}
              {hasNutrition && (
                <div className="space-y-5">
                  <p className="label-utility tracking-[0.4em] text-ivory/18">
                    {t(translations, "nutrition", lang)}
                 </p>
                  <p className="text-[0.88rem] leading-[2] text-ivory/25">
                    {product.nutrition}
                 </p>
               </div>
              )}
           </div>
         </div>
       </section>
      )}

      {/* Related products — editorial divider */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-ivory/[0.03]">
          <div className="container-premium py-16 md:py-24 lg:py-32">
            <RelatedProducts products={relatedProducts} />
         </div>
       </section>
      )}
   </div>
  );
}
