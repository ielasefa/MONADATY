import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getLanguage, getTranslation, loadTranslations } from "@/lib/translations";
import SidebarWrapper from "@/components/admin/SidebarWrapper";
import { getNotifications, getUnreadCount } from "@/lib/admin-notifications";
import { LanguageProvider } from "@/context/LanguageContext";
import { TranslationHydrator } from "@/components/TranslationHydrator";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

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
    const lang = await getLanguage();
    const commonTr = await loadTranslations("common");
    return (
      <LanguageProvider initialLang={lang}>
        <TranslationHydrator initialLang={lang} initialTranslations={commonTr} />
        <main className="min-h-screen bg-bg">{children}</main>
      </LanguageProvider>
    );
  }

  const authed = await isAuthenticated();

  if (!authed) {
    redirect("/admin/login");
  }

  if (authed.mustChangePassword && pathname !== "/admin/change-password") {
    redirect("/admin/change-password");
  }

  if (pathname === "/admin/change-password") {
    const lang = await getLanguage();
    const commonTr = await loadTranslations("common");
    return (
      <LanguageProvider initialLang={lang}>
        <TranslationHydrator initialLang={lang} initialTranslations={commonTr} />
        <main className="min-h-screen bg-bg">{children}</main>
      </LanguageProvider>
    );
  }

  const [notifications, unreadCount, adminTr] = await Promise.all([
    getNotifications(),
    getUnreadCount(),
    loadTranslations("admin"),
  ]);
  const lang = await getLanguage();

  return (
    <LanguageProvider initialLang={lang}>
      <TranslationHydrator initialLang={lang} initialTranslations={adminTr} />
      <div className="admin-shell flex min-h-screen min-w-0 bg-[#0B0B0A]">
        <SidebarWrapper />
        <main className="min-w-0 flex-1 overflow-x-clip bg-[#0B0B0A] p-0">
          <AdminTopbar initialNotifications={notifications} initialUnread={unreadCount} />
          {children}
        </main>
      </div>
    </LanguageProvider>
  );
}
