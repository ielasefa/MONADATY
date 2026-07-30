"use client";

import { useTranslation } from "@/hooks/useTranslation";

export default function AdminError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation("errors");
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-burgundy/10">
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 text-burgundy">
            <circle cx="12" cy="12" r="10" />
            <path d="M15 9l-6 6M9 9l6 6" />
          </svg>
        </div>
        <h1 className="mb-2 font-display text-2xl font-semibold text-white">{t("something_went_wrong")}</h1>
        <p className="mb-6 text-sm text-muted">
          {t("unexpected_error")}
        </p>
        <button
          onClick={reset}
          className="inline-flex h-12 items-center justify-center rounded-button bg-burgundy px-6 text-sm font-medium text-white transition hover:bg-burgundy/90"
        >
          {t("try_again")}
        </button>
      </div>
    </div>
  );
}
