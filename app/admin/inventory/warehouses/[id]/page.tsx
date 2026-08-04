import type { Metadata } from "next";
import { getLanguage, getTranslation, loadTranslations } from "@/lib/translations";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { WarehouseForm } from "./WarehouseForm";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLanguage();
  const translations = await loadTranslations("admin");
  return { title: getTranslation(translations, "warehouse", lang, "Warehouse") };
}

export default async function WarehouseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (id === "new") {
    return (
      <div>
        <WarehouseForm warehouse={null} stocks={[]} />
      </div>
    );
  }

  const warehouse = await prisma.warehouse.findUnique({ where: { id } });
  if (!warehouse) notFound();

  const stocks = await prisma.productWarehouseStock.findMany({
    where: { warehouseId: id },
  });

  const stocksWithProducts = await Promise.all(
    stocks.map(async (s) => {
      const product = await prisma.product.findUnique({
        where: { id: s.productId },
        select: { name: true, sku: true },
      });
      return { ...s, productName: product?.name ?? "Unknown", sku: product?.sku ?? "" };
    })
  );

  return (
    <div>
      <WarehouseForm warehouse={warehouse} stocks={stocksWithProducts} />
    </div>
  );
}
