import { Suspense } from "react";
import { ProductFiltersSync } from "@/components/ProductFiltersWrapper";
import { loadTranslations, t, getLanguage } from "@/lib/translations";
import { getCategories } from "@/lib/db";
import { loadProducts } from "@/lib/data";
import { getLandingCopy } from "@/lib/landing-copy";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const lang = await getLanguage();
  const [translations, commonTranslations] = await Promise.all([
    loadTranslations("shop"),
    loadTranslations("common"),
  ]);

  const [categories, products] = await Promise.all([
    getCategories(),
    loadProducts(),
  ]);
  const categoriesData = categories.map(c => ({ slug: c.slug, name: c.name }));
  const copy = getLandingCopy(lang);

  return (
    <div className="bg-black">
      <section className="relative overflow-hidden border-b border-gold/[0.16] bg-surface">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_0%,rgba(214,179,90,0.09),transparent_36%)]" />
        <div className="storefront-container storefront-section relative">
          <p className="storefront-eyebrow">
            <span className="h-px w-9 bg-gold" />
            {copy.shop.eyebrow}
          </p>

          <div className="mt-6 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="storefront-page-title">
                {copy.shop.title}
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-[1.85] text-white/58 sm:text-[0.95rem]">
                {copy.shop.description}
              </p>
            </div>

            <p className="rounded-full border border-gold/[0.16] bg-black/30 px-4 py-2 text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-white/55">
              {products.length} {products.length === 1 ? t(translations, "drink_unit", lang) : t(translations, "drink_unit_plural", lang)}
            </p>
          </div>
        </div>
      </section>

      <section className="relative">
        <div className="storefront-container py-12 md:py-16 lg:py-20">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-32">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/[0.06] border-t-gold/40" />
                  <p className="label-utility tracking-[0.4em] text-white/30">
                    {t(translations, "loading_collection", lang)}
                  </p>
                </div>
              </div>
            }
          >
            <ProductFiltersSync categories={categoriesData} products={products} commonTranslations={commonTranslations} />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
