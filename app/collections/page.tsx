import Link from "next/link";
import { FadeIn } from "@/components/MotionWrappers";
import { SafeImage } from "@/components/SafeImage";
import { loadCollections, loadProducts } from "@/lib/data";
import { loadTranslations, t, getLanguage } from "@/lib/translations";

export const dynamic = "force-dynamic";

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

  const [featured, ...rest] = collections;

  return (
    <div className="container-premium py-12 md:py-20 lg:py-28">

      {/* Hero — editorial, left-aligned */}
      <FadeIn>
        <section className="mb-20 md:mb-32">
          <p className="label-utility tracking-[0.5em] text-gold/40">
            {t(translations, "collections_label", lang)}
          </p>
          <h1 className="font-display mt-5 text-display-xl leading-[0.86] tracking-[-0.04em] text-ivory sm:text-display-2xl">
            {t(translations, "curated_collections_title", lang)}
          </h1>
          <p className="mt-6 max-w-xl text-[0.82rem] leading-[1.9] text-ivory/30">
            {t(translations, "explore_collections_desc", lang)}
          </p>
          <div className="mt-8 h-px w-10 bg-gold/15" />
        </section>
      </FadeIn>

      {/* Featured collection — full-width cinematic */}
      {featured && (
        <FadeIn delay={0.1}>
          <section className="mb-16 md:mb-24">
            <Link
              href={`/shop?collection=${featured.slug}`}
              className="group relative block overflow-hidden"
            >
              <div className="relative h-[320px] w-full overflow-hidden md:h-[450px] lg:h-[520px]">
                {featured.image ? (
                  <SafeImage
                    src={featured.image}
                    alt={featured.title}
                    fill
                    sizes="100vw"
                    className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
                    fallback={
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-4xl font-semibold tracking-[0.22em] text-ivory/8">MD</span>
                      </div>
                    }
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-4xl font-semibold tracking-[0.22em] text-ivory/8">MD</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              </div>

              <div className="absolute inset-x-0 bottom-0 p-8 md:p-14 lg:p-20">
                <h2 className="font-display text-3xl font-medium text-ivory md:text-4xl lg:text-5xl">
                  {featured.title}
                </h2>
                {featured.description && (
                  <p className="mt-3 max-w-lg text-[0.82rem] leading-[1.8] text-ivory/40">
                    {featured.description}
                  </p>
                )}
                <div className="mt-6 inline-flex items-center gap-2.5 label-utility tracking-[0.3em] text-ivory/50 transition-all duration-300 group-hover:gap-3 group-hover:text-ivory/70">
                  <span>
                    {counts[featured.slug] != null
                      ? `${counts[featured.slug]} ${counts[featured.slug] === 1 ? "drink" : "drinks"}`
                      : t(translations, "shop_label", lang)}
                  </span>
                  <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                    &rarr;
                  </span>
                </div>
              </div>
            </Link>
          </section>
        </FadeIn>
      )}

      {/* Gold divider */}
      {rest.length > 0 && (
        <div className="mx-auto my-20 md:my-28">
          <div className="flex items-center gap-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
            <div className="h-1.5 w-1.5 rotate-45 bg-gold/25" />
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
          </div>
        </div>
      )}

      {/* Remaining collections — asymmetric editorial grid */}
      {rest.length > 0 && (
        <FadeIn delay={0.2}>
          <section>
            <p className="label-utility tracking-[0.5em] text-gold/40">
              {t(translations, "all_collections_title", lang)}
            </p>
            <h2 className="font-display mt-4 text-display-lg leading-[0.88] tracking-[-0.03em] text-ivory md:text-display-xl">
              {t(translations, "explore_label", lang)}
            </h2>
            <div className="mt-6 h-px w-16 bg-gradient-to-r from-gold/40 to-transparent" />

            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-8">
              {rest.map((col, i) => {
                const pairIndex = Math.floor(i / 2);
                const isFirstInPair = i % 2 === 0;
                const isSecondPair = pairIndex % 2 === 1;
                const spanLarge = 7;
                const spanSmall = 5;
                const colSpan = isFirstInPair
                  ? (isSecondPair ? spanSmall : spanLarge)
                  : (isSecondPair ? spanLarge : spanSmall);
                const colSpanClass = colSpan === 7 ? "md:col-span-7" : "md:col-span-5";

                const editorialNum = String(i + 1).padStart(2, "0");

                const aspectRatios = ["aspect-[4/5]", "aspect-[16/11]", "aspect-[3/4]"];
                const aspect = aspectRatios[i % aspectRatios.length];

                return (
                  <Link
                    key={col.slug}
                    href={`/shop?collection=${col.slug}`}
                    className={`group block ${colSpanClass} animate-fade-up stagger-${Math.min(i + 1, 8)}`}
                  >
                    <div className="relative overflow-hidden">
                      <span className="absolute left-4 top-4 z-10 font-display text-[3.5rem] font-light leading-none tracking-[-0.02em] text-ivory/8 md:text-[4.5rem]">
                        {editorialNum}
                      </span>

                      <div className={`relative ${aspect} overflow-hidden`}>
                        {col.image ? (
                          <SafeImage
                            src={col.image}
                            alt={col.title}
                            fill
                            sizes="(min-width: 768px) 58vw, 100vw"
                            className="object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-[1.03]"
                            fallback={
                              <div className="flex h-full w-full items-center justify-center">
                                <span className="text-3xl font-semibold tracking-[0.22em] text-ivory/8">{col.title.charAt(0)}</span>
                              </div>
                            }
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <span className="text-3xl font-semibold tracking-[0.22em] text-ivory/8">{col.title.charAt(0)}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
                      </div>
                    </div>

                    <div className="mt-5">
                      <h3 className="font-display text-xl font-medium tracking-[-0.01em] text-ivory md:text-2xl">{col.title}</h3>
                      {col.description && (
                        <p className="mt-2 text-[0.72rem] leading-[1.8] text-ivory/25 line-clamp-2">{col.description}</p>
                      )}
                      <div className="mt-3 inline-flex items-center gap-2 label-utility text-[0.38rem] tracking-[0.3em] text-ivory/30 transition-all duration-300 group-hover:gap-2.5 group-hover:text-ivory/50">
                        <span>
                          {counts[col.slug] != null
                            ? `${counts[col.slug]} ${counts[col.slug] === 1 ? "drink" : "drinks"}`
                            : t(translations, "shop_label", lang)}
                        </span>
                        <span className="transition-transform duration-300 group-hover:translate-x-0.5">&rarr;</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </FadeIn>
      )}
    </div>
  );
}
