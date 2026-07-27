import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { WarehouseForm } from "./WarehouseForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Warehouse",
};

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
