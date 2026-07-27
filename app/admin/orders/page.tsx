"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import type { StoredOrder } from "@/types";
import { STATUS_COLORS, ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/config";
import { useTranslation } from "@/hooks/useTranslation";

function formatShortDate(iso: string): string {
  if (!iso) return "\u2014";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function StatsBar({ orders }: { orders: StoredOrder[] }) {
  const { t } = useTranslation("admin");
  const total = orders.length;
  const revenue = orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + Number(o.total.replace(/[^0-9.]/g, "")), 0);
  const pending = orders.filter((o) => o.orderStatus === "pending").length;
  const paid = orders.filter((o) => o.paymentStatus === "paid").length;
  const delivered = orders.filter((o) => o.orderStatus === "delivered").length;
  const cancelled = orders.filter((o) => o.orderStatus === "cancelled").length;

  const cards = [
    { label: t("total_orders"), value: total, accent: "" },
    { label: t("revenue_label"), value: `${revenue.toFixed(2)} DH`, accent: "text-yellow" },
    { label: t("pending"), value: pending, accent: "text-red" },
    { label: t("paid"), value: paid, accent: "text-white/65" },
    { label: t("delivered"), value: delivered, accent: "text-white/65" },
    { label: t("cancelled"), value: cancelled, accent: "text-red" },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => (
          <div key={card.label} className="luxury-card rounded-xl border border-white/[0.06] bg-[#141414] p-5">
          <p className="luxury-label text-[10px] text-white/50">{card.label}</p>
          <p className={`mt-1 font-display text-xl font-semibold ${card.accent || "text-white"}`}>{card.value}</p>
      </div>
      ))}
  </div>
  );
}

