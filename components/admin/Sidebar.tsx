"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

type NavItem = { label: string; href: string; icon: string };

export function AdminSidebar({ items, websiteName }: { items: NavItem[]; websiteName?: string }) {
  const { t } = useTranslation("admin");
  const displayName = websiteName || t("admin_panel");
  const pathname = usePathname();

  const signingOutRef = useRef(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const handler = (e: PageTransitionEvent) => {
      if (e.persisted) {
        window.location.reload();
      }
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
      /* ignore network errors; we redirect regardless */
    }
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    window.location.replace("/admin/login");
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="flex w-64 flex-col border-r border-white/[0.06] bg-[#0A0A0A]">
      <div className="flex h-16 items-center gap-3 border-b border-white/[0.06] px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red/15">
          <span className="text-sm font-bold text-red">M</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-display text-lg tracking-wide text-yellow">{displayName}</span>
          <span className="rounded-full border border-red/20 bg-red/10 px-2 py-0.5 text-[0.6rem] font-medium uppercase tracking-widest text-red">
            {t("admin_role")}
          </span>
        </div>
      </div>

      <nav aria-label={t("admin_navigation")} className="flex-1 space-y-1 p-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              isActive(item.href)
                ? "border-l-[3px] border-red bg-red/10 pl-[9px] text-white"
                : "border-l-[3px] border-transparent text-white/50 hover:border-red/40 hover:bg-red/5 hover:text-white"
            }`}
          >
            <span aria-hidden="true" className={`w-5 text-center text-base transition-colors ${isActive(item.href) ? "text-red" : "text-white/50 group-hover:text-red"}`}>
              {item.icon}
            </span>
            {item.label}
            {isActive(item.href) && (
              <div className="absolute right-3 h-1.5 w-1.5 rounded-full bg-red shadow-[0_0_6px_rgba(193,18,31,0.5)]" />
            )}
          </Link>
        ))}
      </nav>

      <div className="divider mx-4" />

      <div className="p-3">
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-white/50 transition-all duration-200 hover:bg-red/10 hover:text-red disabled:opacity-50 disabled:pointer-events-none"
        >
          <span aria-hidden="true" className="w-5 text-center text-base transition-colors group-hover:text-red">&#9211;</span>
          {t("sign_out")}
        </button>
      </div>
    </aside>
  );
}
