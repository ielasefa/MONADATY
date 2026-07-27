"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";

const navLinks = [
  { href: "/admin/inventory", label: "inventory_dashboard" },
  { href: "/admin/inventory/warehouses", label: "warehouses" },
  { href: "/admin/inventory/suppliers", label: "suppliers" },
  { href: "/admin/inventory/purchase-orders", label: "purchase_orders" },
  { href: "/admin/inventory/transfers", label: "transfers" },
  { href: "/admin/inventory/adjustments", label: "adjustments" },
  { href: "/admin/inventory/audit", label: "audit_log" },
];

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation("inventory");
  const pathname = usePathname();

  return (
    <div className="container-shell mx-auto px-6 py-10">
      <nav className="mb-10 flex flex-wrap items-center gap-1 rounded-2xl border border-white/[0.06] bg-card p-1.5">
        {navLinks.map((link) => {
          const isActive = link.href === "/admin/inventory"
            ? pathname === "/admin/inventory"
            : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-button px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] transition-all duration-200 ${
                isActive
                  ? "bg-gold/10 text-gold shadow-sm"
                  : "text-muted hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              {t(link.label)}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
