"use client";

import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";

type DepthTiltProps = {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  maxRotateX?: number;
  maxRotateY?: number;
  hoverScale?: number;
  perspective?: number;
};

const SPRING = { stiffness: 145, damping: 22, mass: 0.72 };

/**
 * A pointer-only, spring-damped perspective surface. Touch and reduced-motion
 * users always receive a stable, neutral composition.
 */
export function DepthTilt({
  children,
  className = "",
  innerClassName = "",
  maxRotateX = 3,
  maxRotateY = 5,
  hoverScale = 1.012,
  perspective = 1200,
}: DepthTiltProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const finePointerRef = useRef(false);
  const shouldReduceMotion = useReducedMotion();
  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const rawScale = useMotionValue(1);
  const rotateX = useSpring(rawRotateX, SPRING);
  const rotateY = useSpring(rawRotateY, SPRING);
  const scale = useSpring(rawScale, SPRING);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => {
      finePointerRef.current = media.matches;
      if (!media.matches) {
        rawRotateX.set(0);
        rawRotateY.set(0);
        rawScale.set(1);
      }
    };

    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [rawRotateX, rawRotateY, rawScale]);

  useEffect(() => {
    if (!shouldReduceMotion) return;
    rawRotateX.set(0);
    rawRotateY.set(0);
    rawScale.set(1);
  }, [rawRotateX, rawRotateY, rawScale, shouldReduceMotion]);

  const canTilt = (event: PointerEvent<HTMLDivElement>) =>
    !shouldReduceMotion && finePointerRef.current && event.pointerType === "mouse";

  const reset = () => {
    rawRotateX.set(0);
    rawRotateY.set(0);
    rawScale.set(1);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!canTilt(event) || !surfaceRef.current) return;
    const bounds = surfaceRef.current.getBoundingClientRect();
    const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
    const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;

    rawRotateX.set(vertical * -2 * maxRotateX);
    rawRotateY.set(horizontal * 2 * maxRotateY);
  };

  return (
    <div className={className} style={{ perspective }}>
      <motion.div
        ref={surfaceRef}
        data-depth-tilt="pointer"
        className={`h-full w-full transform-gpu ${innerClassName}`}
        style={{
          rotateX,
          rotateY,
          scale,
          transformPerspective: perspective,
          transformStyle: "preserve-3d",
        }}
        onPointerEnter={(event) => {
          if (canTilt(event)) rawScale.set(hoverScale);
        }}
        onPointerMove={handlePointerMove}
        onPointerLeave={reset}
        onPointerCancel={reset}
      >
        {children}
      </motion.div>
    </div>
  );
}
