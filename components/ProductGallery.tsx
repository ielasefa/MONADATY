"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ProductImage } from "@/components/ProductImage";
import { ProductImageFallback } from "@/components/ProductImageFallback";
import { resolveDatabaseProductGallery } from "@/lib/product-images";
import { PREMIUM_EASE } from "@/lib/motion";

type ProductGalleryProps = {
  name: string;
  gallery: string[];
  image?: string;
  brand?: string;
  category?: string;
  collection?: string;
  visual?: "can" | "bottle" | "glass";
  accent?: string;
};

export function ProductGallery({ name, gallery, image, brand, category, collection, visual, accent }: ProductGalleryProps) {
  const shouldReduceMotion = useReducedMotion();
  const gallerySource = useMemo(
    () => resolveDatabaseProductGallery({ image, gallery }),
    [image, gallery],
  );
  const imageProduct = { name, image, gallery, brand, category, collection, visual, accent };

  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = gallerySource[Math.min(activeIndex, Math.max(0, gallerySource.length - 1))];

  useEffect(() => {
    if (activeIndex >= gallerySource.length) setActiveIndex(0);
  }, [activeIndex, gallerySource.length]);

  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col gap-4 md:gap-5">
      <div className="group relative aspect-square w-full overflow-hidden rounded-2xl border border-gold/[0.16] bg-surface shadow-[0_28px_90px_rgba(0,0,0,0.3)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(214,179,90,0.09),transparent_62%)]" />
        {activeImage ? (
          <AnimatePresence mode="sync" initial={false}>
            <motion.div
              key={activeImage}
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.99 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.42, ease: PREMIUM_EASE }}
              className="absolute inset-0"
            >
              <ProductImage
                product={{ ...imageProduct, image: activeImage, gallery: [] }}
                alt={name}
                fill
                priority
                sizes="(min-width: 1280px) 600px, (min-width: 1024px) 48vw, 100vw"
                className="object-contain p-7 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.025] motion-reduce:transition-none motion-reduce:group-hover:scale-100 sm:p-10 lg:p-12"
              />
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="absolute inset-0">
            <ProductImageFallback product={imageProduct} />
          </div>
        )}

        {gallerySource.length > 1 && (
          <span className="absolute bottom-4 end-4 z-10 rounded-full border border-gold/[0.16] bg-black/65 px-3 py-1.5 text-[0.52rem] font-semibold tracking-[0.2em] text-white/60 backdrop-blur-md">
            {String(activeIndex + 1).padStart(2, "0")} / {String(gallerySource.length).padStart(2, "0")}
          </span>
        )}
      </div>

      {gallerySource.length > 1 && (
        <div className="flex max-w-full gap-2 overflow-x-auto pb-1 sm:gap-3">
          {gallerySource.map((thumb, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={thumb}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`${name} — image ${index + 1} of ${gallerySource.length}`}
                aria-pressed={isActive}
                className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-surface transition-all duration-300 sm:h-16 sm:w-16 xl:h-20 xl:w-20 ${
                  isActive ? "border-gold ring-2 ring-gold/15" : "border-gold/[0.16] opacity-60 hover:opacity-100"
                }`}
              >
                <ProductImage
                  product={{ ...imageProduct, image: thumb, gallery: [] }}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-contain p-2"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
