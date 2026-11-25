"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { IconRefresh, IconCalendar } from "./icons";

export function DashboardHeader({ adminName }: { adminName?: string | null }) {
  const { t, lang } = useTranslation("admin");
  const reduce = useReducedMotion();
  const router = useRouter();

  const today = new Date().toLocaleDateString({ fr: "fr-MA", en: "en-GB", ar: "ar-MA" }[lang], {
    timeZone: "Africa/Casablanca",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const firstName = adminName ? adminName.trim().split(/\s+/)[0] : "";

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="admin-dashboard-welcome"
    >
      <div>
        <p className="flex items-center gap-2 text-sm font-medium text-[#E8CD91]">
          <span className="h-px w-8 bg-[#E8CD91]" aria-hidden />
          {t("administration", "Administration")} · MONADATY
        </p>
        <h1 className="mt-3 font-display text-[1.9rem] font-bold leading-tight tracking-tight text-white md:text-4xl">
          {firstName ? (
            <>
              {t("welcome_back", "Welcome back")},{" "}
              <span className="admin-welcome-name">
                {firstName}
              </span>
            </>
          ) : (
            t("dashboard", "Dashboard")
          )}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#EFD7D1]">
          {t("overview_of_store", "Overview of your store performance")}
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-3 lg:max-w-60 lg:justify-end">
        <span className="inline-flex items-center gap-2 text-sm text-[#EFD7D1]">
          <IconCalendar className="h-4 w-4" />
          <span className="capitalize">{today}</span>
        </span>
        <motion.button
          type="button"
          onClick={() => router.refresh()}
          whileTap={reduce ? undefined : { scale: 0.97 }}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#E8CD91]/40 bg-white/10 px-4 text-sm font-medium text-white transition-colors duration-200 hover:bg-white/20"
          aria-label={t("refresh_data", "Refresh data")}
        >
          <IconRefresh className="h-3.5 w-3.5" />
          {t("refresh", "Refresh")}
        </motion.button>
      </div>
    </motion.div>
  );
}
