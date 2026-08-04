import { ProductForm } from "@/components/admin/ProductForm";
import type { Metadata } from "next";
import { getLanguage, getTranslation, loadTranslations } from "@/lib/translations";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLanguage();
  const translations = await loadTranslations("admin");
  return { title: getTranslation(translations, "product_form_add_title", lang, "Ajouter un produit — Admin") };
}

export default function AddProductPage() {
  return (
    <div className="container-shell py-10">
      <ProductForm />
    </div>
  );
}
