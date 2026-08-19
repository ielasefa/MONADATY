import { prisma } from "@/lib/prisma";
import {
  getProducts as dbGetProducts,
  getTopSellingProducts as dbGetTopSellingProducts,
  getCollections as dbGetCollections,
  getLandingCollections as dbGetLandingCollections,
  getCategories as dbGetCategories,
  getOrders as dbGetOrders,
  getTestimonials as dbGetTestimonials,
  getFAQ as dbGetFAQ,
  getSiteSettings,
  getProductById as dbGetProductById,
  getRelatedProducts as dbGetRelatedProducts,
} from "@/lib/db";
import type {
  StoredProduct, StoredCollection, StoredCategory, StoredArticle,
  StoredTestimonial, StoredFAQ, SiteSettings,
} from "@/types";

export { getSiteSettings };

// ── Re-export from db.ts ──

export async function getProducts(): Promise<StoredProduct[]> {
  return dbGetProducts();
}

export async function loadProducts() {
  return dbGetProducts();
}

export async function getTopSellingProducts(limit: number) {
  return dbGetTopSellingProducts(limit);
}

export async function getProductById(id: string) {
  return dbGetProductById(id);
}

export async function getRelatedProducts(currentProductId: string, category: string, limit = 3) {
  return dbGetRelatedProducts(currentProductId, category, limit);
}

export async function getCollections(): Promise<StoredCollection[]> {
  return dbGetCollections();
}

export async function getLandingCollections(): Promise<StoredCollection[]> {
  return dbGetLandingCollections();
}

export async function loadCollections() {
  return dbGetCollections();
}

export async function getCategories(): Promise<StoredCategory[]> {
  return dbGetCategories();
}

export async function getOrders(options?: { take?: number; skip?: number }) {
  return dbGetOrders(options);
}

export async function getTestimonials(): Promise<StoredTestimonial[]> {
  return dbGetTestimonials();
}

export async function getFAQ(): Promise<StoredFAQ[]> {
  return dbGetFAQ();
}

export async function getSettings(): Promise<SiteSettings> {
  return getSiteSettings();
}

// ── Save operations (admin) ──

export async function saveProducts(products: StoredProduct[]): Promise<void> {
  for (const p of products) {
    if (!p.id || p.id.length === 0) continue;
    const cat = p.category ? await prisma.category.findUnique({ where: { slug: p.category.toLowerCase() } }) : null;
    const coll = p.collection ? await prisma.collection.findUnique({ where: { slug: p.collection } }) : null;
    await prisma.product.upsert({
      where: { id: p.id },
      update: {
        name: p.name, slug: p.slug, price: p.price, comparePrice: p.comparePrice,
        image: p.image, gallery: p.gallery, categoryId: cat?.id ?? null, collectionId: coll?.id ?? null,
        visual: p.visual ?? "", accent: p.accent ?? "", description: p.description,
        ingredients: p.ingredients ?? "", nutrition: p.nutrition ?? "", badges: p.badges ?? [],
        stock: p.stock, featured: p.featured, available: p.available,
      },
      create: {
        id: p.id, slug: p.slug, name: p.name, price: p.price, comparePrice: p.comparePrice,
        image: p.image, gallery: p.gallery, categoryId: cat?.id ?? null, collectionId: coll?.id ?? null,
        visual: p.visual ?? "", accent: p.accent ?? "", description: p.description,
        ingredients: p.ingredients ?? "", nutrition: p.nutrition ?? "", badges: p.badges ?? [],
        stock: p.stock, featured: p.featured, available: p.available,
      },
    });
  }
}

export async function saveCollections(collections: StoredCollection[]): Promise<void> {
  await prisma.collection.deleteMany({
    where: { slug: { notIn: collections.map((c) => c.slug) } },
  });
  for (const c of collections) {
    await prisma.collection.upsert({
      where: { slug: c.slug },
      update: { name: c.title, description: c.description, accent: c.accent, tone: c.tone, previewLabel: c.previewLabel, image: c.image, order: c.order },
      create: { slug: c.slug, name: c.title, description: c.description, accent: c.accent, tone: c.tone, previewLabel: c.previewLabel, image: c.image, order: c.order, id: c.slug },
    });
  }
}

export async function saveCategories(categories: StoredCategory[]): Promise<void> {
  await prisma.category.deleteMany({
    where: { slug: { notIn: categories.map((c) => c.slug) } },
  });
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, image: c.image },
      create: { id: c.slug, slug: c.slug, name: c.name, description: c.description, image: c.image },
    });
  }
}

export async function saveArticles(articles: StoredArticle[]): Promise<void> {
  await prisma.blogPost.deleteMany({
    where: { id: { notIn: articles.map((a) => a.id) } },
  });
  for (const a of articles) {
    await prisma.blogPost.upsert({
      where: { slug: a.slug },
      update: { title: a.title, content: a.content, coverImage: a.coverImage, author: a.author, tags: a.tags ?? [], published: a.published, order: a.order },
      create: { id: a.id || a.slug, title: a.title, slug: a.slug, content: a.content, coverImage: a.coverImage, author: a.author, tags: a.tags ?? [], published: a.published, order: a.order },
    });
  }
}

export async function getArticles(): Promise<StoredArticle[]> {
  const rows = await prisma.blogPost.findMany({ orderBy: { order: "asc" } });
  return rows.map((a) => ({
    id: a.id, title: a.title, slug: a.slug, content: a.content, coverImage: a.coverImage,
    author: a.author, tags: a.tags ?? [], publishDate: a.createdAt.toISOString(),
    published: a.published, order: a.order,
  }));
}

export async function saveTestimonials(testimonials: StoredTestimonial[], keepIds?: string[]): Promise<void> {
  if (keepIds) {
    await prisma.testimonial.deleteMany({ where: { id: { notIn: keepIds } } });
  }
  for (const t of testimonials) {
    await prisma.testimonial.upsert({
      where: { id: t.id },
      update: { name: t.name, role: t.role, content: t.content, avatar: t.avatar, visible: t.visible, order: t.order },
      create: { id: t.id, name: t.name, role: t.role, content: t.content, avatar: t.avatar, visible: t.visible, order: t.order },
    });
  }
}

export async function saveFAQ(faq: StoredFAQ[], keepIds?: string[]): Promise<void> {
  if (keepIds) {
    await prisma.faq.deleteMany({ where: { id: { notIn: keepIds } } });
  }
  for (const f of faq) {
    await prisma.faq.upsert({
      where: { id: f.id },
      update: { question: f.question, answer: f.answer, order: f.order },
      create: { id: f.id, question: f.question, answer: f.answer, order: f.order },
    });
  }
}

export async function saveSettings(settings: SiteSettings): Promise<void> {
  await prisma.setting.upsert({
    where: { key: "site_settings" },
    update: { value: JSON.stringify(settings) },
    create: { key: "site_settings", value: JSON.stringify(settings) },
  });
}
