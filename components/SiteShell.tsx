"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { StorefrontRouteTransition } from "@/components/StorefrontRouteTransition";

type SiteShellProps = {
  children: ReactNode;
  footer: ReactNode;
  navbar: ReactNode;
};

export function SiteShell({ children, footer, navbar }: SiteShellProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && navbar}
      <main id="main-content" role="main" className={isAdmin ? undefined : "storefront-shell"}>
        {isAdmin ? children : <StorefrontRouteTransition>{children}</StorefrontRouteTransition>}
      </main>
      {!isAdmin && footer}
    </>
  );
}
