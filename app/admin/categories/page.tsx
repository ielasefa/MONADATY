import type { Metadata } from "next";
import { getCategories } from "@/lib/data";
import { getLanguage, getTranslation, loadTranslations } from "@/lib/translations";
import { CategoriesClient } from "./CategoriesClient";
import { saveCategory, deleteCategory } from "@/lib/actions/admin-categories";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLanguage();
  const translations = await loadTranslations("admin");
  return { title: getTranslation(translations, "categories_page_title", lang, "Catégories — Admin") };
}

export default async function AdminCategoriesPage() {
  const categories = await getCategories();
  return (
    <div className="container-shell">
      <CategoriesClient categories={categories} saveCategory={saveCategory} deleteCategory={deleteCategory} />
    </div>
  );
}
