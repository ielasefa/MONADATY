"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SodaCan } from "@/components/visuals/SodaCan";
import { SodaBottle } from "@/components/visuals/SodaBottle";
import { GlassDrink } from "@/components/visuals/GlassDrink";
import { SafeImage } from "@/components/SafeImage";

type ProductGalleryProps = {
  name: string;
  gallery: string[];
  image?: string;
  visual?: "can" | "bottle" | "glass";
  accent?: string;
};

const EASE = [0.16, 1, 0.3, 1] as const;

const PLACEHOLDER_SRC = "/images/placeholder.svg";

export function ProductGallery({ name, gallery, image, visual, accent }: ProductGalleryProps) {
  const galleryImages = useMemo(
    () => (gallery || []).filter((g) => Boolean(g && g.trim().length > 0 && g !== PLACEHOLDER_SRC)),
    [gallery],
  );
  const gallerySource = useMemo(() => {
    const main = image && image !== PLACEHOLDER_SRC ? image : "";
    const source: string[] = main ? [main] : [];
    for (const g of galleryImages) {
      if (!source.includes(g)) source.push(g);
    }
    return source;
  }, [image, galleryImages]);

  const [activeIndex, setActiveIndex] = useState(0);
  const hasGallery = gallerySource.length > 0;
  const activeImage = gallerySource[Math.min(activeIndex, Math.max(0, gallerySource.length - 1))] ?? "";

  useEffect(() => {
    if (gallerySource.length > 0 && activeIndex >= gallerySource.length) {
      setActiveIndex(0);
    }
  }, [gallerySource, activeIndex]);

  return (
    <div className="flex flex-col items-center gap-6 md:gap-8">
      {/* Main image — premium white card, rounded-3xl, luxurious shadow */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <div className="group relative mx-auto w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] lg:w-[400px] lg:h-[400px] max-w-[420px] overflow-hidden rounded-3xl border border-gold/20 bg-white shadow-[0_24px_96px_-32px_rgba(0,0,0,0.7)] transition-all duration-700 ease-premium hover:scale-[1.02] hover:shadow-[0_32px_128px_-40px_rgba(0,0,0,0.85)]">
          <div className="relative h-full w-full">
            {hasGallery ? (
              <AnimatePresence mode="wait" initial={false}>
                {activeImage ? (
                  <motion.div
                    key={activeImage}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="relative h-full w-full"
                  >
<SafeImage
          src={activeImage}
          alt={name}
          fill
          priority
          sizes="(min-width: 1024px) 400px, (min-width: 768px) 340px, 280px"
          className="object-contain p-8 md:p-12 transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          fallback={
                        <div className="flex h-full w-full items-center justify-center">
                          <span className="font-display text-4xl font-light tracking-[0.08em] text-[#0B0B0A]/15">
                            {name.split(" ").slice(0, 2).map((part) => part[0]).join("")}
                          </span>
                        </div>
                      }
                  />
                </motion.div>
                ) : null}
              </AnimatePresence>
            ) : visual ? (
              <div className="flex h-full w-full items-center justify-center p-10 md:p-14">
                {visual === "can" ? (
                  <SodaCan width={240} height={300} accent={accent} label={name} />
                ) : visual === "bottle" ? (
                  <SodaBottle width={220} height={310} accent={accent} label={name} />
                ) : (
                  <GlassDrink width={240} height={240} accent={accent} label={name} />
                )}
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="font-display text-4xl font-light tracking-[0.08em] text-[#0B0B0A]/15">
                  {name.charAt(0)}
                </span>
              </div>
            )}

            {/* Counter chip */}
            {gallerySource.length > 1 && (
              <span className="pointer-events-none absolute bottom-4 end-4 z-10 inline-flex items-center gap-2 rounded-full bg-[#0B0B0A]/50 px-3.5 py-1.5 text-[0.56rem] font-medium tracking-[0.22em] text-white/60 backdrop-blur-sm">
                <span className="h-1 w-1 rounded-full bg-gold/70" />
                {String(activeIndex + 1).padStart(2, "0")} / {String(gallerySource.length).padStart(2, "0")}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Thumbnails — rounded-xl, gold active border, smooth transitions */}
      {gallerySource.length > 1 && (
        <div className="flex items-center gap-3 sm:gap-4">
          {gallerySource.map((thumb, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={thumb}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`${name} — image ${index + 1} of ${gallerySource.length}`}
                aria-pressed={isActive}
                className={`relative h-16 w-16 overflow-hidden rounded-xl border bg-white transition-all duration-500 sm:h-20 sm:w-20 ${
                  isActive
                    ? "border-gold/70 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.7)] ring-1 ring-gold/30 scale-105"
                    : "border-white/10 opacity-50 hover:border-gold/40 hover:opacity-100 hover:scale-[1.02]"
                }`}
              >
                <SafeImage
                  src={thumb}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-contain p-1.5"
                  fallback={
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="font-display text-base font-light text-[#0B0B0A]/20">
                        {name.charAt(0)}
                      </span>
                    </div>
                  }
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}