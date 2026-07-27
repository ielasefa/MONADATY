import type { Metadata } from "next";
import {
  getSettings, saveSettings,
  getTestimonials, saveTestimonials,
} from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { LandingForm } from "./LandingForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Landing Page",
};

const ALLOWED_SECTIONS = ["hero", "featured", "collections", "about", "testimonials", "announcement", "newsletter", "footer"] as const;
type Section = (typeof ALLOWED_SECTIONS)[number];

function requireSection(value: string | null): Section | null {
  if (!value) return null;
  if (!ALLOWED_SECTIONS.includes(value as Section)) return null;
  return value as Section;
}

function str(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

function clampText(value: string, max: number): string {
  return value.slice(0, max);
}

async function updateSettings(formData: FormData) {
  "use server";
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Unauthorized");
  const section = requireSection(formData.get("section") as string);
  if (!section) throw new Error("Invalid section");
  const settings = await getSettings();

  if (section === "hero") {
    settings.hero.enabled = formData.get("enabled") === "true";
    settings.hero.title = clampText(str(formData.get("title")), 200) || settings.hero.title;
    settings.hero.subtitle = clampText(str(formData.get("subtitle")), 200);
    settings.hero.description = clampText(str(formData.get("description")), 1000);
    settings.hero.ctaText = clampText(str(formData.get("ctaText")), 50) || settings.hero.ctaText;
    settings.hero.ctaLink = clampText(str(formData.get("ctaLink")), 2000) || settings.hero.ctaLink;
    const heroImage = str(formData.get("heroImage"));
    if (heroImage !== null) {
      settings.hero.media = heroImage ? [heroImage] : settings.hero.media;
    }
  } else if (section === "featured") {
    settings.featuredProducts.enabled = formData.get("enabled") === "true";
    settings.featuredProducts.title = clampText(str(formData.get("title")), 200) || settings.featuredProducts.title;
    settings.featuredProducts.subtitle = clampText(str(formData.get("subtitle")), 300);
  } else if (section === "collections") {
    settings.collectionsSection.enabled = formData.get("enabled") === "true";
    settings.collectionsSection.title = clampText(str(formData.get("title")), 200) || settings.collectionsSection.title;
    settings.collectionsSection.subtitle = clampText(str(formData.get("subtitle")), 300);
  } else if (section === "about") {
    settings.aboutSection.enabled = formData.get("enabled") === "true";
    settings.aboutSection.title = clampText(str(formData.get("title")), 200) || settings.aboutSection.title;
    settings.aboutSection.subtitle = clampText(str(formData.get("subtitle")), 200);
    settings.aboutSection.description = clampText(str(formData.get("description")), 2000);
    settings.aboutSection.image = clampText(str(formData.get("image")), 2000) || settings.aboutSection.image;
  } else if (section === "testimonials") {
    settings.testimonialsSection.enabled = formData.get("enabled") === "true";
    settings.testimonialsSection.title = clampText(str(formData.get("title")), 200) || settings.testimonialsSection.title;
    settings.testimonialsSection.subtitle = clampText(str(formData.get("subtitle")), 300);
  } else if (section === "footer") {
    settings.footer.description = clampText(str(formData.get("footerDescription")), 1000) || settings.footer.description;
    settings.footer.copyright = clampText(str(formData.get("copyright")), 200) || settings.footer.copyright;
    settings.footer.email = clampText(str(formData.get("footerEmail")), 200) || settings.footer.email;
    settings.footer.phone = clampText(str(formData.get("footerPhone")), 100) || settings.footer.phone;
    settings.footer.address = clampText(str(formData.get("footerAddress")), 300) || settings.footer.address;
  } else if (section === "announcement") {
    settings.announcementBar.enabled = formData.get("enabled") === "true";
    settings.announcementBar.text = clampText(str(formData.get("text")), 300);
    settings.announcementBar.link = clampText(str(formData.get("link")), 2000);
    settings.announcementBar.buttonText = clampText(str(formData.get("buttonText")), 50);
    settings.announcementBar.bgColor = clampText(str(formData.get("bgColor")), 30);
    settings.announcementBar.textColor = clampText(str(formData.get("textColor")), 30);
  } else if (section === "newsletter") {
    settings.newsletter.enabled = formData.get("enabled") === "true";
    settings.newsletter.title = clampText(str(formData.get("title")), 200) || settings.newsletter.title;
    settings.newsletter.subtitle = clampText(str(formData.get("subtitle")), 200);
    settings.newsletter.description = clampText(str(formData.get("description")), 500);
    settings.newsletter.placeholder = clampText(str(formData.get("placeholder")), 100);
    settings.newsletter.buttonText = clampText(str(formData.get("buttonText")), 50);
  }

  await saveSettings(settings);
  revalidatePath("/");
  revalidatePath("/admin/landing");
}

const ALLOWED_SECTION_ORDER = ["announcement", "hero", "featured", "collections", "about", "testimonials", "newsletter"] as const;

async function updateSectionOrder(formData: FormData) {
  "use server";
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Unauthorized");
  const orderRaw = str(formData.get("order"));
  if (!orderRaw) throw new Error("Missing order");
  const parts = orderRaw.split(",").filter(Boolean);
  const allowed = new Set<string>(ALLOWED_SECTION_ORDER);
  const clean = parts.filter((p) => allowed.has(p));
  if (clean.length !== allowed.size || new Set(clean).size !== clean.length) {
    throw new Error("Invalid section order");
  }
  const settings = await getSettings();
  settings.sectionOrder = clean;
  await saveSettings(settings);
  revalidatePath("/");
  revalidatePath("/admin/landing");
}

async function saveFeaturedProducts(formData: FormData) {
  "use server";
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Unauthorized");

  const productIdsRaw = str(formData.get("productIds"));
  const ids = productIdsRaw ? productIdsRaw.split(",").filter(Boolean) : [];
  if (ids.length > 50) throw new Error("Too many featured products");

  const existing = await prisma.product.findMany({ where: { id: { in: ids } }, select: { id: true } });
  const validIds = new Set(existing.map((p) => p.id));
  const validOrdered = ids.filter((id) => validIds.has(id));

  await prisma.$transaction([
    prisma.landingSection.deleteMany({ where: { section: "featured_products" } }),
    ...(validOrdered.length > 0
      ? [prisma.landingSection.createMany({
          data: validOrdered.map((productId, index) => ({
            section: "featured_products",
            productId,
            position: index,
            enabled: true,
          })),
        })]
      : []),
  ]);

  revalidatePath("/");
  revalidatePath("/admin/landing");
}

async function updateFeaturedProduct(formData: FormData) {
  "use server";
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Unauthorized");

  const id = str(formData.get("id"));
  if (!id) throw new Error("Missing entry id");

  const existing = await prisma.landingSection.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw new Error("Entry not found");

  const enabled = formData.get("enabled") === "true";
  const position = Math.max(0, Math.min(9999, parseInt(str(formData.get("position"))) || 0));

  await prisma.landingSection.update({
    where: { id },
    data: { enabled, position },
  });

  revalidatePath("/");
  revalidatePath("/admin/landing");
}

async function deleteFeaturedProduct(formData: FormData) {
  "use server";
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Unauthorized");

  const id = str(formData.get("id"));
  if (!id) throw new Error("Missing entry id");

  await prisma.landingSection.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/admin/landing");
}

const MAX_TESTIMONIALS = 50;

async function saveTestimonialAction(formData: FormData) {
  "use server";
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Unauthorized");
  const testimonials = await getTestimonials();
  const id = str(formData.get("id"));
  const name = clampText(str(formData.get("name")), 200);
  const role = clampText(str(formData.get("role")), 200);
  const content = clampText(str(formData.get("content")), 1000);
  const visible = formData.get("visible") !== "false";
  const order = Math.max(0, Math.min(9999, parseInt(str(formData.get("order"))) || 0));

  if (!name && !id) throw new Error("Testimonial name is required");

  if (id) {
    const idx = testimonials.findIndex((t) => t.id === id);
    if (idx !== -1) {
      testimonials[idx] = { ...testimonials[idx], name, role, content, visible, order };
    }
  } else {
    if (testimonials.length >= MAX_TESTIMONIALS) throw new Error("Maximum testimonials reached");
    testimonials.push({
      id: crypto.randomUUID(),
      name, role, content, avatar: "", visible, order,
    });
  }
  await saveTestimonials(testimonials, testimonials.map((t) => t.id));
  revalidatePath("/");
  revalidatePath("/admin/landing");
}

async function deleteTestimonialAction(formData: FormData) {
  "use server";
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Unauthorized");
  const id = str(formData.get("id"));
  if (!id) throw new Error("Missing testimonial id");
  const allTestimonials = await getTestimonials();
  const remaining = allTestimonials.filter((t) => t.id !== id);
  await saveTestimonials(remaining, remaining.map((t) => t.id));
  revalidatePath("/");
  revalidatePath("/admin/landing");
}

async function updateCollectionLanding(formData: FormData) {
  "use server";
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Unauthorized");
  const id = str(formData.get("id"));
  if (!id) throw new Error("Missing collection id");
  const landingEnabled = formData.get("landingEnabled") === "true";
  const landingOrder = Math.max(0, Math.min(9999, parseInt(str(formData.get("landingOrder"))) || 0));
  await prisma.collection.update({
    where: { id },
    data: { landingEnabled, landingOrder },
  });
  revalidatePath("/");
  revalidatePath("/admin/landing");
}

async function getFeaturedSectionEntries() {
  const entries = await prisma.landingSection.findMany({
    where: { section: "featured_products", productId: { not: null } },
    orderBy: { position: "asc" },
    include: { product: { select: { id: true, name: true, slug: true, price: true, image: true } } },
  });
  return entries.filter((e) => e.productId && e.product).map((e) => ({
    id: e.id,
    position: e.position,
    enabled: e.enabled,
    productId: e.productId!,
    product: e.product,
  }));
}

async function getAllCollections() {
  const rows = await prisma.collection.findMany({ orderBy: { order: "asc" } });
  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    image: c.image,
    landingEnabled: c.landingEnabled,
    landingOrder: c.landingOrder,
  }));
}

export default async function AdminLandingPage() {
  const settings = await getSettings();
  const testimonials = await getTestimonials();
  const featuredEntries = await getFeaturedSectionEntries();
  const allCollections = await getAllCollections();

  return (
    <div className="container-shell mx-auto px-6 py-10">
      <LandingForm
        settings={settings}
        testimonials={testimonials}
        featuredEntries={featuredEntries}
        allCollections={allCollections}
        updateSettings={updateSettings}
        updateSectionOrder={updateSectionOrder}
        saveFeaturedProducts={saveFeaturedProducts}
        updateFeaturedProduct={updateFeaturedProduct}
        deleteFeaturedProduct={deleteFeaturedProduct}
        saveTestimonial={saveTestimonialAction}
        deleteTestimonial={deleteTestimonialAction}
        updateCollectionLanding={updateCollectionLanding}
      />
    </div>
  );
}
