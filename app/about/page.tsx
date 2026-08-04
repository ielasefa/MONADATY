import { loadTranslations, t, getLanguage } from "@/lib/translations";

/* ============================================================
   ABOUT PAGE — editorial narrative
   Cinematic hero with massive headline
   Numbered chapters with editorial spacing
   Moroccan identity without clichés
   ============================================================ */

export default async function AboutPage() {
  const lang = await getLanguage();
  const translations = await loadTranslations("about");

return (
<div className="bg-[#171717]">
      {/* ═══ HERO — massive editorial headline ═══ */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-[1600px] px-6 py-32 md:px-10 md:py-44 lg:px-16 lg:py-56">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-gold/30" />
            <span className="label-utility tracking-[0.55em] text-gold/35">
              {t(translations, "our_story", lang)}
            </span>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-2">
              <span className="font-display text-[4.5rem] font-light leading-none tracking-[-0.04em] text-ivory/[0.04] md:text-[6rem]">
                01
              </span>
            </div>

            <div className="lg:col-span-9">
              <h1 className="font-display text-[clamp(2.5rem,6.5vw,6.5rem)] leading-[0.86] tracking-[-0.045em] text-ivory">
                {t(translations, "about_hero_title", lang)}
              </h1>
              <p className="mt-10 max-w-2xl text-[0.92rem] leading-[1.95] text-ivory/28">
                {t(translations, "about_hero_desc", lang)}
              </p>
            </div>
          </div>

          {/* Bottom markers — chapter + city */}
          <div className="mt-20 flex items-center justify-between md:mt-28 lg:mt-36">
            <span className="label-utility tracking-[0.5em] text-ivory/12">
              {t(translations, "locations_marker", lang)}
            </span>
            <span className="hidden h-px flex-1 mx-6 bg-ivory/[0.04] md:block" />
            <span className="label-utility tracking-[0.5em] text-ivory/12">
              {t(translations, "year_range", lang)}
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1600px] px-6 lg:px-16">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
     </div>

      {/* ═══ CHAPTER I — ORIGIN ═══ */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-[1600px] px-6 py-28 md:px-10 md:py-40 lg:px-16 lg:py-56">
          <div className="grid gap-14 md:grid-cols-12 md:items-start md:gap-16 lg:gap-24">
            {/* Image — editorial asymmetric */}
            <div className="md:col-span-7">
              <div className="relative aspect-[4/5] overflow-hidden bg-black-soft md:aspect-[16/11]">
                {/* Editorial image placeholder */}
                <div className="absolute inset-0 flex items-end justify-start p-8">
                  <div className="space-y-3">
                    <span className="block label-utility tracking-[0.55em] text-ivory/12">
                      {t(translations, "casablanca_city", lang)}
               </span>
                    <span className="block label-utility text-[0.4rem] tracking-[0.4em] text-ivory/10">
                      {t(translations, "atlantic_coast", lang)}
               </span>
             </div>
               </div>
                {/* Chapter number overlay */}
                <div className="absolute right-8 top-8">
                  <span className="font-display text-[3rem] font-light leading-none tracking-[-0.04em] text-ivory/[0.04]">
                    01
             </span>
               </div>
             </div>
           </div>

            {/* Text — editorial narrative */}
            <div className="md:col-span-5 space-y-8 lg:pt-12">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-gold/30" />
                <span className="label-utility tracking-[0.55em] text-gold/40">
                  {t(translations, "crafted_with_precision", lang)}
             </span>
           </div>

              <h2 className="font-display text-[clamp(2rem,4.5vw,3.75rem)] leading-[0.92] tracking-[-0.04em] text-ivory">
                {t(translations, "origin_title", lang)}
           </h2>

              <p className="text-[0.85rem] leading-[2] text-ivory/25">
                {t(translations, "origin_desc", lang)}
           </p>

              {/* Micro signature */}
              <div className="pt-4 flex items-center gap-3">
                <span className="h-px w-10 bg-gold/30" />
                <span className="label-utility tracking-[0.4em] text-ivory/18">
                   {t(translations, "craft_origin", lang)}
             </span>
           </div>
         </div>
       </div>
     </div>
   </section>

      <div className="mx-auto max-w-[1600px] px-6 lg:px-16">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
     </div>

      {/* ═══ CHAPTER II — QUALITY ═══ */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-[1600px] px-6 py-28 md:px-10 md:py-40 lg:px-16 lg:py-56">
          <div className="grid gap-14 md:grid-cols-12 md:items-start md:gap-16 lg:gap-24">
            {/* Text — reversed */}
            <div className="md:col-span-5 md:order-2 space-y-8 lg:pt-12">
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-gold/30" />
                <span className="label-utility tracking-[0.55em] text-gold/40">
                  {t(translations, "delivered_with_care", lang)}
             </span>
           </div>

              <h2 className="font-display text-[clamp(2rem,4.5vw,3.75rem)] leading-[0.92] tracking-[-0.04em] text-ivory">
                {t(translations, "quality_title", lang)}
           </h2>

               <p className="text-[0.85rem] leading-[2] text-ivory/25">
                {t(translations, "quality_desc", lang)}
           </p>

              <div className="pt-4 flex items-center gap-3">
                <span className="h-px w-10 bg-gold/30" />
                 <span className="label-utility tracking-[0.4em] text-ivory/18">
                  {t(translations, "atlas_sahara_medina", lang)}
              </span>
            </div>
          </div>

            {/* Image — reversed */}
            <div className="md:col-span-7 md:order-1">
              <div className="relative aspect-[4/5] overflow-hidden bg-black-soft md:aspect-[16/11]">
                <div className="absolute inset-0 flex items-end justify-start p-8">
                  <div className="space-y-3">
                    <span className="block label-utility tracking-[0.55em] text-ivory/12">
                      {t(translations, "berrechid_city", lang)}
               </span>
                    <span className="block label-utility text-[0.4rem] tracking-[0.4em] text-ivory/10">
                      {t(translations, "the_plain", lang)}
               </span>
             </div>
               </div>
                <div className="absolute right-8 top-8">
                  <span className="font-display text-[3rem] font-light leading-none tracking-[-0.04em] text-ivory/[0.04]">
                    02
             </span>
               </div>
             </div>
           </div>
       </div>
     </div>
   </section>

      <div className="mx-auto max-w-[1600px] px-6 lg:px-16">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
     </div>

      {/* ═══ CHAPTER III — PRINCIPLES ═══ */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-[1600px] px-6 py-28 md:px-10 md:py-40 lg:px-16 lg:py-56">
          <div className="mb-20 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16 md:mb-28 lg:mb-36">
            <div className="lg:col-span-2">
               <span className="font-display text-[4.5rem] font-light leading-none tracking-[-0.04em] text-ivory/[0.04] md:text-[6rem]">
                 03
           </span>
           </div>

            <div className="lg:col-span-9">
              <p className="label-utility tracking-[0.55em] text-gold/40">
                {t(translations, "values_title", lang)}
           </p>
              <h2 className="mt-6 font-display text-[clamp(2.5rem,5.5vw,5rem)] leading-[0.88] tracking-[-0.045em] text-ivory">
                {t(translations, "values_subtitle", lang)}
           </h2>
         </div>
       </div>

          {/* Editorial numbered list — generous spacing, no cards */}
          <div className="space-y-0">
            {[
              { key: "value_1", num: "01" },
              { key: "value_2", num: "02" },
              { key: "value_3", num: "03" },
              { key: "value_4", num: "04" },
            ].map(({ key, num }, i) => (
              <div
                key={key}
                className={`grid grid-cols-1 gap-6 py-14 md:gap-12 md:py-20 lg:grid-cols-12 ${i > 0 ? "border-t border-gold/[0.08]" : "border-t border-gold/[0.08]"}`}
              >
                <div className="lg:col-span-2 flex items-baseline gap-4">
                  <span className="font-display text-[3rem] font-light leading-none tracking-[-0.04em] text-gold/25 md:text-[4rem]">
                    {num}
             </span>
                  <span className="hidden lg:block h-px w-12 bg-gold/25" />
           </div>

                <div className="lg:col-span-9 space-y-4">
                  <h3 className="font-display text-2xl leading-[0.95] tracking-[-0.02em] text-ivory md:text-3xl">
                    {t(translations, `${key}_title`, lang)}
             </h3>
                  <p className="max-w-2xl text-[0.85rem] leading-[2] text-ivory/25">
                    {t(translations, `${key}_desc`, lang)}
             </p>
           </div>
         </div>
            ))}
       </div>
     </div>
   </section>

      {/* ═══ CLOSING — editorial punctuation ═══ */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-[1600px] px-6 py-28 md:px-10 md:py-40 lg:px-16 lg:py-56">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/15 to-transparent" />

          <div className="mt-20 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 lg:mt-28">
            <div className="lg:col-span-2">
               <span className="font-display text-[4.5rem] font-light leading-none tracking-[-0.04em] text-ivory/[0.04] md:text-[6rem]">
                 04
           </span>
           </div>

            <div className="lg:col-span-9 max-w-3xl">
              <p className="font-display text-[clamp(1.5rem,2.5vw,2rem)] leading-[1.4] tracking-[-0.025em] text-ivory/60">
                {t(translations, "closing", lang)}
           </p>

              {/* CTA — return to shop */}
              <div className="mt-12 flex items-center gap-4">
                <span className="h-px w-10 bg-gold/30" />
                <a
                  href="/shop"
                  className="btn-link group"
                >
                  {t(translations, "explore_collection_cta", lang)}
                  <span className="transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180">
                    →
             </span>
           </a>
             </div>
         </div>
       </div>
     </div>
   </section>
 </div>
  );
}
