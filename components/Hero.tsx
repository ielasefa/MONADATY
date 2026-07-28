"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SafeImage } from "@/components/SafeImage";
import { useTranslation } from "@/hooks/useTranslation";

type HeroSettings = {
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  media: string[];
};

type HeroProps = {
  settings: HeroSettings;
};

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
  const heroImage = settings.media?.[0] || "";
  const { t } = useTranslation("home");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsLoaded(true));
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const eyebrowText = settings.subtitle || t("hero_eyebrow", "CRAFTED IN MOROCCO");
  const titleText = settings.title || t("hero_title", "A NEW WAY\nTO TASTE MOROCCO.");
  const descText = settings.description || t("hero_description", "Premium Moroccan beverages, crafted with intention. Born in Casablanca, for those who appreciate exceptional taste.");
  const ctaPrimaryText = settings.ctaText || t("hero_cta_primary", "SHOP NOW");
  const titleLines = titleText.split(/\r?\n+/).map((s) => s.trim()).filter(Boolean);

  return (
<section className="relative w-full overflow-hidden bg-black">
  <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-20%,rgba(200,169,106,0.04)_0%,transparent_55%,transparent_100%)]" />
  </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 md:px-10 lg:px-16">
        <div className="grid min-h-[78vh] grid-cols-1 lg:min-h-[88dvh] lg:grid-cols-12 lg:items-center lg:py-20">
          {/* Product zone — left */}
          <div className="relative flex items-center justify-center py-12 lg:col-span-7 lg:justify-center lg:py-0">
            <div className="relative w-full max-w-md lg:max-w-none">
              {/* Soft ambient glow behind product */}
              <div aria-hidden className="pointer-events-none absolute -inset-8 opacity-40">
                <div className="h-full w-full rounded-full bg-[radial-gradient(ellipse_at_center,rgba(200,169,106,0.06)_0%,transparent_60%)]" />
              </div>

              <div
                className={`relative transition-all duration-900 ease-premium ${
                  isLoaded ? "scale-100 opacity-100" : "scale-[0.97] opacity-0"
                }`}
                style={{ animation: isLoaded ? "float 8s ease-in-out infinite" : "none" }}
              >
                {/* Entry envelope */}
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-transparent via-transparent to-gold/[0.04] opacity-60" />

                {heroImage ? (
                  <div className="relative aspect-[4/5] w-full">
                    <SafeImage
                      src={heroImage}
                      alt="MONADATY — premium Moroccan beverage"
                      priority
                      fill
                      sizes="(min-width: 1024px) 55vw, (min-width: 768px) 70vw, 100vw"
                      className="relative z-10 object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
                      fallback={
                        <div className="flex h-full w-full items-center justify-center">
                          <span className="font-display text-[5rem] font-light text-white/[0.06]">M</span>
                        </div>
                      }
                    />
                  </div>
                ) : (
      <div className="flex aspect-[4/5] w-full items-center justify-center rounded-2xl bg-black-soft">
        <span className="font-display text-[5rem] font-light text-white/[0.04]">M</span>
      </div>
                )}
              </div>
            </div>
          </div>

          {/* Text zone — right */}
          <div className="flex flex-col justify-center pb-16 lg:col-span-5 lg:col-start-8 lg:pb-0">
            <div
              className={`max-w-md transition-all duration-700 ease-premium ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-gold" />
                <span className="label-utility tracking-[0.55em] text-gold/60">
                  {eyebrowText}
                </span>
              </div>

<h1 className="mt-6 font-display text-[clamp(2.25rem,4.5vw,4rem)] leading-[0.9] tracking-[-0.04em] text-white">
      {titleLines.map((line, i) => (
        <span key={i} className="block">{line}</span>
      ))}
    </h1>

    {descText && (
      <p className="mt-6 max-w-sm text-[0.82rem] leading-[1.85] text-white/40">
                  {descText}
                </p>
              )}

              <div className="mt-9 flex flex-col items-start gap-4">
                <Link
                  href={settings.ctaLink || "/shop"}
                  className="group btn-primary h-12 px-8"
                >
                  <span>{ctaPrimaryText}</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5">
                    <ArrowRight />
                  </span>
                </Link>
                <Link
                  href="/shop"
                  className="btn-link"
                >
                  {t("hero_cta_secondary", "EXPLORE COLLECTIONS")}
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

export default Hero;