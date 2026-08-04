"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type ScaleInProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  initialScale?: number;
};

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

export function ScaleIn({
  children,
  className,
  delay = 0,
  duration = 0.5,
  initialScale = 0.96,
}: ScaleInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: initialScale }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration, delay, ease: EASE_PREMIUM }}
      className={className}
    >
      {children}
  </motion.div>
  );
}

export default ScaleIn;
