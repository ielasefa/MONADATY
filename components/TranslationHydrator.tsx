"use client";

import { useEffect } from "react";
import { setTranslations } from "@/hooks/useTranslation";

type Props = {
  initialLang?: "fr" | "en" | "ar";
  initialTranslations: Record<string, Record<string, string>>;
};

export function TranslationHydrator({ initialTranslations }: Props) {
  useEffect(() => {
    if (initialTranslations && Object.keys(initialTranslations).length > 0) {
      setTranslations("common", initialTranslations);
    }
  }, [initialTranslations]);

  return null;
}