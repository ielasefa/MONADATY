"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

export default function RootError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useTranslation("errors");
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex min-h-[60vh] items-center justify-center px-6 py-20"
    >
      <div className="max-w-md w-full rounded-md border border-ivory/[0.06] bg-black-surface p-12 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-md border border-burgundy/10 bg-burgundy/5">
          <svg className="h-7 w-7 text-burgundy" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <p className="text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-burgundy">{t("error")}</p>
        <h2 className="mt-3 font-display text-xl font-semibold text-ivory">{t("something_went_wrong")}</h2>
        <div className="mx-auto my-6 h-px w-12 bg-burgundy/15" />
        <p className="max-w-xs text-[0.8rem] text-ivory/35">{t("unexpected_error")}</p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <button onClick={reset} className="btn-primary h-11 items-center justify-center rounded-md px-7 text-[0.65rem] font-semibold uppercase tracking-[0.14em]">
            {t("try_again")}
          </button>
          <Link href="/" className="btn-secondary h-11 items-center justify-center rounded-md px-7 text-[0.65rem] font-semibold uppercase tracking-[0.14em]">
            {t("go_home")}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
