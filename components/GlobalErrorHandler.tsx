"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useTranslation } from "@/hooks/useTranslation";

export function GlobalErrorHandler() {
  const { t } = useTranslation("errors");
  useEffect(() => {
    function handleError(event: ErrorEvent) {
      const msg = event.message || t("unexpected_error", "An unexpected error occurred");
      if (msg.includes("ChunkLoadError") || msg.includes("Loading chunk")) {
        toast.error(t("connection_issue", "Connection issue detected. Please refresh the page."), {
          action: {
            label: t("refresh", "Refresh"),
            onClick: () => window.location.reload(),
          },
          duration: 10000,
        });
      }
    }

    function handleRejection(event: PromiseRejectionEvent) {
      const reason = event.reason;
      if (reason?.name === "TypeError" && String(reason?.message)?.includes("fetch")) {
        toast.warning(t("network_error", "Network error. Please check your connection."), {
          duration: 8000,
        });
      }
    }

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, [t]);

  return null;
}