type SortField = "createdAt" | "total" | "orderNumber";
type SortDir = "asc" | "desc";

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [search, setSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const pageSize = 20;
  const { t } = useTranslation("admin");

  useEffect(() => {
    fetch("/api/orders/list")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const result = orders.filter((o) => {
      if (orderStatusFilter !== "all" && o.orderStatus !== orderStatusFilter) return false;
      if (paymentStatusFilter !== "all" && o.paymentStatus !== paymentStatusFilter) return false;
      if (!q) return true;
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.phone.includes(q)
      );
    });

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "createdAt") {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortField === "total") {
        cmp = Number(a.total.replace(/[^0-9.]/g, "")) - Number(b.total.replace(/[^0-9.]/g, ""));
      } else {
        cmp = a.orderNumber.localeCompare(b.orderNumber);
      }
      return sortDir === "desc" ? -cmp : cmp;
    });

    return result;
  }, [orders, search, orderStatusFilter, paymentStatusFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
    setPage(0);
  }

  function SortArrow({ field }: { field: SortField }) {
    const up = String.fromCharCode(8593);
    const down = String.fromCharCode(8595);
    const both = String.fromCharCode(8597);
    if (sortField !== field) return <span aria-hidden="true" className="ml-1 text-white/20">{both}</span>;
    return <span aria-hidden="true" className="ml-1 text-yellow">{sortDir === "desc" ? down : up}</span>;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="container-shell mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-white">{t("order_management")}</h1>
          <p className="mt-1 text-sm text-white/50">{orders.length} {t("total_orders")}</p>
        </div>

        <StatsBar orders={orders} />

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap gap-3">
            <input
              type="search"
              placeholder={t("search_orders_placeholder")}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="input-premium h-12 w-56 rounded-md border border-white/[0.06] bg-[#0A0A0A] px-4 text-sm text-white outline-none transition focus:border-yellow/40 focus:ring-1 focus:ring-yellow/20"
              aria-label={t("search_orders_aria")}
            />
            <select
              value={orderStatusFilter}
              onChange={(e) => { setOrderStatusFilter(e.target.value); setPage(0); }}
              className="input-premium h-12 rounded-md border border-white/[0.06] bg-[#0A0A0A] px-3 text-sm text-white outline-none transition focus:border-yellow/40 focus:ring-1 focus:ring-yellow/20"
              aria-label={t("filter_status_aria")}
            >
              <option value="all">{t("all_statuses")}</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</option>
              ))}
            </select>
            <select
              value={paymentStatusFilter}
              onChange={(e) => { setPaymentStatusFilter(e.target.value); setPage(0); }}
              className="input-premium h-12 rounded-md border border-white/[0.06] bg-[#0A0A0A] px-3 text-sm text-white outline-none transition focus:border-yellow/40 focus:ring-1 focus:ring-yellow/20"
              aria-label={t("filter_payment_aria")}
            >
              <option value="all">{t("all_payments")}</option>
              {PAYMENT_STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20" role="status">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-yellow border-t-transparent" />
            <span className="sr-only">{t("loading_orders")}</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-white/[0.06] p-10 text-center">
            <p className="text-sm text-white/50">{t("no_orders_found")}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border border-white/[0.06]" role="table" aria-label={t("orders_table")}>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] text-xs uppercase tracking-wider text-white/50">
                    <th scope="col" className="px-5 py-4 font-medium">
                      <button onClick={() => toggleSort("orderNumber")} className="flex items-center gap-1 hover:text-white">
                        {t("order_hash")}
                        <SortArrow field="orderNumber" />
                      </button>
                    </th>
                    <th scope="col" className="px-5 py-4 font-medium">{t("customer_header")}</th>
                    <th scope="col" className="px-5 py-4 font-medium">{t("email_header")}</th>
                    <th scope="col" className="px-5 py-4 font-medium">{t("phone_header")}</th>
                    <th scope="col" className="px-5 py-4 font-medium">{t("status_header")}</th>
                    <th scope="col" className="px-5 py-4 font-medium">{t("payment_header")}</th>
                    <th scope="col" className="px-5 py-4 font-medium">{t("delivery_co_header")}</th>
                    <th scope="col" className="px-5 py-4 font-medium">{t("tracking_header")}</th>
                    <th scope="col" className="px-5 py-4 font-medium">{t("est_delivery_header")}</th>
                    <th scope="col" className="px-5 py-4 font-medium">{t("items_header")}</th>
                    <th scope="col" className="px-5 py-4 font-medium">
                      <button onClick={() => toggleSort("total")} className="flex items-center gap-1 hover:text-white">
                        {t("total_header")}
                        <SortArrow field="total" />
                      </button>
                    </th>
                    <th scope="col" className="px-5 py-4 font-medium">
                      <button onClick={() => toggleSort("createdAt")} className="flex items-center gap-1 hover:text-white">
                        {t("created_header")}
                        <SortArrow field="createdAt" />
                      </button>
                    </th>
                    <th scope="col" className="px-5 py-4 font-medium text-right">{t("actions_header")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {paged.map((order, i) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: i * 0.04 }}
                      className="transition hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-4 font-mono text-sm font-medium text-white">{order.orderNumber}</td>
                      <td className="px-5 py-4 text-white/50">{order.customerName}</td>
                      <td className="px-5 py-4 text-white/50 max-w-[180px] truncate">{order.customerEmail}</td>
                      <td className="px-5 py-4 text-white/50">{order.phone || "\u2014"}</td>
                      <td className="px-5 py-4">
                        <motion.span
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.15em] ${STATUS_COLORS[order.orderStatus] || ""}`}
                        >
                          {order.orderStatus.replace(/_/g, " ")}
                        </motion.span>
                      </td>
                      <td className="px-5 py-4">
                        <motion.span
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.15em] ${STATUS_COLORS[order.paymentStatus] || ""}`}
                        >
                          {order.paymentStatus}
                        </motion.span>
                      </td>
                      <td className="px-5 py-4 text-white/50 max-w-[120px] truncate">{order.deliveryCompany || "\u2014"}</td>
                      <td className="px-5 py-4 text-white/50 max-w-[120px] truncate">{order.trackingNumber || "\u2014"}</td>
                      <td className="px-5 py-4 text-white/50 whitespace-nowrap">{formatShortDate(order.estimatedDelivery)}</td>
                      <td className="px-5 py-4 text-white/50">{order.items.length}</td>
                      <td className="px-5 py-4 font-medium text-white">{order.total}</td>
                      <td className="px-5 py-4 whitespace-nowrap text-white/50">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => router.push(`/admin/orders/${order.id}`)}
                          className="h-12 rounded-md px-3 py-1.5 text-sm font-medium text-yellow transition hover:bg-yellow/10"
                          aria-label={`${t("view_button")} ${order.orderNumber}`}
                        >
                          {t("view_button")}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="btn-secondary h-12 rounded-md border border-white/[0.06] bg-[#141414] px-4 text-sm text-white/50 transition hover:bg-[#0A0A0A] hover:text-white disabled:opacity-30"
                  aria-label={t("previous_page")}
                >
                  {t("previous")}
                </button>
                <span className="text-sm text-white/50">
                  {t("page_of")} {page + 1} {t("of_label")} {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="btn-secondary h-12 rounded-md border border-white/[0.06] bg-[#141414] px-4 text-sm text-white/50 transition hover:bg-[#0A0A0A] hover:text-white disabled:opacity-30"
                  aria-label={t("next_page")}
                >
                  {t("next")}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
