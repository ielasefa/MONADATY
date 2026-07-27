"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import type { CustomerInfo } from "@/lib/customers";
import type { StoredOrder } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";

type SortField = "name" | "totalSpent" | "totalOrders" | "lastOrderDate";
type SortDir = "asc" | "desc";

export function CustomersClient({ customers: initial }: { customers: CustomerInfo[] }) {
  const { t } = useTranslation("admin");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CustomerInfo | null>(null);
  const [sortField, setSortField] = useState<SortField>("totalSpent");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);
  const pageSize = 20;
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let result = initial;
    if (q) {
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q),
      );
    }
    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else if (sortField === "totalSpent") cmp = a.totalSpent - b.totalSpent;
      else if (sortField === "totalOrders") cmp = a.totalOrders - b.totalOrders;
      else cmp = new Date(a.lastOrderDate).getTime() - new Date(b.lastOrderDate).getTime();
      return sortDir === "desc" ? -cmp : cmp;
    });
    return result;
  }, [initial, search, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

  async function openHistory(c: CustomerInfo) {
    setSelected(c);
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/list`);
      const data = await res.json();
      const allOrders: StoredOrder[] = data.orders || [];
      setOrders(allOrders.filter((o) => o.customerEmail.toLowerCase() === c.email.toLowerCase()));
    } catch {
      setOrders([]);
    }
    setLoading(false);
  }

  const totalRevenue = initial.reduce((s, c) => s + c.totalSpent, 0);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-white">{t("customers_count")}</h1>
          <p className="mt-1 text-sm text-muted">
            {initial.length}{t("customers_count")} &middot; {totalRevenue.toFixed(2)} {t("total_revenue")}
          </p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("search_customers")}
          className="input-premium h-12 w-60 rounded-input border border-white/[0.06] bg-surface px-4 text-sm text-white outline-none transition focus:border-gold/40 focus:ring-1 focus:ring-gold/20"
          aria-label={t("search_customers_aria")}
        />
      </div>

      {selected ? (
        <div>
          <button
            onClick={() => setSelected(null)}
            className="mb-4 text-sm text-gold hover:underline"
          >
            {t("back_to_customers")}
          </button>
          <div className="glass mb-6 rounded-card border border-white/[0.06] p-6">
            <h2 className="font-display text-lg font-semibold text-white">{selected.name}</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div>
                <p className="luxury-label text-[10px] text-muted">{t("email_header")}</p>
                <p className="text-sm text-white">{selected.email}</p>
              </div>
              <div>
                <p className="luxury-label text-[10px] text-muted">{t("phone_header")}</p>
                <p className="text-sm text-white">{selected.phone || "\u2014"}</p>
              </div>
              <div>
                <p className="luxury-label text-[10px] text-muted">{t("total_orders")}</p>
                <p className="text-sm font-medium text-white">{selected.totalOrders}</p>
              </div>
              <div>
                <p className="luxury-label text-[10px] text-muted">{t("total_spent")}</p>
                <p className="font-serif text-sm font-semibold text-gold">{selected.totalSpent.toFixed(2)} DH</p>
              </div>
              <div>
                <p className="luxury-label text-[10px] text-muted">{t("avg_order_value")}</p>
                <p className="font-serif text-sm font-semibold text-gold">{selected.avgOrderValue.toFixed(2)} DH</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-card border border-white/[0.06]">
            <div className="px-6 py-4 border-b border-white/[0.06]">
              <h3 className="luxury-label text-[10px] text-muted">{t("order_history")}</h3>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-10" role="status">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
                <span className="sr-only">{t("loading_orders")}</span>
              </div>
            ) : orders.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted">{t("no_orders_found")}</div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {orders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="font-mono text-sm font-medium text-white">{o.orderNumber}</p>
                      <p className="text-xs text-muted">{new Date(o.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">{o.total}</p>
                      <p className="text-xs text-muted">{o.orderStatus}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="glass overflow-x-auto rounded-card border border-white/[0.06]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-xs uppercase tracking-wider text-muted">
                  <th scope="col" className="px-5 py-4 font-medium">
                    <button onClick={() => { setSortField("name"); setSortDir((d) => sortField === "name" ? (d === "desc" ? "asc" : "desc") : "desc"); setPage(0); }} className="flex items-center gap-1 hover:text-white">
                      {t("name_label")}
                      <span aria-hidden="true" className="ml-1 text-white/20">{sortField === "name" ? (sortDir === "desc" ? "\u2193" : "\u2191") : "\u2195"}</span>
                    </button>
                  </th>
                  <th scope="col" className="px-5 py-4 font-medium">{t("email_header")}</th>
                  <th scope="col" className="px-5 py-4 font-medium">{t("phone_header")}</th>
                  <th scope="col" className="px-5 py-4 font-medium">
                    <button onClick={() => { setSortField("totalOrders"); setSortDir((d) => sortField === "totalOrders" ? (d === "desc" ? "asc" : "desc") : "desc"); setPage(0); }} className="flex items-center gap-1 hover:text-white">
                      {t("total_orders")}
                      <span aria-hidden="true" className="ml-1 text-white/20">{sortField === "totalOrders" ? (sortDir === "desc" ? "\u2193" : "\u2191") : "\u2195"}</span>
                    </button>
                  </th>
                  <th scope="col" className="px-5 py-4 font-medium">
                    <button onClick={() => { setSortField("totalSpent"); setSortDir((d) => sortField === "totalSpent" ? (d === "desc" ? "asc" : "desc") : "desc"); setPage(0); }} className="flex items-center gap-1 hover:text-white">
                      {t("total_spent")}
                      <span aria-hidden="true" className="ml-1 text-white/20">{sortField === "totalSpent" ? (sortDir === "desc" ? "\u2193" : "\u2191") : "\u2195"}</span>
                    </button>
                  </th>
                  <th scope="col" className="px-5 py-4 font-medium">
                    <button onClick={() => { setSortField("lastOrderDate"); setSortDir((d) => sortField === "lastOrderDate" ? (d === "desc" ? "asc" : "desc") : "desc"); setPage(0); }} className="flex items-center gap-1 hover:text-white">
                      {t("last_order")}
                      <span aria-hidden="true" className="ml-1 text-white/20">{sortField === "lastOrderDate" ? (sortDir === "desc" ? "\u2193" : "\u2191") : "\u2195"}</span>
                    </button>
                  </th>
                  <th scope="col" className="px-5 py-4 font-medium text-right">{t("actions_header")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {paged.map((c, index) => (
                  <motion.tr
                    key={c.email}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    className="transition hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-4 font-medium text-white">{c.name}</td>
                    <td className="px-5 py-4 text-muted">{c.email}</td>
                    <td className="px-5 py-4 text-muted">{c.phone || "\u2014"}</td>
                    <td className="px-5 py-4 text-muted">{c.totalOrders}</td>
                    <td className="px-5 py-4 font-medium text-gold">{c.totalSpent.toFixed(2)} DH</td>
                    <td className="px-5 py-4 text-muted text-xs">
                      {c.lastOrderNumber ? (
                        <span>{c.lastOrderNumber}<br/>{new Date(c.lastOrderDate).toLocaleDateString()}</span>
                      ) : "\u2014"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => openHistory(c)}
                        className="h-12 rounded-button px-3 py-1.5 text-sm font-medium text-gold transition hover:bg-gold/10"
                        aria-label={`${t("view_history")} ${c.name}'s ${t("order_history")}`}
                      >
                        {t("view_history")}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="btn-secondary h-12 rounded-button border border-white/[0.06] bg-card px-4 text-sm text-muted transition hover:bg-surface hover:text-white disabled:opacity-30" aria-label={t("previous_page")}>{t("previous")}</button>
              <span className="text-sm text-muted">{t("page_of")} {page + 1} {t("of_label")} {totalPages}</span>
              <button type="button" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} className="btn-secondary h-12 rounded-button border border-white/[0.06] bg-card px-4 text-sm text-muted transition hover:bg-surface hover:text-white disabled:opacity-30" aria-label={t("next_page")}>{t("next")}</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
