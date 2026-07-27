"use client";

import { cn } from "@/lib/utils";

type SkeletonProps = {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "full" | "card" | "none";
  ariaLabel?: string;
};

const radiusMap = {
  sm: "rounded-md",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
  card: "rounded-card",
  none: "",
};

export function Skeleton({ className, rounded = "md", ariaLabel }: SkeletonProps) {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      aria-label={ariaLabel}
      className={cn("skeleton", radiusMap[rounded], className)}
    />
  );
}
