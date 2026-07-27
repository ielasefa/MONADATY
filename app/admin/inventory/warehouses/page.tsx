import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { WarehousesClient } from "./WarehousesClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Warehouses",
};

export default async function WarehousesPage() {
  const warehouses = await prisma.warehouse.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <WarehousesClient warehouses={warehouses} />
    </div>
  );
}
