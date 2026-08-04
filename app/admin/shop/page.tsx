import type { Metadata } from "next";
import { getProducts, getCategories, getCollections } from "@/lib/data";
import { getLanguage, getTranslation, loadTranslations } from "@/lib/translations";
import { ShopForm } from "./ShopForm";
import { saveProduct } from "@/lib/actions/admin-shop";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLanguage();
  const translations = await loadTranslations("admin");
  return { title: getTranslation(translations, "shop_admin", lang, "Admin boutique") };
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
