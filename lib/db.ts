import { prisma } from "@/lib/prisma";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import type { ProductData, CollectionData, SiteSettings } from "@/types";
import { logError, logWarning } from "@/lib/logger";

export const productInclude = { category: true, collection: true } as const;

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  websiteName: "MONADATY",
  logo: "",
  favicon: "",
  contactEmail: "hello@monadaty.com",
  phone: "+212 5XX-XXXXXX",
  address: "Casablanca, Morocco",
  socialLinks: { twitter: "", instagram: "https://instagram.com/monadaty", facebook: "" },
  footer: {
    description: "Premium soda crafted in Morocco.",
    copyright: "© 2025 MONADATY. All rights reserved.",
    email: "hello@monadaty.com",
    phone: "+212 5XX-XXXXXX",
    address: "Casablanca, Morocco",
  },
  hero: {
    enabled: true,
    title: "TASTE\nREDEFINED.",
    subtitle: "Premium Soda — Moroccan Craft",
    description: "A refined soda experience shaped in Morocco. For those who expect more from every sip.",
    ctaText: "Shop MONADATY",
    ctaLink: "/shop",
    media: [],
  },
  featuredProducts: { enabled: true, title: "Featured", subtitle: "SELECTED FLAVORS" },
  collectionsSection: { enabled: true, title: "Shop by Collection", subtitle: "THE COLLECTIONS" },
  articlesSection: { enabled: false, title: "Latest Articles", subtitle: "Stories from our world" },
  aboutSection: { enabled: true, title: "Our Story", subtitle: "BORN IN MOROCCO", description: "MONADATY was born in Casablanca from a simple belief: that a soda could be more than a drink. More crafted. More intentional. More Moroccan.\n\nEvery bottle is a statement of taste, quality, and the confidence of a brand that refuses to be ordinary.", image: "" },
  testimonialsSection: { enabled: true, title: "Testimonials", subtitle: "WHAT THEY SAY" },
  announcementBar: { enabled: false, text: "", link: "", buttonText: "", bgColor: "", textColor: "" },
  navbarBanner: { enabled: false, text: "", image: "" },
  newsletter: { enabled: false, title: "Stay Close.", subtitle: "THE INNER CIRCLE", description: "Join the MONADATY circle for rare releases and brand stories.", placeholder: "Your email", buttonText: "Join" },
  sectionOrder: ["announcement", "hero", "featured", "collections", "about", "testimonials", "newsletter"],
};

export function mapProductToData(p: {
  id: string; name: string; slug: string; price: string; comparePrice: string;
  image: string; gallery: string[]; visual: string; accent: string;
  description: string; shortDescription: string; ingredients: string; nutrition: string;
  badges: string[]; stock: number; featured: boolean; isBestSeller?: boolean; available: boolean;
  category: { name: string } | null;
  collection: { slug: string } | null;
}): ProductData {
  return {
    id: p.id, name: p.name, slug: p.slug, price: p.price, comparePrice: p.comparePrice,
    image: p.image, gallery: p.gallery ?? [], category: p.category?.name ?? "",
    collection: p.collection?.slug ?? "", visual: p.visual as "can" | "bottle" | "glass" | undefined,
    accent: p.accent || undefined, description: p.description, shortDescription: p.shortDescription ?? "",
    ingredients: p.ingredients ?? "", nutrition: p.nutrition ?? "", badges: p.badges ?? [],
    stock: p.stock, featured: p.featured, isBestSeller: p.isBestSeller, available: p.available,
  };
}

export function mapCollectionData(c: {
  slug: string; name: string; description: string; accent: string; tone: string;
  previewLabel: string; image: string; order: number;
}): CollectionData {
  return {
    slug: c.slug, title: c.name, description: c.description, accent: c.accent,
    tone: c.tone, previewLabel: c.previewLabel, image: c.image || "", order: c.order,
  };
}

export const getProducts = cache(async (): Promise<ProductData[]> => {
  try {
    const rows = await prisma.product.findMany({
      include: productInclude,
      orderBy: { createdAt: "desc" },
    });
    return rows.map(mapProductToData);
  } catch (error) {
    logError(error, "Database error in getProducts");
    return [];
  }
});

export const getProductById = cache(async (id: string): Promise<ProductData | null> => {
  try {
    const p = await prisma.product.findUnique({ where: { id }, include: productInclude });
    if (!p) return null;
    return mapProductToData(p);
  } catch (error) {
    logError(error, `Database error in getProductById for id ${id}`);
    return null;
  }
});

