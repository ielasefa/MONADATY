"use client";

import Link from "next/link";
import type { CollectionData as CollectionDefinition } from "@/types";
import { SafeImage } from "@/components/SafeImage";
import { useTranslation } from "@/hooks/useTranslation";

type CollectionCardProps = {
  collection: CollectionDefinition;
  image?: string | null;
  count?: number;
};

export function CollectionCard({ collection, image }: CollectionCardProps) {
  const { t } = useTranslation("common");
  return (
    <Link
      href={`/shop?category=${collection.slug}`}
      className="group block transition-all duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {image ? (
          <SafeImage
            src={image}
            alt={collection.title}
            fill
            sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
            className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
            fallback={
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-2xl font-semibold tracking-[0.15em] text-ivory/6">{collection.title.charAt(0)}</span>
              </div>
            }
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-2xl font-semibold tracking-[0.15em] text-ivory/6">{collection.title.charAt(0)}</span>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-1.5">
        <p className="text-[0.38rem] font-semibold uppercase tracking-[0.35em] text-ivory/15">{t("collection")}</p>
        <h3 className="font-display text-lg leading-[0.92] tracking-[-0.01em] text-ivory transition-colors duration-300 group-hover:text-gold/80">
          {collection.title}
        </h3>
        {collection.description && (
          <p className="line-clamp-2 text-[0.68rem] leading-relaxed text-ivory/25">{collection.description}</p>
        )}
      </div>
    </Link>
  );
}
