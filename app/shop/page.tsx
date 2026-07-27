import { Suspense } from "react";
import { ProductFiltersSync } from "@/components/ProductFiltersWrapper";
import { loadTranslations, t, getLanguage } from "@/lib/translations";
import { getCategories } from "@/lib/db";
import { loadProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

/* ============================================================
   SHOP PAGE — editorial catalogue
   Massive title left-aligned
   Numbered chapter indicator
   Clean product grid below
   ============================================================ */

export default async function ShopPage() {
  const lang = await getLanguage();
  const translations = await loadTranslations("shop");

  const [categories, products] = await Promise.all([
    getCategories(),
    loadProducts(),
  ]);

  const categoriesData = categories.map(c => ({ slug: c.slug, name: c.name }));

  return (
    <div className="bg-black">
      {/* Editorial header */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-[1600px] px-6 py-24 md:px-10 md:py-32 lg:px-16 lg:py-40">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-gold/30" />
            <span className="label-utility tracking-[0.55em] text-gold/40">
              {t(translations, "the_collection", lang)}
        </span>
      </div>

          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-2">
              <span className="font-display text-[4.5rem] font-light leading-none tracking-[-0.04em] text-ivory/[0.06] md:text-[6rem]">
                COLLECTION
          </span>
        </div>

            <div className="lg:col-span-9">
              <h1 className="font-display text-[clamp(2.5rem,6.5vw,6.5rem)] leading-[0.85] tracking-[-0.05em] text-ivory">
                {t(translations, "shop_our_range", lang)}
          </h1>
        </div>
      </div>

          {/* Bottom markers — count + chapter */}
          <div className="mt-16 flex items-center justify-between md:mt-20 lg:mt-24">
            <span className="label-utility tracking-[0.4em] text-ivory/15">
              {products.length} {products.length === 1 ? "drink" : "drinks"}
        </span>
            <span className="hidden h-px flex-1 mx-6 bg-ivory/[0.06] md:block" />
            <span className="label-utility tracking-[0.4em] text-ivory/15">
              2024 — 2026
        </span>
      </div>
    </div>
  </section>

      {/* Products grid with filters */}
      <section className="relative overflow-hidden border-t border-ivory/[0.04]">
        <div className="mx-auto max-w-[1600px] px-6 py-16 md:px-10 md:py-20 lg:px-16 lg:py-24">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-40">
                <div className="text-center">
                  <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border border-ivory/[0.08] border-t-ivory/25" />
                  <p className="mt-3 label-utility tracking-[0.4em] text-ivory/20">
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
