"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
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
    <aside className="flex w-16 shrink-0 flex-col border-e border-white/[0.06] bg-[#171717] sm:w-20 lg:w-64">
      <div className="flex h-16 items-center justify-center border-b border-white/[0.06] px-2 lg:justify-start lg:gap-3 lg:px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/15">
          <span className="text-sm font-bold text-gold">M</span>
        </div>
        <div className="hidden items-center gap-2 lg:flex">
          <span className="font-display text-lg tracking-wide text-gold">{displayName}</span>
          <span className="rounded-full border border-burgundy/20 bg-burgundy/10 px-2 py-0.5 text-[0.6rem] font-medium uppercase tracking-widest text-burgundy">
            {t("admin_role")}
          </span>
        </div>
      </div>

  <nav aria-label={t("admin_navigation")} className="flex-1 space-y-1 p-2 lg:p-3">
 {items.map((item) => {
   const active = isActive(item.href);
   return (
     <motion.div
       key={item.href}
       initial={false}
       animate={{
         x: active ? 4 : 0,
         scale: active ? 1.01 : 1,
       }}
       transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
     >
       <Link
         href={item.href}
         title={item.label}
         className={`group relative flex items-center justify-center rounded-md px-2 py-2.5 text-sm font-medium transition-all duration-200 lg:justify-start lg:gap-3 lg:px-3 ${
           active
             ? "border-s-[3px] border-burgundy bg-burgundy/10 ps-[9px] text-white"
             : "border-s-[3px] border-transparent text-white/50 hover:border-burgundy/40 hover:bg-burgundy/5 hover:text-white"
         }`}
       >
<motion.span
            aria-hidden="true"
            className={`w-5 text-center text-base ${
              active
                ? "text-burgundy"
                : "text-white/50 group-hover:text-burgundy"
            }`}
            animate={{
              color: active ? "var(--rouge)" : undefined,
              scale: active ? [1, 1.2, 1] : 1,
            }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
           {item.icon}
         </motion.span>
         <span className="sr-only lg:not-sr-only">{item.label}</span>
         {active && (
           <motion.div
             layoutId="sidebar-active-dot"
             className="absolute end-3 hidden h-1.5 w-1.5 rounded-full bg-burgundy lg:block"
             transition={{
               type: "spring",
               stiffness: 500,
               damping: 25,
             }}
             style={{
               boxShadow: "0 0 6px rgba(110,31,42,0.5)",
               animation: "pulseSubtle 2s ease-in-out infinite",
             }}
           />
         )}
       </Link>
     </motion.div>
   );
 })}
  </nav>

      <div className="divider mx-4" />

      <div className="p-3">
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          title={t("sign_out")}
          className="group flex w-full items-center justify-center rounded-md px-2 py-2.5 text-sm font-medium text-white/50 transition-all duration-200 hover:bg-burgundy/10 hover:text-burgundy disabled:pointer-events-none disabled:opacity-50 lg:justify-start lg:gap-3 lg:px-3"
        >
          <span aria-hidden="true" className="w-5 text-center text-base transition-colors group-hover:text-burgundy">&#9211;</span>
          <span className="sr-only lg:not-sr-only">{t("sign_out")}</span>
        </button>
      </div>
    </aside>
  );
}
