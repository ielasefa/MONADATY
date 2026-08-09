"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  once?: boolean;
  margin?: string;
};

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

export function Reveal({
  children,
  className,
  delay = 0,
  duration = 0.6,
  y = 24,
  once = true,
  margin = "-60px",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: margin as `${number}px` });
  const shouldReduceMotion = useReducedMotion();
  const hidden = shouldReduceMotion
    ? { opacity: 0 }
    : { opacity: 0, y, scale: 0.985 };
  const visible = shouldReduceMotion
    ? { opacity: 1 }
    : { opacity: 1, y: 0, scale: 1 };

  return (
    <motion.div
      ref={ref}
      initial={hidden}
      animate={inView ? visible : hidden}
      transition={{ duration, delay, ease: EASE_PREMIUM }}
      className={className}
    >
      {children}
  </motion.div>
  );
}

export default Reveal;
