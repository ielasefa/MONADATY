import type { Metadata } from "next";
import { getLanguage, getTranslation, loadTranslations } from "@/lib/translations";
import { prisma } from "@/lib/prisma";
import { PurchaseOrdersClient } from "./PurchaseOrdersClient";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLanguage();
  const translations = await loadTranslations("admin");
  return { title: getTranslation(translations, "purchase_orders", lang, "Purchase Orders") };
}

export default async function PurchaseOrdersPage() {
  const [orders, suppliers] = await Promise.all([
    prisma.purchaseOrder.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        supplier: { select: { id: true, name: true } },
        warehouse: { select: { name: true } },
      },
    }),
    prisma.supplier.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const mapped = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    supplierName: o.supplier.name,
    warehouseName: o.warehouse.name,
    status: o.status,
    total: o.total,
    createdAt: o.createdAt.toISOString(),
  }));

  return (
    <div>
      <PurchaseOrdersClient orders={mapped} suppliers={suppliers} />
    </div>
  );
}
