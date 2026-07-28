"use client";

import { useTranslation } from "@/hooks/useTranslation";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useTranslation("errors");
return (
<html lang="en">
<body className="m-0 flex min-h-screen items-center justify-center bg-black p-8 text-ivory antialiased">
  <div className="mx-auto max-w-md text-center">
    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-burgundy/18 bg-burgundy/8">
    <svg
      className="h-7 w-7 text-burgundy/70"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
    </div>
  <h2 className="mb-2 text-xl font-semibold">{t("critical_error")}</h2>
  <p className="mx-auto mb-8 max-w-sm text-sm text-ivory/35">{t("critical_error_desc")}</p>
  <div className="flex flex-wrap items-center justify-center gap-4">
  <button
    onClick={reset}
    className="h-12 rounded-btn bg-burgundy px-8 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ivory transition-all duration-300 hover:bg-burgundy-hover active:scale-[0.97]"
  >
    {t("try_again")}
  </button>
  <button
    onClick={() => (window.location.href = "/")}
    className="h-12 rounded-btn border border-gold/30 bg-transparent px-8 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-gold transition-all duration-300 hover:bg-gold/[0.06] active:scale-[0.97]"
  >
    {t("go_home")}
  </button>
  </div>
  </div>
  </body>
</html>
  );
}
