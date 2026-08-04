"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import Link from "next/link";
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
          ? { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
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

const EASE = [0.22, 1, 0.36, 1] as const;

/* ── Static ambient dust seeds (CSS-only animation, no JS motion) ── */
const AMBIENT_SEEDS = Array.from({ length: 12 }, (_, i) => ({
  left: `${(i * 37 + 11) % 90}%`,
  top: `${(i * 53 + 23) % 90}%`,
  size: 1 + (i % 3) * 0.4,
  opacity: 0.18 + (i % 3) * 0.06,
  dur: 6 + (i % 4) * 2,
}));

function AmbientDust({ left, top, size, opacity, dur }: {
  left: string; top: string; size: number; opacity: number; dur: number;
}) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute rounded-full"
      style={{
        width: size,
        height: size,
        left,
        top,
        background: `radial-gradient(circle, rgba(200,169,106,${opacity}) 0%, transparent 70%)`,
        animation: `ambientDrift ${dur}s ease-in-out infinite`,
      }}
    />
  );
}

export function Hero({ settings }: HeroProps) {
  const heroImage =
    settings.media?.[0] ||
    "/uploads/monadaty/hero/8236e9ab9f624611.png";
  const { t } = useTranslation("home");

  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [sweepKey, setSweepKey] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  /* ── Multi-layer parallax (bg slow → product medium → particles fast) ── */
  const { scrollY } = useScroll();
  const parallaxBg = useSpring(
    useTransform(scrollY, [0, 800], [0, -120]),
    { stiffness: 40, damping: 16, mass: 1.1 }
  );
  const parallaxProduct = useSpring(
    useTransform(scrollY, [0, 600], [0, 55]),
    { stiffness: 70, damping: 20, mass: 0.8 }
  );
const parallaxParticles = useSpring(
  useTransform(scrollY, [0, 500], [0, -30]),
  { stiffness: 120, damping: 22, mass: 0.6 }
);

/* Scroll exit — depth recession */
  const scrollExit = useSpring(
    useTransform(scrollY, [0, 500], [0, 1]),
    { stiffness: 60, damping: 18, mass: 0.9 }
  );
  const exitScale  = useTransform(scrollExit, [0, 1], [1, 0.93]);
  const exitOpacity = useTransform(scrollExit, [0, 1], [1, 0.2]);
  const exitZ     = useTransform(scrollExit, [0, 1], [0, -60]);

  /* ── 3D tilt from mouse ── */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  /* Hover inspection mode: stronger tilt (±5°), stronger reflection, increased glow */
  const tiltRange = isHovered ? 5 : 3;
  const reflectionIntensity = isHovered ? 0.14 : 0.07;
  const glowIntensity = isHovered ? 0.13 : 0.08;

  const tiltX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [tiltRange, -tiltRange]),
    { stiffness: 260, damping: 24, mass: 0.8 }
  );
  const tiltY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-tiltRange, tiltRange]),
    { stiffness: 260, damping: 24, mass: 0.8 }
  );

  /* Mouse-following reflection position */
  const reflectX = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [25, 75]),
    { stiffness: 180, damping: 22, mass: 0.7 }
  );
  const reflectY = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [25, 75]),
    { stiffness: 180, damping: 22, mass: 0.7 }
  );

  /* Dynamic shadow follows cursor tilt */
  const shadowX = useTransform(tiltY, [-5, 5], [28, -28]);
  const shadowY = useTransform(tiltX, [-5, 5], [20, -20]);
  const shadowBlur = useTransform(tiltX, [-5, 5], [50, 80]);

  /* ── Idle product micro-rotation ── */
  const idleRotation = useSpring(
    useTransform(scrollY, [0, 600], [0, 3]),
    { stiffness: 30, damping: 20, mass: 1.2 }
  );

  useEffect(() => {
    requestAnimationFrame(() => setIsLoaded(true));
  }, []);

  /* ── Gold sweep every 10s ── */
  useEffect(() => {
    const id = setInterval(() => setSweepKey((k) => k + 1), 10000);
    return () => clearInterval(id);
  }, []);

  /* ── Cursor tracking ── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      mouseX.set((e.clientX - r.left) / r.width - 0.5);
      mouseY.set((e.clientY - r.top) / r.height - 0.5);
    };
    el.addEventListener("mousemove", onMove, { passive: true });
    return () => el.removeEventListener("mousemove", onMove);
  }, [mouseX, mouseY]);

  const eyebrowText = settings.subtitle || t("hero_eyebrow", "CRAFTED IN MOROCCO");
  const titleText   = settings.title   || t("hero_title", "A NEW WAY\nTO TASTE MOROCCO.");
  const descText    = settings.description || t("hero_description", "Premium Moroccan beverages, crafted with intention. Born in Casablanca.");
  const ctaText     = settings.ctaText  || t("hero_cta_primary", "SHOP NOW");
  const titleLines  = titleText.split(/\r?\n+/).map(s => s.trim()).filter(Boolean);

  return (
    <section className="relative w-full overflow-hidden bg-black">
      {/* ══════════════════════════════════════════════
          LAYER 0 — PARALLAX BACKGROUND (slowest)
          ══════════════════════════════════════════════ */}
 <motion.div
   aria-hidden
   className="pointer-events-none absolute inset-0 z-0 will-change-transform"
   style={{ y: parallaxBg }}
 >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-30%,rgba(200,169,106,0.07)_0%,transparent_55%,transparent_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_55%,rgba(155,38,56,0.04)_0%,transparent_50%,transparent_100%)]" />
        <div className="absolute top-[10%] start-[60%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(200,169,106,0.04)_0%,transparent_60%)]" />
      </motion.div>

      {/* ══════════════════════════════════════════════
          LAYER 1 — FLOATING DUST PARTICLES (fast)
          ══════════════════════════════════════════════ */}
{isLoaded && (
  <motion.div
    aria-hidden
    className="pointer-events-none absolute inset-0 z-[1]"
    style={{ y: parallaxParticles }}
  >
    {AMBIENT_SEEDS.map((p, i) => (
      <AmbientDust key={i} {...p} />
    ))}
  </motion.div>
)}

      {/* ══════════════════════════════════════════════
          LAYER 2 — AMBIENT GOLD GLOW (z-2)
          ══════════════════════════════════════════════ */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-12 z-[2]"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0.25, 0.5, 0.25], scale: [1, 1.05, 1] }}
        transition={{
          duration: 6,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse",
          delay: 0.1,
        }}
      >
        <div
          className="h-full w-full rounded-full"
          style={{
            background: `radial-gradient(ellipse_at_center,rgba(200,169,106,${glowIntensity})_0%,transparent_65%)`,
          }}
        />
      </motion.div>

      {/* ══════════════════════════════════════════════
          LAYER 3 — CONTENT WITH CINEMATIC PUSH-IN
          ══════════════════════════════════════════════ */}
      <motion.div
        className="relative z-10 mx-auto max-w-[1400px] px-6 md:px-10 lg:px-16"
        style={{ perspective: "1800px" }}
        initial={{ opacity: 0, scale: 1.06 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          ref={containerRef}
          className="
            flex flex-col items-center gap-8
            lg:grid lg:min-h-[80dvh] lg:auto-rows-fr
            lg:grid-cols-[45fr_10fr_45fr] lg:items-center lg:gap-0
            lg:py-20 py-12
          "
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* ═══════════════════════════════════════
              PRODUCT IMAGE — 3D LAYERED DEPTH
              ═══════════════════════════════════════ */}
          <div
            className="
              order-2 relative flex w-[85%] max-w-[420px] items-center
              justify-center mx-auto
              lg:order-1 lg:col-span-1 lg:w-full lg:max-w-[620px] lg:mx-auto
            "
          >
            <div className="relative w-full" style={{ perspective: "1800px" }}>
              {/* Outer float wrapper — medium parallax speed */}
              <motion.div
                style={{ y: parallaxProduct }}
                animate={{ y: [0, -7, 0] }}
                transition={{ duration: 9, ease: "easeInOut", repeat: Infinity }}
              >
 {/* 3D tilt root — stronger on hover */}
 <motion.div
   style={{
     rotateX: tiltX,
     rotateY: tiltY,
     rotateZ: idleRotation,
     transformStyle: "preserve-3d",
     willChange: "transform",
   }}
   transition={{ duration: 0.7, ease: EASE }}
   className="relative will-change-transform"
 >
                  {/* ── SHADOW LAYER (translateZ(-32px)) ── */}
                  <motion.div
                    aria-hidden
                    className="pointer-events-none absolute -bottom-8 start-1/2 h-28 w-3/4 -translate-x-1/2 rounded-full"
                    style={{
                      translateZ: -32,
                      x: shadowX,
                      y: shadowY,
                      filter: `blur(${shadowBlur}px)`,
                      background:
                        "radial-gradient(ellipse_at_center,rgba(0,0,0,0.6)_0%,rgba(0,0,0,0.2)_40%,transparent 70%)",
                    }}
                    transition={{ duration: 0.5, ease: EASE }}
                  />

                  {/* ── GLASS REFRACTION LAYER (translateZ(8px)) ── */}
                  <motion.div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-[8] overflow-hidden rounded-3xl"
                    animate={{
                      background: isHovered
                        ? "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 35%, rgba(200,169,106,0.06) 100%)"
                        : "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 40%, rgba(200,169,106,0.04) 100%)",
                      backdropFilter: isHovered ? "blur(0.5px) saturate(1.15)" : "blur(0.3px) saturate(1.1)",
                    }}
                    transition={{ duration: 0.5, ease: EASE }}
                    style={{
                      translateZ: 8,
                      WebkitBackdropFilter: "blur(0.3px) saturate(1.1)",
                    }}
                  />

                  {/* ── PRODUCT CONTAINER (translateZ(0)) ── */}
                  <div
                    className="relative aspect-[4/5] w-full lg:aspect-auto lg:min-h-[580px]"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {/* Gold reflection sweep — every 10s, enhanced on hover */}
                    <motion.div
                      key={sweepKey}
                      aria-hidden
                      className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-3xl"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: [0, isHovered ? 1 : 0.85, isHovered ? 0.7 : 0.5, 0],
                        x: ["-75%", "75%"],
                      }}
                      transition={{
                        duration: isHovered ? 2.2 : 2.6,
                        ease: [0.22, 1, 0.36, 1],
                        times: [0, 0.28, 0.72, 1],
                      }}
                      style={{
                        background: isHovered
                          ? "linear-gradient(110deg, transparent 28%, rgba(200,169,106,0.28) 40%, rgba(255,255,255,0.32) 50%, rgba(200,169,106,0.28) 60%, transparent 72%)"
                          : "linear-gradient(110deg, transparent 32%, rgba(200,169,106,0.18) 43%, rgba(255,255,255,0.22) 50%, rgba(200,169,106,0.18) 57%, transparent 68%)",
                        filter: isHovered ? "blur(0.3px)" : "blur(0.5px)",
                      }}
                    />

                    {/* Mouse-following luxury light reflection */}
                    <motion.div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 z-10 rounded-3xl"
                      style={{
                        background:
                          `radial-gradient(circle at 50% 35%, rgba(255,255,255,${reflectionIntensity}) 0%, transparent 55%)`,
                        x: reflectX,
                        y: reflectY,
                      }}
                      transition={{ type: "spring", stiffness: 180, damping: 22, mass: 0.7 }}
                    />

                    {/* Liquid highlight — top-of-bottle animated shine */}
                    <motion.div
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 top-0 z-[15] h-[58%] overflow-hidden rounded-t-3xl"
                      animate={{
                        background: isHovered
                          ? [
                              "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 58%)",
                              "linear-gradient(180deg, rgba(255,255,255,0.14) 0%, transparent 52%)",
                              "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 58%)",
                            ]
                          : [
                              "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 60%)",
                              "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, transparent 55%)",
                              "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 60%)",
                            ],
                      }}
                      transition={{ duration: isHovered ? 2.5 : 4, ease: "easeInOut", repeat: Infinity }}
                    />

                    {/* Internal ice-crystal shimmer */}
                    <motion.div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 z-[12] rounded-3xl"
                      animate={{
                        opacity: [0, isHovered ? 0.7 : 0.45, 0],
                        backgroundPosition: ["-200% center", "200% center"],
                      }}
                      transition={{
                        duration: isHovered ? 2.8 : 3.5,
                        ease: "easeInOut",
                        repeat: Infinity,
                        delay: 1.2,
                      }}
                      style={{
                        background:
                          "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.05) 44%, rgba(212,188,126,0.1) 50%, rgba(255,255,255,0.05) 56%, transparent 65%)",
                        backgroundSize: "200% 100%",
                      }}
                    />

                    {/* Cinematic blur-to-focus entrance */}
                    <motion.div
                      className="relative h-full w-full"
                      style={{
                        filter: isLoaded ? "blur(0px)" : "blur(14px)",
                      }}
                    >
                      <div className="relative h-full w-full" style={{ filter: "drop-shadow(0 28px 72px rgba(0,0,0,0.5))" }}>
                        <SafeImage
                          src={heroImage}
                          alt={t("hero_image_alt", "MONADATY — premium Moroccan beverage")}
                          priority
                          fill
                          sizes="(min-width: 1024px) 620px, (min-width: 768px) 70vw, 85vw"
                          className="relative z-10 object-contain"
                          fallback={
                            <div className="flex h-full w-full items-center justify-center">
                              <span className="font-display text-[5rem] font-light text-white/[0.06]">M</span>
                            </div>
                          }
                        />
                      </div>
                    </motion.div>

                    {/* Bottom depth fade */}
                    <div
                      aria-hidden
                      className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-20"
                    />
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* BREATHING SPACE */}
          <div className="hidden lg:block lg:col-span-1 lg:order-2" />

          {/* ═══════════════════════════════════════
              TEXT ZONE — STAGGERED ENTRANCE
              ═══════════════════════════════════════ */}
          <motion.div
            className="order-1 flex flex-col justify-center lg:order-3 lg:col-span-1"
            style={{ translateZ: exitZ }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.01 }}
          >
            <motion.div
              className="max-w-md lg:max-w-[560px]"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE }}
            >
              {/* Eyebrow */}
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
              >
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, ease: EASE, delay: 0.22 }}
                  className="h-px w-8 origin-left bg-gold"
                />
                <span className="label-utility tracking-[0.55em] text-gold">
                  {eyebrowText}
                </span>
              </motion.div>

              {/* Title — line-by-line reveal */}
              <h1 className="mt-7 font-display text-[clamp(2.25rem,4.5vw,4rem)] leading-[0.9] tracking-[-0.04em] text-white">
                {titleLines.map((line, i) => (
                  <motion.span
                    key={line}
                    className="block"
                    initial={{ opacity: 0, y: 30, translateZ: 20 }}
                    animate={{ opacity: 1, y: 0, translateZ: 0 }}
                    transition={{
                      duration: 0.85,
                      ease: EASE,
                      delay: 0.38 + i * 0.12,
                    }}
                  >
                    {line}
                  </motion.span>
                ))}
              </h1>

              {/* Description */}
              {descText && (
                <motion.p
                  className="mt-6 max-w-lg text-[0.82rem] leading-[1.85] text-white/65"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.56 }}
                >
                  {descText}
                </motion.p>
              )}

 {/* CTA */}
 <motion.div
   className="mt-10 flex flex-col items-start gap-4"
   initial={{ opacity: 0, y: 14 }}
   animate={{ opacity: 1, y: 0 }}
   transition={{ duration: 0.75, ease: EASE, delay: 0.7 }}
 >
 <Link
   href={settings.ctaLink || "/shop"}
   className="group relative overflow-hidden btn-primary h-12 px-8"
 >
   <span className="relative z-10">{ctaText}</span>
   <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5">
     <ArrowRight animating={false} />
   </span>
   <span
     aria-hidden
     className="pointer-events-none absolute inset-0 will-change-transform"
     style={{
       background:
         "linear-gradient(120deg, transparent 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0) 60%, transparent 100%)",
       animation: "shimmerLuxury 2.6s ease-in-out infinite",
     }}
   />
 </Link>
 <Link href="/shop" className="btn-link group">
   {t("hero_cta_secondary", "EXPLORE COLLECTIONS")}
   <span className="transition-transform duration-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5">
     <ArrowRight animating={false} />
   </span>
 </Link>
 </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════
          SCROLL EXIT DEPTH
          ══════════════════════════════════════════════ */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          scale: exitScale,
          opacity: exitOpacity,
          translateZ: exitZ,
          transformStyle: "preserve-3d",
        }}
      />
    </section>
  );
}

export default Hero;
