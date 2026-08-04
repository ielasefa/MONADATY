"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

export function QuickActions() {
 const { t } = useTranslation("admin");

 const actions = [
   { label: t("add_product"), href: "/admin/shop", icon: "➕", desc: t("create_new_product") },
   { label: t("order_management"), href: "/admin/orders", icon: "📦", desc: t("view_all_orders") },
   {
     label: t("customer_management"),
     href: "/admin/customers",
     icon: "👥",
     desc: t("customer_management"),
   },
   {
     label: t("manage_collections"),
     href: "/admin/collections",
     icon: "📁",
     desc: t("manage_collections"),
   },
    { label: t("blog", "Blog"), href: "/admin/blog", icon: "📝", desc: t("manage_blog", "Manage blog posts") },
   { label: t("settings"), href: "/admin/settings", icon: "⚙️", desc: t("site_settings") },
 ];

 return (
   <motion.div
     initial={{ opacity: 0, y: 16 }}
     whileInView={{ opacity: 1, y: 0 }}
     viewport={{ once: true, margin: "-60px" }}
     transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
   >
     <p className="luxury-label mb-4 text-[10px] text-white/50">{t("quick_actions")}</p>
     <motion.div
       initial="hidden"
       whileInView="visible"
       viewport={{ once: true, margin: "-40px" }}
       variants={{
         hidden: {},
         visible: {
           transition: {
             staggerChildren: 0.07,
             delayChildren: 0.05,
           },
         },
       }}
       className="grid grid-cols-3 gap-3 md:grid-cols-6"
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
               transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
             },
           }}
           whileHover={{ y: -3, scale: 1.03, transition: { duration: 0.2 } }}
           whileTap={{ scale: 0.97 }}
           className="will-change-transform"
         >
           <Link
             href={action.href}
             className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-surface p-4 text-center transition-all duration-300 hover:border-gold/20 hover:shadow-lg hover:shadow-gold/5"
           >
             <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
             <div className="relative z-10">
               <motion.span
                 className="mb-2 block text-2xl"
                 whileHover={{ scale: 1.15, rotate: 5 }}
                 transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
               >
                 {action.icon}
               </motion.span>
               <p className="text-xs font-medium text-white">{action.label}</p>
               <p className="mt-0.5 text-[0.55rem] text-white/50">{action.desc}</p>
             </div>
           </Link>
         </motion.div>
       ))}
     </motion.div>
   </motion.div>
 );
}
