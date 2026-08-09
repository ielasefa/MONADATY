"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type SlideUpProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
};

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

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
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y, scale: 0.985 }}
      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration, delay, ease: EASE_PREMIUM }}
      className={className}
    >
      {children}
   </motion.div>
  );
}

export default SlideUp;
