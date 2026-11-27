import Image from "next/image";
import { BRAND_LOGO_SRC, BRAND_NAME } from "@/lib/brand";

export function BrandLogo({ className = "", width = 240, height = 80, priority = false }: {
  className?: string; width?: number; height?: number; priority?: boolean;
}) {
  return <Image src={BRAND_LOGO_SRC} alt={BRAND_NAME} width={width} height={height} priority={priority} unoptimized className={`brand-logo ${className}`} />;
}
