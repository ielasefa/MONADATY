"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "@/hooks/useTranslation";

type NavItem = { label: string; href: string; icon: string };

const GROUPS = [
  { key: "overview", hrefs: ["/admin/dashboard", "/admin/reports"] },
  { key: "catalog", hrefs: ["/admin/products", "/admin/categories", "/admin/collections", "/admin/collections-showcase"] },
  { key: "sales", hrefs: ["/admin/orders", "/admin/customers", "/admin/invoices"] },
  { key: "operations", hrefs: ["/admin/inventory"] },
  { key: "content", hrefs: ["/admin/landing", "/admin/blog", "/admin/translations"] },
  { key: "system", hrefs: ["/admin/settings", "/admin/security", "/admin/automation", "/admin/admins"] },
] as const;

const LABEL_KEYS: Record<string, string> = {
  "/admin/dashboard": "dashboard", "/admin/reports": "reports", "/admin/products": "products",
  "/admin/categories": "categories", "/admin/collections": "collections", "/admin/collections-showcase": "collections_showcase",
  "/admin/orders": "orders", "/admin/customers": "customers", "/admin/invoices": "invoices",
  "/admin/inventory": "inventory", "/admin/landing": "landing_page", "/admin/blog": "blog",
  "/admin/translations": "translations", "/admin/settings": "settings", "/admin/security": "security",
  "/admin/automation": "automation", "/admin/admins": "administrators",
};

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
    "/admin/inventory": <svg {...common}><path d="m3 9 9-6 9 6v12H3V9Z" /><path d="M8 21v-9h8v9M8 16h8" /></svg>,
    "/admin/blog": <svg {...common}><path d="M5 3h14v18H5zM8 7h8M8 11h8M8 15h5" /></svg>,
    "/admin/security": <svg {...common}><path d="m12 3 8 3v6c0 4-4 7-8 9-4-2-8-5-8-9V6l8-3Z" /><path d="m8 12 3 3 5-6" /></svg>,
    "/admin/automation": <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>,
    "/admin/settings": <svg {...common}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08A1.7 1.7 0 0 0 9 19.36a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.63 15 1.7 1.7 0 0 0 3.08 14H3v-4h.08A1.7 1.7 0 0 0 4.64 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.63 1.7 1.7 0 0 0 10 3.08V3h4v.08A1.7 1.7 0 0 0 15 4.64a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.37 9 1.7 1.7 0 0 0 20.92 10H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z" /></svg>,
    "/admin/admins": <svg {...common}><path d="M12 3 5 6v5c0 4.7 2.9 8.2 7 10 4.1-1.8 7-5.3 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></svg>,
  };

  return <>{icons[href] ?? icons["/admin/dashboard"]}</>;
}

