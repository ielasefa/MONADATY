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
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-md border border-line bg-card text-2xl text-secondary">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-secondary">{description}</p>
        {action && <div className="mt-6">{action}</div>}
      </div>
    </div>
  );
}
