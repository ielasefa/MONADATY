import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const siteUrl = process.env.APP_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/collections`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.6 },
  ];

  let dynamicRoutes: MetadataRoute.Sitemap = [];

  try {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: { available: true, status: "Active" },
        select: { id: true, updatedAt: true },
      }),
      prisma.category.findMany({ select: { slug: true } }),
    ]);

    dynamicRoutes = [
      ...products.map((p) => ({
        url: `${siteUrl}/product/${p.id}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...categories.map((c) => ({
        url: `${siteUrl}/shop?category=${c.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ];
  } catch {
    // If the database is unavailable, serve only static routes.
  }

  return [...staticRoutes, ...dynamicRoutes];
}