export const getTopSellingProducts = cache(async (limit: number): Promise<ProductData[]> => {
  try {
    const salesAgg = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: { productId: { not: null } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
    });
    const soldIds = salesAgg.map((s) => s.productId).filter(Boolean) as string[];
    const soldProducts = soldIds.length
      ? await prisma.product.findMany({
          where: { id: { in: soldIds }, available: true, stock: { gt: 0 } },
          include: productInclude,
        })
      : [];
    const soldMap = new Map(soldProducts.map((p) => [p.id, p]));
    const sortedSold = soldIds.map((id) => soldMap.get(id)).filter(Boolean) as typeof soldProducts;
    return sortedSold.slice(0, limit).map(mapProductToData);
  } catch (error) {
    logError(error, "Database error in getTopSellingProducts");
    return [];
  }
});

export const getRelatedProducts = cache(async (currentId: string, category: string, limit = 3): Promise<ProductData[]> => {
  try {
    const cat = await prisma.category.findUnique({ where: { slug: category.toLowerCase() } });
    const same = cat
      ? await prisma.product.findMany({
          where: { categoryId: cat.id, id: { not: currentId }, available: true },
          include: productInclude, take: limit,
        })
      : [];
    const remainder = limit - same.length;
    let others: typeof same = [];
    if (remainder > 0) {
      others = await prisma.product.findMany({
        where: { id: { not: currentId, notIn: same.map((s) => s.id) }, available: true },
        include: productInclude, take: remainder,
      });
    }
    return [...same, ...others].map(mapProductToData);
  } catch (error) {
    logError(error, "Database error in getRelatedProducts");
    return [];
  }
});

export const getCollections = cache(async (): Promise<CollectionData[]> => {
  try {
    const rows = await prisma.collection.findMany({ orderBy: { order: "asc" } });
    return rows.map(mapCollectionData);
  } catch (error) {
    logError(error, "Database error in getCollections");
    return [];
  }
});

export const getLandingCollections = unstable_cache(
  async (): Promise<CollectionData[]> => {
  try {
    const header = await prisma.landingCollectionHeader.findFirst({ orderBy: { configId: "asc" } });
    const selectedIds = header?.selectedCollectionIds
      ? header.selectedCollectionIds.split(",").filter(Boolean)
      : [];

    if (selectedIds.length > 0) {
      const rows = await prisma.collection.findMany({
        where: { id: { in: selectedIds } },
      });
      const byId = new Map(rows.map((r) => [r.id, r]));
      const ordered = selectedIds
        .map((id) => byId.get(id))
        .filter(Boolean) as typeof rows;
      return ordered.map(mapCollectionData);
    }

    const fallback = await prisma.collection.findMany({
      orderBy: { order: "asc" },
      take: 3,
    });
    return fallback.map(mapCollectionData);
  } catch (error) {
    logError(error, "Database error in getLandingCollections");
    return [];
  }
},
  [],
  { tags: ["landing"] },
);

export const getCategories = cache(async () => {
  try {
    return await prisma.category.findMany({ orderBy: { name: "asc" } });
  } catch (error) {
    logError(error, "Database error in getCategories");
    return [];
  }
});

export const getTestimonials = unstable_cache(
  async () => {
  try {
    return await prisma.testimonial.findMany({
      where: { visible: true },
      orderBy: { order: "asc" },
      select: { name: true, role: true, content: true, visible: true, id: true, order: true, avatar: true },
    });
  } catch (error) {
    logError(error, "Database error in getTestimonials");
    return [];
  }
},
  [],
  { tags: ["landing"] },
);

export const getAllTestimonials = cache(async () => {
  try {
    return await prisma.testimonial.findMany({
      orderBy: { order: "asc" },
      select: { name: true, role: true, content: true, visible: true, id: true, order: true, avatar: true },
    });
  } catch (error) {
    logError(error, "Database error in getAllTestimonials");
    return [];
  }
});

export const getFAQ = cache(async () => {
  try {
    return await prisma.faq.findMany({ orderBy: { order: "asc" } });
  } catch (error) {
    logError(error, "Database error in getFAQ");
    return [];
  }
});

