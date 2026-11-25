import type { Prisma } from "@/generated/prisma/client";

/** Catalogue stock can include unallocated units; do not invent warehouse allocations. */
export async function allocateStockChange(tx: Prisma.TransactionClient, input: { productId: string; previousStock: number; delta: number; reference: string; adminId?: string; sale?: boolean }) {
  const rows = await tx.productWarehouseStock.findMany({ where: { productId: input.productId, variantId: "" }, include: { warehouse: { select: { isDefault: true } } }, orderBy: { warehouseId: "asc" } });
  if (!rows.length) return;
  rows.sort((a,b) => Number(b.warehouse.isDefault) - Number(a.warehouse.isDefault) || a.warehouseId.localeCompare(b.warehouseId));
  let remaining = input.delta < 0
    ? Math.max(0, -input.delta - Math.max(0, input.previousStock - rows.reduce((sum,row) => sum + Math.max(0,row.stock - row.reservedStock), 0)))
    : input.delta;
  for (const row of rows) {
    if (!remaining) break;
    const quantity = input.delta < 0 ? -Math.min(remaining, Math.max(0,row.stock - row.reservedStock)) : remaining;
    if (!quantity) continue;
    const changed = await tx.productWarehouseStock.updateMany({ where: { id: row.id, stock: row.stock, reservedStock: row.reservedStock }, data: { stock: { increment: quantity } } });
    if (changed.count !== 1) throw new Error("Warehouse allocation changed. Retry the operation.");
    await tx.inventoryMovement.create({ data: { productId: input.productId, warehouseId: row.warehouseId, movementType: input.sale ? "SALE" : "ADJUSTMENT", quantity, previousStock: row.stock, newStock: row.stock + quantity, reference: input.reference, reason: input.sale ? "Order stock deduction" : "Product stock adjustment", adminId: input.adminId || "" } });
    remaining -= Math.abs(quantity);
  }
  if (remaining) throw new Error("Insufficient unreserved warehouse stock");
}

/** Restock exactly the warehouses deducted for this order, once per status transition. */
export async function restoreOrderAllocations(tx: Prisma.TransactionClient, orderId: string, productId: string) {
  const totals = await tx.inventoryMovement.groupBy({ by: ["warehouseId"], where: { productId, variantId: "", reference: orderId, movementType: { in: ["SALE", "RETURN"] } }, _sum: { quantity: true }, orderBy: { warehouseId: "asc" } });
  for (const total of totals) {
    const quantity = -(total._sum.quantity || 0);
    if (quantity <= 0) continue;
    const row = await tx.productWarehouseStock.upsert({ where: { warehouseId_productId_variantId: { warehouseId: total.warehouseId, productId, variantId: "" } }, create: { warehouseId: total.warehouseId, productId, stock: quantity }, update: { stock: { increment: quantity } } });
    await tx.inventoryMovement.create({ data: { productId, warehouseId: total.warehouseId, movementType: "RETURN", quantity, previousStock: row.stock - quantity, newStock: row.stock, reference: orderId, reason: "Order cancellation or return" } });
  }
}
