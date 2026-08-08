"use client";

import { SafeImage } from "@/components/SafeImage";
import { hexToRgba } from "@/lib/color";

type CollectionArtworkProps = {
  image: string;
  title: string;
  accent?: string;
  sizes?: string;
  className?: string;
  monogramSize?: string;
};

export function CollectionArtwork({
  image,
  title,
  accent,
  sizes,
  className = "object-cover",
  monogramSize = "text-[6rem] md:text-[8rem] lg:text-[10rem]",
}: CollectionArtworkProps) {
  const initial = (title || "M").trim().charAt(0).toUpperCase();
  const fallback = (
    <FallbackVisual
      title={title}
      accent={accent}
      initial={initial}
      monogramSize={monogramSize}
    />
  );

  if (!image.trim()) {
    return fallback;
  }

  return (
    <SafeImage
      src={image}
      alt={title}
      fill
      sizes={sizes}
      className={className}
      fallback={fallback}
    />
  );
}

function FallbackVisual({
  title,
  accent,
  initial,
  monogramSize,
}: {
  title: string;
  accent?: string;
  initial: string;
  monogramSize: string;
}) {
  const accentRgba = hexToRgba(accent, 0.22);
  const accentMid = hexToRgba(accent, 0.08);
  const accentGlow = hexToRgba(accent, 0.16);
  const accentMono = hexToRgba(accent, 0.5);

  return (
    <div className="relative h-full w-full overflow-hidden bg-black-soft">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 100% at 50% 0%, ${accentRgba} 0%, ${accentMid} 48%, transparent 80%)`,
        }}
      />
      <div
        className="absolute -top-16 -right-16 h-64 w-64 rounded-full blur-3xl"
        style={{ background: accentGlow }}
      />
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`font-display leading-none tracking-[0.04em] ${monogramSize}`}
          style={{
            color: accentMono,
            textShadow: `0 0 60px ${hexToRgba(accent, 0.35)}`,
            opacity: 0.9,
          }}
        >
          {initial}
        </span>
      </div>
      <span className="sr-only">{title}</span>
    </div>
  );
}
