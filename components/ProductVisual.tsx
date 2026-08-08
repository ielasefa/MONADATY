import { SodaCan } from "@/components/visuals/SodaCan";
import { SodaBottle } from "@/components/visuals/SodaBottle";
import { GlassDrink } from "@/components/visuals/GlassDrink";

export const PLACEHOLDER_IMAGE = "/images/placeholder.svg";

export function isPlaceholderImage(src?: string | null): boolean {
  const value = (src || "").trim();
  return value === "" || value === PLACEHOLDER_IMAGE;
}

export type VisualKind = "can" | "bottle" | "glass";

export function ProductVisual({
  name,
  visual,
  accent,
  compact = false,
  className,
}: {
  name: string;
  visual?: string | null;
  accent?: string | null;
  compact?: boolean;
  className?: string;
}) {
  if (visual === "can") {
    return <SodaCan className={className} width={compact ? 150 : 200} height={compact ? 200 : 266} accent={accent || undefined} label={name} />;
  }
  if (visual === "bottle") {
    return <SodaBottle className={className} width={compact ? 130 : 172} height={compact ? 212 : 280} accent={accent || undefined} label={name} />;
  }
  if (visual === "glass") {
    return <GlassDrink className={className} width={compact ? 160 : 210} height={compact ? 172 : 226} accent={accent || undefined} label={name} />;
  }
  return null;
}
