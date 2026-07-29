import { prisma } from "@/lib/prisma";
import { cache } from "react";
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

export const getLandingCollections = cache(async (): Promise<CollectionData[]> => {
  try {
    const rows = await prisma.collection.findMany({
      where: { landingEnabled: true },
      orderBy: { landingOrder: "asc" },
    });
    if (rows.length > 0) return rows.map(mapCollectionData);
    const fallback = await prisma.collection.findMany({
      orderBy: { order: "asc" },
      take: 3,
    });
    return fallback.map(mapCollectionData);
  } catch (error) {
    logError(error, "Database error in getLandingCollections");
    return [];
  }
});

export const getCategories = cache(async () => {
  try {
    return await prisma.category.findMany({ orderBy: { name: "asc" } });
  } catch (error) {
    logError(error, "Database error in getCategories");
    return [];
  }
});

export const getTestimonials = cache(async () => {
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
});

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

export const getFeaturedProducts = cache(async (): Promise<ProductData[]> => {
  try {
    const rows = await prisma.landingSection.findMany({
      where: { section: "featured_products", enabled: true, product: { available: true } },
      orderBy: { position: "asc" },
      include: { product: { include: productInclude } },
    });
    return rows
      .filter((r) => r.product)
      .map((r) => mapProductToData(r.product!));
  } catch (error) {
    logError(error, "Database error in getFeaturedProducts");
    return [];
  }
});

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
