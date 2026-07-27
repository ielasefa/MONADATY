"use client";

import Link from "next/link";
import { PageTransition } from "@/components/MotionWrappers";
import { useTranslation } from "@/hooks/useTranslation";

export default function NotFound() {
  const { t } = useTranslation("errors");
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center" role="alert" aria-label="404 — Page not found">
      <PageTransition>
        <div className="max-w-lg">
          <h1 className="font-display text-[6rem] font-bold leading-none tracking-tighter text-ivory/[0.06]">
            404
          </h1>
          <div className="mx-auto my-6 h-px w-12 bg-ivory/[0.08]" />
          <p className="font-display text-xl font-semibold text-ivory">{t("page_not_found")}</p>
          <p className="mt-2.5 max-w-sm text-[0.78rem] text-ivory/28">
            {t("page_not_found_desc")}
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/" className="btn-primary h-10 items-center justify-center px-6 text-[0.55rem] font-semibold uppercase tracking-[0.14em]">
              {t("back_to_home")}
            </Link>
            <Link href="/shop" className="btn-secondary h-10 items-center justify-center px-6 text-[0.55rem] font-semibold uppercase tracking-[0.14em]">
              {t("browse_shop")}
            </Link>
          </div>
        </div>
      </PageTransition>
    </div>
  );
}
