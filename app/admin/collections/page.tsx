import type { Metadata } from "next";
import { getCollections, saveCollections } from "@/lib/data";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
import { CollectionsClient } from "./CollectionsClient";

export const metadata: Metadata = {
  title: "Collections",
};

async function saveCollection(formData: FormData) {
  "use server";
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
}

async function deleteCollection(formData: FormData) {
  "use server";
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Unauthorized");
  const slug = formData.get("slug") as string;
  const allColl = await getCollections();
  await saveCollections(allColl.filter((c) => c.slug !== slug));
  revalidatePath("/collections");
  revalidatePath("/");
  revalidatePath("/admin/collections");
}

export default async function AdminCollectionsPage() {
  const collections = await getCollections();
  return <CollectionsClient collections={collections} saveCollection={saveCollection} deleteCollection={deleteCollection} />;
}
