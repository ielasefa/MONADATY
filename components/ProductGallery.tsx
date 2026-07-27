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

export function ProductGallery({ name, gallery, image, visual, accent }: ProductGalleryProps) {
  const galleryImages = useMemo(() => (gallery || []).filter((g) => Boolean(g && g.length > 0)), [gallery]);
  const gallerySource = useMemo(() => galleryImages.length > 0 ? galleryImages : (image ? [image] : []), [galleryImages, image]);
  const [activeImage, setActiveImage] = useState(gallerySource[0] ?? "");
  const hasGallery = gallerySource.length > 0;

  useEffect(() => {
    setActiveImage(gallerySource[0] ?? "");
  }, [gallerySource]);

  return (
    <div className="space-y-6">
      {/* Main image — floats on black, no border */}
      <div className="relative aspect-[3/4] overflow-visible flex items-center justify-center group">
        <div className="relative h-full w-full flex items-center justify-center">
          {hasGallery ? (
            <AnimatePresence mode="wait">
              {activeImage ? (
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.015]"
                >
                  <SafeImage
                    src={activeImage}
                    alt={name}
                    fill
                    priority
                    sizes="(min-width: 1024px) 48vw, 100vw"
                    className="object-contain drop-shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
                    fallback={
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-sm font-medium tracking-[0.24em] text-ivory/8">{name.split(" ").slice(0, 2).map((part) => part[0]).join("")}</span>
                      </div>
                    }
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>
          ) : visual ? (
            <div className="mx-auto transition-all duration-300 ease-in-out drop-shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
              {visual === "can" ? (
                <SodaCan width={300} height={400} accent={accent} label={name} />
              ) : visual === "bottle" ? (
                <SodaBottle width={280} height={420} accent={accent} label={name} />
              ) : (
                <GlassDrink width={320} height={320} accent={accent} label={name} />
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Thumbnails — minimal, no bg, gold ring on active */}
      {gallerySource.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {gallerySource.map((thumb) => (
            <button
              key={thumb}
              type="button"
              onClick={() => setActiveImage(thumb)}
              className={`relative aspect-square overflow-hidden transition-all duration-300 ${
                activeImage === thumb
                  ? "ring-1 ring-gold/40 ring-offset-2 ring-offset-black"
                  : "opacity-30 hover:opacity-60"
              }`}
            >
              <SafeImage
                src={thumb}
                alt={name}
                fill
                sizes="(min-width: 1024px) 12vw, 25vw"
                className="object-contain p-2"
                fallback={
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-[0.6rem] font-medium tracking-[0.22em] text-ivory/10">{name.split(" ").slice(0, 2).map((part) => part[0]).join("")}</span>
                  </div>
                }
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
