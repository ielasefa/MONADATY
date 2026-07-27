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
      <div className="container-premium pt-8 md:pt-10">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[0.5rem] font-medium uppercase tracking-[0.16em] text-ivory/15">
          <Link href="/shop" className="transition-colors hover:text-ivory/40">
            {t(translations, "back_to_drinks", lang)}
          </Link>
          <span aria-hidden="true" className="text-ivory/6">/</span>
          <span className="text-ivory/20">{product.category}</span>
          <span aria-hidden="true" className="text-ivory/6">/</span>
          <span className="text-ivory/30">{product.name}</span>
        </nav>
      </div>

      <section className="container-premium py-12 md:py-20 lg:py-28">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-start lg:gap-16 xl:gap-24">
          <div className="relative">
            <ProductGallery
              name={product.name}
              gallery={product.gallery}
              image={product.image}
              visual={product.visual as "can" | "bottle" | "glass" | undefined}
              accent={product.accent}
            />
          </div>

          <div className="lg:sticky lg:top-32 space-y-8 lg:pt-8">
            <div>
              <p className="label-utility text-gold/40">
                {product.category}
              </p>
            </div>

            <h1 className="font-display text-[clamp(2.5rem,5vw,4rem)] leading-[0.88] tracking-[-0.03em] text-ivory">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-4">
              <p className="text-2xl font-semibold text-gold md:text-3xl">
                {product.price}
              </p>
            </div>

            <div className="h-px w-16 bg-gold/15" />

            {product.description && (
              <p className="max-w-md text-[0.85rem] leading-[2] text-ivory/28">
                {product.description}
              </p>
            )}

            <div className="pt-4">
              <ProductOrderForm product={product} />
            </div>
          </div>
        </div>
      </section>

      {(hasIngredients || hasNutrition) && (
        <section className="container-premium py-16 md:py-24 lg:py-32">
          <div className="space-y-10">
            <div className="space-y-4">
              <p className="label-utility text-gold/40">
                {t(translations, "ingredients", lang)}
              </p>
              <div className="h-px w-full bg-ivory/[0.04]" />
            </div>

            <div className="grid gap-10 md:grid-cols-2">
              {hasIngredients && (
                <div className="space-y-4">
                  <p className="text-[0.45rem] font-semibold uppercase tracking-[0.22em] text-ivory/25">
                    {t(translations, "ingredients", lang)}
                  </p>
                  <p className="text-[0.82rem] leading-[2] text-ivory/28">
                    {product.ingredients}
                  </p>
                </div>
              )}
              {hasNutrition && (
                <div className="space-y-4">
                  <p className="text-[0.45rem] font-semibold uppercase tracking-[0.22em] text-ivory/25">
                    {t(translations, "nutrition", lang)}
                  </p>
                  <p className="text-[0.82rem] leading-[2] text-ivory/28">
                    {product.nutrition}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {relatedProducts.length > 0 && (
        <section className="container-premium py-16 md:py-24 lg:py-32 border-t border-ivory/[0.04]">
          <RelatedProducts products={relatedProducts} />
        </section>
      )}
    </div>
  );
}
