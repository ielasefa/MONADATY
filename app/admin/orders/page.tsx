"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { StoredOrder } from "@/types";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/config";
import { useTranslation } from "@/hooks/useTranslation";

type SortField = "createdAt" | "total" | "orderNumber";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 15;

function formatShortDate(value: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

function StatusBadge({ status, payment = false }: { status: string; payment?: boolean }) {
  const tone =
    status === "delivered" || status === "completed" || status === "paid"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
      : status === "cancelled" || status === "refunded"
        ? "border-burgundy/30 bg-burgundy/15 text-red-300"
        : status === "processing" || status === "shipped" || status === "out_for_delivery"
          ? "border-blue-500/20 bg-blue-500/10 text-blue-300"
          : "border-gold/20 bg-gold/10 text-gold";
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[0.56rem] font-semibold uppercase tracking-[0.1em] ${tone}`}>{payment ? status : status.replace(/_/g, " ")}</span>;
}

function StatsBar({ orders }: { orders: StoredOrder[] }) {
  const { t } = useTranslation("admin");
  const revenue = orders.filter((order) => order.paymentStatus === "paid").reduce((sum, order) => sum + Number(order.total.replace(/[^0-9.]/g, "")), 0);
  const cards = [
    { label: t("total_orders", "Total orders"), value: String(orders.length), accent: "white" },
    { label: t("revenue_label", "Revenue"), value: `${revenue.toFixed(2)} DH`, accent: "gold" },
    { label: t("pending", "Pending"), value: String(orders.filter((order) => order.orderStatus === "pending").length), accent: "burgundy" },
    { label: t("paid", "Paid"), value: String(orders.filter((order) => order.paymentStatus === "paid").length), accent: "white" },
    { label: t("delivered", "Delivered"), value: String(orders.filter((order) => order.orderStatus === "delivered").length), accent: "white" },
    { label: t("cancelled", "Cancelled"), value: String(orders.filter((order) => order.orderStatus === "cancelled").length), accent: "burgundy" },
  ];
  return (
    <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6" aria-label={t("order_statistics", "Order statistics")}>
      {cards.map((card) => (
        <div key={card.label} className="relative min-w-0 overflow-hidden rounded-xl border border-white/[0.06] bg-[#121211] p-4 sm:p-5">
          <span className={`absolute inset-x-0 top-0 h-px ${card.accent === "gold" ? "bg-gold/70" : card.accent === "burgundy" ? "bg-burgundy/70" : "bg-white/10"}`} />
          <p className="truncate text-[0.56rem] font-semibold uppercase tracking-[0.14em] text-white/40">{card.label}</p>
          <p className={`mt-2 truncate font-display text-xl font-semibold ${card.accent === "gold" ? "text-gold" : card.accent === "burgundy" ? "text-red-200" : "text-white"}`}>{card.value}</p>
        </div>
      ))}
    </section>
  );
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const { t } = useTranslation("admin");
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [search, setSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [page, setPage] = useState(0);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const response = await fetch("/api/orders/list");
      if (!response.ok) throw new Error("Failed to load orders");
      const data = await response.json();
      setOrders(data.orders || []);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    const result = orders.filter((order) => {
      if (orderStatusFilter !== "all" && order.orderStatus !== orderStatusFilter) return false;
      if (paymentStatusFilter !== "all" && order.paymentStatus !== paymentStatusFilter) return false;
      if (!query) return true;
      return order.orderNumber.toLowerCase().includes(query) || order.customerName.toLowerCase().includes(query) || order.customerEmail.toLowerCase().includes(query) || order.phone.includes(query);
    });
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === "createdAt") comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      else if (sortField === "total") comparison = Number(a.total.replace(/[^0-9.]/g, "")) - Number(b.total.replace(/[^0-9.]/g, ""));
      else comparison = a.orderNumber.localeCompare(b.orderNumber);
      return sortDir === "desc" ? -comparison : comparison;
    });
    return result;
  }, [orders, search, orderStatusFilter, paymentStatusFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(totalPages - 1, 0));
  const paged = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const firstVisible = filtered.length === 0 ? 0 : currentPage * PAGE_SIZE + 1;
  const lastVisible = Math.min((currentPage + 1) * PAGE_SIZE, filtered.length);
  const hasFilters = Boolean(search || orderStatusFilter !== "all" || paymentStatusFilter !== "all");

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir((direction) => direction === "desc" ? "asc" : "desc");
    else { setSortField(field); setSortDir("desc"); }
    setPage(0);
  }

  function SortArrow({ field }: { field: SortField }) {
    return <span aria-hidden className={sortField === field ? "text-gold" : "text-white/25"}>{sortField === field ? (sortDir === "desc" ? "↓" : "↑") : "↕"}</span>;
  }

  function clearFilters() {
    setSearch("");
    setOrderStatusFilter("all");
    setPaymentStatusFilter("all");
    setPage(0);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] min-w-0 bg-[#0B0B0A]">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
        <header className="mb-7 border-b border-white/[0.06] pb-7">
          <div className="flex items-center gap-3"><span className="h-px w-8 bg-gold/50" /><p className="text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-gold/70">{t("admin_orders", "Orders")}</p></div>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div><h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">{t("order_management", "Order Management")}</h1><p className="mt-2 text-sm text-white/45">{t("orders_description", "Track fulfillment, payment, and customer order activity.")}</p></div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/35">{orders.length} {t("total_orders", "orders")}</p>
          </div>
        </header>

        <StatsBar orders={orders} />

        <section className="mb-5 flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-[#121211] p-3 md:flex-row md:items-center" aria-label={t("order_filters", "Order filters")}>
          <div className="relative min-w-0 flex-1">
            <svg className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
            <input type="search" placeholder={t("search_orders_placeholder", "Search orders or customers") } value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} className="input-premium h-11 w-full bg-[#0B0B0A] ps-10" aria-label={t("search_orders_aria", "Search orders")} />
          </div>
          <select value={orderStatusFilter} onChange={(event) => { setOrderStatusFilter(event.target.value); setPage(0); }} className="input-premium h-11 w-full bg-[#0B0B0A] text-xs md:w-52" aria-label={t("filter_status_aria", "Filter order status")}><option value="all">{t("all_statuses", "All statuses")}</option>{ORDER_STATUSES.map((status) => <option key={status} value={status}>{status.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())}</option>)}</select>
          <select value={paymentStatusFilter} onChange={(event) => { setPaymentStatusFilter(event.target.value); setPage(0); }} className="input-premium h-11 w-full bg-[#0B0B0A] text-xs md:w-48" aria-label={t("filter_payment_aria", "Filter payment status")}><option value="all">{t("all_payments", "All payments")}</option>{PAYMENT_STATUSES.map((status) => <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>)}</select>
          {hasFilters && <button type="button" onClick={clearFilters} className="inline-flex h-11 shrink-0 items-center justify-center rounded-md px-4 text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-white/45 transition hover:bg-white/[0.04] hover:text-white">{t("clear_filters", "Clear")}</button>}
        </section>

        {loading ? (
          <div className="space-y-2 rounded-xl border border-white/[0.06] bg-[#121211] p-4" role="status"><span className="sr-only">{t("loading_orders", "Loading orders")}</span>{[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="h-[76px] animate-pulse rounded-lg bg-white/[0.035]" />)}</div>
        ) : loadError ? (
          <section className="rounded-xl border border-burgundy/30 bg-burgundy/[0.06] px-6 py-14 text-center" role="alert"><p className="text-sm font-medium text-white/80">{t("orders_load_failed", "Failed to load orders")}</p><button type="button" onClick={loadOrders} className="btn-primary mt-4 h-10 px-5 text-[0.6rem]">{t("retry", "Retry")}</button></section>
        ) : filtered.length === 0 ? (
          <section className="rounded-xl border border-dashed border-white/[0.1] bg-[#121211] px-6 py-20 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-gold/60" aria-hidden>□</div><h2 className="mt-4 text-sm font-semibold text-white/80">{t("no_orders_found", "No orders found")}</h2><p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-white/40">{t("no_orders_found_desc", "Orders matching your filters will appear here.")}</p>{hasFilters && <button type="button" onClick={clearFilters} className="mt-5 inline-flex h-10 items-center rounded-md border border-gold/25 px-4 text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-gold">{t("clear_filters", "Clear filters")}</button>}</section>
        ) : (
          <>
            <div className="hidden overflow-x-auto rounded-xl border border-white/[0.07] bg-[#121211] xl:block">
              <table className="w-full min-w-[900px] table-fixed text-start text-sm">
                <colgroup><col className="w-[16%]" /><col className="w-[27%]" /><col className="w-[15%]" /><col className="w-[14%]" /><col className="w-[20%]" /><col className="w-[8%]" /></colgroup>
                <thead className="bg-white/[0.015]"><tr className="h-12 border-b border-white/[0.06] text-[0.58rem] uppercase tracking-[0.14em] text-white/40"><th className="px-5"><button type="button" onClick={() => toggleSort("orderNumber")} className="inline-flex items-center gap-2 hover:text-white">{t("order_hash", "Order ID")}<SortArrow field="orderNumber" /></button></th><th className="px-5">{t("customer_header", "Customer")}</th><th className="px-5"><button type="button" onClick={() => toggleSort("createdAt")} className="inline-flex items-center gap-2 hover:text-white">{t("created_header", "Date")}<SortArrow field="createdAt" /></button></th><th className="px-5 text-end"><button type="button" onClick={() => toggleSort("total")} className="inline-flex items-center gap-2 hover:text-white">{t("total_header", "Total")}<SortArrow field="total" /></button></th><th className="px-5">{t("status_header", "Status")}</th><th className="px-5 text-end">{t("actions_header", "Action")}</th></tr></thead>
                <tbody className="divide-y divide-white/[0.06]">{paged.map((order) => (
                  <tr key={order.id} className="h-[78px] transition-colors duration-200 hover:bg-white/[0.025]"><td className="px-5"><p className="truncate font-mono text-sm font-medium text-white" title={order.orderNumber}>{order.orderNumber}</p><p className="mt-1 text-[0.65rem] text-white/30">{order.items.length} {t("items_header", "items")}</p></td><td className="px-5"><p className="truncate font-medium text-white/80" title={order.customerName}>{order.customerName}</p><p className="mt-1 truncate text-xs text-white/35" title={order.customerEmail}>{order.customerEmail}</p></td><td className="px-5 text-xs text-white/50">{formatShortDate(order.createdAt)}</td><td className="px-5 text-end font-semibold tabular-nums text-gold">{order.total}</td><td className="px-5"><div className="flex flex-wrap gap-1.5"><StatusBadge status={order.orderStatus} /><StatusBadge status={order.paymentStatus} payment /></div></td><td className="px-5 text-end"><button type="button" onClick={() => router.push(`/admin/orders/${order.id}`)} className="inline-flex h-8 items-center rounded-md border border-gold/20 px-3 text-[0.56rem] font-semibold uppercase tracking-[0.1em] text-gold transition hover:bg-gold/10" aria-label={`${t("view_button", "View")} ${order.orderNumber}`}>{t("view_button", "View")}</button></td></tr>
                ))}</tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:hidden">{paged.map((order) => (
              <article key={order.id} className="min-w-0 rounded-xl border border-white/[0.07] bg-[#121211] p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-mono text-sm font-semibold text-white">{order.orderNumber}</p><p className="mt-1 text-xs text-white/35">{formatShortDate(order.createdAt)}</p></div><p className="shrink-0 font-semibold text-gold">{order.total}</p></div><div className="mt-4 min-w-0 border-y border-white/[0.06] py-3"><p className="truncate text-sm font-medium text-white/80">{order.customerName}</p><p className="mt-1 truncate text-xs text-white/35">{order.customerEmail}</p></div><div className="mt-4 flex flex-wrap items-center gap-2"><StatusBadge status={order.orderStatus} /><StatusBadge status={order.paymentStatus} payment /><button type="button" onClick={() => router.push(`/admin/orders/${order.id}`)} className="ms-auto inline-flex h-9 items-center rounded-md border border-gold/20 px-3 text-[0.56rem] font-semibold uppercase tracking-[0.1em] text-gold">{t("view_button", "View")}</button></div></article>
            ))}</div>

            <nav className="mt-5 flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-[#121211] px-4 py-3 sm:flex-row sm:items-center sm:justify-between" aria-label={t("pagination", "Pagination")}><p className="text-xs tabular-nums text-white/40">{t("showing", "Showing")} {firstVisible}–{lastVisible} {t("of_label", "of")} {filtered.length}</p><div className="flex items-center justify-between gap-2 sm:justify-end"><button type="button" disabled={currentPage === 0} onClick={() => setPage((value) => Math.max(value - 1, 0))} className="inline-flex h-9 items-center rounded-md border border-white/[0.08] px-3 text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-white/50 transition hover:border-gold/25 hover:text-gold disabled:cursor-not-allowed disabled:opacity-30">← <span className="ms-1 hidden sm:inline">{t("previous", "Previous")}</span></button><span className="min-w-[92px] text-center text-xs tabular-nums text-white/45">{t("page_of", "Page")} {currentPage + 1} {t("of_label", "of")} {Math.max(totalPages, 1)}</span><button type="button" disabled={currentPage >= totalPages - 1} onClick={() => setPage((value) => Math.min(value + 1, totalPages - 1))} className="inline-flex h-9 items-center rounded-md border border-white/[0.08] px-3 text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-white/50 transition hover:border-gold/25 hover:text-gold disabled:cursor-not-allowed disabled:opacity-30"><span className="me-1 hidden sm:inline">{t("next", "Next")}</span> →</button></div></nav>
          </>
        )}
      </div>
    </div>
  );
}
