import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdjustmentsClient } from "./AdjustmentsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stock Adjustments",
};

export default async function AdjustmentsPage() {
  const [warehouses, recentAdjustments] = await Promise.all([
    prisma.warehouse.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.inventoryMovement.findMany({
      where: { movementType: "ADJUSTMENT" },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { warehouse: { select: { name: true } } },
    }),
  ]);

  const formatted = recentAdjustments.map((m) => ({
    id: m.id,
    productId: m.productId,
    warehouseName: m.warehouse.name,
    quantity: m.quantity,
    previousStock: m.previousStock,
    newStock: m.newStock,
    reason: m.reason,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div>
      <AdjustmentsClient warehouses={warehouses} recentAdjustments={formatted} />
    </div>
  );
}
