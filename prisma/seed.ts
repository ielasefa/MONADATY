import "dotenv/config";
import { Pool } from "pg";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { seedTranslations } from "./seed-translations";

const pool = new Pool({ connectionString: process.env.DATABASE_URL!, max: 1 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function slugify(text: string): string {
  return text.toLowerCase().replace(/[&]/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const IMAGE_MAP: Record<string, { image: string; gallery: string[] }> = {
  cola: { image: "/images/placeholder.svg", gallery: ["/images/placeholder.svg"] },
  sprite: { image: "/images/placeholder.svg", gallery: ["/images/placeholder.svg"] },
  tropical: { image: "/images/placeholder.svg", gallery: ["/images/placeholder.svg"] },
  apple: { image: "/images/placeholder.svg", gallery: ["/images/placeholder.svg"] },
  orange: { image: "/images/placeholder.svg", gallery: ["/images/placeholder.svg"] },
  tonic: { image: "/images/placeholder.svg", gallery: ["/images/placeholder.svg"] },
  energy: { image: "/images/placeholder.svg", gallery: ["/images/placeholder.svg"] },
  juice: { image: "/images/placeholder.svg", gallery: ["/images/placeholder.svg"] },
  water: { image: "/images/placeholder.svg", gallery: ["/images/placeholder.svg"] },
};

const CATEGORY_IMAGE_KEY: Record<string, string> = {
  "coca-cola": "cola", hawai: "tropical", sprite: "sprite", poms: "apple", fanta: "orange",
  schweppes: "tonic", "ice-energy": "energy", cappy: "juice", water: "water",
};

const CATEGORY_ACCENT: Record<string, string> = {
  "coca-cola": "#E21A1A", hawai: "#FF6B8A", sprite: "#00A86B", poms: "#DC143C", fanta: "#FF8C00",
  schweppes: "#D4A574", "ice-energy": "#00BFFF", cappy: "#FFA500", water: "#4FC3F7",
};

function getProductImages(categorySlug: string) {
  return IMAGE_MAP[CATEGORY_IMAGE_KEY[categorySlug] ?? "cola"];
}

function getAccent(categorySlug: string) {
  return CATEGORY_ACCENT[categorySlug] ?? "#C8A96A";
}

async function main() {
  console.log("Seeding MONADATY database...");

  // ── Super Admin ──
  const adminEmail = process.env.ADMIN_EMAIL;
  if(!adminEmail)
    {
      throw new Error("ADMIN_EMAIL environment variable is required for seeding.");
    }
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error(
      "ADMIN_PASSWORD environment variable is required for seeding.\n" +
      "  Set it in .env or pass it inline:\n" +
      '  ADMIN_PASSWORD="your-password" npm run db:seed'
    );
  }
  if (adminPassword.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters long.");
  }
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: { name: "Super Admin", passwordHash, mustChangePassword: false },
    create: { name: "Super Admin", email: adminEmail, passwordHash, role: "SUPER_ADMIN", mustChangePassword: false },
  });
  console.log("  ✓ Super Admin");

  // ── Settings ──
  await prisma.setting.upsert({
    where: { key: "site_settings" },
    update: {},
    create: {
      key: "site_settings",
      value: JSON.stringify({
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
          title: "LE GOÛT,\nAUTREMENT.",
          subtitle: "Soda crafted in Morocco",
          description: "Née au Maroc. Pensée autour du goût. MONADATY redéfinit ce que signifie une boisson premium.",
          ctaText: "SHOP MONADATY",
          ctaLink: "/shop",
          media: [],
        },
        featuredProducts: { enabled: true, title: "THREE WAYS\nTO TASTE IT.", subtitle: "THE MONADATY EDIT" },
        collectionsSection: { enabled: true, title: "COLLECTED\nBY TASTE.", subtitle: "CURATED FOR THE CURIOUS" },
        aboutSection: { enabled: true, title: "BORN IN MOROCCO.\nBUILT AROUND TASTE.", subtitle: "OUR STORY", description: "Carefully sourced ingredients, intentionally crafted blends, and service designed for Morocco.", image: "" },
      }),
    },
  });

  // ── Categories ──
  const categories = [
    { slug: "citrus", name: "Citrus", description: "Bright, zesty citrus flavors", image: "" },
    { slug: "berry", name: "Berry", description: "Rich berry blends", image: "" },
    { slug: "cola", name: "Cola", description: "Classic cola with a premium twist", image: "" },
    { slug: "energy", name: "Energy", description: "Sparkling energy drinks", image: "" },
    { slug: "herbal", name: "Herbal", description: "Botanical and herbal infusions", image: "" },
  ];
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, image: cat.image },
      create: { id: cat.slug, slug: cat.slug, name: cat.name, description: cat.description, image: cat.image },
    });
  }
  console.log(`  ✓ ${categories.length} categories`);

  // ── Collections ──
  const collections = [
    { slug: "classic", name: "Classic", description: "Timeless flavors", accent: "#C8A96A", tone: "from-[#fffdf7] via-white to-[#f4ead3]", previewLabel: "Signature", order: 1, image: "" },
    { slug: "premium", name: "Premium", description: "Our finest selection", accent: "#1a1a2e", tone: "from-[#f0f0ff] via-white to-[#e8e8ff]", previewLabel: "Luxury", order: 2, image: "" },
    { slug: "limited", name: "Limited Edition", description: "Seasonal exclusives", accent: "#8B0000", tone: "from-[#fff5f5] via-white to-[#ffe0e0]", previewLabel: "Limited", order: 3, image: "" },
  ];
  for (const coll of collections) {
    await prisma.collection.upsert({
      where: { slug: coll.slug },
      update: { name: coll.name, description: coll.description, accent: coll.accent, tone: coll.tone, previewLabel: coll.previewLabel, image: coll.image, order: coll.order },
      create: { id: coll.slug, slug: coll.slug, name: coll.name, description: coll.description, accent: coll.accent, tone: coll.tone, previewLabel: coll.previewLabel, image: coll.image, order: coll.order },
    });
  }
  console.log(`  ✓ ${collections.length} collections`);

  // ── Products ──
  const citrusCat = await prisma.category.findUnique({ where: { slug: "citrus" } });
  const berryCat = await prisma.category.findUnique({ where: { slug: "berry" } });
  const colaCat = await prisma.category.findUnique({ where: { slug: "cola" } });
  const energyCat = await prisma.category.findUnique({ where: { slug: "energy" } });
  const classicColl = await prisma.collection.findUnique({ where: { slug: "classic" } });
  const premiumColl = await prisma.collection.findUnique({ where: { slug: "premium" } });

  const products = [
    { id: "citrus-spark-soda", slug: "golden-citrus", name: "Golden Citrus", description: "A bright sparkling citrus soda with a crisp mineral finish.", price: "35.00 DH", comparePrice: "", image: "/images/placeholder.svg", gallery: [], visual: "can", accent: "#F5C542", categoryId: citrusCat?.id ?? null, collectionId: classicColl?.id ?? null, stock: 50, featured: true, available: true, badges: ["Best Seller"], ingredients: "Carbonated water, citric acid, natural citrus flavors, cane sugar.", nutrition: "Per 100ml: Calories 42, Sugar 10g" },
    { id: "berry-fresh-cola", slug: "midnight-berry", name: "Midnight Berry", description: "Deep berry flavors with a soft sweet finish.", price: "38.00 DH", comparePrice: "", image: "/images/placeholder.svg", gallery: [], visual: "bottle", accent: "#4A0080", categoryId: berryCat?.id ?? null, collectionId: premiumColl?.id ?? null, stock: 40, featured: true, available: true, badges: ["New"], ingredients: "Carbonated water, berry extract, cane sugar, natural flavors.", nutrition: "Per 100ml: Calories 48, Sugar 11g" },
    { id: "amber-cola", slug: "amber-cola", name: "Amber Cola", description: "Premium cola with caramel fizz and a polished finish.", price: "32.00 DH", comparePrice: "38.00 DH", image: "/images/placeholder.svg", gallery: [], visual: "can", accent: "#8B4513", categoryId: colaCat?.id ?? null, collectionId: classicColl?.id ?? null, stock: 60, featured: true, available: true, badges: [], ingredients: "Carbonated water, caramel color, phosphoric acid, cane sugar, natural flavors.", nutrition: "Per 100ml: Calories 45, Sugar 10.5g" },
    { id: "ice-lemon-energy", slug: "zenergy-spark", name: "Zenergy Spark", description: "Zesty lemon energy soda with a smooth bubbly finish.", price: "40.00 DH", comparePrice: "", image: "/images/placeholder.svg", gallery: [], visual: "can", accent: "#FF6600", categoryId: energyCat?.id ?? null, collectionId: premiumColl?.id ?? null, stock: 30, featured: false, available: true, badges: [], ingredients: "Carbonated water, caffeine, taurine, B-vitamins, natural lemon flavor.", nutrition: "Per 100ml: Calories 20, Sugar 4g" },
    { id: "white-grape-fizz", slug: "rose-lychee", name: "Rose Lychee", description: "Floral rose and sweet lychee in a delicate sparkling blend.", price: "42.00 DH", comparePrice: "", image: "/images/placeholder.svg", gallery: [], visual: "bottle", accent: "#FF69B4", categoryId: citrusCat?.id ?? null, collectionId: premiumColl?.id ?? null, stock: 25, featured: true, available: true, badges: ["Limited"], ingredients: "Carbonated water, rose extract, lychee juice, cane sugar.", nutrition: "Per 100ml: Calories 38, Sugar 9g" },
    { id: "moroccan-mint", slug: "moroccan-mint", name: "Moroccan Mint", description: "Refreshing mint soda inspired by traditional Moroccan tea.", price: "35.00 DH", comparePrice: "", image: "/images/placeholder.svg", gallery: [], visual: "can", accent: "#00A86B", categoryId: colaCat?.id ?? null, collectionId: classicColl?.id ?? null, stock: 45, featured: false, available: true, badges: [], ingredients: "Carbonated water, mint extract, cane sugar, green tea extract.", nutrition: "Per 100ml: Calories 35, Sugar 8g" },
    { id: "mint-sparkling-water", slug: "mint-sparkling-water", name: "Mint Sparkling Water", description: "A clean sparkling water with cool mint freshness and a smooth mineral edge.", price: "29.00 DH", comparePrice: "", image: "", gallery: [], visual: "bottle", accent: "#B7D8C9", categoryId: energyCat?.id ?? null, collectionId: classicColl?.id ?? null, stock: 35, featured: false, available: true, badges: [], ingredients: "Carbonated water, natural mint flavor.", nutrition: "Per 100ml: Calories 0, Sugar 0g" },
    { id: "peach-bubble-tonic", slug: "peach-bubble-tonic", name: "Peach Bubble Tonic", description: "Soft peach sweetness lifted by delicate bubbles for a premium refreshment.", price: "35.00 DH", comparePrice: "", image: "", gallery: [], visual: "glass", accent: "#F2C1A0", categoryId: citrusCat?.id ?? null, collectionId: premiumColl?.id ?? null, stock: 20, featured: true, available: true, badges: ["New"], ingredients: "Carbonated water, peach extract, cane sugar, natural flavors.", nutrition: "Per 100ml: Calories 40, Sugar 9.5g" },
    { id: "cola-zero-spark", slug: "cola-zero-spark", name: "Cola Zero Spark", description: "A crisp zero-sugar cola with glossy carbonation and a polished modern finish.", price: "35.00 DH", comparePrice: "", image: "", gallery: [], visual: "can", accent: "#9AA3A8", categoryId: colaCat?.id ?? null, collectionId: classicColl?.id ?? null, stock: 55, featured: false, available: true, badges: [], ingredients: "Carbonated water, caramel color, phosphoric acid, natural flavors, stevia.", nutrition: "Per 100ml: Calories 2, Sugar 0g" },
    { id: "amber-ginger-refresh", slug: "amber-ginger-refresh", name: "Amber Ginger Refresh", description: "Warm ginger spice balanced with amber notes and a cold sparkling lift.", price: "39.00 DH", comparePrice: "", image: "", gallery: [], visual: "bottle", accent: "#D7B58A", categoryId: energyCat?.id ?? null, collectionId: premiumColl?.id ?? null, stock: 30, featured: false, available: true, badges: [], ingredients: "Carbonated water, ginger extract, amber syrup, cane sugar.", nutrition: "Per 100ml: Calories 38, Sugar 9g" },
  ];
  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: { slug: p.slug, name: p.name, description: p.description, price: p.price, comparePrice: p.comparePrice, image: p.image, gallery: p.gallery, visual: p.visual, accent: p.accent, categoryId: p.categoryId, collectionId: p.collectionId, stock: p.stock, featured: p.featured, available: p.available, badges: p.badges, ingredients: p.ingredients, nutrition: p.nutrition },
      create: { id: p.id, slug: p.slug, name: p.name, description: p.description, price: p.price, comparePrice: p.comparePrice, image: p.image, gallery: p.gallery, visual: p.visual, accent: p.accent, categoryId: p.categoryId, collectionId: p.collectionId, stock: p.stock, featured: p.featured, available: p.available, badges: p.badges, ingredients: p.ingredients, nutrition: p.nutrition },
    });
  }
  console.log(`  ✓ ${products.length} products`);

  // ── Blog Posts ──
  const posts = [
    { id: "b1", slug: "art-of-crafting-soda", title: "The Art of Crafting Premium Soda", content: "At MONADATY, we believe soda is more than a drink — it's an experience. Every bottle is crafted with care using the finest ingredients sourced from around the world.\n\nOur process begins with pure spring water, filtered three times for absolute clarity. We then blend natural fruit extracts, botanicals, and just the right amount of cane sugar to create a perfectly balanced refreshment.\n\nEach flavor is taste-tested by our master blenders to ensure consistency and quality in every batch.", coverImage: "", author: "MONADATY Team", tags: ["craft", "quality", "process"], published: true, order: 1 },
    { id: "b2", slug: "morocco-soda-heritage", title: "Morocco's Rich Soda Heritage", content: "Morocco has a long tradition of refreshing beverages — from mint tea to fruit syrups. MONADATY draws inspiration from this heritage to create sodas that celebrate Moroccan flavors.\n\nOur Moroccan Mint flavor pays homage to the nation's beloved tea culture, while our citrus varieties capture the essence of sun-ripened Moroccan oranges and lemons.\n\nWe're proud to bring a taste of Morocco to the world, one can at a time.", coverImage: "", author: "MONADATY Team", tags: ["morocco", "heritage", "culture"], published: true, order: 2 },
    { id: "b3", slug: "perfect-soda-pairings", title: "Perfect Soda & Food Pairings", content: "Just like wine, premium soda can elevate any meal. Here are our favorite pairings:\n\n**Golden Citrus** — Pair with grilled seafood or light salads. The bright citrus notes complement delicate flavors.\n\n**Amber Cola** — The classic partner for burgers, barbecue, and hearty dishes. Caramel notes enhance smoky flavors.\n\n**Midnight Berry** — Perfect with dark chocolate desserts or cheese plates. The berry richness creates a luxurious finish.\n\n**Moroccan Mint** — Ideal with spicy cuisine or as a palate cleanser between courses.", coverImage: "", author: "MONADATY Team", tags: ["pairings", "food", "tips"], published: true, order: 3 },
  ];
  for (const post of posts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: { title: post.title, content: post.content, coverImage: post.coverImage, author: post.author, tags: post.tags, published: post.published, order: post.order },
      create: { id: post.id, slug: post.slug, title: post.title, content: post.content, coverImage: post.coverImage, author: post.author, tags: post.tags, published: post.published, order: post.order },
    });
  }
  console.log(`  ✓ ${posts.length} blog posts`);

  // ── Testimonials ──
  const testimonials = [
    { id: "t1", name: "Sofia A.", role: "Casablanca", content: "MONADATY's Golden Citrus is absolutely refreshing. The quality is unmatched!", avatar: "", visible: true, order: 1 },
    { id: "t2", name: "Youssef M.", role: "Rabat", content: "Finally, a Moroccan soda brand that competes with international premium labels. Bravo!", avatar: "", visible: true, order: 2 },
    { id: "t3", name: "Laila K.", role: "Marrakech", content: "The Rose Lychee is my go-to gift for friends. Everyone loves it!", avatar: "", visible: true, order: 3 },
  ];
  for (const t of testimonials) {
    await prisma.testimonial.upsert({
      where: { id: t.id },
      update: { name: t.name, role: t.role, content: t.content, avatar: t.avatar, visible: t.visible, order: t.order },
      create: { id: t.id, name: t.name, role: t.role, content: t.content, avatar: t.avatar, visible: t.visible, order: t.order },
    });
  }
  console.log(`  ✓ ${testimonials.length} testimonials`);

  // ── FAQ ──
  const faqs = [
    { id: "f1", question: "Where is MONADATY made?", answer: "MONADATY is proudly crafted in Casablanca, Morocco using the finest ingredients sourced globally.", order: 1 },
    { id: "f2", question: "Is MONADATY available for delivery across Morocco?", answer: "Yes! We deliver to all major cities in Morocco including Casablanca, Rabat, Marrakech, Tangier, Fez, and more.", order: 2 },
    { id: "f3", question: "What payment methods do you accept?", answer: "We offer Cash on Delivery (COD) for all orders within Morocco. Simply pay when your order arrives.", order: 3 },
    { id: "f4", question: "How long does delivery take?", answer: "Standard delivery takes 3-5 business days. Express delivery is available for 1-2 business days.", order: 4 },
    { id: "f5", question: "Do you offer international shipping?", answer: "Currently we deliver within Morocco only. International shipping is coming soon!", order: 5 },
  ];
  for (const f of faqs) {
    await prisma.faq.upsert({
      where: { id: f.id },
      update: { question: f.question, answer: f.answer, order: f.order },
      create: { id: f.id, question: f.question, answer: f.answer, order: f.order },
    });
  }
  console.log(`  ✓ ${faqs.length} FAQ items`);

  // ═══════════════════════════════════════════════════════════════
  //  MOROCCAN BEVERAGE CATEGORIES
  // ═══════════════════════════════════════════════════════════════
  const moroccanCategoryDefs = [
    { slug: "coca-cola", name: "Coca-Cola", description: "Produits Coca-Cola authentiques" },
    { slug: "hawai", name: "Hawai", description: "Boissons Hawai tropicales" },
    { slug: "sprite", name: "Sprite", description: "Boissons Sprite citronnées" },
    { slug: "poms", name: "Poms", description: "Boissons Poms fruitées" },
    { slug: "fanta", name: "Fanta", description: "Boissons Fanta orange" },
    { slug: "schweppes", name: "Schweppes", description: "Boissons Schweppes tonic" },
    { slug: "ice-energy", name: "Ice & Energy Drinks", description: "Boissons glacées et énergisantes" },
    { slug: "cappy", name: "Cappy", description: "Jus Cappy naturels" },
    { slug: "water", name: "Water", description: "Eaux minérales marocaines" },
  ];
  let moroccanCatCreated = 0;
  for (const cat of moroccanCategoryDefs) {
    const exists = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (!exists) moroccanCatCreated++;
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, image: "" },
      create: { id: cat.slug, slug: cat.slug, name: cat.name, description: cat.description, image: "" },
    });
  }
  console.log(`  ✓ ${moroccanCatCreated} Moroccan beverage categories created`);

  // ═══════════════════════════════════════════════════════════════
  //  MOROCCAN BEVERAGE COLLECTIONS
  // ═══════════════════════════════════════════════════════════════
  const moroccanCollectionDefs = [
    { slug: "coca-cola-collection", name: "Coca-Cola", description: "Toute la gamme Coca-Cola", accent: "#E21A1A", tone: "from-[#fff5f5] via-white to-[#ffe0e0]", previewLabel: "Coca-Cola", order: 4 },
    { slug: "hawai-collection", name: "Hawai", description: "Toute la gamme Hawai", accent: "#FF6B8A", tone: "from-[#fff0f5] via-white to-[#ffe0eb]", previewLabel: "Hawai", order: 5 },
    { slug: "sprite-collection", name: "Sprite", description: "Toute la gamme Sprite", accent: "#00A86B", tone: "from-[#f0fff4] via-white to-[#e0ffe8]", previewLabel: "Sprite", order: 6 },
    { slug: "poms-collection", name: "Poms", description: "Toute la gamme Poms", accent: "#DC143C", tone: "from-[#fff0f0] via-white to-[#ffe0e0]", previewLabel: "Poms", order: 7 },
    { slug: "fanta-collection", name: "Fanta", description: "Toute la gamme Fanta", accent: "#FF8C00", tone: "from-[#fff8f0] via-white to-[#fff0e0]", previewLabel: "Fanta", order: 8 },
    { slug: "schweppes-collection", name: "Schweppes", description: "Toute la gamme Schweppes", accent: "#D4A574", tone: "from-[#fffdf7] via-white to-[#f4ead3]", previewLabel: "Schweppes", order: 9 },
    { slug: "ice-energy-collection", name: "Ice & Energy Drinks", description: "Boissons glacées et énergisantes", accent: "#00BFFF", tone: "from-[#f0faff] via-white to-[#e0f4ff]", previewLabel: "Energy", order: 10 },
    { slug: "cappy-collection", name: "Cappy", description: "Jus Cappy naturels", accent: "#FFA500", tone: "from-[#fffaf0] via-white to-[#fff5e0]", previewLabel: "Cappy", order: 11 },
    { slug: "water-collection", name: "Water", description: "Eaux minérales marocaines", accent: "#4FC3F7", tone: "from-[#f0faff] via-white to-[#e0f7ff]", previewLabel: "Water", order: 12 },
  ];
  let moroccanCollCreated = 0;
  for (const coll of moroccanCollectionDefs) {
    const exists = await prisma.collection.findUnique({ where: { slug: coll.slug } });
    if (!exists) moroccanCollCreated++;
    await prisma.collection.upsert({
      where: { slug: coll.slug },
      update: { name: coll.name, description: coll.description, accent: coll.accent, tone: coll.tone, previewLabel: coll.previewLabel, image: "", order: coll.order },
      create: { id: coll.slug, slug: coll.slug, name: coll.name, description: coll.description, accent: coll.accent, tone: coll.tone, previewLabel: coll.previewLabel, image: "", order: coll.order },
    });
  }
  console.log(`  ✓ ${moroccanCollCreated} Moroccan beverage collections created`);

  // ═══════════════════════════════════════════════════════════════
  //  MOROCCAN BEVERAGE PRODUCTS
  // ═══════════════════════════════════════════════════════════════
  interface ProductInput {
    name: string;
    catSlug: string;
    collSlug: string;
    price: string;
    visual?: string;
  }

  const productInputs: ProductInput[] = [
    // ── Coca-Cola ──
    { name: "COCA BOITE 25 CL", catSlug: "coca-cola", collSlug: "coca-cola-collection", price: "80.63 DH", visual: "can" },
    { name: "COCA MINI 25 CL", catSlug: "coca-cola", collSlug: "coca-cola-collection", price: "47.40 DH", visual: "can" },
    { name: "COCA MAXI 45 CL", catSlug: "coca-cola", collSlug: "coca-cola-collection", price: "60.60 DH", visual: "can" },
    { name: "COCA 1L", catSlug: "coca-cola", collSlug: "coca-cola-collection", price: "56.22 DH", visual: "bottle" },
    { name: "COCA 1.5L", catSlug: "coca-cola", collSlug: "coca-cola-collection", price: "47.76 DH", visual: "bottle" },
    { name: "COCA 2L", catSlug: "coca-cola", collSlug: "coca-cola-collection", price: "58.44 DH", visual: "bottle" },
    { name: "COCA COLA SLIM 33CL (24x33CL)", catSlug: "coca-cola", collSlug: "coca-cola-collection", price: "181.00 DH", visual: "can" },
    // ── Hawai ──
    { name: "HAWAI BOITE 25 CL", catSlug: "hawai", collSlug: "hawai-collection", price: "80.63 DH", visual: "can" },
    { name: "HAWAI MINI 25 CL", catSlug: "hawai", collSlug: "hawai-collection", price: "55.50 DH", visual: "can" },
    { name: "HAWAI MAXI 45 CL", catSlug: "hawai", collSlug: "hawai-collection", price: "72.00 DH", visual: "can" },
    { name: "HAWAI 1L", catSlug: "hawai", collSlug: "hawai-collection", price: "59.45 DH", visual: "bottle" },
    { name: "HAWAI 1.5L", catSlug: "hawai", collSlug: "hawai-collection", price: "59.16 DH", visual: "bottle" },
    { name: "HAWAI 2L", catSlug: "hawai", collSlug: "hawai-collection", price: "69.72 DH", visual: "bottle" },
    { name: "HAWAI SLIM 33CL (24x33CL)", catSlug: "hawai", collSlug: "hawai-collection", price: "181.00 DH", visual: "can" },
    // ── Sprite ──
    { name: "SPRITE BOITE 25 CL", catSlug: "sprite", collSlug: "sprite-collection", price: "80.63 DH", visual: "can" },
    { name: "SPRITE MINI 25 CL", catSlug: "sprite", collSlug: "sprite-collection", price: "47.40 DH", visual: "can" },
    { name: "SPRITE MAXI 45 CL", catSlug: "sprite", collSlug: "sprite-collection", price: "60.60 DH", visual: "can" },
    { name: "SPRITE 1L", catSlug: "sprite", collSlug: "sprite-collection", price: "46.08 DH", visual: "bottle" },
    { name: "SPRITE 1.5L", catSlug: "sprite", collSlug: "sprite-collection", price: "37.80 DH", visual: "bottle" },
    { name: "SPRITE SLIM 33CL (24x33CL)", catSlug: "sprite", collSlug: "sprite-collection", price: "181.00 DH", visual: "can" },
    // ── Poms ──
    { name: "POMS BOITE 25 CL", catSlug: "poms", collSlug: "poms-collection", price: "80.63 DH", visual: "can" },
    { name: "POMS MINI 25 CL", catSlug: "poms", collSlug: "poms-collection", price: "55.50 DH", visual: "can" },
    { name: "POMS MAXI 45 CL", catSlug: "poms", collSlug: "poms-collection", price: "72.00 DH", visual: "can" },
    { name: "POMS 1L", catSlug: "poms", collSlug: "poms-collection", price: "59.45 DH", visual: "bottle" },
    { name: "POMS 1.5L", catSlug: "poms", collSlug: "poms-collection", price: "59.16 DH", visual: "bottle" },
    { name: "POMS SLIM 33CL (24x33CL)", catSlug: "poms", collSlug: "poms-collection", price: "181.00 DH", visual: "can" },
    // ── Fanta ──
    { name: "FANTA BOITE 25 CL", catSlug: "fanta", collSlug: "fanta-collection", price: "80.63 DH", visual: "can" },
    { name: "FANTA ORANGE 25 CL", catSlug: "fanta", collSlug: "fanta-collection", price: "47.40 DH", visual: "can" },
    { name: "FANTA 1.5L", catSlug: "fanta", collSlug: "fanta-collection", price: "40.50 DH", visual: "bottle" },
    // ── Schweppes ──
    { name: "SCHWEPPES MAXI 45 CL", catSlug: "schweppes", collSlug: "schweppes-collection", price: "82.68 DH", visual: "can" },
    { name: "SCHWEPPES 1L", catSlug: "schweppes", collSlug: "schweppes-collection", price: "88.24 DH", visual: "bottle" },
    { name: "SCHWEPPES SLIM 33CL (24x33CL)", catSlug: "schweppes", collSlug: "schweppes-collection", price: "181.00 DH", visual: "can" },
    // ── Ice & Energy Drinks ──
    { name: "ICE 25CL", catSlug: "ice-energy", collSlug: "ice-energy-collection", price: "32.00 DH", visual: "can" },
    { name: "ICE 1.5L", catSlug: "ice-energy", collSlug: "ice-energy-collection", price: "38.00 DH", visual: "bottle" },
    { name: "STING ENERGY", catSlug: "ice-energy", collSlug: "ice-energy-collection", price: "60.00 DH", visual: "can" },
    { name: "PREDATOR ENERGY", catSlug: "ice-energy", collSlug: "ice-energy-collection", price: "81.00 DH", visual: "can" },
    { name: "WORLD OF TANKS ENERGY DRINK", catSlug: "ice-energy", collSlug: "ice-energy-collection", price: "15.00 DH", visual: "can" },
    // ── Cappy ──
    { name: "CAPPY ORANGE 25CL", catSlug: "cappy", collSlug: "cappy-collection", price: "45.90 DH", visual: "bottle" },
    { name: "CAPPY ORANGE 1L", catSlug: "cappy", collSlug: "cappy-collection", price: "81.72 DH", visual: "bottle" },
    // ── Water ──
    { name: "OULMES 33CL", catSlug: "water", collSlug: "water-collection", price: "42.00 DH", visual: "bottle" },
    { name: "OULMES 50CL", catSlug: "water", collSlug: "water-collection", price: "51.00 DH", visual: "bottle" },
    { name: "OULMES 1L", catSlug: "water", collSlug: "water-collection", price: "39.00 DH", visual: "bottle" },
    { name: "SIDI ALI PACK 12×33CL", catSlug: "water", collSlug: "water-collection", price: "20.40 DH", visual: "bottle" },
    { name: "SIDI ALI PACK 12×50CL", catSlug: "water", collSlug: "water-collection", price: "32.50 DH", visual: "bottle" },
    { name: "AIN SAISS 33CL", catSlug: "water", collSlug: "water-collection", price: "20.40 DH", visual: "bottle" },
    { name: "AIN SAISS 1.5L", catSlug: "water", collSlug: "water-collection", price: "25.20 DH", visual: "bottle" },
    { name: "AIN SAISS 2L", catSlug: "water", collSlug: "water-collection", price: "20.40 DH", visual: "bottle" },
    { name: "AIN SAISS 5L", catSlug: "water", collSlug: "water-collection", price: "23.00 DH", visual: "bottle" },
    { name: "BAHIA 5L", catSlug: "water", collSlug: "water-collection", price: "21.00 DH", visual: "bottle" },
  ];

  const productSlugs = productInputs.map((p) => slugify(p.name));
  const existingProducts = await prisma.product.findMany({ where: { slug: { in: productSlugs } }, select: { slug: true } });
  const existingProductSlugs = new Set(existingProducts.map((p) => p.slug));

  let productsCreated = 0;
  let productsUpdated = 0;

  for (const input of productInputs) {
    const slug = slugify(input.name);
    const category = await prisma.category.findUnique({ where: { slug: input.catSlug } });
    const collection = await prisma.collection.findUnique({ where: { slug: input.collSlug } });
    const images = getProductImages(input.catSlug);
    const accent = getAccent(input.catSlug);
    const description = `${input.name} — Rafraîchissement de qualité supérieure. Parfait pour toute occasion, à déguster bien frais.`;
    const shortDescription = `${input.name} — Qualité et fraîcheur.`;

    const isNew = !existingProductSlugs.has(slug);
    if (isNew) productsCreated++;
    else productsUpdated++;

    await prisma.product.upsert({
      where: { slug },
      update: {
        name: input.name,
        description,
        shortDescription,
        price: input.price,
        comparePrice: "",
        image: images.image,
        gallery: images.gallery,
        visual: input.visual ?? "",
        accent,
        categoryId: category?.id ?? null,
        collectionId: collection?.id ?? null,
        stock: 100,
        featured: true,
        available: true,
        badges: [],
        ingredients: "",
        nutrition: "",
      },
      create: {
        slug,
        name: input.name,
        description,
        shortDescription,
        price: input.price,
        comparePrice: "",
        image: images.image,
        gallery: images.gallery,
        visual: input.visual ?? "",
        accent,
        categoryId: category?.id ?? null,
        collectionId: collection?.id ?? null,
        stock: 100,
        featured: true,
        available: true,
        badges: [],
        ingredients: "",
        nutrition: "",
      },
    });
  }
  console.log(`  ✓ ${productsCreated} Moroccan products created, ${productsUpdated} updated`);

  // ═══════════════════════════════════════════════════════════════
  //  LANDING SECTION — FEATURED PRODUCTS
  // ═══════════════════════════════════════════════════════════════
  const existingLandingSections = await prisma.landingSection.count({ where: { section: "featured_products" } });
  if (existingLandingSections === 0) {
    const featuredSlugs = ["coca-boite-25-cl", "hawai-boite-25-cl", "sprite-boite-25-cl"];
    const featuredProductRecords = await prisma.product.findMany({
      where: { slug: { in: featuredSlugs }, available: true },
      select: { id: true },
    });
    if (featuredProductRecords.length > 0) {
      await prisma.landingSection.createMany({
        data: featuredProductRecords.map((p, idx) => ({
          section: "featured_products",
          productId: p.id,
          position: idx,
          enabled: true,
        })),
      });
      console.log(`  ✓ ${featuredProductRecords.length} featured landing sections created`);
    } else {
      console.log(`  ⚠ No products found for featured landing sections (slugs: ${featuredSlugs.join(", ")})`);
    }
  } else {
    console.log(`  ✓ Featured landing sections already exist (${existingLandingSections} entries)`);
  }

  // ═══════════════════════════════════════════════════════════════
  //  CITIES
  // ═══════════════════════════════════════════════════════════════
  const cities = [
    "Agadir", "Al Hoceima", "Beni Mellal", "Berkane", "Berrechid", "Boujdour",
    "Casablanca", "Dakhla", "El Jadida", "El Kelaa des Sraghna", "Errachidia",
    "Essaouira", "Fès", "Fkih Ben Salah", "Guelmim", "Ifrane", "Inezgane",
    "Kénitra", "Khemisset", "Khenifra", "Khouribga", "Laayoune", "Larache",
    "Marrakech", "Meknès", "Mohammedia", "Nador", "Ouarzazate", "Oujda",
    "Rabat", "Safi", "Salé", "Sefrou", "Settat", "Sidi Kacem", "Sidi Slimane",
    "Skhirat", "Tanger", "Tan-Tan", "Taounate", "Taroudant", "Tata",
    "Taza", "Témara", "Tétouan", "Tiznit", "Youssoufia", "Zagora",
  ];
  for (let i = 0; i < cities.length; i++) {
    await prisma.city.upsert({
      where: { id: cities[i].toLowerCase() },
      update: { name: cities[i], active: true, displayOrder: i },
      create: { id: cities[i].toLowerCase(), name: cities[i], active: true, displayOrder: i },
    });
  }
  console.log(`  ✓ ${cities.length} cities`);

  // ═══════════════════════════════════════════════════════════════
  //  EMAIL TEMPLATES
  // ═══════════════════════════════════════════════════════════════
  const emailTemplates = [
    {
      key: "confirmation",
      subject: "Order Confirmed — {orderNumber} | {websiteName}",
      body: "Thank you for your order! We've received it and our team has started preparing your package. You'll receive updates as your order progresses.",
    },
    {
      key: "processing",
      subject: "Order Processing — {orderNumber} | {websiteName}",
      body: "Great news! Your order is now being processed. Our team is carefully preparing your items for shipment.",
    },
    {
      key: "shipped",
      subject: "Order Shipped — {orderNumber} | {websiteName}",
      body: "Your order has been shipped and is on its way! We'll notify you when it's out for delivery.",
    },
    {
      key: "out_for_delivery",
      subject: "Out for Delivery — {orderNumber} | {websiteName}",
      body: "Your package is out for delivery today! Please ensure someone is available to receive it.",
    },
    {
      key: "delivered",
      subject: "Order Delivered — {orderNumber} | {websiteName}",
      body: "Your order has been delivered! We hope you enjoy your experience.",
    },
    {
      key: "completed",
      subject: "Order Completed — {orderNumber} | {websiteName}",
      body: "Your order has been completed. Thank you for choosing us!",
    },
    {
      key: "cancelled",
      subject: "Order Cancelled — {orderNumber} | {websiteName}",
      body: "Your order has been cancelled. If you have any questions, please contact our support team.",
    },
    {
      key: "refunded",
      subject: "Refund Processed — {orderNumber} | {websiteName}",
      body: "Your refund has been processed. The amount will be credited to your original payment method.",
    },
  ];
  for (const t of emailTemplates) {
    await prisma.emailTemplate.upsert({
      where: { key: t.key },
      update: { subject: t.subject, body: t.body },
      create: { key: t.key, subject: t.subject, body: t.body },
    });
  }
  console.log(`  ✓ ${emailTemplates.length} email templates`);

  // ═══════════════════════════════════════════════════════════════
  //  ADMIN MENU ITEMS
  // ═══════════════════════════════════════════════════════════════
  const adminMenuItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: "◇", requireSuperAdmin: false, displayOrder: 1 },
    { label: "Orders", href: "/admin/orders", icon: "☰", requireSuperAdmin: false, displayOrder: 2 },
    { label: "Customers", href: "/admin/customers", icon: "♢", requireSuperAdmin: false, displayOrder: 3 },
    { label: "Reports", href: "/admin/reports", icon: "◎", requireSuperAdmin: false, displayOrder: 4 },
    { label: "Automation", href: "/admin/automation", icon: "⚡", requireSuperAdmin: false, displayOrder: 5 },
    { label: "Security", href: "/admin/security", icon: "🔒", requireSuperAdmin: false, displayOrder: 6 },
    { label: "Landing Page", href: "/admin/landing", icon: "◎", requireSuperAdmin: false, displayOrder: 7 },
    { label: "Shop", href: "/admin/shop", icon: "□", requireSuperAdmin: false, displayOrder: 8 },
    { label: "Categories", href: "/admin/categories", icon: "⊞", requireSuperAdmin: false, displayOrder: 9 },
    { label: "Collections", href: "/admin/collections", icon: "⊟", requireSuperAdmin: false, displayOrder: 10 },
    { label: "Blog", href: "/admin/blog", icon: "△", requireSuperAdmin: false, displayOrder: 11 },
    { label: "Inventory", href: "/admin/inventory", icon: "▤", requireSuperAdmin: false, displayOrder: 12 },
    { label: "Admins", href: "/admin/admins", icon: "✦", requireSuperAdmin: true, displayOrder: 13 },
    { label: "Settings", href: "/admin/settings", icon: "⚙", requireSuperAdmin: false, displayOrder: 14 },
  ];
  for (const item of adminMenuItems) {
    await prisma.adminMenuItem.upsert({
      where: { href: item.href },
      update: { label: item.label, icon: item.icon, requireSuperAdmin: item.requireSuperAdmin, displayOrder: item.displayOrder },
      create: { id: item.href.replace(/\//g, "_").replace(/^_/, ""), label: item.label, href: item.href, icon: item.icon, requireSuperAdmin: item.requireSuperAdmin, displayOrder: item.displayOrder },
    });
  }
  console.log(`  ✓ ${adminMenuItems.length} admin menu items`);

  // ── Translations ──
  await seedTranslations(prisma);
  console.log("  ✓ Translations seeded");

  // ═══════════════════════════════════════════════════════════════
  //  VERIFICATION
  // ═══════════════════════════════════════════════════════════════
  const totalCategories = await prisma.category.count();
  const totalProducts = await prisma.product.count();
  console.log(`\n  ── Summary ──`);
  console.log(`  Total categories: ${totalCategories}`);
  console.log(`  Total products:  ${totalProducts}`);

  const moroccanProductRecords = await prisma.product.findMany({ where: { slug: { in: productSlugs } }, include: { category: true } });
  let missingImage = 0, missingCategory = 0, missingStock = 0, missingPrice = 0, missingSlug = 0;
  for (const p of moroccanProductRecords) {
    if (!p.image) missingImage++;
    if (!p.category) missingCategory++;
    if (!p.stock && p.stock !== 0) missingStock++;
    if (!p.price) missingPrice++;
    if (!p.slug) missingSlug++;
  }

  if (missingImage || missingCategory || missingStock || missingPrice || missingSlug) {
    console.log(`\n  ⚠️  Verification issues found:`);
    if (missingImage) console.log(`    - ${missingImage} products missing image`);
    if (missingCategory) console.log(`    - ${missingCategory} products missing category`);
    if (missingStock) console.log(`    - ${missingStock} products missing stock`);
    if (missingPrice) console.log(`    - ${missingPrice} products missing price`);
    if (missingSlug) console.log(`    - ${missingSlug} products missing slug`);
  } else {
    console.log(`  ✓ All ${moroccanProductRecords.length} Moroccan products verified (image ✓, category ✓, stock ✓, price ✓, slug ✓)`);
  }

  console.log("\n✅ Seeding complete!");
  console.log("\n─────────────────────────────────────────");
  console.log("  Admin Email:      " + adminEmail);
  console.log("  Temporary Password: " + adminPassword);
  console.log("─────────────────────────────────────────\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
