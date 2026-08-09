"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { SafeImage } from "@/components/SafeImage";
import { useTranslation } from "@/hooks/useTranslation";
import { getLandingCopy } from "@/lib/landing-copy";

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
  fallbackImage?: string;
};

const EASE = [0.22, 1, 0.36, 1] as const;

function ArrowRight() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 rtl:rotate-180"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function Hero({ settings, fallbackImage }: HeroProps) {
  const { lang } = useTranslation("home");
  const copy = getLandingCopy(lang);
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const visualY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, 54],
  );
  const visualScale = useTransform(
    scrollYProgress,
    [0, 1],
    [1, 0.975],
  );

  const eyebrow = copy.hero.eyebrow;
  const title = copy.hero.title;
  const description = copy.hero.description;
  const ctaText = copy.hero.primaryCta;
  const cmsHeroImage = settings.media?.[0]?.trim();
  const heroImage = cmsHeroImage || fallbackImage?.trim() || undefined;

  const entrance = (delay: number, y = 22) => ({
    initial: { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.72, delay, ease: EASE },
  });

  return (
    <section
      ref={sectionRef}
      className="relative isolate w-full overflow-hidden bg-[#0B0B0A]"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -start-[20%] top-[12%] h-[40rem] w-[40rem] rounded-full bg-[#6E1F2A]/[0.15] blur-[150px]" />
        <div className="absolute -end-[16%] top-[-14%] h-[42rem] w-[42rem] rounded-full bg-[#D6B35A]/[0.075] blur-[160px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_46%,transparent_0%,rgba(11,11,10,0.12)_44%,#0B0B0A_86%)]" />
        <div className="absolute inset-0 opacity-[0.09] [background-image:linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] [background-size:80px_80px] [mask-image:linear-gradient(to_bottom,black,transparent_84%)]" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-[1520px] grid-cols-1 items-center gap-10 px-5 pb-14 pt-28 sm:px-8 sm:pb-16 sm:pt-32 md:min-h-[700px] md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] md:gap-9 md:px-10 md:pb-16 md:pt-28 lg:min-h-[740px] lg:grid-cols-[minmax(0,0.88fr)_minmax(500px,1.12fr)] lg:gap-12 lg:px-16 lg:pb-20 xl:min-h-[780px] xl:px-20">
        <div className="relative z-20 max-w-[560px] text-start lg:py-10">
          <motion.div {...entrance(0.1)} className="flex items-center gap-3">
            <span className="h-px w-9 bg-[#D6B35A]" />
            <p className="max-w-[28rem] text-[0.6rem] font-medium uppercase tracking-[0.34em] text-[#D6B35A] sm:text-[0.66rem]">
              {eyebrow}
            </p>
          </motion.div>

          <motion.h1
            {...entrance(0.2, 28)}
            className="mt-7 max-w-[10.5ch] whitespace-pre-line font-display text-[clamp(2.8rem,5vw,5rem)] font-normal leading-[0.94] tracking-[-0.045em] text-white"
          >
            {title}
          </motion.h1>

          <motion.p
            {...entrance(0.32)}
            className="mt-6 max-w-[32.5rem] text-[0.94rem] font-normal leading-[1.7] text-white/55 sm:text-base"
          >
            {description}
          </motion.p>

          <motion.div
            {...entrance(0.43)}
            className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4"
          >
            <Link
              href={settings.ctaLink || "/shop"}
              className="landing-primary group min-w-[174px]"
            >
              {ctaText}
              <span className="transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                <ArrowRight />
              </span>
            </Link>
            <Link
              href="#collections"
              className="landing-secondary group"
            >
              {copy.hero.secondaryCta}
              <span className="h-px w-7 bg-[#D6B35A]/75 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-10" />
            </Link>
          </motion.div>

          <motion.div
            {...entrance(0.55, 12)}
            className="mt-9 flex items-center gap-5 border-t border-white/[0.08] pt-5 text-[0.55rem] font-medium uppercase tracking-[0.18em] text-white/35 sm:mt-10 sm:gap-8"
          >
            <span>{copy.hero.categories}</span>
            <span className="h-1 w-1 rounded-full bg-[#D6B35A]" />
            <span>{copy.hero.value}</span>
          </motion.div>
        </div>

        <motion.div
          {...entrance(0.3, 34)}
          className="relative mx-auto w-full max-w-[760px] lg:max-w-none"
          style={shouldReduceMotion ? undefined : { y: visualY, scale: visualScale }}
        >
          <div className="absolute inset-x-[12%] bottom-[2%] h-[18%] rounded-full bg-black/80 blur-3xl" />
          <div className="absolute inset-[14%] rounded-full bg-[#D6B35A]/[0.09] blur-[100px]" />
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 1.04 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            whileHover={shouldReduceMotion ? undefined : { scale: 1.02, transition: { duration: 0.55, delay: 0, ease: EASE } }}
            transition={{ duration: 0.72, delay: 0.28, ease: EASE }}
            className="relative aspect-[6/5] min-h-[300px] overflow-hidden rounded-[1.25rem] border border-[#D6B35A]/[0.13] bg-[#11110F]/60 shadow-[0_38px_110px_rgba(0,0,0,.5)] sm:min-h-[400px] md:aspect-[4/5] md:min-h-0 lg:aspect-[5/6] lg:max-h-[650px] xl:aspect-[6/5]"
          >
            <SafeImage
              src={heroImage}
              alt={copy.hero.imageAlt}
              fill
              priority
              sizes="(min-width: 1440px) 760px, (min-width: 1024px) 55vw, 100vw"
              className="object-contain p-3 sm:p-5 lg:p-6"
              fallback={
                <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_50%_40%,rgba(214,179,90,.13),transparent_55%)]">
                  <span className="font-display text-[clamp(5rem,14vw,11rem)] tracking-[-0.05em] text-[#D6B35A]/20">
                    M
                  </span>
                </div>
              }
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,.04),transparent_28%,transparent_70%,rgba(214,179,90,.04))]" />
          </motion.div>
          <div className="absolute -bottom-4 end-5 rounded-full border border-[#D6B35A]/25 bg-[#0B0B0A]/80 px-4 py-2 text-[0.54rem] uppercase tracking-[0.24em] text-[#D6B35A] backdrop-blur-xl sm:end-8">
            {copy.hero.visualLabel}
          </div>
        </motion.div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#D6B35A]/35 to-transparent" />
    </section>
  );
}
