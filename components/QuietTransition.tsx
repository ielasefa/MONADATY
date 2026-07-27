"use client";

import { useTranslation } from "@/hooks/useTranslation";

/* ============================================================
   QUIET TRANSITION SCENE
   Almost empty black space. Tiny champagne text + one statement
   far from center. Creates breathing room after the hero.
   ============================================================ */

export function QuietTransition() {
  const { t } = useTranslation("home");
  return (
    <section className="relative w-full overflow-hidden bg-black">
      {/* Very tall, lots of vertical air */}
      <div className="mx-auto max-w-[1600px] px-6 py-32 md:px-10 md:py-44 lg:px-16 lg:py-60">
        {/* Tiny chapter label, far left */}
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-gold/30" />
          <span className="label-utility text-gold/40">
            {t("quiet_chapter")}
          </span>
     </div>

        {/* Statement — far from center, asymmetric placement */}
        <div className="mt-20 grid grid-cols-1 gap-10 md:mt-28 lg:mt-32 lg:grid-cols-12">
          <div className="lg:col-span-2" />
          <h2 className="font-display text-[clamp(2rem,4.6vw,4rem)] leading-[1.05] tracking-[-0.035em] text-ivory/85 lg:col-span-8">
            <span className="block italic text-gold/70">&ldquo</span>
            <span className="block">{t("quiet_statement_1")}</span>
            <span className="block">{t("quiet_statement_2")}</span>
       </h2>
     </div>

        {/* Tiny footer-like marker */}
        <div className="mt-20 flex items-center justify-between md:mt-28 lg:mt-32">
          <span className="label-utility tracking-[0.5em] text-ivory/15">
            {t("quiet_marker_left")}
       </span>
          <span className="h-px flex-1 bg-ivory/[0.06] mx-6" />
          <span className="label-utility tracking-[0.5em] text-ivory/15">
            {t("quiet_marker_right")}
       </span>
     </div>
   </div>
 </section>
  );
}
