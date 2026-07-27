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
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 5;
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
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_65%_50%,rgba(116,24,39,0.06)_0%,rgba(0,0,0,0.35)_40%,rgba(0,0,0,0.95)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100dvh] flex-col max-w-[1600px] px-6 md:px-10 lg:px-16">
        {/* Editorial eyebrow — upper left */}
        <div className="pt-8 md:pt-10 lg:pt-12">
          <div className="flex items-end justify-between">
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
        <div className="relative flex flex-1 flex-col justify-center pb-24 md:pb-32 lg:pb-0">
          <div className="relative pt-10 md:pt-16 lg:pt-20">
            <p className="label-utility text-gold/40 animate-fade-up">
              {settings.subtitle || t("hero_subtitle")}
            </p>

            <h1 className="mt-6 max-w-[16ch] font-display text-[clamp(3.5rem,9.5vw,9.5rem)] leading-[0.82] tracking-[-0.055em] text-ivory">
              {titleLines.map((line, idx) => (
                <span key={idx} className="block overflow-hidden">
                  <span
                    className="block animate-fade-up"
                    style={{ animationDelay: `${idx * 0.12 + 0.1}s` }}
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
              right: "-8vw",
              top: "-4%",
              width: "68vw",
              maxWidth: "960px",
              transition: "transform 700ms cubic-bezier(0.16, 1, 0.3, 1)",
              willChange: "transform",
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-[12%] left-1/2 z-0 h-[28%] w-[75%] -translate-x-1/2 overflow-hidden opacity-[0.06]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,176,106,0.5)_0%,rgba(212,176,106,0.05)_50%,transparent_70%)]" />
            </div>

            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[70%] w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(116,24,39,0.08)_0%,transparent_65%)] blur-3xl"
            />

            <div className="relative aspect-[3/4] w-full overflow-visible">
              <SafeImage
                src={heroImage}
                alt={settings.title}
                priority
                fill
                sizes="(min-width: 1024px) 68vw, 100vw"
                className="relative z-10 object-contain drop-shadow-[0_32px_96px_rgba(0,0,0,0.65)]"
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
          <div className="relative mt-10 aspect-[3/4] w-full max-w-[420px] mx-auto lg:hidden">
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[80%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(116,24,39,0.10)_0%,transparent_65%)] blur-3xl"
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

          {/* Bottom — copy, CTA, scroll indicator */}
          <div className="mt-16 grid grid-cols-1 gap-10 md:mt-24 md:grid-cols-12 lg:mt-0 lg:absolute lg:bottom-12 lg:left-0 lg:right-0">
            <div className="md:col-span-5 lg:col-span-7" />

            <div className="space-y-8 md:col-span-7 lg:col-span-5">
              <div
                className="h-px w-8 bg-gold/30 animate-fade-up"
                style={{ animationDelay: "0.3s" }}
              />

              <p
                className="max-w-[20rem] text-[0.62rem] font-semibold uppercase leading-[1.7] tracking-[0.32em] text-ivory/45 animate-fade-up md:text-[0.66rem]"
                style={{ animationDelay: "0.35s" }}
              >
                {t("hero_subheadline")}
              </p>

              {settings.description && (
                <p
                  className="max-w-[20rem] text-[0.78rem] leading-[2] text-ivory/25 animate-fade-up"
                  style={{ animationDelay: "0.42s" }}
                >
                  {settings.description}
                </p>
              )}

              <div
                className="flex flex-col gap-3.5 sm:flex-row sm:items-center animate-fade-up"
                style={{ animationDelay: "0.55s" }}
              >
                <Link
                  href={settings.ctaLink || "/shop"}
                  className="btn-primary"
                >
                  <span>{settings.ctaText || t("shop_now")}</span>
                  <ArrowRight />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex h-11 items-center justify-center gap-2 px-0 text-[0.52rem] font-semibold uppercase tracking-[0.3em] text-ivory/25 transition-colors duration-400 hover:text-ivory/55"
                >
                  {t("discover_more")}
                  <ArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
