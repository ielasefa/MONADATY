"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

export default function ShopError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useTranslation("shop");
  return (
    <div className="container-premium flex min-h-[60vh] items-center justify-center py-20 animate-fade-in">
      <div className="border border-ivory/[0.06] bg-black-surface rounded-md px-12 py-16 max-w-lg text-center stagger-1">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-md border border-burgundy/20 bg-burgundy/10">
          <svg className="h-7 w-7 text-burgundy" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="label-utility tracking-[0.5em] text-burgundy">{t("error")}</p>
        <h2 className="font-display mt-3 text-3xl font-semibold text-ivory">{t("shop_unavailable")}</h2>
        <div className="mx-auto my-6 h-px w-12 bg-burgundy/15" />
        <p className="mb-8 max-w-sm text-sm text-ivory/60">
          {t("shop_unavailable_desc")}
        </p>
        <div className="flex items-center justify-center gap-4">
          <button onClick={reset} className="btn-primary">{t("try_again")}</button>
          <Link href="/" className="btn-secondary">{t("go_home")}</Link>
        </div>
      </div>
    </div>
  );
}
