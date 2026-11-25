import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ unstable_cache: (callback: unknown) => callback }));
vi.mock("@/lib/logger", () => ({ logError: vi.fn(), logWarning: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    landingConfig: { findFirst: vi.fn() },
    collectionShowcaseProduct: { groupBy: vi.fn(), count: vi.fn() },
    landingSection: { findMany: vi.fn() },
    landingCollectionHeader: { findFirst: vi.fn() },
    product: { findMany: vi.fn() },
    collection: { findMany: vi.fn() },
    setting: { findUnique: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";
import { getLandingCollections, getLandingContent, getLandingFeaturedProducts, getCollectionShowcaseStats } from "@/lib/db";

const missingTable = { code: "P2021", message: "The CMS table does not exist" };
const product = {
  id: "cola",
  slug: "cola-25cl",
  name: "Cola 25cl",
  price: "80.00 DH",
  comparePrice: "",
  image: "/uploads/products/original.jpg",
  gallery: [],
  images: [{ url: "/uploads/products/cover.jpg", isCover: true, sortOrder: 0 }],
  category: { name: "Sodas" },
  collection: { slug: "cola" },
  visual: "can",
  accent: "#780B10",
  description: "",
  shortDescription: "",
  ingredients: "",
  nutrition: "",
  badges: [],
  stock: 12,
  lowStockThreshold: 5,
  available: true,
  featured: true,
  brand: "Cola",
  sku: "",
  barcode: "",
};

describe("landing images on databases created before the versioned CMS", () => {
  beforeEach(() => vi.resetAllMocks());

  it("uses saved hero media and enabled sections when the CMS tables are missing", async () => {
    vi.mocked(prisma.landingConfig.findFirst).mockRejectedValue(missingTable);
    vi.mocked(prisma.setting.findUnique).mockResolvedValue({
      value: JSON.stringify({
        hero: { media: ["/uploads/banners/original.jpg"] },
        featuredProducts: { enabled: false },
        sectionOrder: ["hero", "collections"],
      }),
    } as never);

    const content = await getLandingContent();

    expect(content.hero.media).toEqual(["/uploads/banners/original.jpg"]);
    expect(content.featuredProducts.enabled).toBe(false);
    expect(content.sectionOrder).toEqual(["hero", "collections"]);
  });

  it("restores the selected legacy products and their persisted image priority", async () => {
    vi.mocked(prisma.landingConfig.findFirst).mockRejectedValue(missingTable);
    vi.mocked(prisma.landingSection.findMany).mockResolvedValue([
      { product },
      { product: { ...product, id: "water", image: "/images/placeholder.svg" } },
    ] as never);

    const products = await getLandingFeaturedProducts();

    expect(products.map(({ id, image }) => ({ id, image }))).toEqual([
      { id: "cola", image: "/uploads/products/original.jpg" },
      { id: "water", image: "/uploads/products/cover.jpg" },
    ]);
    expect(prisma.landingSection.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { section: "featured_products", enabled: true, product: { available: true, status: "Active" } },
      orderBy: { position: "asc" },
    }));
  });

  it("keeps an empty selection in the newer CMS empty", async () => {
    vi.mocked(prisma.landingConfig.findFirst).mockResolvedValue({ featured: { productIds: "" } } as never);

    expect(await getLandingFeaturedProducts()).toEqual([]);
    expect(prisma.landingSection.findMany).not.toHaveBeenCalled();
  });

  it("continues to use products selected in the newer CMS", async () => {
    vi.mocked(prisma.landingConfig.findFirst).mockResolvedValue({ featured: { productIds: "cola" } } as never);
    vi.mocked(prisma.product.findMany).mockResolvedValue([product] as never);

    const products = await getLandingFeaturedProducts();

    expect(products[0].image).toBe("/uploads/products/original.jpg");
    expect(prisma.landingSection.findMany).not.toHaveBeenCalled();
  });

  it("loads collection photography when its CMS header table is missing", async () => {
    vi.mocked(prisma.landingCollectionHeader.findFirst).mockRejectedValue(missingTable);
    vi.mocked(prisma.collection.findMany).mockResolvedValue([{
      slug: "cola", name: "Cola", description: "", accent: "", tone: "", previewLabel: "Cola",
      image: "/uploads/collections/cola.webp", order: 1,
    }] as never);

    expect((await getLandingCollections())[0].image).toBe("/uploads/collections/cola.webp");
    expect(prisma.collection.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { products: { some: { available: true, status: "Active" } } },
    }));
  });

  it("does not treat a connection failure as a legacy database", async () => {
    vi.mocked(prisma.landingConfig.findFirst).mockRejectedValue({ code: "P1001" });

    expect(await getLandingFeaturedProducts()).toEqual([]);
    expect(prisma.landingSection.findMany).not.toHaveBeenCalled();
  });
});


describe("legacy dashboard showcase statistics", () => {
  beforeEach(() => vi.resetAllMocks());
  it("renders an unconfigured showcase without a server error for the earlier schema", async () => {
    vi.mocked(prisma.collectionShowcaseProduct.groupBy).mockRejectedValue(missingTable);
    vi.mocked(prisma.collectionShowcaseProduct.count).mockResolvedValue(0);
    expect(await getCollectionShowcaseStats()).toEqual({ configuredCollections: 0, configuredProducts: 0, perCollection: {} });
    expect(logError).not.toHaveBeenCalled();
  });
  it("keeps unexpected database failures visible in the server log", async () => {
    const failure = new Error("Database unavailable");
    vi.mocked(prisma.collectionShowcaseProduct.groupBy).mockRejectedValue(failure);
    await getCollectionShowcaseStats();
    expect(logError).toHaveBeenCalledWith(failure, "Database error in getCollectionShowcaseStats");
  });
});
