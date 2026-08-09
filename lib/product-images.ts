export const PRODUCT_PLACEHOLDER_IMAGE = "/images/placeholder.svg";

export type ProductImageRecord = {
  url?: string | null;
  isCover?: boolean;
  sortOrder?: number;
};

export type ProductImageSubject = {
  name: string;
  image?: string | null;
  images?: ProductImageRecord[] | null;
  gallery?: (string | null | undefined)[] | null;
  brand?: string | null;
  category?: string | null;
  collection?: string | null;
  visual?: string | null;
  accent?: string | null;
};

export function isUsableProductImage(src?: string | null): boolean {
  const value = (src || "").trim();
  return value !== "" && value !== PRODUCT_PLACEHOLDER_IMAGE;
}

function orderedProductImages(images?: ProductImageRecord[] | null): ProductImageRecord[] {
  return [...(images || [])].sort(
    (a, b) => (a.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortOrder ?? Number.MAX_SAFE_INTEGER),
  );
}

/**
 * Resolves only persisted database images. Product.image is deliberately first:
 * a ProductImage cover or legacy gallery entry must never override an admin-selected image.
 */
export function resolveDatabaseProductImage(product: Omit<ProductImageSubject, "name">): string {
  if (isUsableProductImage(product.image)) return product.image!.trim();

  const images = orderedProductImages(product.images);
  const cover = images.find((entry) => entry.isCover && isUsableProductImage(entry.url));
  if (cover?.url) return cover.url.trim();

  const firstImage = images.find((entry) => isUsableProductImage(entry.url));
  if (firstImage?.url) return firstImage.url.trim();

  const galleryImage = product.gallery?.find(isUsableProductImage);
  return galleryImage?.trim() || "";
}

/**
 * Produces a synchronized storefront gallery. Structured ProductImage rows are canonical
 * when present; legacy gallery[] is used only for products without those rows.
 */
export function resolveDatabaseProductGallery(product: Omit<ProductImageSubject, "name">): string[] {
  const primary = resolveDatabaseProductImage(product);
  const structured = orderedProductImages(product.images)
    .map((entry) => entry.url?.trim() || "")
    .filter(isUsableProductImage);
  const legacy = (product.gallery || [])
    .map((entry) => entry?.trim() || "")
    .filter(isUsableProductImage);
  const candidates = structured.length > 0 ? structured : legacy;

  return [primary, ...candidates].filter(
    (src, index, all) => isUsableProductImage(src) && all.indexOf(src) === index,
  );
}

export type ProductFallbackKind = "cola" | "water" | "juice" | "citrus" | "energy" | "dairy" | "drink";
export type ProductFallbackFormat = "can" | "bottle" | "jug" | "carton" | "glass" | "pack";

export type ProductFallbackProfile = {
  kind: ProductFallbackKind;
  format: ProductFallbackFormat;
  brandLabel: string;
  detailLabel: string;
  sizeLabel: string;
  accent: string;
  secondary: string;
  liquid: string;
};

const KNOWN_BRANDS = [
  "COCA-COLA",
  "COCA COLA",
  "AIN SAISS",
  "SIDI ALI",
  "SIDI HARAZEM",
  "RED BULL",
  "SAN PELLEGRINO",
  "SCHWEPPES",
  "ORANGINA",
  "AQUAFINA",
  "CRISTALINE",
  "MIRINDA",
  "SPRITE",
  "PEPSI",
  "CAPPY",
  "HAWAI",
  "HAWAII",
  "OULMES",
  "MONSTER",
  "POMS",
] as const;

