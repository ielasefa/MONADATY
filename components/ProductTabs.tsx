"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

type ProductTabsProps = {
  description?: string;
  ingredients?: string;
  nutrition?: string;
};

const EASE = [0.22, 1, 0.36, 1] as const;

type TabId = "description" | "ingredients" | "nutrition";

export function ProductTabs({ description, ingredients, nutrition }: ProductTabsProps) {
  const { t } = useTranslation("products");

  const sections = (
    [
      { id: "description", label: t("description"), content: description ?? "" },
      { id: "ingredients", label: t("ingredients"), content: ingredients ?? "" },
      { id: "nutrition", label: t("nutrition"), content: nutrition ?? "" },
    ] as Array<{ id: TabId; label: string; content: string }>
  ).filter((section) => section.content.trim().length > 0);

  const [activeId, setActiveId] = useState<TabId>(sections[0]?.id ?? "description");

  if (sections.length === 0) {
    return null;
  }

  if (sections.length === 1) {
    return (
      <div>
        <p className="max-w-3xl whitespace-pre-line text-[0.95rem] leading-[1.9] text-white/55">
          {sections[0].content}
        </p>
      </div>
    );
  }

  const activeSection = sections.find((section) => section.id === activeId) ?? sections[0];

  return (
    <div>
      {/* Tab bar — refined, generous rhythm */}
      <div
        role="tablist"
        aria-label="Product details"
        className="flex gap-10 overflow-x-auto border-b border-white/[0.08] md:gap-14"
      >
        {sections.map((section) => {
          const isActive = section.id === activeId;
          return (
            <button
              key={section.id}
              role="tab"
              id={`tab-${section.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${section.id}`}
              onClick={() => setActiveId(section.id)}
              className={`relative -mb-px shrink-0 py-5 text-[0.72rem] font-medium uppercase tracking-[0.24em] transition-colors duration-300 focus-visible:outline-none md:py-6 ${
                isActive ? "text-white" : "text-white/35 hover:text-white/70"
              }`}
            >
              {section.label}
              {isActive && (
                <motion.span
                  layoutId="product-tab-underline"
                  className="absolute inset-x-0 -bottom-px h-[2px] bg-gold"
                  transition={{ duration: 0.3, ease: EASE }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Active panel */}
      <div className="pt-10 md:pt-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeId}
            role="tabpanel"
            id={`panel-${activeId}`}
            aria-labelledby={`tab-${activeId}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <p className="max-w-3xl whitespace-pre-line text-[0.95rem] leading-[1.9] text-white/55">
              {activeSection.content}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
