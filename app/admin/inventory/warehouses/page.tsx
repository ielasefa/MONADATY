import type { Metadata } from "next";
import { getLanguage, getTranslation, loadTranslations } from "@/lib/translations";
import { prisma } from "@/lib/prisma";
import { WarehousesClient } from "./WarehousesClient";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLanguage();
  const translations = await loadTranslations("admin");
  return { title: getTranslation(translations, "warehouses", lang, "Warehouses") };
}

export default async function WarehousesPage() {
  const warehouses = await prisma.warehouse.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <WarehousesClient warehouses={warehouses} />
    </div>
  );
}