function normalizedText(product: ProductImageSubject): string {
  return [product.name, product.brand, product.category, product.collection, product.visual]
    .filter(Boolean)
    .join(" ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

function includesAny(value: string, words: readonly string[]): boolean {
  return words.some((word) => value.includes(word));
}

function extractSize(value: string): string {
  const match = value.match(/\b(\d+(?:[.,]\d+)?)\s*(ML|CL|L)\b/i);
  return match ? `${match[1].replace(",", ".")} ${match[2].toUpperCase()}` : "";
}

function inferKind(value: string): ProductFallbackKind {
  if (includesAny(value, ["WATER", "EAU", "AQUA", "AIN SAISS", "SIDI ALI", "SIDI HARAZEM", "OULMES", "BAHIA", "CRISTALINE"])) return "water";
  if (includesAny(value, ["JUICE", "JUS", "NECTAR", "CAPPY", "POMS", "MANGO", "MANGUE", "POMME", "ANANAS", "TROPICAL", "PEACH", "PECHE", "LYCHEE"])) return "juice";
  if (includesAny(value, ["COLA", "COCA", "COKE", "PEPSI"])) return "cola";
  if (includesAny(value, ["CITRUS", "ORANGE", "CITRON", "LEMON", "LIME", "SPRITE", "FANTA", "MIRINDA", "HAWAI", "HAWAII", "ORANGINA"])) return "citrus";
  if (includesAny(value, ["ENERGY", "RED BULL", "MONSTER", "BURN"])) return "energy";
  if (includesAny(value, ["MILK", "LAIT", "YOGURT", "YAOURT"])) return "dairy";
  return "drink";
}

function inferFormat(value: string, visual?: string | null): ProductFallbackFormat {
  const explicit = visual?.trim().toLowerCase();
  if (value.includes(" PACK ")) return "pack";
  if (includesAny(value, ["CANETTE", " BOITE ", " CAN ", "TIN "])) return "can";
  if (includesAny(value, ["CARTON", "BRICK", "TETRA"])) return "carton";
  const literSize = value.match(/\b(\d+(?:[.,]\d+)?)\s*L\b/);
  if (literSize && Number.parseFloat(literSize[1].replace(",", ".")) >= 5) return "jug";
  if (explicit === "can" || explicit === "glass" || explicit === "bottle") return explicit;
  return "bottle";
}

function inferredBrand(product: ProductImageSubject, value: string): string {
  const explicitBrand = product.brand?.trim();
  if (explicitBrand) return explicitBrand.toUpperCase().slice(0, 18);
  const known = KNOWN_BRANDS.find((brand) => value.includes(brand));
  if (known) return known.replace("COCA COLA", "COCA-COLA").slice(0, 18);

  const cleaned = product.name
    .replace(/\b\d+(?:[.,]\d+)?\s*(?:ml|cl|l)\b/gi, "")
    .replace(/\b(can|canette|bottle|bouteille|pet|carton|brick|tetra)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  return (cleaned || "MONADATY").split(" ").slice(0, 2).join(" ").toUpperCase().slice(0, 18);
}

function fallbackPalette(kind: ProductFallbackKind, value: string) {
  if (kind === "water") return { accent: "#3B91C8", secondary: "#BFE8F7", liquid: "#DDF5FC" };
  if (kind === "cola") return { accent: "#B8242F", secondary: "#F4E5D0", liquid: "#3A160F" };
  if (kind === "energy") return { accent: "#C7A849", secondary: "#171715", liquid: "#E8D458" };
  if (kind === "dairy") return { accent: "#4F80B7", secondary: "#F5F1E8", liquid: "#FFFDF7" };
  if (value.includes("POMS")) return { accent: "#A62B35", secondary: "#E7B94F", liquid: "#B43A38" };
  if (includesAny(value, ["LYCHEE", "ROSE "])) return { accent: "#B84F6D", secondary: "#F0A5B8", liquid: "#D8738D" };
  if (includesAny(value, ["PEACH", "PECHE"])) return { accent: "#D97852", secondary: "#F2B87D", liquid: "#E99363" };
  if (includesAny(value, ["ORANGE", "CAPPY", "MIRINDA", "HAWAI", "HAWAII", "MANGO", "MANGUE"])) {
    return { accent: "#E97824", secondary: "#FFD35C", liquid: "#F49A2E" };
  }
  if (includesAny(value, ["LEMON", "LIME", "CITRON", "SPRITE"])) {
    return { accent: "#72A94B", secondary: "#D8DF55", liquid: "#DDEB78" };
  }
  if (includesAny(value, ["BERRY", "BERRIES", "FRAISE", "FRAMBOISE", "POMEGRANATE", "GRENADE"])) {
    return { accent: "#8D2636", secondary: "#D95C6F", liquid: "#A52E43" };
  }
  if (kind === "juice") return { accent: "#E78A2C", secondary: "#F5C554", liquid: "#EFA13E" };
  if (kind === "citrus") return { accent: "#D9952E", secondary: "#F0D85B", liquid: "#E6B53A" };
  return { accent: "#B89B5E", secondary: "#6E1F2A", liquid: "#B89B5E" };
}

function usableAccent(accent?: string | null): string {
  const value = accent?.trim() || "";
  if (!/^#[0-9a-f]{6}$/i.test(value)) return "";
  const normalized = value.toLowerCase();
  return ["#c8a96a", "#d5b87d", "#d6b35a"].includes(normalized) ? "" : value;
}

export function getProductFallbackProfile(product: ProductImageSubject): ProductFallbackProfile {
  const value = ` ${normalizedText(product)} `;
  const kind = inferKind(value);
  const palette = fallbackPalette(kind, value);
  const sizeLabel = extractSize(value);
  const kindLabel: Record<ProductFallbackKind, string> = {
    cola: "COLA",
    water: "WATER",
    juice: "JUICE",
    citrus: includesAny(value, ["ORANGE", "HAWAI", "HAWAII", "MANGO", "MANGUE"]) ? "ORANGE" : "CITRUS",
    energy: "ENERGY",
    dairy: "DAIRY",
    drink: "DRINK",
  };

  return {
    kind,
    format: inferFormat(value, product.visual),
    brandLabel: inferredBrand(product, value),
    detailLabel: kindLabel[kind],
    sizeLabel,
    accent: usableAccent(product.accent) || palette.accent,
    secondary: palette.secondary,
    liquid: palette.liquid,
  };
}
