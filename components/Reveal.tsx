"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

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
  y = 24,
  duration = 0.6,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className={className}>
      <motion.div
        initial={{ opacity: 0, y }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
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