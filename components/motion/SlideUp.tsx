"use client";

import { motion } from "framer-motion";
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
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: EASE_PREMIUM }}
      className={className}
    >
      {children}
   </motion.div>
  );
}

export default SlideUp;
