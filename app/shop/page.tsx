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
    <div className="mx-auto max-w-[1600px] px-6 md:px-10 lg:px-16 py-10 md:py-16">
      <header className="mb-16 md:mb-24 animate-fade-in">
        <p className="label-utility text-gold/35">
          {t(translations, "the_collection", lang)}
        </p>
        <h1 className="font-display mt-5 text-display-xl leading-[0.85] tracking-[-0.04em] text-ivory sm:text-display-2xl">
          {t(translations, "shop_our_range", lang)}
        </h1>
        <div className="mt-8 h-px w-10 bg-gold/15" />
      </header>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-40">
            <div className="text-center">
              <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border border-ivory/8 border-t-ivory/25" />
              <p className="mt-3 text-[0.7rem] text-ivory/20">{t(translations, "loading_collection", lang)}</p>
            </div>
          </div>
        }
      >
        <ProductFiltersSync categories={categoriesData} products={products} />
      </Suspense>
    </div>
  );
}
