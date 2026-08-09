"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { PREMIUM_EASE } from "@/lib/motion";

type SlideUpProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
};

export function SlideUp({
  children,
  className,
  delay = 0,
  duration = 0.7,
  y = 32,
}: SlideUpProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : duration, delay: shouldReduceMotion ? 0 : delay, ease: PREMIUM_EASE }}
      className={["motion-reveal", className].filter(Boolean).join(" ")}
    >
      {children}
   </motion.div>
  );
}

export default SlideUp;
