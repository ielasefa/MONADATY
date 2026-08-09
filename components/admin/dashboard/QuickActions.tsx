"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { EASE, Panel, SectionHeading } from "./ui";
import {
  IconPlus,
  IconBag,
  IconUsers,
  IconLayers,
  IconSettings,
  IconArrowRight,
} from "./icons";

type Action = {
  label: string;
  desc: string;
  href: string;
};

const GLYPHS = [IconPlus, IconBag, IconUsers, IconLayers, IconSettings];

export function QuickActions() {
  const { t } = useTranslation("admin");
  const reduce = useReducedMotion();

  const actions: Action[] = [
    { label: t("add_product", "Add Product"), desc: t("create_new_product"), href: "/admin/products/add" },
    { label: t("order_management", "Order Management"), desc: t("view_all_orders"), href: "/admin/orders" },
    { label: t("customer_management", "Customers"), desc: t("customer_management"), href: "/admin/customers" },
    { label: t("manage_collections", "Collections"), desc: t("manage_collections"), href: "/admin/collections" },
    { label: t("settings", "Settings"), desc: t("site_settings"), href: "/admin/settings" },
  ];

  return (
    <Panel hover={false} className="p-5">
      <SectionHeading
        title={t("quick_actions", "Quick Actions")}
        action={
          <span className="hidden items-center gap-1.5 text-[0.64rem] uppercase tracking-[0.18em] text-white/30 sm:inline-flex">
            <span className="h-1 w-1 rounded-full bg-gold/50" aria-hidden />
            {t("shortcuts", "Shortcuts")}
          </span>
        }
      />

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {actions.map((action, i) => {
          const Glyph = GLYPHS[i % GLYPHS.length];
          return (
            <motion.div
              key={action.href}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: reduce ? 0 : 0.06 + i * 0.06 }}
            >
              <Link
                href={action.href}
                className="group relative flex h-full min-h-28 flex-col overflow-hidden rounded-lg border border-white/[0.06] bg-card p-3.5 transition-colors duration-300 hover:border-gold/25"
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-gold/[0.05] blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-white/60 transition-colors duration-300 group-hover:border-gold/25 group-hover:bg-gold/10 group-hover:text-gold">
                    <Glyph className="h-[18px] w-[18px]" />
                  </span>
                  <IconArrowRight className="h-3.5 w-3.5 text-white/20 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100 group-hover:text-gold" />
                </div>

                <p className="mt-3.5 text-[0.82rem] font-semibold leading-snug text-white">
                  {action.label}
                </p>
                <p className="mt-1 text-[0.68rem] leading-relaxed text-muted">{action.desc}</p>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </Panel>
  );
}
