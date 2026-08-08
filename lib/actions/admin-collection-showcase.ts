"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { logError } from "@/lib/logger";

export type SaveCollectionShowcaseResult =
  | { ok: true }
  | { ok: false; code: string };

const REQUIRED_COUNT = 3;

export async function saveCollectionShowcase(
  formData: FormData,
): Promise<SaveCollectionShowcaseResult> {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return { ok: false, code: "unauthorized" };

  const collectionId = (formData.get("collectionId") as string) ?? "";
  const productIds = [1, 2, 3]
    .map((n) => (formData.get(`productId${n}`) as string) ?? "")
    .filter(Boolean);

  if (!collectionId) return { ok: false, code: "invalid_collection" };

  if (productIds.length !== REQUIRED_COUNT) {
    return { ok: false, code: "exactly_three" };
  }

  if (new Set(productIds).size !== REQUIRED_COUNT) {
    return { ok: false, code: "duplicate_products" };
  }

  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    include: { products: { select: { id: true } } },
  });
  if (!collection) return { ok: false, code: "invalid_collection" };

  const validIds = new Set(collection.products.map((p) => p.id));
  for (const productId of productIds) {
    if (!validIds.has(productId)) return { ok: false, code: "product_not_in_collection" };
  }

  try {
    await prisma.$transaction([
      prisma.collectionShowcaseProduct.deleteMany({ where: { collectionId } }),
      prisma.collectionShowcaseProduct.createMany({
        data: productIds.map((productId, index) => ({
          collectionId,
          productId,
          position: index + 1,
        })),
      }),
    ]);
  } catch (error) {
    logError(error, "saveCollectionShowcase");
    return { ok: false, code: "save_failed" };
  }

  revalidateTag("landing");
  revalidatePath("/");
  revalidatePath("/collections");
  revalidatePath("/admin/collections-showcase");
  revalidatePath("/admin/dashboard");

  return { ok: true };
}
