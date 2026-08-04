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
    <aside className="flex w-64 flex-col border-r border-white/[0.06] bg-[#171717]">
      <div className="flex h-16 items-center gap-3 border-b border-white/[0.06] px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/15">
          <span className="text-sm font-bold text-gold">M</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-display text-lg tracking-wide text-gold">{displayName}</span>
          <span className="rounded-full border border-burgundy/20 bg-burgundy/10 px-2 py-0.5 text-[0.6rem] font-medium uppercase tracking-widest text-burgundy">
            {t("admin_role")}
          </span>
        </div>
      </div>

  <nav aria-label={t("admin_navigation")} className="flex-1 space-y-1 p-3">
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
         className={`group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
           active
             ? "border-l-[3px] border-burgundy bg-burgundy/10 pl-[9px] text-white"
             : "border-l-[3px] border-transparent text-white/50 hover:border-burgundy/40 hover:bg-burgundy/5 hover:text-white"
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
             color: active ? "#9B2638" : undefined,
             scale: active ? [1, 1.2, 1] : 1,
           }}
           transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
         >
           {item.icon}
         </motion.span>
         {item.label}
         {active && (
           <motion.div
             layoutId="sidebar-active-dot"
             className="absolute right-3 h-1.5 w-1.5 rounded-full bg-burgundy"
             transition={{
               type: "spring",
               stiffness: 500,
               damping: 25,
             }}
             style={{
               boxShadow: "0 0 6px rgba(155,38,56,0.5)",
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
          className="group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-white/50 transition-all duration-200 hover:bg-burgundy/10 hover:text-burgundy disabled:opacity-50 disabled:pointer-events-none"
        >
          <span aria-hidden="true" className="w-5 text-center text-base transition-colors group-hover:text-burgundy">&#9211;</span>
          {t("sign_out")}
        </button>
      </div>
    </aside>
  );
}
