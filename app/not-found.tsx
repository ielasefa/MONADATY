"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

export default function NotFound() {
  const { t } = useTranslation("errors");
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-black px-6 text-center" role="alert" aria-label={t("page_not_found_label", "404 — Page not found")}>
      {/* Editorial chapter number */}
      <span className="font-display text-[10rem] font-light leading-[0.85] tracking-[-0.05em] text-ivory/[0.03] md:text-[16rem]">
        404
    </span>

      {/* Gold rule */}
      <div className="mt-6 h-px w-12 bg-gold/25" />

      <h1 className="mt-10 font-display text-[clamp(2rem,5vw,3.5rem)] leading-[0.92] tracking-[-0.04em] text-ivory">
        {t("page_not_found")}
    </h1>

      <p className="mt-4 max-w-md text-[0.85rem] leading-[1.95] text-ivory/25">
        {t("page_not_found_desc")}
    </p>

      <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
        <Link href="/" className="btn-primary">
          {t("back_to_home")}
      </Link>
        <Link href="/shop" className="btn-link">
          {t("browse_shop")}
      </Link>
     </div>

      {/* Bottom signature */}
      <div className="mt-16 flex items-center gap-3">
        <span className="h-px w-10 bg-ivory/[0.04]" />
        <span className="label-utility tracking-[0.5em] text-ivory/12">
          MONADATY · MMXXIV
      </span>
    </div>
   </div>
  );
}