export const getLandingFeaturedProducts = unstable_cache(
  async (): Promise<ProductData[]> => {
  try {
    const config = await prisma.landingConfig.findFirst({
      where: { status: "published" },
      orderBy: { publishedAt: "desc" },
      include: { featured: { select: { productIds: true } } },
    }) ?? await prisma.landingConfig.findFirst({
      orderBy: { createdAt: "desc" },
      include: { featured: { select: { productIds: true } } },
    });

    const raw = config?.featured?.productIds || "";
    const ids = raw.split(",").filter(Boolean);

    if (ids.length === 0) return [];

    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
      include: productInclude,
    });

    const orderMap = new Map(ids.map((id, idx) => [id, idx]));
    return products
      .sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0))
      .map(mapProductToData);
  } catch (error) {
    logError(error, "Database error in getLandingFeaturedProducts");
    return [];
  }
},
  [],
  { tags: ["landing"] },
);

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const row = await prisma.setting.findUnique({ where: { key: "site_settings" } });
    if (!row) {
      logWarning("Site settings not found in database. Returning default settings.");
      return DEFAULT_SITE_SETTINGS;
    }
    const parsed = JSON.parse(row.value) as Partial<SiteSettings>;
    return {
      ...DEFAULT_SITE_SETTINGS,
      ...parsed,
      hero: { ...DEFAULT_SITE_SETTINGS.hero, ...parsed.hero },
      featuredProducts: { ...DEFAULT_SITE_SETTINGS.featuredProducts, ...parsed.featuredProducts },
      collectionsSection: { ...DEFAULT_SITE_SETTINGS.collectionsSection, ...parsed.collectionsSection },
      aboutSection: { ...DEFAULT_SITE_SETTINGS.aboutSection, ...parsed.aboutSection },
      testimonialsSection: { ...DEFAULT_SITE_SETTINGS.testimonialsSection, ...parsed.testimonialsSection },
      announcementBar: { ...DEFAULT_SITE_SETTINGS.announcementBar, ...parsed.announcementBar },
      navbarBanner: { ...DEFAULT_SITE_SETTINGS.navbarBanner, ...parsed.navbarBanner },
      newsletter: { ...DEFAULT_SITE_SETTINGS.newsletter, ...parsed.newsletter },
      footer: { ...DEFAULT_SITE_SETTINGS.footer, ...parsed.footer },
      socialLinks: { ...DEFAULT_SITE_SETTINGS.socialLinks, ...parsed.socialLinks },
    };
  } catch (error) {
    logError(error, "Database error in getSiteSettings");
    return DEFAULT_SITE_SETTINGS;
  }
});

export const getCities = cache(async () => {
  try {
    return await prisma.city.findMany({
      where: { active: true },
      orderBy: { displayOrder: "asc" },
      select: { name: true },
    });
  } catch (error) {
    logError(error, "Database error in getCities");
    return [];
  }
});

export const getAdminMenuItems = cache(async (role: "SUPER_ADMIN" | "ADMIN") => {
  try {
    const all = await prisma.adminMenuItem.findMany({ orderBy: { displayOrder: "asc" } });
    return all.filter((item) => !item.requireSuperAdmin || role === "SUPER_ADMIN");
  } catch (error) {
    logError(error, "Database error in getAdminMenuItems");
    return [];
  }
});

import type { StoredOrder, StoredOrderItem } from "@/types";

export const getOrders = cache(async (): Promise<StoredOrder[]> => {
  try {
    const rows = await prisma.order.findMany({
      include: { items: true, customer: true },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId ?? "",
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      phone: order.phone,
      address: order.address,
      city: order.city,
      postalCode: order.postalCode,
      country: order.country,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus as StoredOrder["paymentStatus"],
      orderStatus: order.orderStatus as StoredOrder["orderStatus"],
      subtotal: order.subtotal,
      shipping: order.shipping,
      shippingMethod: order.shippingMethod,
      tax: order.tax,
      total: order.total,
      currency: order.currency,
      items: order.items.map((i) => ({
        productId: i.productId ?? "",
        name: i.name,
        slug: i.slug,
        image: i.image,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.totalPrice,
      })) satisfies StoredOrderItem[],
      idempotencyKey: order.idempotencyKey,
      estimatedDelivery: order.estimatedDelivery,
      actualDeliveryDate: order.actualDeliveryDate,
      deliveryCompany: order.deliveryCompany,
      trackingNumber: order.trackingNumber,
      deliveryNotes: order.deliveryNotes,
      discountAmount: order.discountAmount,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    }));
  } catch (error) {
    logError(error, "Database error in getOrders");
    return [];
  }
});

