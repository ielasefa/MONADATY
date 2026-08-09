"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { PREMIUM_EASE } from "@/lib/motion";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  once?: boolean;
  margin?: string;
};

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
  const hidden = { opacity: 0, y, scale: 0.985 };
  const visible = { opacity: 1, y: 0, scale: 1 };

  return (
    <motion.div
      ref={ref}
      initial={shouldReduceMotion ? false : hidden}
      animate={shouldReduceMotion || inView ? visible : hidden}
      transition={{ duration: shouldReduceMotion ? 0 : duration, delay: shouldReduceMotion ? 0 : delay, ease: PREMIUM_EASE }}
      className={["motion-reveal", className].filter(Boolean).join(" ")}
    >
      {children}
  </motion.div>
  );
}

export default Reveal;
