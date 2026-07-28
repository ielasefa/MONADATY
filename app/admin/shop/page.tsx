import type { Metadata } from "next";
import { getProducts, saveProducts, getCategories, getCollections } from "@/lib/data";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
import { ShopForm } from "./ShopForm";

export const metadata: Metadata = {
  title: "Shop Admin",
};

async function saveProduct(formData: FormData) {
  "use server";
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Unauthorized");
  const products = await getProducts();
  const id = formData.get("id") as string;
  const slug = formData.get("slug") as string;
  const entry = {
    id: id || slug,
    name: (formData.get("name") as string) || "",
    slug,
    price: (formData.get("price") as string) || "0.00 DH",
    comparePrice: (formData.get("comparePrice") as string) || "",
    image: (formData.get("image") as string) || "",
    gallery: [],
    category: (formData.get("category") as string) || "Sparkling",
    collection: (formData.get("collection") as string) || "",
    visual: (formData.get("visual") as string) || "",
    accent: (formData.get("accent") as string) || "#D5B87D",
    description: (formData.get("description") as string) || "",
    ingredients: (formData.get("ingredients") as string) || "",
    nutrition: (formData.get("nutrition") as string) || "",
    badges: (formData.get("badges") as string || "").split(",").map((b: string) => b.trim()).filter(Boolean),
    stock: parseInt(formData.get("stock") as string) || 0,
    featured: formData.getAll("featured").includes("true"),
    available: formData.getAll("available").includes("true"),
  };

  if (id) {
    const idx = products.findIndex((p) => p.id === id);
    if (idx !== -1) products[idx] = entry;
  } else {
    products.push(entry);
  }
  await saveProducts(products);
  revalidatePath("/shop");
  revalidatePath("/");
  revalidatePath("/admin/shop");
}

export default async function AdminShopPage() {
  const products = await getProducts();
  const categories = await getCategories();
  const collections = await getCollections();

  return (
    <div className="min-h-screen bg-bg">
      <div className="container-shell mx-auto px-6 py-10">
        <ShopForm
          products={products}
          categories={categories}
          collections={collections}
          saveProduct={saveProduct}
        />
      </div>
    </div>
  );
}
