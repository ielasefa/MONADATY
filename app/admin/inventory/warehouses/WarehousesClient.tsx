"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

type Warehouse = {
  id: string;
  code: string;
  name: string;
  city: string;
  manager: string;
  isActive: boolean;
};

export function WarehousesClient({ warehouses: initial }: { warehouses: Warehouse[] }) {
  const router = useRouter();
  const { t } = useTranslation("inventory");
  const [search, setSearch] = useState("");
  const [warehouses, setWarehouses] = useState(initial);

  const filtered = warehouses.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.code.toLowerCase().includes(search.toLowerCase()) ||
      w.city.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = async (id: string, current: boolean) => {
    setWarehouses((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isActive: !current } : w))
    );
    await fetch(`/api/admin/inventory/warehouses/${id}/toggle`, { method: "POST" });
    router.refresh();
  };

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="luxury-label mb-2">{t("inventory", "Inventory")}</p>
          <h1 className="text-3xl font-semibold tracking-tight text-white">{t("warehouses", "Warehouses")}</h1>
          <p className="mt-1 text-sm text-muted">{warehouses.length} {t("warehouses_count", "warehouses")}</p>
        </div>
        <Link
          href="/admin/inventory/warehouses/new"
          className="btn-primary inline-flex h-12 items-center rounded-button px-5 text-xs font-semibold uppercase tracking-[0.1em]"
        >
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mr-2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          {t("add_warehouse", "Add Warehouse")}
        </Link>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search warehouses..."
          className="input-premium w-full max-w-md"
        />
      </div>

      <div className="glass overflow-hidden rounded-card border border-white/[0.06]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-xs uppercase tracking-[0.1em] text-muted">
                <th className="px-5 py-4 font-medium">Code</th>
                <th className="px-5 py-4 font-medium">Name</th>
                <th className="px-5 py-4 font-medium">City</th>
                <th className="px-5 py-4 font-medium">Manager</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filtered.map((w, i) => (
                <motion.tr
                  key={w.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="transition hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-4 font-mono text-xs font-medium text-gold">{w.code}</td>
                  <td className="px-5 py-4 font-medium text-white">{w.name}</td>
                  <td className="px-5 py-4 text-muted">{w.city}</td>
                  <td className="px-5 py-4 text-muted">{w.manager || "\u2014"}</td>
                  <td className="px-5 py-4">
                    <button
                      aria-label={`${w.isActive ? "Deactivate" : "Activate"} ${w.name}`}
                      onClick={() => toggleStatus(w.id, w.isActive)}
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.15em] transition-all ${
                        w.isActive
                          ? "badge-emerald bg-gold/10 text-gold border border-emerald/20"
                          : "badge-red bg-burgundy/10 text-burgundy border border-burgundy/20"
                      }`}
                    >
                      {w.isActive ? t("active", "Active") : t("inactive", "Inactive")}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/inventory/warehouses/${w.id}`}
                      className="rounded-button px-3 py-1.5 text-sm font-medium text-gold transition hover:bg-gold/10"
                    >
                      {t("edit")}
                    </Link>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted">
                    No warehouses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
