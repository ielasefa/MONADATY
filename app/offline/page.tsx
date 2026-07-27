"use client";

import Link from "next/link";
import { PageTransition } from "@/components/MotionWrappers";
import { useTranslation } from "@/hooks/useTranslation";

export default function OfflinePage() {
  const { t } = useTranslation("errors");
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <PageTransition>
        <div className="max-w-lg">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-md border border-ivory/[0.05] bg-ivory/[0.02]">
            <svg className="h-7 w-7 text-ivory/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39M10.71 5.05A16 16 0 0122.56 9M1.42 9a15.91 15.91 0 014.7-2.88M8.53 16.11a6 6 0 016.95 0M12 20h.01" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-semibold text-ivory">
            {t("no_connection")}
          </h1>
          <div className="mx-auto my-6 h-px w-12 bg-ivory/[0.06]" />
          <p className="max-w-sm text-[0.8rem] text-ivory/35">
            {t("check_connection")}
          </p>
          <Link href="/" className="mt-8 btn-primary inline-flex h-11 items-center justify-center rounded-md px-7 text-[0.65rem] font-semibold uppercase tracking-[0.14em]">
            {t("go_home")}
          </Link>
        </div>
      </PageTransition>
    </div>
  );
}
