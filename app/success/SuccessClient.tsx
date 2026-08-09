"use client";

import { motion, useReducedMotion } from "framer-motion";

export function SuccessClient() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-gold/25 bg-gold/[0.08] text-gold"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-9 w-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <motion.path
          d="m7.5 12.5 3 3 6-7"
          initial={shouldReduceMotion ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: shouldReduceMotion ? 0 : 0.18, duration: 0.5, ease: "easeOut" }}
        />
      </svg>
    </motion.div>
  );
}
