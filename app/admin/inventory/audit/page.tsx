import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AuditLogClient } from "./AuditLogClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Audit Log",
};

export default async function AuditLogPage() {
  const [warehouses, movements] = await Promise.all([
    prisma.warehouse.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.inventoryMovement.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { warehouse: { select: { id: true, name: true } } },
    }),
  ]);

  const formatted = movements.map((m) => ({
    id: m.id,
    productId: m.productId,
    warehouseId: m.warehouseId,
    warehouseName: m.warehouse.name,
    movementType: m.movementType,
    quantity: m.quantity,
    reason: m.reason,
    reference: m.reference,
    createdAt: m.createdAt.toISOString(),
    previousStock: m.previousStock,
    newStock: m.newStock,
  }));

  return (
    <div>
      <AuditLogClient warehouses={warehouses} initialMovements={formatted} />
    </div>
  );
}
