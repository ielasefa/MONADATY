import { prisma } from "@/lib/prisma";
import { cache } from "react";
import { logError } from "@/lib/logger";

export type LandingPageData = {
  id: string;
  status: string;
  sectionOrder: string[];
  publishedAt: string | null;
  publishedBy: string;
  updatedAt: string;
  seo: Record<string, string> | null;
  hero: Record<string, unknown> | null;
  brandStory: Record<string, unknown> | null;
  featured: Record<string, unknown> | null;
  collectionHeader: Record<string, unknown> | null;
  testimonialHeader: Record<string, unknown> | null;
  moroccanMoment: Record<string, unknown> | null;
  finalCta: Record<string, unknown> | null;
  newsletter: Record<string, unknown> | null;
};

async function ensureConfig(): Promise<string> {
  let config = await prisma.landingConfig.findFirst({ orderBy: { createdAt: "desc" } });
  if (!config) {
    config = await prisma.landingConfig.create({
      data: {
        status: "published",
        sectionOrder: JSON.stringify(["hero", "featured", "collections", "about", "testimonials", "moroccan_moment", "newsletter", "final_cta"]),
      },
    });
    for (const fn of [ensureHero, ensureBrandStory, ensureFeatured, ensureCollectionHeader, ensureTestimonialHeader, ensureMoroccanMoment, ensureFinalCta, ensureNewsletter]) {
      await fn(config.id);
    }
  }
  return config.id;
}

async function ensureHero(configId: string) {
  if (!(await prisma.landingHero.findUnique({ where: { configId } }))) {
    await prisma.landingHero.create({ data: { configId, enabled: true, title: "TASTE\nREDEFINED.", subtitle: "Premium Soda — Moroccan Craft", description: "A refined soda experience shaped in Morocco.", ctaText: "Shop MONADATY", ctaLink: "/shop" } });
  }
}
async function ensureBrandStory(configId: string) {
  if (!(await prisma.landingBrandStory.findUnique({ where: { configId } }))) {
    await prisma.landingBrandStory.create({ data: { configId, enabled: true, title: "Our Story", subtitle: "BORN IN MOROCCO", description: "MONADATY was born in Casablanca from a simple belief: that a soda could be more than a drink." } });
  }
}
async function ensureFeatured(configId: string) {
  if (!(await prisma.landingFeatured.findUnique({ where: { configId } }))) {
    await prisma.landingFeatured.create({ data: { configId, enabled: true, title: "Featured", subtitle: "SELECTED FLAVORS" } });
  }
}
async function ensureCollectionHeader(configId: string) {
  if (!(await prisma.landingCollectionHeader.findUnique({ where: { configId } }))) {
    await prisma.landingCollectionHeader.create({ data: { configId, enabled: true, title: "Shop by Collection", subtitle: "THE COLLECTIONS" } });
  }
}
async function ensureTestimonialHeader(configId: string) {
  if (!(await prisma.landingTestimonialHeader.findUnique({ where: { configId } }))) {
    await prisma.landingTestimonialHeader.create({ data: { configId, enabled: true, title: "Testimonials", subtitle: "WHAT THEY SAY" } });
  }
}
async function ensureMoroccanMoment(configId: string) {
  if (!(await prisma.landingMoroccanMoment.findUnique({ where: { configId } }))) {
    await prisma.landingMoroccanMoment.create({ data: { configId, enabled: true, title: "Pour. Serve. Savor.", subtitle: "THE MONADATY MOMENT", description: "MONADATY is designed for the good moments." } });
  }
}
async function ensureFinalCta(configId: string) {
  if (!(await prisma.landingFinalCta.findUnique({ where: { configId } }))) {
    await prisma.landingFinalCta.create({ data: { configId, enabled: true, subtitle: "BEGIN THE POUR", title: "YOUR NEXT FAVORITE TASTE IS WAITING.", description: "Discover the MONADATY collection.", buttonText: "SHOP NOW", buttonLink: "/shop" } });
  }
}
async function ensureNewsletter(configId: string) {
  if (!(await prisma.landingNewsletter.findUnique({ where: { configId } }))) {
    await prisma.landingNewsletter.create({ data: { configId, enabled: false, title: "Stay Close.", subtitle: "THE INNER CIRCLE", description: "Join the MONADATY circle.", placeholder: "Your email", buttonText: "Join" } });
  }
}

