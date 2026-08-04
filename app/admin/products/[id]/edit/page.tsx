import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { getLanguage, getTranslation, loadTranslations } from "@/lib/translations";
import { EditProductForm } from "@/components/admin/EditProductForm";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLanguage();
  const translations = await loadTranslations("admin");
  return { title: getTranslation(translations, "product_form_edit_title", lang, "Modifier le produit — Admin") };
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const authed = await isAuthenticated();
  if (!authed) {
    redirect("/admin/login");
  }

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      collection: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!product) {
    redirect("/admin/products");
  }

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const collections = await prisma.collection.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="container-shell py-10">
      <EditProductForm
        product={JSON.parse(JSON.stringify(product))}
        categories={JSON.parse(JSON.stringify(categories))}
        collections={JSON.parse(JSON.stringify(collections))}
      />
    </div>
  );
}
