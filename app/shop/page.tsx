import { Suspense } from "react";
import { ProductFiltersSync } from "@/components/ProductFiltersWrapper";
import { loadTranslations, t, getLanguage } from "@/lib/translations";
import { getCategories } from "@/lib/db";
import { loadProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const lang = await getLanguage();
  const translations = await loadTranslations("shop");

  const [categories, products] = await Promise.all([
    getCategories(),
    loadProducts(),
  ]);

  const categoriesData = categories.map(c => ({ slug: c.slug, name: c.name }));

  return (
    <div className="bg-black-soft">
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 lg:px-16 py-16 md:py-20 lg:py-24">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-gold" />
            <span className="label-utility tracking-[0.55em] text-gold/60">
              {t(translations, "the_collection", lang)}
            </span>
          </div>

          <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1
                className="font-display text-[clamp(1.875rem,3.5vw,2.5rem)] leading-[0.95] tracking-[-0.03em] text-white"
              >
                {t(translations, "shop_our_range", lang)}
              </h1>
              <p className="mt-3 max-w-lg text-[0.82rem] leading-[1.85] text-white/55">
                Discover our curated selection of premium Moroccan beverages,
                crafted with exceptional ingredients and delivered to your door.
              </p>
            </div>

            <p className="label-utility tracking-[0.4em] text-white/30">
              {products.length} {products.length === 1 ? "DRINK" : "DRINKS"}
            </p>
          </div>
        </div>
      </section>

      <section className="relative border-t border-white/[0.06]">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 lg:px-16 py-16 md:py-20 lg:py-24">
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
            <ProductFiltersSync categories={categoriesData} products={products} />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