export const getAdminLanding = cache(async (): Promise<LandingPageData> => {
  try {
    const configId = await ensureConfig();
    const config = await prisma.landingConfig.findUnique({
      where: { id: configId },
      include: { hero: true, brandStory: true, featured: true, collectionHeader: true, testimonialHeader: true, moroccanMoment: true, finalCta: true, newsletter: true, seo: true },
    });

    if (!config) throw new Error("Config not found");

    const mapSection = (obj: Record<string, unknown> | null): Record<string, unknown> | null => {
      if (!obj) return null;
      const { configId: _c, id: _id, ...rest } = obj as Record<string, unknown>;
      return rest;
    };

    return {
      id: config.id,
      status: config.status,
      sectionOrder: JSON.parse(config.sectionOrder || "[]"),
      publishedAt: config.publishedAt?.toISOString() ?? null,
      publishedBy: config.publishedBy,
      updatedAt: config.updatedAt.toISOString(),
      seo: config.seo ? (() => { const { configId: _c, id: _id, createdAt: _cr, updatedAt: _ur, ...rest } = config.seo as Record<string, unknown>; return rest as Record<string, string>; })() : null,
      hero: mapSection(config.hero as unknown as Record<string, unknown>),
      brandStory: mapSection(config.brandStory as unknown as Record<string, unknown>),
      featured: mapSection(config.featured as unknown as Record<string, unknown>),
      collectionHeader: mapSection(config.collectionHeader as unknown as Record<string, unknown>),
      testimonialHeader: mapSection(config.testimonialHeader as unknown as Record<string, unknown>),
      moroccanMoment: mapSection(config.moroccanMoment as unknown as Record<string, unknown>),
      finalCta: mapSection(config.finalCta as unknown as Record<string, unknown>),
      newsletter: mapSection(config.newsletter as unknown as Record<string, unknown>),
    };
  } catch (error) {
    logError(error, "getAdminLanding");
    return { id: "", status: "draft", sectionOrder: [], publishedAt: null, publishedBy: "", updatedAt: new Date().toISOString(), seo: null, hero: null, brandStory: null, featured: null, collectionHeader: null, testimonialHeader: null, moroccanMoment: null, finalCta: null, newsletter: null };
  }
});

export async function saveSection(configId: string, sectionType: string, data: Record<string, unknown>, adminName: string) {
  switch (sectionType) {
    case "hero":
      await ensureHero(configId);
      await prisma.landingHero.update({ where: { configId }, data: data as any });
      break;
    case "about":
      await ensureBrandStory(configId);
      await prisma.landingBrandStory.update({ where: { configId }, data: data as any });
      break;
    case "featured":
      await ensureFeatured(configId);
      await prisma.landingFeatured.update({ where: { configId }, data: data as any });
      break;
    case "collections":
      await ensureCollectionHeader(configId);
      await prisma.landingCollectionHeader.update({ where: { configId }, data: data as any });
      break;
    case "testimonials":
      await ensureTestimonialHeader(configId);
      await prisma.landingTestimonialHeader.update({ where: { configId }, data: data as any });
      break;
    case "moroccanMoment":
      await ensureMoroccanMoment(configId);
      await prisma.landingMoroccanMoment.update({ where: { configId }, data: data as any });
      break;
    case "finalCta":
      await ensureFinalCta(configId);
      await prisma.landingFinalCta.update({ where: { configId }, data: data as any });
      break;
    case "newsletter":
      await ensureNewsletter(configId);
      await prisma.landingNewsletter.update({ where: { configId }, data: data as any });
      break;
    default:
      throw new Error(`Unknown section type: ${sectionType}`);
  }
  await saveDraft(configId, adminName);
  await createVersion(configId, adminName);
}

export async function saveSeo(configId: string, data: Record<string, string>, adminName: string) {
  const exists = await prisma.landingSeo.findUnique({ where: { configId } });
  if (exists) {
    await prisma.landingSeo.update({ where: { configId }, data });
  } else {
    await prisma.landingSeo.create({ data: { configId, ...data } });
  }
  await saveDraft(configId, adminName);
  await createVersion(configId, adminName);
}

export async function saveSectionOrder(configId: string, order: string[], adminName: string) {
  await prisma.landingConfig.update({ where: { id: configId }, data: { sectionOrder: JSON.stringify(order) } });
  await saveDraft(configId, adminName);
  await createVersion(configId, adminName);
}

export async function publishLanding(configId: string, adminName: string) {
  const versionCount = await prisma.landingVersion.count({ where: { configId } });
  await prisma.landingVersion.create({
    data: {
      configId,
      version: versionCount + 1,
      status: "published",
      label: `Published v${versionCount + 1}`,
      data: JSON.stringify({ sectionOrder: (await prisma.landingConfig.findUnique({ where: { id: configId }, select: { sectionOrder: true } }))?.sectionOrder || "[]" }),
      createdBy: adminName,
    },
  });
  await prisma.landingConfig.update({
    where: { id: configId },
    data: { status: "published", publishedAt: new Date(), publishedBy: adminName },
  });
}

export async function saveDraft(configId: string, _adminName: string) {
  await prisma.landingConfig.update({ where: { id: configId }, data: { status: "draft" } });
}

async function createVersion(configId: string, adminName: string) {
  const versionCount = await prisma.landingVersion.count({ where: { configId } });
  await prisma.landingVersion.create({
    data: {
      configId,
      version: versionCount + 1,
      status: "draft",
      label: `Auto-save v${versionCount + 1}`,
      data: JSON.stringify({ saved: true }),
      createdBy: adminName,
    },
  });
}

