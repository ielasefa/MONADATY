"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type FadeInProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  x?: number;
};

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.6,
  y = 16,
  x = 0,
}: FadeInProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y, x, scale: 0.985 }}
      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, x: 0, scale: 1 }}
      transition={{ duration, delay, ease: EASE_PREMIUM }}
      className={className}
    >
      {children}
   </motion.div>
  );
}

export default FadeIn;
