"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

export default function RootError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useTranslation("errors");
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-black px-6 text-center">
      {/* Editorial icon */}
      <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center border border-ivory/[0.04]">
        <svg aria-hidden="true" className="h-9 w-9 text-ivory/22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
     </svg>
   </div>

      {/* Eyebrow */}
      <span className="label-utility tracking-[0.55em] text-burgundy/50">
        {t("error")}
   </span>

      {/* Title */}
      <h1 className="mt-4 font-display text-[clamp(2rem,5vw,3.5rem)] leading-[0.92] tracking-[-0.04em] text-ivory">
        {t("something_went_wrong")}
     </h1>

      {/* Gold rule */}
      <div className="mx-auto my-8 h-px w-12 bg-burgundy/22" />

      <p className="max-w-md text-[0.85rem] leading-[1.95] text-ivory/25">
        {t("unexpected_error")}
     </p>

      {/* CTAs */}
      <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
        <button onClick={reset} className="btn-primary">
          {t("try_again")}
       </button>
        <Link href="/" className="btn-secondary">
          {t("go_home")}
       </Link>
     </div>
   </div>
  );
}
