"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

type Movement = {
  id: string;
  productId: string;
  warehouseName: string;
  movementType: string;
  quantity: number;
  createdAt: string;
};

type LowStockProduct = {
  id: string;
  name: string;
  stock: number;
  lowStockThreshold: number;
  image: string;
};

type Props = {
  totalProducts: number;
  totalWarehouses: number;
  totalSuppliers: number;
  outOfStockCount: number;
  lowStockCount: number;
  movementsToday: number;
  latestMovements: Movement[];
  lowStockProducts: LowStockProduct[];
};

function StatCard({
  label,
  value,
  href,
  accent,
}: {
  label: string;
  value: string | number;
  href: string;
  accent?: "gold" | "red" | "emerald";
}) {
  const accentMap = { gold: "text-gold", red: "text-burgundy", emerald: "text-gold" };
  return (
    <motion.div
      whileHover={{ y: -4, borderColor: "rgba(212,175,55,0.15)", transition: { duration: 0.25 } }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <Link
        href={href}
        className="luxury-card group block rounded-card border border-white/[0.06] bg-card p-6 transition-all duration-300 hover:border-gold/20"
      >
        <p className="luxury-label text-[10px] text-muted">{label}</p>
        <p className={`mt-2 font-display text-3xl font-semibold tracking-tight ${accent ? accentMap[accent] : "text-white"}`}>
          {value}
        </p>
      </Link>
    </motion.div>
  );
}

const typeColors: Record<string, string> = {
  IN: "badge-emerald",
  OUT: "badge-red",
  SALE: "bg-burgundy/10 text-burgundy border border-burgundy/20",
  RETURN: "badge-emerald",
  ADJUSTMENT: "badge-gold",
  TRANSFER: "bg-gold/30 text-gold border border-blue-500/20",
  PURCHASE: "badge-emerald",
  REFUND: "badge-gold",
  DAMAGED: "badge-red",
};

export function InventoryDashboardClient(props: Props) {
  const { t } = useTranslation("inventory");
  return (
    <div>
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white">{t("inventory_dashboard")}</h1>
          <p className="mt-1 text-sm text-muted">Overview of your inventory</p>
        </div>
      </div>

      <div className="mb-10">
        <p className="luxury-label mb-4 text-[10px] text-muted">Key Metrics</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Total Products" value={props.totalProducts} href="/admin/inventory" />
          <StatCard label="Warehouses" value={props.totalWarehouses} href="/admin/inventory/warehouses" accent="emerald" />
          <StatCard label={t("suppliers_count")} value={props.totalSuppliers} href="/admin/inventory/suppliers" accent="gold" />
          <StatCard label={t("out_of_stock_count")} value={props.outOfStockCount} href="/admin/inventory" accent="red" />
          <StatCard label="Low Stock" value={props.lowStockCount} href="/admin/inventory" accent="gold" />
          <StatCard label="Movements Today" value={props.movementsToday} href="/admin/inventory/audit" />
        </div>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <p className="luxury-label mb-4 text-[10px] text-muted">Latest Movements</p>
          <div className="glass rounded-card border border-white/[0.06] p-6">
            {props.latestMovements.length === 0 ? (
              <p className="text-sm text-muted">{t("no_movements")}</p>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {props.latestMovements.map((m) => (
                  <motion.div
                    key={m.id}
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0 -mx-6 px-6"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted">
                        {new Date(m.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.15em] ${typeColors[m.movementType] || "bg-white/10 text-white/60"}`}>
                        {m.movementType}
                      </span>
                    </div>
                    <div className="text-right text-sm">
                      <span className={m.quantity > 0 ? "text-gold" : "text-burgundy"}>
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                      </span>
                      <span className="ml-2 text-xs text-muted">{m.warehouseName}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            <Link
              href="/admin/inventory/audit"
              className="mt-4 inline-flex text-xs font-medium text-gold transition hover:text-gold/80"
            >
              t("view_all_movements", "View All Movements") &rarr;
            </Link>
          </div>
        </div>

        <div>
          <p className="luxury-label mb-4 text-[10px] text-muted">Low Stock Forecast</p>
          <div className="glass rounded-card border border-white/[0.06] p-6">
            {props.lowStockProducts.length === 0 ? (
              <p className="text-sm text-muted">{t("no_low_stock")}</p>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {props.lowStockProducts.map((p) => (
                  <motion.div
                    key={p.id}
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <span className="text-sm font-medium text-white">{p.name}</span>
                    <span className="badge-red rounded-full bg-burgundy/10 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-burgundy">
                      {p.stock} left
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-10">
        <p className="luxury-label mb-4 text-[10px] text-muted">Quick Actions</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Link
            href="/admin/inventory/warehouses"
            className="luxury-card rounded-card border border-white/[0.06] bg-card p-5 text-center transition hover:border-gold/20"
          >
            <p className="text-sm font-medium text-white">Warehouses</p>
            <p className="mt-1 text-xs text-muted">Manage locations</p>
          </Link>
          <Link
            href="/admin/inventory/suppliers"
            className="luxury-card rounded-card border border-white/[0.06] bg-card p-5 text-center transition hover:border-gold/20"
          >
            <p className="text-sm font-medium text-white">Suppliers</p>
            <p className="mt-1 text-xs text-muted">Manage vendors</p>
          </Link>
          <Link
            href="/admin/inventory/purchase-orders"
            className="luxury-card rounded-card border border-white/[0.06] bg-card p-5 text-center transition hover:border-gold/20"
          >
            <p className="text-sm font-medium text-white">{t("purchase_orders")}</p>
            <p className="mt-1 text-xs text-muted">{t("manage_pos")}</p>
          </Link>
          <Link
            href="/admin/inventory/transfers"
            className="luxury-card rounded-card border border-white/[0.06] bg-card p-5 text-center transition hover:border-gold/20"
          >
            <p className="text-sm font-medium text-white">{t("stock_transfers")}</p>
            <p className="mt-1 text-xs text-muted">{t("move_stock")}</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
