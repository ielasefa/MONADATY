"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { CollectionData as CollectionDefinition } from "@/types";
import { SafeImage } from "@/components/SafeImage";
import { useTranslation } from "@/hooks/useTranslation";

type CollectionCardProps = {
  collection: CollectionDefinition;
  image?: string | null;
  count?: number;
};

const EASE = [0.22, 1, 0.36, 1] as const;

export function CollectionCard({ collection, image }: CollectionCardProps) {
  const { t } = useTranslation("common");
  const imageSource = image || collection.image;
  return (
    <Link
      href={`/shop?collection=${collection.slug}`}
      className="market-collection-card group block"
    >
      <motion.div
        initial={false}
        whileHover={{ y: -4, transition: { duration: 0.22, ease: EASE } }}
        transition={{ duration: 0.22, ease: EASE }}
        className="relative aspect-[4/3] overflow-hidden rounded-xl"
      >
        {imageSource ? (
          <motion.div
            initial={false}
            whileHover={{ scale: 1.04, transition: { duration: 0.6, ease: EASE } }}
            transition={{ duration: 0.6, ease: EASE }}
            className="h-full w-full"
          >
            <SafeImage
              src={imageSource}
              alt={collection.title}
              fill
              sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
              className="object-cover"
              fallback={null}
            />
          </motion.div>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#450407]">
            <motion.span
              initial={false}
              whileHover={{ scale: 1.05 }}
              className="font-display text-2xl font-light tracking-[0.08em] text-[#E8CD91]"
            >
              {collection.title.charAt(0)}
            </motion.span>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={false}
        whileHover={{ x: 2 }}
        transition={{ duration: 0.22, ease: EASE }}
        className="mt-3 space-y-1.5"
      >
        <p className="text-xs font-semibold text-secondary">
          {t("collection")}
        </p>
        <h3 className="font-display text-lg leading-[0.92] tracking-[-0.01em] text-brand transition-colors duration-300 group-hover:underline">
          {collection.title}
        </h3>
        {collection.description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-secondary">
            {collection.description}
          </p>
        )}
      </motion.div>
    </Link>
  );
}
