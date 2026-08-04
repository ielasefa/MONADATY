import type { Metadata } from "next";
import { getLanguage, getTranslation, loadTranslations } from "@/lib/translations";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SupplierForm } from "./SupplierForm";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLanguage();
  const translations = await loadTranslations("admin");
  return { title: getTranslation(translations, "supplier", lang, "Supplier") };
}

export default async function SupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (id === "new") {
    return (
      <div>
        <SupplierForm supplier={null} />
      </div>
    );
  }

  const supplier = await prisma.supplier.findUnique({ where: { id } });
  if (!supplier) notFound();

  return (
    <div>
      <SupplierForm supplier={supplier} />
    </div>
  );
}
