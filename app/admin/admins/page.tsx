import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminManagement } from "./AdminManagement";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Management",
};

export default async function AdminsPage() {
  const admin = await getAuthenticatedAdmin();
  if (!admin || admin.role !== "SUPER_ADMIN") redirect("/admin/dashboard");

  const admins = await prisma.admin.findMany({
    select: { id: true, name: true, email: true, role: true, mustChangePassword: true, lastLoginAt: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="container-shell mx-auto px-6 py-10">
      <AdminManagement admins={admins} />
    </div>
  );
}
