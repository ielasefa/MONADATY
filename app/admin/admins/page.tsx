import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLanguage, getTranslation, loadTranslations } from "@/lib/translations";
import { AdminManagement } from "./AdminManagement";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLanguage();
  const translations = await loadTranslations("admin");
  return { title: getTranslation(translations, "admin_management_title", lang, "Gestion des administrateurs — Admin") };
}

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
