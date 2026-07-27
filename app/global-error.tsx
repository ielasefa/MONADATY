"use client";

import { useTranslation } from "@/hooks/useTranslation";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useTranslation("errors");
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", background: "#050505", color: "#F2EEE6", fontFamily: "system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", WebkitFontSmoothing: "antialiased" }}>
        <div style={{ textAlign: "center", maxWidth: "28rem" }}>
          <div style={{ margin: "0 auto 1.5rem", width: "64px", height: "64px", borderRadius: "50%", border: "1px solid rgba(116,24,39,0.2)", background: "rgba(116,24,39,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg style={{ width: "28px", height: "28px", color: "#7A1F2B" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>{t("critical_error")}</h2>
          <p style={{ fontSize: "0.875rem", color: "rgba(242,238,229,0.4)", marginBottom: "2rem" }}>{t("critical_error_desc")}</p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <button onClick={reset} style={{ height: "3rem", padding: "0 2rem", background: "#7A1F2B", color: "#F2EEE6", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, border: "none", borderRadius: "3px", cursor: "pointer" }}>
              {t("try_again")}
            </button>
            <button onClick={() => (window.location.href = "/")} style={{ height: "3rem", padding: "0 2rem", background: "transparent", color: "#F2EEE6", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, border: "1px solid rgba(242,238,229,0.1)", borderRadius: "3px", cursor: "pointer" }}>
              {t("go_home")}
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
