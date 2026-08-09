"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "@/hooks/useTranslation";

type NavItem = { label: string; href: string; icon: string };

const GROUPS = [
  { key: "overview", hrefs: ["/admin/dashboard", "/admin/reports"] },
  { key: "catalog", hrefs: ["/admin/products", "/admin/categories", "/admin/collections", "/admin/collections-showcase"] },
  { key: "sales", hrefs: ["/admin/orders", "/admin/customers", "/admin/invoices"] },
  { key: "content", hrefs: ["/admin/landing", "/admin/translations"] },
  { key: "system", hrefs: ["/admin/settings", "/admin/admins"] },
] as const;

function NavIcon({ href }: { href: string }) {
  const common = {
    className: "h-[17px] w-[17px]",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  const icons: Record<string, ReactNode> = {
    "/admin/dashboard": <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="4" rx="1" /><rect x="14" y="11" width="7" height="10" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>,
    "/admin/products": <svg {...common}><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="m4.5 7.5 7.5 4 7.5-4M12 11.5V21" /></svg>,
    "/admin/categories": <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>,
    "/admin/collections": <svg {...common}><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></svg>,
    "/admin/collections-showcase": <svg {...common}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M8 4v16M8 10h13" /></svg>,
    "/admin/orders": <svg {...common}><path d="M6 3h12l2 4H4l2-4Z" /><path d="M5 7v13h14V7M9 11h6" /></svg>,
    "/admin/customers": <svg {...common}><circle cx="9" cy="8" r="3" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 4.5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 3.5 4.8" /></svg>,
    "/admin/invoices": <svg {...common}><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" /><path d="M9 8h6M9 12h6M9 16h3" /></svg>,
    "/admin/reports": <svg {...common}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>,
    "/admin/landing": <svg {...common}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 9v12" /></svg>,
    "/admin/translations": <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></svg>,
    "/admin/settings": <svg {...common}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08A1.7 1.7 0 0 0 9 19.36a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.63 15 1.7 1.7 0 0 0 3.08 14H3v-4h.08A1.7 1.7 0 0 0 4.64 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.63 1.7 1.7 0 0 0 10 3.08V3h4v.08A1.7 1.7 0 0 0 15 4.64a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.37 9 1.7 1.7 0 0 0 20.92 10H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z" /></svg>,
    "/admin/admins": <svg {...common}><path d="M12 3 5 6v5c0 4.7 2.9 8.2 7 10 4.1-1.8 7-5.3 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></svg>,
  };

  return <>{icons[href] ?? icons["/admin/dashboard"]}</>;
}

export function AdminSidebar({ items, websiteName }: { items: NavItem[]; websiteName?: string }) {
  const { t } = useTranslation("admin");
  const displayName = websiteName || "MONADATY";
  const pathname = usePathname();
  const signingOutRef = useRef(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const handler = (event: PageTransitionEvent) => {
      if (event.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", handler);
    return () => window.removeEventListener("pageshow", handler);
  }, []);

  async function handleSignOut() {
    if (signingOutRef.current) return;
    signingOutRef.current = true;
    setIsSigningOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // The user is redirected even if the request is interrupted.
    }
    document.cookie.split(";").forEach((cookie) => {
      document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    });
    window.location.replace("/admin/login");
  }

  const normalizedItems = items.map((item) =>
    item.href === "/admin/shop"
      ? { ...item, href: "/admin/products", label: t("products", "Products") }
      : item,
  );
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="sticky top-0 flex h-screen w-16 shrink-0 flex-col border-e border-white/[0.08] bg-[#0A0A09] lg:w-[232px]">
      <div className="flex h-16 shrink-0 items-center justify-center border-b border-white/[0.08] px-2 lg:justify-start lg:px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#D6B35A]/20 bg-[#D6B35A]/[0.08] text-xs font-semibold text-[#D6B35A]">
          M
        </div>
        <div className="ms-3 hidden min-w-0 lg:block">
          <p className="truncate text-[0.78rem] font-semibold tracking-[0.18em] text-white">{displayName}</p>
          <p className="mt-0.5 text-[0.52rem] font-medium uppercase tracking-[0.16em] text-white/35">{t("control_center", "Control center")}</p>
        </div>
      </div>

      <nav aria-label={t("admin_navigation", "Admin navigation")} className="min-h-0 flex-1 overflow-y-auto px-2 py-3 lg:px-3 lg:py-4">
        <div className="space-y-4 lg:space-y-5">
          {GROUPS.map((group) => {
            const groupItems = group.hrefs
              .map((href) => normalizedItems.find((item) => item.href === href))
              .filter((item): item is NavItem => Boolean(item));
            if (groupItems.length === 0) return null;
            return (
              <section key={group.key}>
                <p className="mb-1.5 hidden px-3 text-[0.52rem] font-medium uppercase tracking-[0.2em] text-white/25 lg:block">
                  {t(`nav_group_${group.key}`, group.key)}
                </p>
                <div className="space-y-1">
                  {groupItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={item.label}
                        className={`group relative flex h-10 items-center justify-center rounded-xl text-sm transition-[background-color,color,border-color] duration-200 lg:justify-start lg:gap-3 lg:px-3 ${
                          active
                            ? "bg-[#151512] text-white"
                            : "text-white/[0.48] hover:bg-white/[0.035] hover:text-white/80"
                        }`}
                      >
                        {active ? <span className="absolute inset-y-2 start-0 w-0.5 rounded-full bg-[#D6B35A]" aria-hidden /> : null}
                        <span className={`shrink-0 ${active ? "text-[#D6B35A]" : "text-white/40 group-hover:text-white/65"}`}>
                          <NavIcon href={item.href} />
                        </span>
                        <span className="hidden truncate text-[0.78rem] font-medium lg:block">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </nav>

      <div className="shrink-0 border-t border-white/[0.08] p-2 lg:p-3">
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          title={t("sign_out", "Sign out")}
          className="group flex h-10 w-full items-center justify-center rounded-xl text-white/40 transition-colors duration-200 hover:bg-red-500/[0.06] hover:text-red-300 disabled:pointer-events-none disabled:opacity-40 lg:justify-start lg:gap-3 lg:px-3"
        >
          <svg aria-hidden className="h-[17px] w-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M10 17l5-5-5-5M15 12H3" /><path d="M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" /></svg>
          <span className="hidden text-[0.78rem] font-medium lg:block">{isSigningOut ? t("signing_out", "Signing out…") : t("sign_out", "Sign out")}</span>
        </button>
      </div>
    </aside>
  );
}
