import Link from "next/link";
import { CollectionArtwork } from "@/components/CollectionArtwork";
import { loadCollections, loadProducts } from "@/lib/data";
import { loadTranslations, t, getLanguage } from "@/lib/translations";

export const dynamic = "force-dynamic";

/* ============================================================
   COLLECTIONS PAGE — campaign-driven
   Large cinematic featured collection (left)
   2 smaller collections stacked (right)
   ============================================================ */

export default async function CollectionsPage() {
  const lang = await getLanguage();
  const translations = await loadTranslations("collections");
  const [collections, products] = await Promise.all([
    loadCollections(),
    loadProducts(),
  ]);
  const counts = Object.fromEntries(
    collections.map((c) => [
      c.slug,
      products.filter((p) => p.collection === c.slug).length,
    ])
  );

  // Get the 3 specific collections for the showcase: Cappy (large left), Hawai + Coca-Cola (right stacked)
  const cappyCollection = collections.find((c) => c.slug === "cappy-collection");
  const hawaiCollection = collections.find((c) => c.slug === "hawai-collection");
  const cocaColaCollection = collections.find((c) => c.slug === "coca-cola-collection");

  // Fallback to first 3 if not found
  const featuredCollection = cappyCollection ?? collections[0];
  const rightCollections = [hawaiCollection, cocaColaCollection].filter(
    (c): c is NonNullable<typeof hawaiCollection> => c != null
  );

  return (
    <div className="bg-black">
      {/* ═══ HERO — editorial headline ═══ */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-[1600px] px-6 py-28 md:px-10 md:py-40 lg:px-16 lg:py-56">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-gold/30" />
            <span className="label-utility tracking-[0.55em] text-gold/35">
              {t(translations, "collections_label", lang)}
        </span>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-2">
            <span className="font-display text-[4.5rem] font-light leading-none tracking-[-0.04em] text-ivory/[0.04] md:text-[6rem]">
              00
         </span>
      </div>

          <div className="lg:col-span-9">
            <h1 className="font-display text-[clamp(2.5rem,7vw,7rem)] leading-[0.85] tracking-[-0.05em] text-ivory">
              {t(translations, "curated_collections_title", lang)}
        </h1>
            <p className="mt-10 max-w-2xl text-[0.92rem] leading-[1.95] text-ivory/25">
              {t(translations, "explore_collections_desc", lang)}
        </p>
         </div>
        </div>

        {/* Bottom markers */}
        <div className="mt-20 flex items-center justify-between md:mt-28 lg:mt-36">
          <span className="label-utility tracking-[0.5em] text-ivory/12">
            {String(collections.length).padStart(2, "0")} {t(translations, "collections_count_label", lang)}
     </span>
          <span className="hidden h-px flex-1 mx-6 bg-ivory/[0.04] md:block" />
          <span className="label-utility tracking-[0.5em] text-ivory/12">
            {t(translations, "established_label", lang)}
     </span>
       </div>
       </div>
     </section>

      {/* ═══ FEATURED COLLECTION — full-width cinematic ═══ */}
      {featuredCollection && (
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-[1600px] px-6 lg:px-16">
            <Link
              href={`/shop?collection=${featuredCollection.slug}`}
              className="group relative block"
            >
              <div className="relative h-[400px] w-full overflow-hidden md:h-[560px] lg:h-[640px]">
                <CollectionArtwork
                  image={featuredCollection.image}
                  title={featuredCollection.title}
                  accent={featuredCollection.accent}
                  sizes="100vw"
                  className="object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.025]"
                  monogramSize="text-[9rem] md:text-[14rem] lg:text-[18rem]"
                />

                {/* Subtle gradient for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                {/* Editorial index — top right */}
                <div className="absolute right-6 top-6 z-10 hidden md:flex items-center gap-3">
                    <span className="label-utility text-[0.4rem] tracking-[0.4em] text-ivory/30">
                    {t(translations, "editorial_index_label", lang, { num: "01" })}
           </span>
                    <span className="h-px w-8 bg-ivory/15" />
          </div>
        </div>

              {/* Editorial caption — bottom */}
              <div className="absolute inset-x-0 bottom-0 z-10 p-8 md:p-14 lg:p-20">
                <div className="flex items-center gap-3 mb-4">
                <span className="h-px w-8 bg-gold/30" />
                  <span className="label-utility tracking-[0.55em] text-gold/40">
                    {t(translations, "all_collections_title", lang)}
           </span>
         </div>

                <h2 className="font-display text-3xl font-normal leading-[0.92] tracking-[-0.025em] text-ivory md:text-5xl lg:text-6xl">
                  {featuredCollection.title}
          </h2>

                {featuredCollection.description && (
                  <p className="mt-4 max-w-xl text-[0.85rem] leading-[1.9] text-ivory/40">
                    {featuredCollection.description}
          </p>
                )}

                <div className="mt-6 inline-flex items-center gap-2.5 label-utility tracking-[0.3em] text-ivory/45 transition-all duration-300 group-hover:gap-3 group-hover:text-ivory/70">
                  <span>
                    {counts[featuredCollection.slug] != null
                      ? `${counts[featuredCollection.slug]} ${counts[featuredCollection.slug] === 1 ? t(translations, "drink_count", lang) : t(translations, "drink_count_plural", lang)}`
                      : t(translations, "shop_label", lang)}
          </span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
            </span>
               </div>
          </div>
        </Link>
       </div>
     </section>
       )}

      {/* ═══ COLLECTIONS SHOWCASE — 1 large LEFT + 2 small RIGHT ═══ */}
      {(cappyCollection && rightCollections.length > 0) && (
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-[1600px] px-6 py-28 md:px-10 md:py-40 lg:px-16 lg:py-56">
            <div className="flex items-end justify-between gap-8">
              <div>
                <p className="label-utility tracking-[0.55em] text-gold/35">
                  {t(translations, "all_collections_title", lang)}
          </p>
                <h2 className="mt-6 font-display text-[clamp(2rem,5vw,4.5rem)] leading-[0.88] tracking-[-0.045em] text-ivory">
                  {t(translations, "explore_label", lang)}
            </h2>
             </div>

              <div className="hidden md:block">
                  <span className="label-utility tracking-[0.4em] text-ivory/12">
                  {t(translations, "chapter_label", lang, { num: "02" })}
           </span>
            </div>
           </div>

            <div className="mt-6 h-px w-16 bg-gradient-to-r from-gold/40 to-transparent" />

            {/* Main grid: 12 columns — 7 left (large), 5 right (2 stacked) */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-x-8 md:gap-y-12">
              {/* LARGE CARD — LEFT (spans 7 columns) */}
              {cappyCollection && (
                <Link
                  key={cappyCollection.slug}
                  href={`/shop?collection=${cappyCollection.slug}`}
                  className="group block md:col-span-7"
                >
                  <div className="relative overflow-hidden">
                    <span className="absolute left-4 top-4 z-10 font-display text-[3.5rem] font-light leading-none tracking-[-0.02em] text-ivory/[0.04] md:text-[4.5rem]">
                      02
                    </span>

                    <div className="relative aspect-[4/5] overflow-hidden">
                      <CollectionArtwork
                        image={cappyCollection.image}
                        title={cappyCollection.title}
                        accent={cappyCollection.accent}
                        sizes="(min-width: 1024px) 58vw, 100vw"
                        className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.03]"
                        monogramSize="text-[8rem] md:text-[11rem]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
                   </div>
                </div>

                  <div className="mt-6">
                    <h3 className="font-display text-2xl font-normal leading-[0.92] tracking-[-0.02em] text-ivory md:text-3xl lg:text-4xl">
                      {cappyCollection.title}
                </h3>
                    {cappyCollection.description && (
                        <p className="mt-3 max-w-md text-[0.78rem] leading-[1.85] text-ivory/25 line-clamp-2">
                          {cappyCollection.description}
                    </p>
                    )}
                        <div className="mt-4 inline-flex items-center gap-2 label-utility tracking-[0.3em] text-ivory/25 transition-all duration-300 group-hover:gap-2.5 group-hover:text-ivory/45">
                          <span>
                            {counts[cappyCollection.slug] != null
                              ? `${counts[cappyCollection.slug]} ${counts[cappyCollection.slug] === 1 ? t(translations, "drink_count", lang) : t(translations, "drink_count_plural", lang)}`
                              : t(translations, "shop_label", lang)}
                        </span>
                          <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                       </div>
                    </div>
                </Link>
              )}

              {/* SMALL CARDS — RIGHT (spans 5 columns, stacked) */}
              <div className="md:col-span-5 grid grid-cols-1 gap-8">
                {rightCollections.map((col, i) => (
                  <Link
                    key={col.slug}
                    href={`/shop?collection=${col.slug}`}
                    className="group block"
                  >
                    <div className="relative overflow-hidden">
                      <span className="absolute left-3 top-3 z-10 font-display text-[2.5rem] font-light leading-none tracking-[-0.02em] text-ivory/[0.04] md:text-[3.5rem]">
                        {String(i + 3).padStart(2, "0")}
                      </span>

                      <div className="relative aspect-[3/4] overflow-hidden">
                        <CollectionArtwork
                          image={col.image}
                          title={col.title}
                          accent={col.accent}
                          sizes="(min-width: 768px) 28vw, 100vw"
                          className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.03]"
                          monogramSize="text-[5rem] md:text-[7rem]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
                     </div>
                  </div>

                      <div className="mt-4">
                        <h3 className="font-display text-xl font-normal leading-[0.92] tracking-[-0.02em] text-ivory md:text-2xl">
                          {col.title}
                        </h3>
                        {col.description && (
                            <p className="mt-2 max-w-xs text-[0.7rem] leading-[1.85] text-ivory/25 line-clamp-2">
                              {col.description}
                            </p>
                        )}
                            <div className="mt-3 inline-flex items-center gap-2 label-utility tracking-[0.3em] text-ivory/25 transition-all duration-300 group-hover:gap-2 group-hover:text-ivory/45">
                              <span>
                                {counts[col.slug] != null
                                  ? `${counts[col.slug]} ${counts[col.slug] === 1 ? t(translations, "drink_count", lang) : t(translations, "drink_count_plural", lang)}`
                                  : t(translations, "shop_label", lang)}
                            </span>
                              <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                           </div>
                        </div>
                    </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
   </div>
  );
}