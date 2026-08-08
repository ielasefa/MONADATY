import type { Metadata } from "next";
import { headers } from "next/headers";
import { isAuthenticated } from "@/lib/auth";
import { getLanguage, getTranslation, loadTranslations } from "@/lib/translations";
import SidebarWrapper from "@/components/admin/SidebarWrapper";
import { NotificationBell } from "@/components/admin/NotificationBell";
import { getNotifications, getUnreadCount } from "@/lib/admin-notifications";
import { LanguageProvider } from "@/context/LanguageContext";
import { TranslationHydrator } from "@/components/TranslationHydrator";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLanguage();
  const translations = await loadTranslations("admin");
  return { title: getTranslation(translations, "admin_panel", lang, "Admin") };
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get("x-admin-pathname") ?? "";

  // Login and change-password pages render without the sidebar.
  // All auth redirects happen in the middleware (real HTTP 307 responses);
  // the layout never redirects, so it cannot participate in redirect loops.
  if (pathname === "/admin/login" || pathname === "/admin/change-password") {
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

  // If the DB-backed session is invalid (e.g. expired/revoked), render the
  // page without the admin shell. The middleware handles the cookie-level
  // gate; no redirect is issued here.
  if (!authed) {
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
      <div className="flex min-h-screen bg-bg">
        <SidebarWrapper />
        <main className="flex-1 overflow-auto bg-bg p-0">
          <div className="sticky top-0 z-40 flex h-16 items-center justify-end gap-3 border-b border-white/[0.06] bg-bg/80 px-3 backdrop-blur-2xl will-change-transform sm:px-4 lg:px-6">
            <div className="flex items-center gap-3">
              <NotificationBell initialNotifications={notifications} initialUnread={unreadCount} />
            </div>
          </div>
          {children}
        </main>
      </div>
    </LanguageProvider>
  );
}
