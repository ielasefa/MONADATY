import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getLanguage, getTranslation, loadTranslations } from "@/lib/translations";
import SidebarWrapper from "@/components/admin/SidebarWrapper";
import { getNotifications, getUnreadCount } from "@/lib/admin-notifications";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { getSiteSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLanguage();
  const translations = await loadTranslations("admin");
  return { title: getTranslation(translations, "admin_panel", lang, "Admin") };
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get("x-admin-pathname") ?? "";

  if (pathname === "/admin/login") {
    return <div className="min-h-screen bg-canvas">{children}</div>;
  }

  const authed = await isAuthenticated();

  if (!authed) {
    redirect("/admin/login");
  }

  if (authed.mustChangePassword && pathname !== "/admin/change-password") {
    redirect("/admin/change-password");
  }

  if (pathname === "/admin/change-password") {
    return <div className="min-h-screen bg-canvas">{children}</div>;
  }

  const [notifications, unreadCount, settings] = await Promise.all([
    getNotifications(),
    getUnreadCount(),
    getSiteSettings().catch(() => null),
  ]);
  return (
    <div className="admin-shell flex min-h-screen min-w-0 bg-canvas">
      <SidebarWrapper />
      <div className="admin-main min-w-0 flex-1 bg-canvas p-0">
        <AdminTopbar initialNotifications={notifications} initialUnread={unreadCount} logoUrl={settings?.logo || ""} />
        <div className="admin-workspace">{children}</div>
      </div>
    </div>
  );
}
