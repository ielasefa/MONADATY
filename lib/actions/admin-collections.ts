"use server";

import { getCollections, saveCollections } from "@/lib/data";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdmin } from "@/lib/auth";

export async function saveCollection(formData: FormData) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Unauthorized");

  const collections = await getCollections();
  const original = formData.get("original") as string;
  const slug = formData.get("slug") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const accent = formData.get("accent") as string || "#D5B87D";
  const tone = formData.get("tone") as string || "";
  const previewLabel = formData.get("previewLabel") as string || title;
  const image = formData.get("image") as string || "";
  const order = parseInt(formData.get("order") as string) || 0;

  const entry = { slug, title, description, accent, tone, previewLabel, image, order };

  if (original) {
    const idx = collections.findIndex((c) => c.slug === original);
    if (idx !== -1) collections[idx] = entry;
  } else {
    collections.push(entry);
  }

  await saveCollections(collections);
  revalidatePath("/collections");
  revalidatePath("/");
  revalidatePath("/admin/collections");
  revalidatePath("/admin/dashboard");
}

export async function deleteCollection(formData: FormData) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Unauthorized");

  const slug = formData.get("slug") as string;
  const allColl = await getCollections();
  await saveCollections(allColl.filter((c) => c.slug !== slug));

  revalidatePath("/collections");
  revalidatePath("/");
  revalidatePath("/admin/collections");
  revalidatePath("/admin/dashboard");
}
