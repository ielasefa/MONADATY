"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { IconBag, IconBox, IconUsers, IconLayers, IconSettings } from "@/components/admin/dashboard/icons";
import { useTranslation } from "@/hooks/useTranslation";

export function QuickActions() {
  const { t } = useTranslation("admin");

  const actions = [
    { label: t("add_product"), href: "/admin/shop", icon: <IconBox className="h-5 w-5" />, desc: t("create_new_product") },
    { label: t("order_management"), href: "/admin/orders", icon: <IconBag className="h-5 w-5" />, desc: t("view_all_orders") },
    {
      label: t("customer_management"),
      href: "/admin/customers",
      icon: <IconUsers className="h-5 w-5" />,
      desc: t("customer_management"),
    },
    {
      label: t("manage_collections"),
      href: "/admin/collections",
      icon: <IconLayers className="h-5 w-5" />,
      desc: t("manage_collections"),
    },
    { label: t("settings"), href: "/admin/settings", icon: <IconSettings className="h-5 w-5" />, desc: t("site_settings") },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <p className="luxury-label mb-4 text-xs text-secondary">{t("quick_actions")}</p>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.07,
              delayChildren: 0.05,
            },
          },
        }}
        className="grid grid-cols-3 gap-4 md:grid-cols-5"
      >
        {actions.map((action) => (
          <motion.div
            key={action.href}
            variants={{
              hidden: { opacity: 0, y: 14, scale: 0.97, filter: "blur(3px)" },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                filter: "blur(0px)",
                transition: { duration: 0.5, ease: [0.16, 1, 0.36, 1] },
              },
            }}
            whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.97 }}
            className="will-change-transform"
          >
            <Link
              href={action.href}
              className="group relative overflow-hidden rounded-xl border border-line bg-card p-5 h-full transition-all duration-300 hover:border-gold/20 hover:shadow-lg hover:shadow-gold/5 flex flex-col"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative z-10 flex flex-col h-full">
                <motion.span
                  className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-line text-accent"
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  {action.icon}
                </motion.span>
                <p className="text-sm font-medium text-foreground">{action.label}</p>
                <p className="mt-1 flex-1 text-xs text-secondary">{action.desc}</p>
              </div>
              <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gold/[0.04] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}