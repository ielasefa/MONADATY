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
    <div className="min-h-[calc(100vh-4rem)] min-w-0 bg-[#0B0B0A]">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
      <ProductForm />
      </div>
    </div>
  );
}
