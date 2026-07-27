"use client";

import Link from "next/link";
import { SafeImage } from "@/components/SafeImage";
import { useTranslation } from "@/hooks/useTranslation";
import { useEffect, useRef } from "react";

type HeroSettings = {
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  media: string[];
};

type HeroProps = { settings: HeroSettings };

function ArrowRight() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="rtl:rotate-180"
    >
      <path d="M5 12h14" />
      <path d="M12 5l7 7-7 7" />
   </svg>
  );
}

function ArrowDown() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14" />
      <path d="M5 12l7 7 7-7" />
   </svg>
  );
}

export function Hero({ settings }: HeroProps) {
  const heroImage = settings.media?.[0] || "/images/placeholder.svg";
  const { t } = useTranslation("home");

  const productRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const el = sectionRef.current;
    const img = productRef.current;
    if (!el || !img) return;
    let raf = 0;
    function onMove(e: MouseEvent) {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el!.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 6;
        img!.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
    }
    function onLeave() {
      cancelAnimationFrame(raf);
      img!.style.transform = "translate3d(0, 0, 0)";
    }
    el.addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("mouseleave", onLeave, { passive: true });
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  const titleLines = (settings.title || t("hero_title"))
    .split(/\r?\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-[100dvh] overflow-hidden bg-black"
    >
      {/* Atmospheric base layer — burgundy radial at right */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_45%,rgba(116,24,39,0.10)_0%,rgba(0,0,0,0.40)_45%,rgba(0,0,0,0.95)_100%)]" />
     </div>

      {/* Vertical chapter label — far left edge */}
      <div className="absolute left-6 top-1/2 z-10 hidden -translate-y-1/2 lg:block">
        <div
          className="flex flex-col items-center gap-6 text-ivory/15"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          <span className="h-12 w-px bg-ivory/15" />
          <span className="label-utility tracking-[0.55em]">
            {t("hero_eyebrow")} · MONADATY
         </span>
          <span className="h-12 w-px bg-ivory/15" />
       </div>
     </div>

      <div className="relative z-10 mx-auto flex min-h-[100dvh] flex-col max-w-[1600px] px-6 md:px-10 lg:px-16">
        {/* Editorial eyebrow — upper edge */}
        <div className="pt-8 md:pt-10 lg:pt-12">
          <div className="flex items-end justify-between gap-6">
            <span className="inline-flex items-center gap-3 label-utility text-ivory/20">
              <span className="h-px w-6 bg-gold/30" />
              {t("hero_eyebrow")}
           </span>
            <span className="hidden label-utility text-ivory/15 md:inline-flex">
              {t("hero_chapter")}
           </span>
         </div>
       </div>

        {/* Central composition — product as sculptural object */}
        <div className="relative flex flex-1 flex-col justify-center pb-28 md:pb-32 lg:pb-0">
          <div className="relative pt-8 md:pt-14 lg:pt-16">
            {/* Eyebrow above title */}
            <p className="label-utility tracking-[0.55em] text-gold/45 animate-fade-up">
              {settings.subtitle || t("hero_subtitle")}
           </p>

            {/* Massive display headline */}
            <h1 className="mt-7 max-w-[16ch] font-display text-[clamp(3.25rem,9.5vw,9.5rem)] leading-[0.82] tracking-[-0.055em] text-ivory">
              {titleLines.map((line, idx) => (
                <span key={idx} className="block overflow-hidden">
                  <span
                    className="block animate-fade-up"
                    style={{ animationDelay: `${idx * 0.14 + 0.15}s` }}
                  >
                    {line}
                 </span>
               </span>
              ))}
           </h1>
         </div>

          {/* Floating product — breaks grid, oversized, sculptural */}
          <div
            ref={productRef}
            className="pointer-events-none absolute z-20 hidden lg:block"
            style={{
              right: "-10vw",
              top: "-2%",
              width: "70vw",
              maxWidth: "1000px",
              transition: "transform 800ms cubic-bezier(0.16, 1, 0.3, 1)",
              willChange: "transform",
            }}
          >
            {/* Champagne gold reflection at bottom */}
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-[10%] left-1/2 z-0 h-[26%] w-[78%] -translate-x-1/2 overflow-hidden opacity-[0.07]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,176,106,0.55)_0%,rgba(212,176,106,0.04)_55%,transparent_75%)]" />
           </div>

            {/* Burgundy atmospheric glow behind product */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[75%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(116,24,39,0.10)_0%,transparent_65%)] blur-3xl"
            />

            {/* Editorial index floating top-left of product */}
            <div
              aria-hidden
              className="absolute -left-12 top-8 z-20 hidden xl:flex flex-col gap-3"
            >
              <span className="h-px w-10 bg-gold/35" />
              <span className="label-utility text-ivory/22">N° 01 / 09</span>
           </div>

            {/* Editorial index bottom-right of product */}
            <div
              aria-hidden
              className="absolute -right-8 bottom-12 z-20 hidden xl:flex flex-col items-end gap-3"
            >
              <span className="label-utility text-ivory/22">SIGNATURE</span>
              <span className="h-px w-10 bg-gold/35" />
           </div>

            <div className="relative aspect-[3/4] w-full overflow-visible">
              <SafeImage
                src={heroImage}
                alt={settings.title}
                priority
                fill
                sizes="(min-width: 1024px) 70vw, 100vw"
                className="relative z-10 object-contain drop-shadow-[0_36px_110px_rgba(0,0,0,0.70)]"
                fallback={
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="font-display text-[7rem] font-light tracking-[0.08em] text-ivory/[0.04]">
                      MD
                   </span>
                 </div>
                }
              />
           </div>
         </div>

          {/* Mobile product */}
          <div className="relative mt-12 aspect-[3/4] w-full max-w-[440px] mx-auto lg:hidden">
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[80%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(116,24,39,0.12)_0%,transparent_65%)] blur-3xl"
            />
            <SafeImage
              src={heroImage}
              alt={settings.title}
              priority
              fill
              sizes="100vw"
              className="relative z-10 object-contain drop-shadow-[0_28px_80px_rgba(0,0,0,0.6)]"
              fallback={
                <div className="flex h-full w-full items-center justify-center">
                  <span className="font-display text-[6rem] font-light tracking-[0.08em] text-ivory/[0.04]">
                    MD
                 </span>
               </div>
              }
            />
         </div>

          {/* Bottom — copy, CTA */}
          <div className="mt-16 grid grid-cols-1 gap-10 md:mt-24 md:grid-cols-12 lg:mt-0 lg:absolute lg:bottom-14 lg:left-0 lg:right-0">
            <div className="md:col-span-5 lg:col-span-7" />

            <div className="space-y-9 md:col-span-7 lg:col-span-5">
              <div
                className="h-px w-8 bg-gold/30 animate-fade-up"
                style={{ animationDelay: "0.35s" }}
              />

              <p
                className="max-w-[22rem] text-[0.62rem] font-semibold uppercase leading-[1.7] tracking-[0.32em] text-ivory/50 animate-fade-up md:text-[0.68rem]"
                style={{ animationDelay: "0.40s" }}
              >
                {t("hero_subheadline")}
             </p>

              {settings.description && (
                <p
                  className="max-w-[22rem] text-[0.82rem] leading-[2] text-ivory/28 animate-fade-up"
                  style={{ animationDelay: "0.46s" }}
                >
                  {settings.description}
               </p>
              )}

              <div
                className="flex flex-col gap-4 sm:flex-row sm:items-center animate-fade-up"
                style={{ animationDelay: "0.58s" }}
              >
                <Link
                  href={settings.ctaLink || "/shop"}
                  className="btn-primary"
                >
                  <span>{settings.ctaText || t("shop_now")</span>
                  <ArrowRight />
               </Link>
                <Link
                  href="/about"
                  className="btn-link"
                >
                  {t("discover_more")}
                  <ArrowRight />
               </Link>
             </div>
           </div>
         </div>
       </div>

        {/* Scroll indicator — bottom of hero */}
        <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 lg:flex flex-col items-center gap-3 animate-fade-up" style={{ animationDelay: "0.9s" }}>
          <span className="label-utility tracking-[0.55em] text-ivory/20">
            {t("scroll_label")}
         </span>
          <ArrowDown />
       </div>
     </div>
   </section>
  );
}
