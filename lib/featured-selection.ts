import { prisma } from "@/lib/prisma";
import { saveSection } from "@/lib/landing-cms";

export const FEATURED_PRODUCT_LIMIT = 4;
export const isMissingCmsTable = (error: unknown) =>
  Boolean(error && typeof error === "object" && "code" in error && error.code === "P2021");

export class FeaturedSelectionError extends Error {
  constructor(public readonly reason: "SELECT_FOUR_PRODUCTS" | "PRODUCTS_UNAVAILABLE") {
    super(reason);
  }
}

export function parseFeaturedProductIds(value: unknown): string[] {
  if (!Array.isArray(value) || value.length !== FEATURED_PRODUCT_LIMIT ||
    value.some(id => typeof id !== "string" || !id.trim()) ||
    new Set(value).size !== FEATURED_PRODUCT_LIMIT) {
    throw new FeaturedSelectionError("SELECT_FOUR_PRODUCTS");
  }
  return value as string[];
}

export async function loadLegacyFeaturedSelection() {
  const [entries, products] = await Promise.all([
    prisma.landingSection.findMany({
      where: { section: "featured_products", enabled: true },
      orderBy: { position: "asc" },
      select: { productId: true },
      take: FEATURED_PRODUCT_LIMIT,
    }),
    prisma.product.findMany({
      where: { status: "Active", available: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, image: true, price: true },
    }),
  ]);
  return {
    productIds: entries.flatMap(entry => entry.productId ? [entry.productId] : []),
    products,
  };
}

export async function saveFeaturedSelection(productIds: string[], adminName: string) {
  let config: { id: string } | null;
  try {
    config = await prisma.landingConfig.findFirst({ orderBy: { createdAt: "desc" }, select: { id: true } });
  } catch (error) {
    if (!isMissingCmsTable(error)) throw error;
    config = null;
  }
  const count = await prisma.product.count({
    where: { id: { in: productIds }, status: "Active", available: true },
  });
  if (count !== FEATURED_PRODUCT_LIMIT) throw new FeaturedSelectionError("PRODUCTS_UNAVAILABLE");

  if (config) {
    await saveSection(config.id, "featured", { productIds: productIds.join(",") }, adminName);
    return;
  }
  // Replace the four ordered slots atomically; concurrent writers cannot merge selections.
  await prisma.$transaction(async tx => {
    await tx.landingSection.deleteMany({ where: { section: "featured_products" } });
    await tx.landingSection.createMany({
      data: productIds.map((productId, position) => ({
        section: "featured_products", productId, position, enabled: true,
      })),
    });
  }, { isolationLevel: "Serializable" });
}
