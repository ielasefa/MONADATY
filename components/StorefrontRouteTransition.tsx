"use client";

import type { ReactNode } from "react";
import { MotionConfig, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { PREMIUM_EASE } from "@/lib/motion";

export function StorefrontRouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  return (
    <MotionConfig transition={{ ease: PREMIUM_EASE }}>
      <motion.div
        key={pathname}
        initial={shouldReduceMotion ? false : { opacity: 0.96, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.32, ease: PREMIUM_EASE }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
