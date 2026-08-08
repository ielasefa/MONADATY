"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { IconRefresh, IconCalendar } from "./icons";

export function DashboardHeader({ adminName }: { adminName?: string | null }) {
  const { t } = useTranslation("admin");
  const reduce = useReducedMotion();
  const router = useRouter();

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const firstName = adminName ? adminName.trim().split(/\s+/)[0] : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
    >
      <div>
        <p className="flex items-center gap-2 text-[0.64rem] font-semibold uppercase tracking-[0.24em] text-gold/80">
          <span className="h-px w-8 bg-gold/50" aria-hidden />
          Monadaty · Admin
        </p>
        <h1 className="mt-3 font-display text-[1.9rem] font-bold leading-tight tracking-tight text-white md:text-4xl">
          {firstName ? (
            <>
              {t("welcome_back", "Welcome back")},{" "}
              <span className="bg-gradient-to-r from-gold via-[#E6CE9A] to-gold bg-clip-text text-transparent">
                {firstName}
              </span>
            </>
          ) : (
            t("dashboard", "Dashboard")
          )}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          {t("overview_of_store", "Overview of your store performance")}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="hidden items-center gap-2 rounded-lg border border-white/[0.06] bg-surface px-3.5 py-2.5 text-[0.72rem] text-white/55 md:inline-flex">
          <IconCalendar className="h-3.5 w-3.5 text-gold/70" />
          <span className="capitalize">{today}</span>
        </span>
        <motion.button
          type="button"
          onClick={() => router.refresh()}
          whileTap={reduce ? undefined : { scale: 0.97 }}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-gold/25 bg-gold/10 px-4 text-[0.72rem] font-semibold text-gold transition-colors duration-200 hover:bg-gold/20"
          aria-label={t("refresh_data", "Refresh data")}
        >
          <IconRefresh className="h-3.5 w-3.5" />
          {t("refresh", "Refresh")}
        </motion.button>
      </div>
    </motion.div>
  );
}
