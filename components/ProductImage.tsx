"use client";

import type { ReactNode } from "react";
import { ProductImageFallback } from "@/components/ProductImageFallback";
import { SafeImage } from "@/components/SafeImage";
import {
  resolveDatabaseProductImage,
  type ProductImageSubject,
} from "@/lib/product-images";

type ProductImageProps = {
  product: ProductImageSubject;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
  blurDataURL?: string;
  fallback?: ReactNode;
};

/** Renders the persisted database image exactly; the illustration exists only as a display fallback. */
export function ProductImage({
  product,
  alt = product.name,
  className = "object-contain",
  fallbackClassName = "",
  sizes,
  priority,
  fill = true,
  width,
  height,
  blurDataURL,
  fallback,
}: ProductImageProps) {
  const source = resolveDatabaseProductImage(product);
  const fallbackVisual = fallback ?? (
    <ProductImageFallback product={product} className={fallbackClassName} />
  );

  if (!source) return <>{fallbackVisual}</>;

  return (
    <SafeImage
      src={source}
      alt={alt}
      className={className}
      sizes={sizes}
      priority={priority}
      fill={fill}
      width={width}
      height={height}
      blurDataURL={blurDataURL}
      fallback={fallbackVisual}
    />
  );
}
