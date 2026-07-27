import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { isAuthenticated } from "@/lib/auth";
import SidebarWrapper from "@/components/admin/SidebarWrapper";
import { NotificationBell } from "@/components/admin/NotificationBell";
import { getNotifications, getUnreadCount } from "@/lib/admin-notifications";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get("x-admin-pathname") ?? "";

  // Login and change-password pages render without the sidebar
  if (pathname === "/admin/login" || pathname === "/admin/change-password") {
    if (pathname === "/admin/login") {
      const authed = await isAuthenticated();
      if (authed) {
        redirect("/admin/dashboard");
      }
    }
    return <main className="min-h-screen bg-bg">{children}</main>;
  }

  const authed = await isAuthenticated();

  if (!authed) {
    redirect("/admin/login");
  }

  const [notifications, unreadCount] = await Promise.all([
    getNotifications(),
    getUnreadCount(),
  ]);

  return (
    <div className="flex min-h-screen bg-bg">
      <SidebarWrapper />
      <main className="flex-1 overflow-auto bg-bg p-0">
        <div className="sticky top-0 z-40 flex h-16 items-center justify-end gap-3 border-b border-white/[0.06] bg-bg/80 px-6 backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            <NotificationBell initialNotifications={notifications} initialUnread={unreadCount} />
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
