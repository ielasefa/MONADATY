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

  return <AdminSidebar items={items} websiteName={settings?.websiteName} />;
}
