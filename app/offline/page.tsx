"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

export default function OfflinePage() {
  const { t } = useTranslation("errors");
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-black px-6 text-center">
      {/* Editorial icon */}
      <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center border border-ivory/[0.04]">
        <svg aria-hidden="true" className="h-9 w-9 text-ivory/22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39M10.71 5.05A16 16 0 0122.56 9M1.42 9a15.91 15.91 0 014.7-2.88M8.53 16.11a6 6 0 016.95 0M12 20h.01" />
    </svg>
  </div>

      <span className="label-utility tracking-[0.55em] text-ivory/18">
        OFFLINE
    </span>

      <h1 className="mt-4 font-display text-[clamp(2rem,5vw,3.5rem)] leading-[0.92] tracking-[-0.04em] text-ivory">
        {t("no_connection")}
     </h1>

      <div className="mx-auto my-8 h-px w-12 bg-gold/25" />

      <p className="max-w-md text-[0.85rem] leading-[1.95] text-ivory/25">
        {t("check_connection")}
     </p>

      <Link href="/" className="btn-primary mt-12">
        {t("go_home")}
     </Link>
   </div>
  );
}
