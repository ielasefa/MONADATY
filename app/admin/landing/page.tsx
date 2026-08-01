import type { Metadata } from "next";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { getTestimonials } from "@/lib/data";
import { getAdminLanding, getVersions, migrateFromSettings } from "@/lib/landing-cms";
import { prisma } from "@/lib/prisma";
import { LandingCMS } from "./LandingCMS";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Landing Page CMS" };

async function ensureConfigId(): Promise<string> {
  let config = await prisma.landingConfig.findFirst({ orderBy: { createdAt: "desc" } });
  if (!config) {
    await migrateFromSettings();
    config = await prisma.landingConfig.findFirst({ orderBy: { createdAt: "desc" } });
  }
  if (!config) throw new Error("Failed to create landing config");
  return config.id;
}

async function getFeaturedSectionEntries() {
  const entries = await prisma.landingSection.findMany({
    where: { section: "featured_products", productId: { not: null } },
    orderBy: { position: "asc" },
    include: { product: { select: { id: true, name: true, slug: true, price: true, image: true } } },
  });
  return entries.filter((e) => e.productId && e.product).map((e) => ({
    id: e.id, position: e.position, enabled: e.enabled,
    productId: e.productId!, product: e.product,
  }));
}

export default async function AdminLandingPage() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Unauthorized");

  const configId = await ensureConfigId();
  const [landingData, testimonials, featuredEntries, versions] = await Promise.all([
    getAdminLanding(),
    getTestimonials(),
    getFeaturedSectionEntries(),
    getVersions(configId),
  ]);

  const allCollections = (await prisma.collection.findMany({ orderBy: { order: "asc" } })).map((c) => ({
    id: c.id, name: c.name, slug: c.slug, image: c.image,
    landingEnabled: c.landingEnabled, landingOrder: c.landingOrder,
  }));

  return (
      <LandingCMS
        configId={configId}
        landingData={landingData}
        testimonials={testimonials}
        featuredEntries={featuredEntries}
        allCollections={allCollections}
        versions={versions.map((v: { id: string; version: number; status: string; label: string; createdBy: string; createdAt: Date }) => ({
          id: v.id, version: v.version, status: v.status, label: v.label,
          createdBy: v.createdBy, createdAt: v.createdAt.toISOString(),
        }))}
      />
  );
}
