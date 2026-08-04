import type { Metadata } from "next";
import { getLanguage, getTranslation, loadTranslations } from "@/lib/translations";
import { prisma } from "@/lib/prisma";
import { TransfersClient } from "./TransfersClient";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLanguage();
  const translations = await loadTranslations("admin");
  return { title: getTranslation(translations, "stock_transfers", lang, "Stock Transfers") };
}

export default async function TransfersPage() {
  const [warehouses, recentTransfers] = await Promise.all([
    prisma.warehouse.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.inventoryMovement.findMany({
      where: { movementType: "TRANSFER" },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { warehouse: { select: { name: true } } },
    }),
  ]);

  const formatted = recentTransfers.map((m) => ({
    id: m.id,
    productId: m.productId,
    warehouseName: m.warehouse.name,
    quantity: m.quantity,
    reason: m.reason,
    reference: m.reference,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div>
      <TransfersClient warehouses={warehouses} recentTransfers={formatted} />
    </div>
  );
}
