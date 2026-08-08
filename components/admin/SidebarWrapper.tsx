import { getAuthenticatedAdmin } from "@/lib/auth";
import { getAdminMenuItems, getSiteSettings } from "@/lib/db";
import { AdminSidebar } from "./Sidebar";

export default async function SidebarWrapper() {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    return null;
  }

  const [items, settings] = await Promise.all([
    getAdminMenuItems(admin.role),
    getSiteSettings().catch(() => null),
  ]);

  const filteredItems = items.filter((item) => {
    const hrefsToHide = [
      "/admin/automation",
      "/admin/inventory",
      "/admin/blog",
      "/admin/security",
    ];
    return !hrefsToHide.some((h) => item.href === h || item.href.startsWith(h + "/"));
  });

  return <AdminSidebar items={filteredItems} websiteName={settings?.websiteName} />;
}
