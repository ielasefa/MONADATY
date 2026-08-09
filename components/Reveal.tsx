"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { PREMIUM_EASE } from "@/lib/motion";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  duration?: number;
};

export function Reveal({
  children,
  className = "",
  delay = 0,
  y = 20,
  duration = 0.65,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const shouldReduceMotion = useReducedMotion();
  const hidden = { opacity: 0, y, scale: 0.97 };
  const visible = { opacity: 1, y: 0, scale: 1 };

  return (
    <div ref={ref} className={className}>
      <motion.div
        className="motion-reveal h-full"
        initial={shouldReduceMotion ? false : hidden}
        animate={shouldReduceMotion || isInView ? visible : hidden}
        transition={{
          duration: shouldReduceMotion ? 0 : duration,
          delay: shouldReduceMotion ? 0 : delay,
          ease: PREMIUM_EASE,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
