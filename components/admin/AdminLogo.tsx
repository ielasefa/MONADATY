"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { BrandLogo } from "@/components/BrandLogo";

const DEFAULT_ARIA_LABEL = "MONADATY — back to store";

/**
 * The same gold MONADATY mark and wordmark used by the storefront.
 */
export function AdminLogo({ size = "md" }: { size?: "sm" | "md" | "lg"; logoUrl?: string }) {
  const router = useRouter();
  const { t, lang, translations } = useTranslation("common");
  const [ariaLabel, setAriaLabel] = useState(DEFAULT_ARIA_LABEL);

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
      <BrandLogo width={280} height={94} className={`market-admin-logo-image market-admin-logo-image-${size}`} />
    </button>
  );
}

export function AdminLogoMark({ className }: { className?: string }) {
  return <BrandLogo width={144} height={48} className={className} />;
}
