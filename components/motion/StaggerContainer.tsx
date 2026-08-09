"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { PREMIUM_EASE } from "@/lib/motion";

type StaggerContainerProps = {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  initialDelay?: number;
};

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.06,
  initialDelay = 0,
}: StaggerContainerProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 1 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: shouldReduceMotion ? 0 : staggerDelay,
            delayChildren: shouldReduceMotion ? 0 : initialDelay,
          },
        },
      }}
      className={["motion-reveal", className].filter(Boolean).join(" ")}
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
        hidden: shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y, scale: 0.985 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: shouldReduceMotion ? 0 : 0.5, ease: PREMIUM_EASE },
        },
      }}
      className={["motion-reveal", className].filter(Boolean).join(" ")}
    >
      {children}
 </motion.div>
  );
}

export default StaggerContainer;
