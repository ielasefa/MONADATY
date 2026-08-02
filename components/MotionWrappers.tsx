"use client";

import { type ReactNode, useRef, useEffect, useState } from "react";

type AnimProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

const EASE = [0.22, 1, 0.36, 1] as const;

function useInView(
  ref: React.RefObject<HTMLElement | null>,
  threshold = 0.12,
) {
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
      { threshold, rootMargin: "0px 0px -60px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return inView;
}

const OFFSET = 24;

function offset(dir: "up" | "down" | "left" | "right") {
  switch (dir) {
    case "up":
      return `translateY(${OFFSET}px)`;
    case "down":
      return `translateY(-${OFFSET}px)`;
    case "left":
      return `translateX(${OFFSET}px)`;
    case "right":
      return `translateX(-${OFFSET}px)`;
  }
}

export function FadeIn({
  children,
  className,
  delay = 0,
  direction = "up",
}: AnimProps & { direction?: "up" | "down" | "left" | "right" }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);

    const easeStr = "cubic-bezier(0.22, 1, 0.36, 1)";
    return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : offset(direction),
        transition: `opacity 0.7s ${easeStr} ${delay}s, transform 0.7s ${easeStr} ${delay}s`,
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

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "scale(0.96)",
        transition: `opacity 0.6s ${EASE}, transform 0.6s ${EASE}`,
        willChange: inView ? "auto" : "opacity, transform",
        transitionDelay: `${delay || 0}s`,
      }}
    >
      {children}
    </div>
  );
}

export function PageTransition({ children, className }: AnimProps) {
  return <FadeIn className={className}>{children}</FadeIn>;
}
