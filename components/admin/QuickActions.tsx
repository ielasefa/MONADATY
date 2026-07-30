"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

export function QuickActions() {
  const { t } = useTranslation("admin");

  const actions = [
    { label: t("add_product"), href: "/admin/shop", icon: "\u2795", desc: t("create_new_product") },
    { label: t("order_management"), href: "/admin/orders", icon: "\uD83D\uDCE6", desc: t("view_all_orders") },
    { label: t("customer_management"), href: "/admin/customers", icon: "\uD83D\uDC65", desc: t("customer_management") },
    { label: t("manage_collections"), href: "/admin/collections", icon: "\uD83D\uDCC1", desc: t("manage_collections") },
    { label: t("blog") || "Blog", href: "/admin/blog", icon: "📝", desc: t("manage_blog") || "Manage blog posts" },
    { label: t("settings"), href: "/admin/settings", icon: "\u2699\uFE0F", desc: t("site_settings") },
  ];

  return (
    <div className="animate-fade-in">
      <p className="luxury-label mb-4 text-[10px] text-white/50">{t("quick_actions")}</p>
      <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-surface p-4 text-center transition-all duration-300 hover:border-gold/20 hover:shadow-lg hover:shadow-gold/5"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative z-10">
              <span
                className="mb-2 block text-2xl transition-transform duration-200 group-hover:scale-110"
              >
                {action.icon}
              </span>
              <p className="text-xs font-medium text-white">{action.label}</p>
              <p className="mt-0.5 text-[0.55rem] text-white/50">{action.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
