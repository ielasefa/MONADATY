import Link from "next/link";
import { loadTranslations, t, getLanguage } from "@/lib/translations";

/* ============================================================
   ABOUT PAGE — premium luxury editorial
   Complete redesign with elegant hero, brand story, values, experience
   ============================================================ */
export default async function AboutPage() {
  const lang = await getLanguage();
  const translations = await loadTranslations("about");

  return (
    <div className="bg-black">
      {/* ═══ HERO — two-column premium luxury ═══ */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-[1600px] px-6 pb-16 pt-28 md:px-10 md:pb-28 md:pt-44 lg:px-16 lg:pb-36 lg:pt-60">
          <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-24">
            {/* Left — editorial headline */}
            <div className="space-y-10">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-gold/25" />
                <span className="label-utility tracking-[0.55em] text-gold/30">
                  {t(translations, "our_story", lang)}
                </span>
              </div>

              <h1 className="font-display text-[clamp(2.25rem,4.5vw,4.25rem)] leading-[0.9] tracking-[-0.04em] text-ivory">
                {t(translations, "about_hero_title", lang)}
              </h1>

              <p className="max-w-lg text-[0.88rem] leading-[2.1] text-ivory/28">
                {t(translations, "about_hero_desc", lang)}
              </p>

              <Link
                href="/shop"
                className="btn-primary inline-flex"
              >
                {t(translations, "explore_collection_cta", lang)}
              </Link>
            </div>

            {/* Right — premium brand image card */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-black-soft shadow-luxury-hover lg:aspect-[5/4]">
              <div className="absolute inset-0 bg-gradient-to-br from-gold/[0.04] to-transparent" />
              <div className="absolute inset-0 flex items-end justify-start p-10">
                <div className="space-y-4">
                  <span className="block label-utility tracking-[0.55em] text-ivory/15">
                    {t(translations, "locations_marker", lang)}
                  </span>
                  <span className="block label-utility text-[0.42rem] tracking-[0.42em] text-ivory/12">
                    {t(translations, "year_range", lang)}
                  </span>
                </div>
              </div>
              <div className="absolute right-10 top-10">
                <span className="font-display text-[3.5rem] font-light leading-none tracking-[-0.04em] text-ivory/[0.04]">
                  01
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1600px] px-6 lg:px-16">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/12 to-transparent" />
      </div>

      {/* ═══ BRAND STORY — origin + quality ═══ */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-[1600px] px-6 py-28 md:px-10 md:py-40 lg:px-16 lg:py-52">
          {/* Origin */}
          <div className="grid gap-16 md:grid-cols-12 md:items-start md:gap-20 lg:gap-28">
            <div className="md:col-span-7">
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-black-soft shadow-luxury-hover md:aspect-[16/11]">
                <div className="absolute inset-0 flex items-end justify-start p-10">
                  <div className="space-y-4">
                    <span className="block label-utility tracking-[0.55em] text-ivory/12">
                      {t(translations, "casablanca_city", lang)}
                    </span>
                    <span className="block label-utility text-[0.42rem] tracking-[0.42em] text-ivory/10">
                      {t(translations, "atlantic_coast", lang)}
                    </span>
                  </div>
                </div>
                <div className="absolute right-10 top-10">
                  <span className="font-display text-[3.5rem] font-light leading-none tracking-[-0.04em] text-ivory/[0.04]">
                    02
                  </span>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 space-y-8 lg:pt-16">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-gold/25" />
                <span className="label-utility tracking-[0.55em] text-gold/35">
                  {t(translations, "crafted_with_precision", lang)}
                </span>
              </div>

              <h2 className="font-display text-[clamp(2rem,4.5vw,3.75rem)] leading-[0.92] tracking-[-0.04em] text-ivory">
                {t(translations, "origin_title", lang)}
              </h2>

              <p className="max-w-lg text-[0.875rem] leading-[2.3] text-ivory/22">
                {t(translations, "origin_desc", lang)}
              </p>

              <div className="pt-4 flex items-center gap-3">
                <span className="h-px w-10 bg-gold/25" />
                <span className="label-utility tracking-[0.4em] text-ivory/16">
                  {t(translations, "craft_origin", lang)}
                </span>
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="my-28 md:my-36 lg:my-44">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/10 to-transparent" />
          </div>

          {/* Quality */}
          <div className="grid gap-16 md:grid-cols-12 md:items-start md:gap-20 lg:gap-28">
            <div className="md:col-span-5 md:order-2 space-y-8 lg:pt-16">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-gold/25" />
                <span className="label-utility tracking-[0.55em] text-gold/35">
                  {t(translations, "delivered_with_care", lang)}
                </span>
              </div>

              <h2 className="font-display text-[clamp(2rem,4.5vw,3.75rem)] leading-[0.92] tracking-[-0.04em] text-ivory">
                {t(translations, "quality_title", lang)}
              </h2>

              <p className="max-w-lg text-[0.875rem] leading-[2.3] text-ivory/22">
                {t(translations, "quality_desc", lang)}
              </p>

              <div className="pt-4 flex items-center gap-3">
                <span className="h-px w-10 bg-gold/25" />
                <span className="label-utility tracking-[0.4em] text-ivory/16">
                  {t(translations, "atlas_sahara_medina", lang)}
                </span>
              </div>
            </div>

            <div className="md:col-span-7 md:order-1">
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-black-soft shadow-luxury-hover md:aspect-[16/11]">
                <div className="absolute inset-0 flex items-end justify-start p-10">
                  <div className="space-y-4">
                    <span className="block label-utility tracking-[0.55em] text-ivory/12">
                      {t(translations, "berrechid_city", lang)}
                    </span>
                    <span className="block label-utility text-[0.42rem] tracking-[0.42em] text-ivory/10">
                      {t(translations, "the_plain", lang)}
                    </span>
                  </div>
                </div>
                <div className="absolute right-10 top-10">
                  <span className="font-display text-[3.5rem] font-light leading-none tracking-[-0.04em] text-ivory/[0.04]">
                    03
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1600px] px-6 lg:px-16">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/12 to-transparent" />
      </div>

      {/* ═══ VALUES — premium icon cards ═══ */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-[1600px] px-6 py-28 lg:px-16 lg:py-52">
          <div className="mb-20 md:mb-28 space-y-6">
            <p className="label-utility tracking-[0.55em] text-gold/35">
              {t(translations, "values_title", lang)}
            </p>
            <h2 className="max-w-3xl font-display text-[clamp(2rem,4.5vw,3.5rem)] leading-[0.93] tracking-[-0.04em] text-ivory">
              {t(translations, "values_subtitle", lang)}
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                key: "value_1",
                icon: (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                ),
              },
              {
                key: "value_2",
                icon: (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                ),
              },
              {
                key: "value_3",
                icon: (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M12 2v20" />
                    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                  </svg>
                ),
              },
              {
                key: "value_4",
                icon: (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <circle cx="12" cy="5" r="3" />
                    <path d="M12 12v7" />
                    <path d="M8 22h8" />
                  </svg>
                ),
              },
            ].map(({ key, icon }) => (
              <div
                key={key}
                className="group rounded-2xl border border-gold/[0.06] bg-black-soft p-8 transition-all duration-500 ease-premium hover:border-gold/[0.18] hover:-translate-y-0.5 hover:shadow-luxury"
              >
                <div className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gold/[0.05] text-gold/45 transition-colors duration-300 group-hover:bg-gold/[0.1] group-hover:text-gold/65">
                  {icon}
                </div>
                <h3 className="font-display text-lg leading-[1.1] tracking-[-0.015em] text-ivory">
                  {t(translations, `${key}_title`, lang)}
                </h3>
                <p className="mt-4 text-[0.8rem] leading-[2] text-ivory/20">
                  {t(translations, `${key}_desc`, lang)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1600px] px-6 lg:px-16">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/12 to-transparent" />
      </div>

      {/* ═══ EXPERIENCE — split layout ═══ */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-[1600px] px-6 py-28 lg:px-16 lg:py-52">
          <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
            {/* Image */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-black-soft shadow-luxury-hover lg:aspect-square">
              <div className="absolute inset-0 bg-gradient-to-bl from-gold/[0.02] to-transparent" />
              <div className="absolute inset-0 flex items-end justify-start p-10">
                <div className="space-y-4">
                  <span className="block label-utility tracking-[0.55em] text-gold/25">
                    {t(translations, "locations_marker", lang)}
                  </span>
                  <span className="block label-utility text-[0.42rem] tracking-[0.42em] text-ivory/10">
                    {t(translations, "year_range", lang)}
                  </span>
                </div>
              </div>
              <div className="absolute right-10 top-10">
                <span className="font-display text-[3.5rem] font-light leading-none tracking-[-0.04em] text-ivory/[0.04]">
                  04
                </span>
              </div>
            </div>

            {/* Text */}
            <div className="space-y-9">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-gold/25" />
                <span className="label-utility tracking-[0.55em] text-gold/35">
                  {t(translations, "attr_legacy", lang)}
                </span>
              </div>

              <h2 className="font-display text-[clamp(2rem,4vw,3.25rem)] leading-[0.92] tracking-[-0.04em] text-ivory">
                {t(translations, "heritage_title", lang)}
              </h2>

              <p className="max-w-lg text-[0.875rem] leading-[2.3] text-ivory/22">
                {t(translations, "heritage_desc", lang)}
              </p>

              <div className="flex items-center gap-3 pt-2">
                <span className="h-px w-10 bg-gold/25" />
                <span className="label-utility tracking-[0.4em] text-ivory/16">
                  {t(translations, "craft_origin", lang)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1600px] px-6 lg:px-16">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/12 to-transparent" />
      </div>

      {/* ═══ CLOSING CTA ═══ */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-[1600px] px-6 py-32 lg:px-16 lg:py-56">
          <div className="mx-auto max-w-2xl text-center space-y-12">
            <p className="font-display text-[clamp(1.5rem,2.5vw,2rem)] leading-[1.45] tracking-[-0.025em] text-ivory/50">
              {t(translations, "closing", lang)}
            </p>

            <div className="flex items-center justify-center gap-4">
              <span className="h-px w-12 bg-gold/20" />
              <Link
                href="/shop"
                className="btn-link text-[0.55rem] group"
              >
                {t(translations, "explore_collection_cta", lang)}
                <span className="transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180">
                  →
                </span>
              </Link>
              <span className="h-px w-12 bg-gold/20" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}