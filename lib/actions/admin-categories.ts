"use server";

import { getCategories, saveCategories, getProducts, saveProducts } from "@/lib/data";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdmin } from "@/lib/auth";

export async function saveCategory(formData: FormData) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Unauthorized");

  const categories = await getCategories();
  const original = formData.get("original") as string;
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const image = formData.get("image") as string;

  const entry = { name, slug, description, image };

  if (original) {
    const idx = categories.findIndex((c) => c.slug === original);
    if (idx !== -1) categories[idx] = entry;
  } else {
    categories.push(entry);
  }

  await saveCategories(categories);
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/categories");
}

export async function deleteCategory(formData: FormData) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Unauthorized");

  const slug = formData.get("slug") as string;
  const replacement = (formData.get("replacement") as string) || "";
  const allCats = await getCategories();
  await saveCategories(allCats.filter((c) => c.slug !== slug));

  if (replacement) {
    const products = await getProducts();
    for (const p of products) {
      if (p.category === slug) p.category = replacement;
    }
    await saveProducts(products);
  }

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/categories");
}
