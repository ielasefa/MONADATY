"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function GlobalErrorHandler() {
  useEffect(() => {
    function handleError(event: ErrorEvent) {
      const msg = event.message || "An unexpected error occurred";
      if (msg.includes("ChunkLoadError") || msg.includes("Loading chunk")) {
        toast.error("Connection issue detected. Please refresh the page.", {
          action: {
            label: "Refresh",
            onClick: () => window.location.reload(),
          },
          duration: 10000,
        });
      }
    }

    function handleRejection(event: PromiseRejectionEvent) {
      const reason = event.reason;
      if (reason?.name === "TypeError" && String(reason?.message)?.includes("fetch")) {
        toast.warning("Network error. Please check your connection.", {
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
  }, []);

  return null;
}
