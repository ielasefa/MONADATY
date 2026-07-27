import { FadeIn } from "@/components/MotionWrappers";
import { loadTranslations, t, getLanguage } from "@/lib/translations";

export default async function AboutPage() {
  const lang = await getLanguage();
  const translations = await loadTranslations("about");

  return (
    <div className="container-premium py-40 md:py-56 lg:py-64">

      {/* Hero — editorial headline */}
      <FadeIn>
        <div className="max-w-4xl">
          <p className="inline-flex items-center gap-3 label-utility text-gold/40">
            <span className="h-px w-8 bg-gold/40" />
            {t(translations, "our_story", lang)}
          </p>
          <h1 className="mt-6 font-display text-display-xl leading-[0.85] tracking-[-0.04em] text-ivory sm:text-display-2xl lg:text-display-3xl">
            {t(translations, "about_hero_title", lang)}
          </h1>
          <p className="mt-8 max-w-xl text-[0.85rem] leading-[2] text-ivory/25">
            {t(translations, "about_hero_desc", lang)}
          </p>
        </div>
      </FadeIn>

      <div className="mt-40 lg:mt-56">
        <div className="h-px w-full bg-gold/12" />
      </div>

      {/* Origin — Casablanca editorial scene */}
      <div className="mt-40 grid gap-14 md:grid-cols-2 md:items-center md:gap-20 lg:mt-56">
        <FadeIn>
          <div className="aspect-[4/5] overflow-hidden lg:aspect-[16/11] bg-black">
            <div className="flex h-full w-full items-end justify-start p-8">
              <span className="font-display text-[0.55rem] font-semibold uppercase tracking-[0.5em] text-ivory/12">
                Casablanca / Maroc
              </span>
            </div>
          </div>
        </FadeIn>
        <FadeIn className="space-y-6">
          <p className="inline-flex items-center gap-3 label-utility text-gold/40">
            <span className="h-px w-8 bg-gold/40" />
            {t(translations, "crafted_with_precision", lang)}
          </p>
          <h2 className="font-display text-display-md leading-[0.88] tracking-[-0.03em] text-ivory sm:text-display-lg">
            {t(translations, "origin_title", lang)}
          </h2>
          <p className="text-[0.82rem] leading-[2] text-ivory/25">
            {t(translations, "origin_desc", lang)}
          </p>
        </FadeIn>
      </div>

      <div className="mt-40 lg:mt-56">
        <div className="h-px w-full bg-gold/12" />
      </div>

      {/* Quality — reversed */}
      <div className="mt-40 grid gap-14 md:grid-cols-2 md:items-center md:gap-20 lg:mt-56">
        <FadeIn className="order-2 space-y-6 md:order-1">
          <p className="inline-flex items-center gap-3 label-utility text-gold/40">
            <span className="h-px w-8 bg-gold/40" />
            {t(translations, "delivered_with_care", lang)}
          </p>
          <h2 className="font-display text-display-md leading-[0.88] tracking-[-0.03em] text-ivory sm:text-display-lg">
            {t(translations, "quality_title", lang)}
          </h2>
          <p className="text-[0.82rem] leading-[2] text-ivory/25">
            {t(translations, "quality_desc", lang)}
          </p>
        </FadeIn>
        <FadeIn className="order-1 md:order-2">
          <div className="aspect-[4/5] overflow-hidden lg:aspect-[16/11] bg-black">
            <div className="flex h-full w-full items-end justify-start p-8">
              <span className="font-display text-[0.55rem] font-semibold uppercase tracking-[0.5em] text-ivory/12">
                {t(translations, "craft_origin", lang)}
              </span>
            </div>
          </div>
        </FadeIn>
      </div>

      <div className="mt-40 lg:mt-56">
        <div className="h-px w-full bg-gold/12" />
      </div>

      {/* Values — editorial list */}
      <div className="mt-40 lg:mt-56">
        <FadeIn className="mb-20 max-w-2xl">
          <p className="label-utility text-gold/40">{t(translations, "values_title", lang)}</p>
          <h2 className="mt-4 font-display text-display-md leading-[0.88] tracking-[-0.03em] text-ivory sm:text-display-lg">
            {t(translations, "values_subtitle", lang)}
          </h2>
        </FadeIn>

        <div className="space-y-0">
          {[
            { key: "value_1" },
            { key: "value_2" },
            { key: "value_3" },
            { key: "value_4" },
          ].map(({ key }, i) => (
            <FadeIn key={key}>
              <div className={`grid grid-cols-[auto_1fr] gap-8 py-12 md:gap-14 md:py-16 ${i > 0 ? "border-t border-gold/[0.08]" : ""}`}>
                <span className="text-4xl font-bold tracking-tight text-gold/20 md:text-5xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-lg font-medium text-ivory">{t(translations, `${key}_title`, lang)}</h3>
                  <p className="mt-3 max-w-md text-[0.78rem] leading-[1.9] text-ivory/25">{t(translations, `${key}_desc`, lang)}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      <FadeIn className="mt-40 max-w-2xl lg:mt-56">
        <div className="h-px w-full bg-gold/12" />
        <p className="mt-10 text-[0.85rem] leading-[2] text-ivory/25">
          {t(translations, "closing", lang)}
        </p>
      </FadeIn>
    </div>
  );
}
