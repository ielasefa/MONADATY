"use client";

import { usePathname } from "next/navigation";
import { NotificationBell } from "@/components/admin/NotificationBell";
import { BrandLogo } from "@/components/BrandLogo";
import type { AdminNotificationType } from "@/lib/admin-notifications";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import Link from "next/link";

type Props = {
  initialNotifications: AdminNotificationType[];
  initialUnread: number;
  logoUrl?: string;
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
  { match: /^\/admin\/inventory/, group: "Operations", title: "Inventory", description: "Manage stock, suppliers and warehouses." },
  { match: /^\/admin\/security/, group: "System", title: "Security", description: "Manage access and account security." },
  { match: /^\/admin\/automation/, group: "System", title: "Automation", description: "Manage scheduled operations." },
  { match: /^\/admin\/blog/, group: "Content", title: "Blog", description: "Manage your store articles." },
  { match: /^\/admin\/reports/, group: "Overview", title: "Reports", description: "Analyze store performance and operations." },
  { match: /^\/admin\/dashboard/, group: "Overview", title: "Dashboard", description: "Store performance and operational overview." },
] as const;

export function AdminTopbar({ initialNotifications, initialUnread }: Props) {
  const pathname = usePathname();
  const { t } = useTranslation("admin");
  const context = PAGE_CONTEXT.find((item) => item.match.test(pathname)) ?? {
    group: "Admin",
    title: "Control center",
    description: "Manage MONADATY operations.",
  };

  return (
    <header className="admin-topbar">
      <div className="min-w-0">
        <div className="admin-topbar-caption hidden min-w-0 items-center gap-2 sm:flex">
          <span className="hidden sm:inline">MONADATY</span>
          <span className="hidden text-secondary sm:inline" aria-hidden>/</span>
          <span className="truncate">{t(`nav_group_${context.group.toLowerCase()}`, context.group)}</span>
        </div>
          <div className="flex min-w-0 items-baseline gap-3 sm:mt-0.5">
            <p className="admin-topbar-title">{t(`topbar_${context.title.toLowerCase().replace(/\s+/g, "_")}`, context.title)}</p>
            <p className="hidden truncate text-sm text-secondary 2xl:block">{t(`topbar_${context.title.toLowerCase().replace(/\s+/g, "_")}_description`, context.description)}</p>
          </div>
      </div>

      <div className="admin-topbar-actions">
        <LanguageSwitcher />
        <NotificationBell initialNotifications={initialNotifications} initialUnread={initialUnread} />
        <div className="hidden h-11 items-center gap-2.5 border-s border-line ps-3 lg:flex">
          <Link href="/" className="admin-topbar-logo admin-topbar-current-logo-link" aria-label={t("back_to_storefront", "Back to storefront")}>
            <BrandLogo width={150} height={50} className="admin-topbar-current-logo" />
          </Link>
          <div className="hidden min-w-0 sm:block">
            <p className="text-xs text-secondary">{t("admin_role", "Admin")}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
