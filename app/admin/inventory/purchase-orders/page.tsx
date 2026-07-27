import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PurchaseOrdersClient } from "./PurchaseOrdersClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Purchase Orders",
};

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