export const getEmailTemplate = cache(async (key: string) => {
  try {
    return await prisma.emailTemplate.findUnique({ where: { key } });
  } catch (error) {
    logError(error, `Database error in getEmailTemplate for key ${key}`);
    return null;
  }
});

function parseLandingHero(hero: { enabled: boolean; title: string; subtitle: string; description: string; ctaText: string; ctaLink: string; media: string[] }) {
  return {
    enabled: hero.enabled,
    title: hero.title,
    subtitle: hero.subtitle,
    description: hero.description,
    ctaText: hero.ctaText,
    ctaLink: hero.ctaLink,
    media: hero.media,
  };
}

function parseLandingBrandStory(bs: { enabled: boolean; title: string; subtitle: string; description: string; image: string }) {
  return {
    enabled: bs.enabled,
    title: bs.title,
    subtitle: bs.subtitle,
    description: bs.description,
    image: bs.image,
  };
}

function parseLandingFeatured(f: { enabled: boolean; title: string; subtitle: string; productIds: string }) {
  return { enabled: f.enabled, title: f.title, subtitle: f.subtitle, productIds: f.productIds || "" };
}

function parseLandingCollectionHeader(ch: { enabled: boolean; title: string; subtitle: string; selectedCollectionIds?: string }) {
  return { enabled: ch.enabled, title: ch.title, subtitle: ch.subtitle, selectedCollectionIds: ch.selectedCollectionIds || "" };
}

function parseLandingTestimonialHeader(th: { enabled: boolean; title: string; subtitle: string }) {
  return { enabled: th.enabled, title: th.title, subtitle: th.subtitle };
}

function parseLandingNewsletter(nl: { enabled: boolean; title: string; subtitle: string; description: string; placeholder: string; buttonText: string }) {
  return {
    enabled: nl.enabled,
    title: nl.title,
    subtitle: nl.subtitle,
    description: nl.description,
    placeholder: nl.placeholder,
    buttonText: nl.buttonText,
  };
}

