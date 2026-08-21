"use client";

import { usePathname } from "next/navigation";
import { NotificationBell } from "@/components/admin/NotificationBell";
import type { AdminNotificationType } from "@/lib/admin-notifications";
import { useTranslation } from "@/hooks/useTranslation";

type Props = {
  initialNotifications: AdminNotificationType[];
  initialUnread: number;
};

const PAGE_CONTEXT = [
  { match: /^\/admin\/products\/add$/, group: "Catalog", title: "Add product", description: "Create a new catalog item." },
  { match: /^\/admin\/products\/[^/]+\/edit$/, group: "Catalog", title: "Edit product", description: "Update product details, pricing, stock, and media." },
  { match: /^\/admin\/products/, group: "Catalog", title: "Products", description: "Manage products, stock, pricing, and availability." },
  { match: /^\/admin\/shop/, group: "Catalog", title: "Products", description: "Manage the product catalog." },
  { match: /^\/admin\/categories/, group: "Catalog", title: "Categories", description: "Organize the product catalog." },
  { match: /^\/admin\/collections-showcase/, group: "Catalog", title: "Collection showcase", description: "Curate featured products for storefront collections." },
  { match: /^\/admin\/collections/, group: "Catalog", title: "Collections", description: "Manage collection content and presentation." },
  { match: /^\/admin\/orders\//, group: "Sales", title: "Order details", description: "Review fulfillment, payment, and delivery information." },
  { match: /^\/admin\/orders/, group: "Sales", title: "Orders", description: "Track order and payment activity." },
  { match: /^\/admin\/customers/, group: "Sales", title: "Customers", description: "Review customer activity and lifetime value." },
  { match: /^\/admin\/invoices/, group: "Sales", title: "Invoices", description: "Manage generated sales invoices." },
  { match: /^\/admin\/landing/, group: "Content", title: "Landing page", description: "Edit and publish storefront content." },
  { match: /^\/admin\/translations/, group: "Content", title: "Translations", description: "Manage localized interface content." },
  { match: /^\/admin\/settings/, group: "System", title: "Settings", description: "Configure store identity and contact details." },
  { match: /^\/admin\/admins/, group: "System", title: "Administrators", description: "Manage administrative access." },
  { match: /^\/admin\/reports/, group: "Overview", title: "Reports", description: "Analyze store performance and operations." },
  { match: /^\/admin\/dashboard/, group: "Overview", title: "Dashboard", description: "Store performance and operational overview." },
] as const;

export function AdminTopbar({ initialNotifications, initialUnread }: Props) {
  const pathname = usePathname();
  const { t } = useTranslation("admin");
  const isDashboard = pathname === "/admin/dashboard";
  const context = PAGE_CONTEXT.find((item) => item.match.test(pathname)) ?? {
    group: "Admin",
    title: "Control center",
    description: "Manage MONADATY operations.",
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 min-w-0 items-center justify-between gap-3 border-b border-white/[0.08] bg-[#0B0B0A]/95 pe-4 ps-16 backdrop-blur-xl sm:px-5 lg:px-7">
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2 text-[0.6rem] font-medium uppercase tracking-[0.15em] text-white/35">
          <span className="hidden sm:inline">MONADATY</span>
          <span className="hidden text-white/20 sm:inline" aria-hidden>/</span>
          <span className="truncate text-[#D6B35A]/80">{t(`nav_group_${context.group.toLowerCase()}`, context.group)}</span>
        </div>
        {!isDashboard && (
          <div className="mt-0.5 flex min-w-0 items-baseline gap-3">
            <p className="truncate text-sm font-semibold text-white sm:text-[0.94rem]">{t(`topbar_${context.title.toLowerCase().replace(/\s+/g, "_")}`, context.title)}</p>
            <p className="hidden truncate text-xs text-white/35 xl:block">{t(`topbar_${context.title.toLowerCase().replace(/\s+/g, "_")}_description`, context.description)}</p>
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2.5">
        <NotificationBell initialNotifications={initialNotifications} initialUnread={initialUnread} />
        <div className="flex h-10 items-center gap-2.5 rounded-xl border border-white/[0.08] bg-[#151512] p-1 pe-1 sm:pe-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6E1F2A] text-[0.68rem] font-semibold text-white" aria-hidden>
            M
          </span>
          <div className="hidden min-w-0 sm:block">
            <p className="max-w-28 truncate text-[0.7rem] font-medium text-white">MONADATY</p>
            <p className="text-[0.56rem] uppercase tracking-[0.12em] text-white/35">{t("admin_role", "Admin")}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
