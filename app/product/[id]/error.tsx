"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

export default function ProductError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useTranslation("products");
  return (
    <motion.div 
      initial={{ opacity: 0, y: 32 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="container-premium flex min-h-[60vh] items-center justify-center py-20"
    >
      <div className="border border-ivory/[0.06] bg-black-surface rounded-md px-12 py-16 max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-md border border-burgundy/20 bg-burgundy/10">
          <svg className="h-7 w-7 text-burgundy" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="label-utility tracking-[0.5em] text-burgundy">{t("error")}</p>
        <h2 className="font-display mt-3 text-3xl font-semibold text-ivory">{t("product_not_found")}</h2>
        <div className="mx-auto my-6 h-px w-12 bg-burgundy/15" />
        <p className="mb-8 max-w-sm text-sm text-ivory/60">
          {t("product_unavailable")}
        </p>
        <div className="flex items-center justify-center gap-4">
          <button onClick={reset} className="btn-primary">{t("try_again")}</button>
          <Link href="/shop" className="btn-secondary">{t("browse_shop")}</Link>
        </div>
      </div>
    </motion.div>
  );
}