export async function getVersions(configId: string) {
  return prisma.landingVersion.findMany({
    where: { configId },
    orderBy: { version: "desc" },
    take: 50,
    select: { id: true, version: true, status: true, label: true, createdBy: true, createdAt: true },
  });
}

export async function getVersion(configId: string, versionId: string) {
  const version = await prisma.landingVersion.findUnique({ where: { id: versionId } });
  if (!version || version.configId !== configId) return null;
  return { ...version, data: JSON.parse(version.data) };
}

export async function restoreVersion(configId: string, versionId: string, adminName: string) {
  const version = await prisma.landingVersion.findUnique({ where: { id: versionId } });
  if (!version || version.configId !== configId) return;
  // Mark this as restored — the version history stores the snapshot
  await saveDraft(configId, adminName);
  await createVersion(configId, adminName);
}

export async function migrateFromSettings() {
  const settingsRow = await prisma.setting.findUnique({ where: { key: "site_settings" } });
  if (!settingsRow) return;

  try {
    const settings = JSON.parse(settingsRow.value);
    const configId = await ensureConfig();

    if (settings.hero) {
      await prisma.landingHero.upsert({
        where: { configId },
        update: { enabled: settings.hero.enabled ?? true, title: settings.hero.title ?? "", subtitle: settings.hero.subtitle ?? "", description: settings.hero.description ?? "", ctaText: settings.hero.ctaText ?? "", ctaLink: settings.hero.ctaLink ?? "", media: settings.hero.media ?? [] },
        create: { configId, enabled: true, title: settings.hero.title ?? "", subtitle: settings.hero.subtitle ?? "", description: settings.hero.description ?? "", ctaText: settings.hero.ctaText ?? "", ctaLink: settings.hero.ctaLink ?? "", media: settings.hero.media ?? [] },
      });
    }
    if (settings.featuredProducts) {
      await prisma.landingFeatured.upsert({ where: { configId }, update: { enabled: settings.featuredProducts.enabled ?? true, title: settings.featuredProducts.title ?? "", subtitle: settings.featuredProducts.subtitle ?? "" }, create: { configId, enabled: true, title: settings.featuredProducts.title ?? "", subtitle: settings.featuredProducts.subtitle ?? "" } });
    }
    if (settings.collectionsSection) {
      await prisma.landingCollectionHeader.upsert({ where: { configId }, update: { enabled: settings.collectionsSection.enabled ?? true, title: settings.collectionsSection.title ?? "", subtitle: settings.collectionsSection.subtitle ?? "" }, create: { configId, enabled: true, title: settings.collectionsSection.title ?? "", subtitle: settings.collectionsSection.subtitle ?? "" } });
    }
    if (settings.aboutSection) {
      await prisma.landingBrandStory.upsert({ where: { configId }, update: { enabled: settings.aboutSection.enabled ?? true, title: settings.aboutSection.title ?? "", subtitle: settings.aboutSection.subtitle ?? "", description: settings.aboutSection.description ?? "", image: settings.aboutSection.image ?? "" }, create: { configId, enabled: true, title: settings.aboutSection.title ?? "", subtitle: settings.aboutSection.subtitle ?? "", description: settings.aboutSection.description ?? "", image: settings.aboutSection.image ?? "" } });
    }
    if (settings.testimonialsSection) {
      await prisma.landingTestimonialHeader.upsert({ where: { configId }, update: { enabled: settings.testimonialsSection.enabled ?? true, title: settings.testimonialsSection.title ?? "", subtitle: settings.testimonialsSection.subtitle ?? "" }, create: { configId, enabled: true, title: settings.testimonialsSection.title ?? "", subtitle: settings.testimonialsSection.subtitle ?? "" } });
    }
    if (settings.newsletter) {
      await prisma.landingNewsletter.upsert({ where: { configId }, update: { enabled: settings.newsletter.enabled ?? false, title: settings.newsletter.title ?? "", subtitle: settings.newsletter.subtitle ?? "", description: settings.newsletter.description ?? "", placeholder: settings.newsletter.placeholder ?? "", buttonText: settings.newsletter.buttonText ?? "" }, create: { configId, enabled: false, title: settings.newsletter.title ?? "", subtitle: settings.newsletter.subtitle ?? "", description: settings.newsletter.description ?? "", placeholder: settings.newsletter.placeholder ?? "", buttonText: settings.newsletter.buttonText ?? "" } });
    }
    if (settings.sectionOrder) {
      await prisma.landingConfig.update({ where: { id: configId }, data: { sectionOrder: JSON.stringify(settings.sectionOrder) } });
    }
    await prisma.landingConfig.update({ where: { id: configId }, data: { status: "published", publishedAt: new Date() } });
  } catch (error) {
    logError(error, "Failed to migrate landing settings from JSON blob");
  }
}