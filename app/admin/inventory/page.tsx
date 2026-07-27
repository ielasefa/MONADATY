import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { InventoryDashboardClient } from "./InventoryDashboardClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Inventory Dashboard",
};

export default async function InventoryDashboardPage() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalProducts,
    totalWarehouses,
    totalSuppliers,
    outOfStockCount,
    lowStockCount,
    movementsToday,
    latestMovements,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.warehouse.count(),
    prisma.supplier.count(),
    prisma.product.count({ where: { stock: { lte: 0 } } }),
    prisma.product.count({ where: { stock: { gt: 0, lte: 5 } } }),
    prisma.inventoryMovement.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.inventoryMovement.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { warehouse: { select: { name: true } } },
    }),
  ]);

  const lowStockProducts = await prisma.product.findMany({
    where: { stock: { gt: 0, lte: 5 } },
    orderBy: { stock: "asc" },
    take: 10,
    select: { id: true, name: true, stock: true, lowStockThreshold: true, image: true },
  });

  const movements = latestMovements.map((m) => ({
    id: m.id,
    productId: m.productId,
    warehouseName: m.warehouse.name,
    movementType: m.movementType,
    quantity: m.quantity,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <InventoryDashboardClient
      totalProducts={totalProducts}
      totalWarehouses={totalWarehouses}
      totalSuppliers={totalSuppliers}
      outOfStockCount={outOfStockCount}
      lowStockCount={lowStockCount}
      movementsToday={movementsToday}
      latestMovements={movements}
      lowStockProducts={lowStockProducts}
    />
  );
}
