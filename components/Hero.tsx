"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
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

function ArrowRight({ animating }: { animating: boolean }) {
  return (
    <motion.span
      className="rtl:rotate-180 inline-block"
      animate={
        animating
        ? { x: [0, 5, -1, 0], opacity: [1, 0.85, 1] }
        : { x: [0, 4, 0] }
      }
      transition={
        animating
        ? { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
        : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
      }
    >
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14" />
        <path d="M12 5l7 7-7 7" />
      </svg>
    </motion.span>
  );
}

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero({ settings }: HeroProps) {
  const heroImage =
    settings.media?.[0] ||
    "/uploads/monadaty/hero/8236e9ab9f624611.png";
  const { t } = useTranslation("home");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [arrowFlash, setArrowFlash] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const imageY = useTransform(scrollY, [0, 400], [0, 30]);
  const imageOpacity = useTransform(scrollY, [0, 300], [1, 0.6]);

  useEffect(() => {
    requestAnimationFrame(() => setIsLoaded(true));
    const timer = setTimeout(() => setIsVisible(true), 60);
    return () => clearTimeout(timer);
  }, []);

  const eyebrowText =
    settings.subtitle || t("hero_eyebrow", "CRAFTED IN MOROCCO");
  const titleText =
    settings.title || t("hero_title", "A NEW WAY\nTO TASTE MOROCCO.");
  const descText =
    settings.description ||
    t(
      "hero_description",
      "Premium Moroccan beverages, crafted with intention. Born in Casablanca, for those who appreciate exceptional taste.",
    );
  const ctaPrimaryText =
    settings.ctaText || t("hero_cta_primary", "SHOP NOW");
  const titleLines = titleText
    .split(/\r?\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const handleCtaHover = () => {
    if (!arrowFlash) {
      setArrowFlash(true);
      setTimeout(() => setArrowFlash(false), 500);
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-black">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-20%,rgba(200,169,106,0.04)_0%,transparent_55%,transparent_100%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 md:px-10 lg:px-16">
        <div
          ref={containerRef}
          className="
            flex flex-col items-center gap-8
            lg:grid lg:min-h-[80dvh] lg:auto-rows-fr
            lg:grid-cols-[45fr_10fr_45fr] lg:items-center lg:gap-0
            lg:py-20
            py-12
          "
        >
          {/* PRODUCT IMAGE */}
          <div
            className="
              order-2 relative flex w-[85%] max-w-[420px] items-center
              justify-center mx-auto
              lg:order-1 lg:col-span-1 lg:w-full lg:max-w-[620px] lg:mx-auto
            "
          >
            <div className="relative w-full">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-8 opacity-40"
              >
                <div className="h-full w-full rounded-full bg-[radial-gradient(ellipse_at_center,rgba(200,169,106,0.06)_0%,transparent_60%)]" />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={
                  isLoaded
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 30 }
                }
                transition={{ duration: 1.0, ease: EASE, delay: 0.1 }}
                style={{ y: imageY, opacity: imageOpacity }}
                className={`relative ${isLoaded ? "animate-float" : ""}`}
              >
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-transparent via-transparent to-gold/[0.04] opacity-60" />
                {heroImage ? (
                  <motion.div
                    initial={{ clipPath: "inset(100% 0 0 0)" }}
                    animate={{ clipPath: "inset(0% 0 0 0)" }}
                    transition={{
                      duration: 1.1,
                      ease: EASE,
                      delay: 0.1,
                    }}
                    className="relative aspect-[4/5] w-full lg:aspect-auto lg:min-h-[580px]"
                  >
                    <SafeImage
                      src={heroImage}
                      alt="MONADATY — premium Moroccan beverage"
                      priority
                      fill
                      sizes="(min-width: 1024px) 620px, (min-width: 768px) 70vw, 85vw"
                      className="relative z-10 object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
                      fallback={
                        <div className="flex h-full w-full items-center justify-center">
                          <span className="font-display text-[5rem] font-light text-white/[0.06]">M</span>
                        </div>
                      }
                    />
                    {/* Soft reveal edge glow */}
                    <div
                      aria-hidden
                      className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/40 to-transparent pointer-events-none z-20"
                    />
                  </motion.div>
                ) : (
                  <div className="flex aspect-[4/5] w-full items-center justify-center rounded-2xl bg-black-soft">
                    <span className="font-display text-[5rem] font-light text-white/[0.04]">M</span>
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* BREATHING SPACE */}
          <div className="hidden lg:block lg:col-span-1 lg:order-2" />

          {/* TEXT ZONE */}
          <div className="order-1 flex flex-col justify-center lg:order-3 lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={
                isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }
              }
              transition={{ duration: 0.8, ease: EASE }}
              className="max-w-md lg:max-w-[560px]"
            >
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={
                  isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }
                }
                transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
                className="flex items-center gap-3"
              >
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={isVisible ? { scaleX: 1 } : { scaleX: 0 }}
                  transition={{
                    duration: 0.5,
                    ease: EASE,
                    delay: 0.2,
                  }}
                  className="h-px w-8 origin-left bg-gold"
                />
                <span className="label-utility tracking-[0.55em] text-gold">
                  {eyebrowText}
                </span>
              </motion.div>

              <h1 className="mt-6 font-display text-[clamp(2.25rem,4.5vw,4rem)] leading-[0.9] tracking-[-0.04em] text-white">
                {titleLines.map((line, i) => (
                  <motion.span
                    key={line}
                    initial={{ opacity: 0, y: 28 }}
                    animate={
                      isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }
                    }
                    transition={{
                      duration: 0.7,
                      ease: EASE,
                      delay: 0.2 + i * 0.1,
                    }}
                    className="block"
                  >
                    {line}
                  </motion.span>
                ))}
              </h1>

              {descText && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.45 }}
                  className="mt-6 max-w-lg text-[0.82rem] leading-[1.85] text-white/65"
                >
                  {descText}
                </motion.p>
              )}

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={
                  isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }
                }
                transition={{ duration: 0.7, ease: EASE, delay: 0.6 }}
                className="mt-9 flex flex-col items-start gap-4"
              >
                <Link
                  href={settings.ctaLink || "/shop"}
                  className="group btn-primary h-12 px-8"
                  onMouseEnter={handleCtaHover}
                >
                  <span>{ctaPrimaryText}</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5">
                    <ArrowRight animating={arrowFlash} />
                  </span>
                </Link>
                <Link
                  href="/shop"
                  className="btn-link"
                >
                  {t("hero_cta_secondary", "EXPLORE COLLECTIONS")}
                  <ArrowRight animating={false} />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
