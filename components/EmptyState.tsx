"use client";

import { type ReactNode } from "react";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex min-h-[22rem] flex-col items-center justify-center px-6 text-center", className)}>
      <div className="flex flex-col items-center max-w-sm">
        {icon && (
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-md border border-ivory/[0.05] bg-black-surface text-2xl text-ivory/8">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold tracking-tight text-ivory">{title}</h3>
        <p className="mt-2 text-[0.72rem] leading-relaxed text-ivory/25">{description}</p>
        {action && <div className="mt-6">{action}</div>}
      </div>
    </div>
  );
}
