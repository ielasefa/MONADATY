"use client";

import { useTranslation } from "@/hooks/useTranslation";

/* ============================================================
   QUIET TRANSITION SCENE
   Almost empty black space. Tiny champagne text + one statement
   far from center. Creates breathing room after the hero.

   Refinements:
   - Larger asymmetric quote
   - Vertical chapter indicator
   - Two micro markers framing the scene
   - More breathing room
   ============================================================ */

export function QuietTransition() {
  const { t } = useTranslation("home");
  return (
    <section className="relative w-full overflow-hidden bg-black">
      {/* Very tall — intentional breathing room */}
      <div className="mx-auto max-w-[1600px] px-6 py-40 md:px-10 md:py-56 lg:px-16 lg:py-72">
        {/* Top micro marker — far left */}
        <div className="flex items-center gap-3">
          <span className="h-px w-10 bg-gold/30" />
          <span className="label-utility tracking-[0.55em] text-gold/40">
            {t("quiet_chapter")}
        </span>
      </div>

        {/* Statement — far from center, asymmetric placement */}
        <div className="mt-24 grid grid-cols-1 gap-10 md:mt-32 lg:mt-40 lg:grid-cols-12">
          <div className="lg:col-span-2" />
          <h2 className="font-display text-[clamp(2.2rem,5vw,4.5rem)] leading-[1.02] tracking-[-0.035em] text-ivory/85 lg:col-span-8">
            <span className="block italic text-gold/70 text-[0.6em] mb-3 font-light">
              &ldquo;
          </span>
            <span className="block">{t("quiet_statement_1")}</span>
            <span className="block mt-2 text-ivory/55">{t("quiet_statement_2")}</span>
        </h2>
      </div>

        {/* Bottom markers — chapter index + city */}
        <div className="mt-24 flex items-center justify-between md:mt-32 lg:mt-40">
          <span className="label-utility tracking-[0.5em] text-ivory/15">
            {t("quiet_marker_left")}
        </span>
          <span className="hidden h-px flex-1 mx-6 bg-ivory/[0.06] md:block" />
          <span className="label-utility tracking-[0.5em] text-ivory/15">
            {t("quiet_marker_right")}
        </span>
      </div>

        {/* Editorial index floating bottom-right */}
        <div className="absolute right-6 top-1/2 hidden -translate-y-1/2 lg:block">
          <div
            className="flex flex-col items-center gap-4 text-ivory/15"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            <span className="h-8 w-px bg-ivory/15" />
            <span className="label-utility tracking-[0.55em]">02 / 06</span>
            <span className="h-8 w-px bg-ivory/15" />
        </div>
      </div>
    </div>
  </section>
  );
}
