"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { logError } from "@/lib/logger";

function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 255);
}

async function findUniqueSlug(base: string, excludeId?: string): Promise<string> {
  let candidate = base;
  let suffix = 1;
  while (true) {
    const existing = await prisma.product.findFirst({
      where: { slug: candidate, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    });
    if (!existing) return candidate;
    candidate = `${base}-${suffix}`;
    suffix++;
  }
}

function generateSku(name: string): string {
  const prefix = name
    .split(/\s+/)
    .slice(0, 3)
    .map((w) => w.replace(/[^a-zA-Z0-9]/g, "").toUpperCase())
    .join("-");
  const suffix = Date.now().toString(36).toUpperCase().slice(-6);
  return `${prefix}-${suffix}`;
}

export async function saveProduct(formData: FormData) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Unauthorized");

  const id = (formData.get("id") as string) || "";
  const name = (formData.get("name") as string) || "";
  const rawSlug = (formData.get("slug") as string) || "";
  const price = (formData.get("price") as string) || "0.00 DH";
  const comparePrice = (formData.get("comparePrice") as string) || "";
  const image = (formData.get("image") as string) || "";
  const categoryName = (formData.get("category") as string) || "Sparkling";
  const collectionSlug = (formData.get("collection") as string) || "";
  const visual = (formData.get("visual") as string) || "";
  const accent = (formData.get("accent") as string) || "#D5B87D";
  const description = (formData.get("description") as string) || "";
  const ingredients = (formData.get("ingredients") as string) || "";
  const nutrition = (formData.get("nutrition") as string) || "";
  const badgesStr = (formData.get("badges") as string) || "";
  const badges = badgesStr.split(",").map((b: string) => b.trim()).filter(Boolean);
  const stock = parseInt(formData.get("stock") as string) || 0;
  const featured = formData.getAll("featured").includes("true");
  const available = formData.getAll("available").includes("true");

  const category = categoryName
    ? await prisma.category.findUnique({ where: { slug: categoryName.toLowerCase() } })
    : null;
  const collection = collectionSlug
    ? await prisma.collection.findUnique({ where: { slug: collectionSlug } })
    : null;

  try {
    const baseSlug = sanitizeSlug(rawSlug || name);
    const slug = await findUniqueSlug(baseSlug, id || undefined);

    if (id) {
      await prisma.product.update({
        where: { id },
        data: {
          name,
          slug,
          price,
          comparePrice,
          image,
          categoryId: category?.id ?? null,
          collectionId: collection?.id ?? null,
          visual,
          accent,
          description,
          ingredients,
          nutrition,
          badges,
          stock,
          featured,
          available,
        },
      });
    } else {
      await prisma.product.create({
        data: {
          name,
          slug,
          sku: generateSku(name),
          price,
          comparePrice,
          image,
          categoryId: category?.id ?? null,
          collectionId: collection?.id ?? null,
          visual,
          accent,
          description,
          ingredients,
          nutrition,
          badges,
          stock,
          featured,
          available,
          status: "Active",
        },
      });
    }
  } catch (err) {
    logError(err, "SAVE_PRODUCT");
    throw new Error("Failed to save product");
  }

  revalidatePath("/shop");
  revalidatePath("/");
  revalidatePath("/admin/shop");
  revalidatePath("/admin/dashboard");
}