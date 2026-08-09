"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type StaggerContainerProps = {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  initialDelay?: number;
};

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.06,
  initialDelay = 0,
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 1 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: initialDelay,
          },
        },
      }}
      className={className}
    >
      {children}
 </motion.div>
  );
}

type StaggerItemProps = {
  children: ReactNode;
  className?: string;
  y?: number;
};

export function StaggerItem({ children, className, y = 16 }: StaggerItemProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={{
        hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y, scale: 0.985 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.5, ease: EASE_PREMIUM },
        },
      }}
      className={className}
    >
      {children}
 </motion.div>
  );
}

export default StaggerContainer;
