import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { TransfersClient } from "./TransfersClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stock Transfers",
};

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
