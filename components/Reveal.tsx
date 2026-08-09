"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

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
  const hidden = shouldReduceMotion
    ? { opacity: 0 }
    : { opacity: 0, y, scale: 0.985 };
  const visible = shouldReduceMotion
    ? { opacity: 1 }
    : { opacity: 1, y: 0, scale: 1 };

  return (
    <div ref={ref} className={className}>
      <motion.div
        className="h-full"
        initial={hidden}
        animate={isInView ? visible : hidden}
        transition={{
          duration,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
