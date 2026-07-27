"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

type Supplier = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  active: boolean;
};

export function SuppliersClient({ suppliers: initial }: { suppliers: Supplier[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [suppliers, setSuppliers] = useState(initial);

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.company.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = async (id: string, current: boolean) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !current } : s))
    );
    await fetch(`/api/admin/inventory/suppliers/${id}/toggle`, { method: "POST" });
    router.refresh();
  };

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="luxury-label mb-2">Inventory</p>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Suppliers</h1>
          <p className="mt-1 text-sm text-muted">{suppliers.length} suppliers</p>
        </div>
        <Link
          href="/admin/inventory/suppliers/new"
          className="btn-primary inline-flex h-12 items-center rounded-button px-5 text-xs font-semibold uppercase tracking-[0.1em]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mr-2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Supplier
        </Link>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search suppliers..."
          className="input-premium w-full max-w-md"
        />
      </div>

      <div className="glass overflow-hidden rounded-card border border-white/[0.06]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-xs uppercase tracking-[0.1em] text-muted">
                <th className="px-5 py-4 font-medium">Name</th>
                <th className="px-5 py-4 font-medium">Company</th>
                <th className="px-5 py-4 font-medium">Email</th>
                <th className="px-5 py-4 font-medium">Phone</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filtered.map((s, i) => (
                <motion.tr
                  key={s.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="transition hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-4 font-medium text-white">{s.name}</td>
                  <td className="px-5 py-4 text-muted">{s.company || "\u2014"}</td>
                  <td className="px-5 py-4 text-muted">{s.email || "\u2014"}</td>
                  <td className="px-5 py-4 text-muted">{s.phone || "\u2014"}</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => toggleStatus(s.id, s.active)}
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.15em] transition-all ${
                        s.active
                          ? "badge-emerald bg-emerald/10 text-emerald border border-emerald/20"
                          : "badge-red bg-red/10 text-red border border-red/20"
                      }`}
                    >
                      {s.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/inventory/suppliers/${s.id}`}
                      className="rounded-button px-3 py-1.5 text-sm font-medium text-gold transition hover:bg-gold/10"
                    >
                      Edit
                    </Link>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted">
                    No suppliers found.
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
