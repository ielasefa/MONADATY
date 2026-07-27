import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SuppliersClient } from "./SuppliersClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Suppliers",
};

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <SuppliersClient suppliers={suppliers} />
    </div>
  );
}
