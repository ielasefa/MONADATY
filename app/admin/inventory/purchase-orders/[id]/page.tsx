import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PurchaseOrderDetailClient } from "./PurchaseOrderDetailClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Purchase Order",
};

export default async function PurchaseOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (id === "new") {
    const [suppliers, warehouses] = await Promise.all([
      prisma.supplier.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
      prisma.warehouse.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    ]);
    return (
      <div>
        <PurchaseOrderDetailClient order={null} items={[]} suppliers={suppliers} warehouses={warehouses} />
      </div>
    );
  }

  const order = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      supplier: true,
      warehouse: true,
      items: true,
    },
  });
  if (!order) notFound();

  const [suppliers, warehouses] = await Promise.all([
    prisma.supplier.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.warehouse.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const itemsWithProducts = await Promise.all(
    order.items.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { name: true, sku: true, stock: true },
      });
      return {
        id: item.id,
        productId: item.productId,
        productName: product?.name ?? "Unknown",
        sku: product?.sku ?? "",
        currentStock: product?.stock ?? 0,
        variantId: item.variantId,
        quantity: item.quantity,
        cost: item.cost,
        receivedQuantity: item.receivedQuantity,
        remainingQuantity: item.remainingQuantity,
      };
    })
  );

  return (
    <div>
      <PurchaseOrderDetailClient
        order={{
          id: order.id,
          orderNumber: order.orderNumber,
          supplierId: order.supplierId,
          supplierName: order.supplier.name,
          warehouseId: order.warehouseId,
          warehouseName: order.warehouse.name,
          status: order.status,
          notes: order.notes,
          subtotal: order.subtotal,
          tax: order.tax,
          total: order.total,
          createdAt: order.createdAt.toISOString(),
          updatedAt: order.updatedAt.toISOString(),
        }}
        items={itemsWithProducts}
        suppliers={suppliers}
        warehouses={warehouses}
      />
    </div>
  );
}
