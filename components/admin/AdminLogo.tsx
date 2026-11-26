"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";

const DEFAULT_ARIA_LABEL = "MONADATY — back to store";

/**
 * The same gold MONADATY mark and wordmark used by the storefront.
 */
export function AdminLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const router = useRouter();
  const { t, lang, translations } = useTranslation("common");
  const [ariaLabel, setAriaLabel] = useState(DEFAULT_ARIA_LABEL);
  const gradientId = `admin-wordmark-metal-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    setAriaLabel(t("monadaty_logo_aria", DEFAULT_ARIA_LABEL));
  }, [lang, t, translations]);

  return (
    <button
      type="button"
      onClick={() => router.push("/")}
      aria-label={ariaLabel}
      className={`market-admin-logo market-admin-logo-${size} group outline-none`}
    >
      <svg className="market-admin-logo-mark" viewBox="0 0 56 25" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="56" y2="25" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8C6228" />
            <stop offset=".5" stopColor="#E8CD91" />
            <stop offset="1" stopColor="#8C6228" />
          </linearGradient>
        </defs>
        <path d="M2 22C11 22 12 4 20 4s8 16 14 16S39 4 46 4s7 16 10 18" stroke={`url(#${gradientId})`} strokeWidth="6" />
      </svg>
      <span className="market-admin-logo-name">MONADATY</span>
      <small className="market-admin-logo-subtitle">ELASRI BUSINESS</small>
    </button>
  );
}
