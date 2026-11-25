import { Suspense } from "react";
import { ProductFiltersSync } from "@/components/ProductFiltersWrapper";
import { loadTranslations, t, getLanguage } from "@/lib/translations";
import { getCategories } from "@/lib/db";
import { loadProducts } from "@/lib/data";
import { getLandingCopy } from "@/lib/landing-copy";
import { FadeIn } from "@/components/motion/FadeIn";
import "./shop.css";

export const dynamic = "force-dynamic";

export const metadata = { title: "Boissons en gros" };

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
  const unitKey = products.length === 1 ? "drink_unit" : "drink_unit_plural";
  const translatedUnit = t(translations, unitKey, lang);
  const unitFallbacks = {
    fr: { single: "boisson", plural: "boissons" },
    en: { single: "drink", plural: "drinks" },
    ar: { single: "مشروب", plural: "مشروبات" },
  }[lang];
  const unitFallback = products.length === 1 ? unitFallbacks.single : unitFallbacks.plural;
  const unitLabel = translatedUnit === unitKey ? unitFallback : translatedUnit;

  return (
    <div className="market-catalogue bg-canvas">
      <section className="catalogue-intro" aria-labelledby="catalogue-title">
        <div className="storefront-container">
          <FadeIn y={10} duration={0.4} className="catalogue-intro-layout">
            <div className="catalogue-intro-copy">
              <p className="storefront-eyebrow"><span />{copy.shop.eyebrow}</p>
              <h1 id="catalogue-title" className="catalogue-title">{copy.shop.title}</h1>
              <p className="catalogue-description">{copy.shop.description}</p>
            </div>
            <p className="catalogue-count">
              <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"><path d="m12 3 9 5-9 5-9-5 9-5ZM3 8v9l9 5 9-5V8M12 13v9M7 5.8l9 5" /></svg>
              <span>{products.length} {unitLabel}</span>
            </p>
          </FadeIn>
        </div>
      </section>
      <section className="relative">
        <div className="storefront-container catalogue-results">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-32">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-line border-t-gold/40" />
                  <p className="label-utility tracking-[0.08em] text-secondary">
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
