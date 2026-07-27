"use client";

import { type ReactNode, useRef, useEffect, useState } from "react";

type AnimProps = { children: ReactNode; className?: string; delay?: number };

function useInView(ref: React.RefObject<HTMLElement | null>, threshold = 0.12) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return inView;
}

function offset(dir: "up" | "down" | "left" | "right") {
  const d = 32;
  switch (dir) {
    case "up": return `translateY(${d}px)`;
    case "down": return `translateY(-${d}px)`;
    case "left": return `translateX(${d}px)`;
    case "right": return `translateX(-${d}px)`;
  }
}

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

export function FadeIn({ children, className, delay, direction = "up" }: AnimProps & { direction?: "up" | "down" | "left" | "right" }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const d = delay || 0;
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : offset(direction),
        transition: `opacity 0.9s ${EASE} ${d}s, transform 0.9s ${EASE} ${d}s`,
        willChange: inView ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

export function FadeInView({ children, className, delay }: AnimProps) {
  return <FadeIn className={className} delay={delay}>{children}</FadeIn>;
}

export function ScaleIn({ children, className, delay }: AnimProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const d = delay || 0;
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "scale(0.95)",
        transition: `opacity 0.8s ${EASE} ${d}s, transform 0.8s ${EASE} ${d}s`,
        willChange: inView ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

export function PageTransition({ children, className }: AnimProps) {
  return <FadeIn className={className}>{children}</FadeIn>;
}
