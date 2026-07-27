import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SupplierForm } from "./SupplierForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Supplier",
};

export default async function SupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (id === "new") {
    return (
      <div>
        <SupplierForm supplier={null} />
      </div>
    );
  }

  const supplier = await prisma.supplier.findUnique({ where: { id } });
  if (!supplier) notFound();

  return (
    <div>
      <SupplierForm supplier={supplier} />
    </div>
  );
}
