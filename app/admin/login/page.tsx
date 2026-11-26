import { redirect } from "next/navigation";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { adminLoginDestination } from "@/lib/admin-login-destination";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getSiteSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ searchParams }: {
  searchParams: Promise<{ redirect?: string | string[] }>;
}) {
  const params = await searchParams;
  const requested = typeof params.redirect === "string" ? params.redirect : undefined;
  const admin = await getAuthenticatedAdmin();
  if (admin) redirect(adminLoginDestination(requested, admin.mustChangePassword));
  const settings = await getSiteSettings().catch(() => null);
  return <AdminLoginForm requestedDestination={requested} logoUrl={settings?.logo || ""} />;
}