export type LandingContent = {
  hero: ReturnType<typeof parseLandingHero>;
  featuredProducts: ReturnType<typeof parseLandingFeatured>;
  collectionsSection: ReturnType<typeof parseLandingCollectionHeader>;
  aboutSection: ReturnType<typeof parseLandingBrandStory>;
  testimonialsSection: ReturnType<typeof parseLandingTestimonialHeader>;
  newsletter: ReturnType<typeof parseLandingNewsletter>;
  moroccanMoment: { enabled: boolean; title: string; subtitle: string; description: string };
  finalCta: { enabled: boolean; subtitle: string; title: string; description: string; buttonText: string; buttonLink: string };
  seo: { title: string; metaDescription: string; ogTitle: string; ogDescription: string; ogImage: string; canonicalUrl: string } | null;
  sectionOrder: string[];
};
export const getLandingContent = unstable_cache(
  async (): Promise<LandingContent> => {
  try {
    let config = await prisma.landingConfig.findFirst({
      where: { status: "published" },
      orderBy: { publishedAt: "desc" },
      include: {
        hero: true,
        brandStory: true,
        featured: true,
        collectionHeader: true,
        testimonialHeader: true,
        moroccanMoment: true,
        finalCta: true,
        newsletter: true,
      },
    });

    if (!config) {
      config = await prisma.landingConfig.findFirst({
        orderBy: { createdAt: "desc" },
        include: {
          hero: true,
          brandStory: true,
          featured: true,
          collectionHeader: true,
          testimonialHeader: true,
          moroccanMoment: true,
          finalCta: true,
          newsletter: true,
        },
      });
    }

    if (!config) {
      return {
        hero: { enabled: true, title: "TASTE\nREDEFINED.", subtitle: "Premium Soda — Moroccan Craft", description: "A refined soda experience shaped in Morocco.", ctaText: "Shop MONADATY", ctaLink: "/shop", media: [] },
        featuredProducts: { enabled: true, title: "Featured", subtitle: "SELECTED FLAVORS", productIds: "" },
        collectionsSection: { enabled: true, title: "Shop by Collection", subtitle: "THE COLLECTIONS", selectedCollectionIds: "" },
        aboutSection: { enabled: true, title: "Our Story", subtitle: "BORN IN MOROCCO", description: "", image: "" },
        testimonialsSection: { enabled: true, title: "Testimonials", subtitle: "WHAT THEY SAY" },
        newsletter: { enabled: false, title: "Stay Close.", subtitle: "THE INNER CIRCLE", description: "", placeholder: "Your email", buttonText: "Join" },
        moroccanMoment: { enabled: true, title: "Pour. Serve. Savor.", subtitle: "THE MONADATY MOMENT", description: "" },
        finalCta: { enabled: true, subtitle: "BEGIN THE POUR", title: "YOUR NEXT FAVORITE TASTE IS WAITING.", description: "", buttonText: "SHOP NOW", buttonLink: "/shop" },
        seo: null,
        sectionOrder: ["hero", "featured", "collections", "about", "testimonials", "moroccan_moment", "newsletter", "final_cta"],
      };
    }

    const seoRow = await prisma.landingSeo.findUnique({ where: { configId: config.id } });
    const seo = seoRow
      ? {
          title: seoRow.title,
          metaDescription: seoRow.metaDescription,
          ogTitle: seoRow.ogTitle,
          ogDescription: seoRow.ogDescription,
          ogImage: seoRow.ogImage,
          canonicalUrl: seoRow.canonicalUrl,
        }
      : null;

    const sectionOrder: string[] = JSON.parse(config.sectionOrder || "[]");

    return {
      hero: config.hero ? parseLandingHero(config.hero) : { enabled: false, title: "", subtitle: "", description: "", ctaText: "", ctaLink: "", media: [] },
      featuredProducts: config.featured ? parseLandingFeatured(config.featured) : { enabled: false, title: "", subtitle: "", productIds: "" },
      collectionsSection: config.collectionHeader ? parseLandingCollectionHeader(config.collectionHeader) : { enabled: false, title: "", subtitle: "", selectedCollectionIds: "" },
      aboutSection: config.brandStory ? parseLandingBrandStory(config.brandStory) : { enabled: false, title: "", subtitle: "", description: "", image: "" },
      testimonialsSection: config.testimonialHeader ? parseLandingTestimonialHeader(config.testimonialHeader) : { enabled: false, title: "", subtitle: "" },
      newsletter: config.newsletter ? parseLandingNewsletter(config.newsletter) : { enabled: false, title: "", subtitle: "", description: "", placeholder: "", buttonText: "" },
      moroccanMoment: config.moroccanMoment
        ? { enabled: config.moroccanMoment.enabled, title: config.moroccanMoment.title, subtitle: config.moroccanMoment.subtitle, description: config.moroccanMoment.description }
        : { enabled: false, title: "", subtitle: "", description: "" },
      finalCta: config.finalCta
        ? { enabled: config.finalCta.enabled, subtitle: config.finalCta.subtitle, title: config.finalCta.title, description: config.finalCta.description, buttonText: config.finalCta.buttonText, buttonLink: config.finalCta.buttonLink }
        : { enabled: false, subtitle: "", title: "", description: "", buttonText: "", buttonLink: "" },
      seo,
      sectionOrder,
    };
  } catch (error) {
    logError(error, "Database error in getLandingContent");
    return {
      hero: { enabled: true, title: "TASTE\nREDEFINED.", subtitle: "Premium Soda — Moroccan Craft", description: "A refined soda experience shaped in Morocco.", ctaText: "Shop MONADATY", ctaLink: "/shop", media: [] },
      featuredProducts: { enabled: true, title: "Featured", subtitle: "SELECTED FLAVORS", productIds: "" },
      collectionsSection: { enabled: true, title: "Shop by Collection", subtitle: "THE COLLECTIONS", selectedCollectionIds: "" },
      aboutSection: { enabled: true, title: "Our Story", subtitle: "BORN IN MOROCCO", description: "", image: "" },
      testimonialsSection: { enabled: true, title: "Testimonials", subtitle: "WHAT THEY SAY" },
      newsletter: { enabled: false, title: "Stay Close.", subtitle: "THE INNER CIRCLE", description: "", placeholder: "Your email", buttonText: "Join" },
      moroccanMoment: { enabled: true, title: "Pour. Serve. Savor.", subtitle: "THE MONADATY MOMENT", description: "" },
      finalCta: { enabled: true, subtitle: "BEGIN THE POUR", title: "YOUR NEXT FAVORITE TASTE IS WAITING.", description: "", buttonText: "SHOP NOW", buttonLink: "/shop" },
      seo: null,
      sectionOrder: ["hero", "featured", "collections", "about", "testimonials", "moroccan_moment", "newsletter", "final_cta"],
    };
  }
},
  [],
  { tags: ["landing"] },
);

