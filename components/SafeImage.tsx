"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";

type SafeImageProps = {
  src?: string | null;
  alt: string;
  fallback?: ReactNode;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  blurDataURL?: string;
};

const PLACEHOLDER_SRC = "/images/placeholder.svg";
const FALLBACK_BLUR =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMTQxNDE0Ii8+PHBhdGggZD0iTTAgMGgxMHYxMEgwVjB6IiBmaWxsPSIjRkZGRkZGIiBvcGFjaXR5PSIwLjA2Ii8+PC9zdmc+";

export function SafeImage({
  src,
  alt,
  fallback,
  className = "",
  sizes: sizesProp,
  priority,
  fill,
  width,
  height,
  blurDataURL,
}: SafeImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const normalizedSrc = typeof src === "string" ? src.trim() : "";
  const resolvedSrc = !normalizedSrc || imageError ? PLACEHOLDER_SRC : normalizedSrc;
  const showFallbackOverlay = Boolean(fallback) && (!normalizedSrc || imageError);
  const showSkeleton = !isLoaded && !imageError;

  const imgWidth = fill ? undefined : (width ?? 1200);
  const imgHeight = fill ? undefined : (height ?? 1200);

  useEffect(() => {
    setImageError(false);
    setIsLoaded(false);
  }, [normalizedSrc]);

  return (
    <span
      className={`${fill ? "relative block h-full w-full" : "relative inline-block"} storefront-image-shell`}
      data-image-loaded={isLoaded || imageError ? "true" : "false"}
    >
      <Image
        src={resolvedSrc}
        alt={alt}
        className={className}
        placeholder="blur"
        blurDataURL={blurDataURL || FALLBACK_BLUR}
        loading={priority ? undefined : "lazy"}
        decoding="async"
        onError={() => setImageError(true)}
        onLoad={() => setIsLoaded(true)}
        sizes={sizesProp}
        fill={fill || false}
        width={imgWidth}
        height={imgHeight}
        fetchPriority={priority ? "high" : undefined}
      />
      {showSkeleton ? (
        <span className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/[0.04] via-surface to-white/[0.04]" aria-hidden />
      ) : null}
      {showFallbackOverlay ? <span className="absolute inset-0">{fallback}</span> : null}
    </span>
  );
}