export function AdminSidebar({ items, websiteName }: { items: NavItem[]; websiteName?: string }) {
  const { t } = useTranslation("admin");
  const displayName = websiteName || "MONADATY";
  const pathname = usePathname();
  const router = useRouter();
  const signingOutRef = useRef(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawer = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handler = (event: PageTransitionEvent) => {
      if (event.persisted) router.refresh();
    };
    window.addEventListener("pageshow", handler);
    return () => window.removeEventListener("pageshow", handler);
  }, [router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 640px)");
    const resize = () => { if (query.matches) setMobileOpen(false); };
    query.addEventListener("change", resize);
    return () => query.removeEventListener("change", resize);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setMobileOpen(false); menuButton.current?.focus(); }
      if (event.key === "Tab") {
        const nodes = Array.from(drawer.current?.querySelectorAll<HTMLElement>("a,button:not([disabled])") || []).filter(node => node.getClientRects().length);
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.body.style.overflow = "hidden";
    drawer.current?.querySelector<HTMLElement>("button")?.focus();
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileOpen]);

  async function handleSignOut() {
    if (signingOutRef.current) return;
    signingOutRef.current = true;
    setIsSigningOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // The user is redirected even if the request is interrupted.
    }
    // Cross the authenticated layout boundary with a fresh server request.
    window.location.replace("/admin/login");
  }

  const normalizedItems = items.map((item) =>
    item.href === "/admin/shop"
      ? { ...item, href: "/admin/products", label: t("products", "Products") }
      : item,
  );
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <button
        ref={menuButton}
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label={t("open_admin_navigation", "Open admin navigation")}
        aria-controls="admin-sidebar"
        aria-expanded={mobileOpen}
        className="admin-menu-toggle admin-icon-button sm:hidden"
      >
        <svg aria-hidden className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {mobileOpen ? (
        <button
          type="button"
          aria-label={t("close_admin_navigation", "Close admin navigation")}
          className="fixed inset-0 z-[65] bg-black/70 backdrop-blur-sm sm:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        ref={drawer}
        id="admin-sidebar"
        data-open={mobileOpen}
        role={mobileOpen ? "dialog" : undefined}
        aria-modal={mobileOpen || undefined}
        aria-label={t("admin_navigation", "Admin navigation")}
        className={`admin-sidebar fixed inset-y-0 start-0 z-[70] flex h-dvh w-[min(18.5rem,calc(100vw-2rem))] shrink-0 flex-col transition-transform duration-200 sm:z-auto sm:w-[72px] sm:translate-x-0 sm:rtl:translate-x-0 lg:w-[248px] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
        }`}
      >
      <div className="admin-sidebar-brand">
        <Link href="/admin/dashboard" className="admin-brand-badge" aria-label={t("dashboard", "Dashboard")}>
          M
        </Link>
        <div className="min-w-0 sm:hidden lg:block">
          <p className="truncate text-sm font-semibold tracking-[0.08em] text-white">{displayName}</p>
          <p className="mt-1 text-xs text-secondary">{t("administration", "Administration")}</p>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label={t("close_admin_navigation", "Close admin navigation")}
          className="ms-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl text-secondary hover:bg-white/10 sm:hidden"
        >
          <span aria-hidden>&times;</span>
        </button>
      </div>

      <nav tabIndex={0} aria-label={t("admin_navigation", "Admin navigation")} className="min-h-0 flex-1 overflow-y-auto px-2 py-5 lg:px-4">
        <div className="space-y-4 lg:space-y-5">
          {GROUPS.map((group) => {
            const groupItems = group.hrefs
              .map((href) => normalizedItems.find((item) => item.href === href))
              .filter((item): item is NavItem => Boolean(item));
            if (groupItems.length === 0) return null;
            return (
              <section key={group.key}>
                <p className="admin-sidebar-group sm:hidden lg:block">
                  {t(`nav_group_${group.key}`, group.key)}
                </p>
                <div className="space-y-1">
                  {groupItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={t(LABEL_KEYS[item.href] || item.label, item.label)}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setMobileOpen(false)}
                        className="admin-sidebar-link"
                      >
                        <span className="shrink-0">
                          <NavIcon href={item.href} />
                        </span>
                        <span className="truncate sm:hidden lg:block">{t(LABEL_KEYS[item.href] || item.label, item.label)}</span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </nav>

      <div className="admin-sidebar-footer">
        <Link href="/" className="admin-sidebar-link" title={t("view_store", "View store")}>
          <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10V6l2-3h14l2 3v4M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M4 13v8h16v-8M9 21v-6h6v6" /></svg>
          <span className="sm:hidden lg:block">{t("view_store", "View store")}</span>
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          title={t("sign_out", "Sign out")}
          className="admin-sidebar-link w-full disabled:pointer-events-none disabled:opacity-50"
        >
          <svg aria-hidden className="h-[17px] w-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M10 17l5-5-5-5M15 12H3" /><path d="M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" /></svg>
          <span className="text-sm font-medium sm:hidden lg:block">{isSigningOut ? t("signing_out", "Signing out…") : t("sign_out", "Sign out")}</span>
        </button>
      </div>
      </aside>
    </>
  );
}
