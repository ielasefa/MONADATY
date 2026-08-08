"use client";

import { useMemo, useState } from "react";
import type { CustomerInfo } from "@/lib/customers";
import type { StoredOrder } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";

type SortField = "name" | "totalSpent" | "totalOrders" | "lastOrderDate";
type SortDir = "asc" | "desc";
type CustomerSegment = "all" | "new" | "returning";

const PAGE_SIZE = 15;

function formatDate(value: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function CustomerBadge({ repeat, labels }: { repeat: boolean; labels: { newCustomer: string; returning: string } }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.1em] ${
        repeat
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
          : "border-gold/20 bg-gold/10 text-gold"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${repeat ? "bg-emerald-400" : "bg-gold"}`} aria-hidden />
      {repeat ? labels.returning : labels.newCustomer}
    </span>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const tone =
    status === "delivered" || status === "completed"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
      : status === "cancelled" || status === "refunded"
        ? "border-burgundy/30 bg-burgundy/15 text-red-300"
        : "border-gold/20 bg-gold/10 text-gold";

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.1em] ${tone}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function CustomersClient({ customers: initial }: { customers: CustomerInfo[] }) {
  const { t } = useTranslation("admin");
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState<CustomerSegment>("all");
  const [selected, setSelected] = useState<CustomerInfo | null>(null);
  const [sortField, setSortField] = useState<SortField>("totalSpent");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(false);

  const labels = {
    newCustomer: t("new_customer", "New customer"),
    returning: t("returning_customer", "Returning"),
  };

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    const result = initial.filter((customer) => {
      if (segment === "new" && customer.totalOrders !== 1) return false;
      if (segment === "returning" && customer.totalOrders < 2) return false;
      if (!query) return true;
      return (
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phone.toLowerCase().includes(query)
      );
    });

    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === "name") comparison = a.name.localeCompare(b.name);
      else if (sortField === "totalSpent") comparison = a.totalSpent - b.totalSpent;
      else if (sortField === "totalOrders") comparison = a.totalOrders - b.totalOrders;
      else comparison = new Date(a.lastOrderDate).getTime() - new Date(b.lastOrderDate).getTime();
      return sortDir === "desc" ? -comparison : comparison;
    });

    return result;
  }, [initial, search, segment, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const currentPage = Math.min(page, Math.max(totalPages - 1, 0));
  const paged = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const firstVisible = filtered.length === 0 ? 0 : currentPage * PAGE_SIZE + 1;
  const lastVisible = Math.min((currentPage + 1) * PAGE_SIZE, filtered.length);

  const totalRevenue = initial.reduce((sum, customer) => sum + customer.totalSpent, 0);
  const returningCustomers = initial.filter((customer) => customer.totalOrders > 1).length;
  const averageValue = initial.length > 0 ? totalRevenue / initial.length : 0;

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir((direction) => (direction === "desc" ? "asc" : "desc"));
    else {
      setSortField(field);
      setSortDir(field === "name" ? "asc" : "desc");
    }
    setPage(0);
  }

  function SortArrow({ field }: { field: SortField }) {
    return (
      <span aria-hidden className={`text-[0.65rem] ${sortField === field ? "text-gold" : "text-white/25"}`}>
        {sortField === field ? (sortDir === "desc" ? "↓" : "↑") : "↕"}
      </span>
    );
  }

  async function openHistory(customer: CustomerInfo) {
    setSelected(customer);
    setLoading(true);
    setOrdersError(false);
    try {
      const response = await fetch("/api/orders/list");
      if (!response.ok) throw new Error("Failed to load orders");
      const data = await response.json();
      const allOrders: StoredOrder[] = data.orders || [];
      setOrders(allOrders.filter((order) => order.customerEmail.toLowerCase() === customer.email.toLowerCase()));
    } catch {
      setOrders([]);
      setOrdersError(true);
    } finally {
      setLoading(false);
    }
  }

  function clearFilters() {
    setSearch("");
    setSegment("all");
    setPage(0);
  }

  if (selected) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <button
          type="button"
          onClick={() => setSelected(null)}
          className="mb-5 inline-flex h-10 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 text-xs font-semibold uppercase tracking-[0.12em] text-white/65 transition hover:border-gold/30 hover:text-gold"
        >
          <span aria-hidden>←</span>
          {t("back_to_customers", "Back to customers")}
        </button>

        <header className="mb-6 flex flex-col gap-4 border-b border-white/[0.06] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-gold/70">{t("customer_profile", "Customer profile")}</p>
            <h1 className="mt-2 truncate font-display text-3xl text-white sm:text-4xl">{selected.name}</h1>
            <p className="mt-2 truncate text-sm text-white/45">{selected.email}</p>
          </div>
          <CustomerBadge repeat={selected.totalOrders > 1} labels={labels} />
        </header>

        <section className="mb-6 overflow-hidden rounded-xl border border-white/[0.07] bg-[#121211]">
          <div className="border-b border-white/[0.06] px-5 py-4 sm:px-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/75">{t("customer_information", "Customer information")}</h2>
          </div>
          <div className="grid grid-cols-1 divide-y divide-white/[0.06] sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-5">
            {[
              [t("phone_header", "Phone"), selected.phone || "—"],
              [t("city", "City"), selected.city || "—"],
              [t("total_orders", "Orders"), String(selected.totalOrders)],
              [t("total_spent", "Total spent"), `${selected.totalSpent.toFixed(2)} DH`],
              [t("avg_order_value", "Average order"), `${selected.avgOrderValue.toFixed(2)} DH`],
            ].map(([label, value], index) => (
              <div key={label} className={`min-w-0 px-5 py-5 ${index === 4 ? "sm:col-span-2 xl:col-span-1" : ""}`}>
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-white/35">{label}</p>
                <p className={`mt-2 truncate text-sm font-medium ${index >= 3 ? "text-gold" : "text-white/85"}`}>{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#121211]">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-white/75">{t("order_history", "Order history")}</h2>
              <p className="mt-1 text-xs text-white/35">{t("customer_orders_description", "Orders associated with this email address")}</p>
            </div>
            {!loading && !ordersError && <span className="badge-gold">{orders.length}</span>}
          </div>

          {loading ? (
            <div className="space-y-3 p-6" role="status">
              <span className="sr-only">{t("loading_orders", "Loading orders")}</span>
              {[0, 1, 2].map((item) => <div key={item} className="h-16 animate-pulse rounded-lg bg-white/[0.04]" />)}
            </div>
          ) : ordersError ? (
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <span className="text-2xl text-burgundy" aria-hidden>!</span>
              <p className="mt-3 text-sm font-medium text-white/80">{t("orders_load_failed", "Orders could not be loaded")}</p>
              <button type="button" onClick={() => openHistory(selected)} className="mt-4 inline-flex h-9 items-center rounded-md bg-burgundy px-4 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-white">
                {t("retry", "Retry")}
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-white/30" aria-hidden>□</div>
              <p className="mt-3 text-sm font-medium text-white/75">{t("no_orders_found", "No orders found")}</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {orders.map((order) => (
                <div key={order.id} className="grid min-h-[76px] grid-cols-1 gap-3 px-5 py-4 transition hover:bg-white/[0.02] sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:px-6">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-sm font-medium text-white">{order.orderNumber}</p>
                    <p className="mt-1 text-xs text-white/35">{formatDate(order.createdAt)}</p>
                  </div>
                  <OrderStatusBadge status={order.orderStatus} />
                  <p className="min-w-[100px] text-left text-sm font-semibold text-gold sm:text-right">{order.total}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <header className="mb-7 border-b border-white/[0.06] pb-7">
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-gold/50" />
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-gold/70">{t("customers_label", "Customers")}</p>
        </div>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">{t("customers_heading", "Customer Management")}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/45">{t("customers_description", "Review customer activity, purchase history, and lifetime value.")}</p>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/35">{initial.length} {t("customers_count", "customers")}</p>
        </div>
      </header>

      <section className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          [t("customers_count", "Customers"), String(initial.length)],
          [t("total_revenue", "Total revenue"), `${totalRevenue.toFixed(2)} DH`],
          [t("returning_customers", "Returning customers"), String(returningCustomers)],
          [t("average_customer_value", "Average value"), `${averageValue.toFixed(2)} DH`],
        ].map(([label, value], index) => (
          <div key={label} className="relative min-w-0 overflow-hidden rounded-xl border border-white/[0.06] bg-[#121211] p-4 sm:p-5">
            <span className={`absolute inset-x-0 top-0 h-px ${index === 1 ? "bg-gold/70" : index === 2 ? "bg-burgundy/70" : "bg-white/10"}`} />
            <p className="truncate text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-white/40">{label}</p>
            <p className={`mt-2 truncate font-display text-xl sm:text-2xl ${index === 1 ? "text-gold" : "text-white"}`}>{value}</p>
          </div>
        ))}
      </section>

      <section className="mb-5 flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-[#121211] p-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(event) => { setSearch(event.target.value); setPage(0); }}
            placeholder={t("search_customers", "Search name, email, or phone")}
            className="input-premium h-11 w-full bg-[#0B0B0A] pl-10 pr-4"
            aria-label={t("search_customers_aria", "Search customers")}
          />
        </div>
        <select
          value={segment}
          onChange={(event) => { setSegment(event.target.value as CustomerSegment); setPage(0); }}
          className="input-premium h-11 w-full bg-[#0B0B0A] sm:w-52"
          aria-label={t("filter_customers", "Filter customers")}
        >
          <option value="all">{t("all_customers", "All customers")}</option>
          <option value="new">{t("new_customers", "New customers")}</option>
          <option value="returning">{t("returning_customers", "Returning customers")}</option>
        </select>
        {(search || segment !== "all") && (
          <button type="button" onClick={clearFilters} className="inline-flex h-11 shrink-0 items-center justify-center rounded-md px-4 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-white/45 transition hover:bg-white/[0.04] hover:text-white">
            {t("clear_filters", "Clear")}
          </button>
        )}
        <span className="shrink-0 px-2 text-xs tabular-nums text-white/35">{filtered.length} {t("results", "results")}</span>
      </section>

      {paged.length === 0 ? (
        <section className="rounded-xl border border-dashed border-white/[0.1] bg-[#121211] px-6 py-20 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-xl text-gold/60" aria-hidden>◇</div>
          <h2 className="mt-4 text-sm font-semibold text-white/80">{initial.length === 0 ? t("no_customers", "No customers yet") : t("no_customers_found", "No customers found")}</h2>
          <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-white/40">{initial.length === 0 ? t("no_customers_description", "Customers will appear here after their first order.") : t("adjust_customer_filters", "Try a different search or clear the current filter.")}</p>
          {(search || segment !== "all") && <button type="button" onClick={clearFilters} className="mt-5 inline-flex h-10 items-center rounded-md border border-gold/25 px-4 text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-gold transition hover:bg-gold/10">{t("clear_filters", "Clear filters")}</button>}
        </section>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-xl border border-white/[0.07] bg-[#121211] lg:block">
            <table className="w-full min-w-[960px] table-fixed text-left text-sm">
              <colgroup>
                <col className="w-[18%]" />
                <col className="w-[23%]" />
                <col className="w-[14%]" />
                <col className="w-[10%]" />
                <col className="w-[14%]" />
                <col className="w-[13%]" />
                <col className="w-[8%]" />
              </colgroup>
              <thead className="bg-white/[0.015]">
                <tr className="h-12 border-b border-white/[0.06] text-[0.6rem] uppercase tracking-[0.14em] text-white/40">
                  <th scope="col" className="px-5 font-semibold"><button type="button" onClick={() => toggleSort("name")} className="inline-flex items-center gap-2 transition hover:text-white">{t("name_label", "Name")}<SortArrow field="name" /></button></th>
                  <th scope="col" className="px-5 font-semibold">{t("email_header", "Email")}</th>
                  <th scope="col" className="px-5 font-semibold">{t("phone_header", "Phone")}</th>
                  <th scope="col" className="px-5 text-center font-semibold"><button type="button" onClick={() => toggleSort("totalOrders")} className="inline-flex items-center gap-2 transition hover:text-white">{t("total_orders", "Orders")}<SortArrow field="totalOrders" /></button></th>
                  <th scope="col" className="px-5 text-right font-semibold"><button type="button" onClick={() => toggleSort("totalSpent")} className="inline-flex items-center gap-2 transition hover:text-white">{t("total_spent", "Total spent")}<SortArrow field="totalSpent" /></button></th>
                  <th scope="col" className="px-5 font-semibold"><button type="button" onClick={() => toggleSort("lastOrderDate")} className="inline-flex items-center gap-2 transition hover:text-white">{t("last_order", "Last order")}<SortArrow field="lastOrderDate" /></button></th>
                  <th scope="col" className="px-5 text-right font-semibold">{t("actions_header", "Action")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {paged.map((customer) => (
                  <tr key={customer.email} className="h-[76px] transition-colors hover:bg-white/[0.025]">
                    <td className="px-5">
                      <p className="truncate font-medium text-white" title={customer.name}>{customer.name}</p>
                      <div className="mt-1.5"><CustomerBadge repeat={customer.totalOrders > 1} labels={labels} /></div>
                    </td>
                    <td className="px-5"><p className="truncate text-white/55" title={customer.email}>{customer.email}</p></td>
                    <td className="px-5"><p className="truncate text-white/55" title={customer.phone || undefined}>{customer.phone || "—"}</p></td>
                    <td className="px-5 text-center"><span className="inline-flex min-w-8 items-center justify-center rounded-full bg-white/[0.05] px-2.5 py-1 text-xs font-semibold tabular-nums text-white/70">{customer.totalOrders}</span></td>
                    <td className="px-5 text-right font-semibold tabular-nums text-gold">{customer.totalSpent.toFixed(2)} DH</td>
                    <td className="px-5"><p className="truncate font-mono text-xs text-white/65">{customer.lastOrderNumber || "—"}</p><p className="mt-1 text-[0.68rem] text-white/35">{formatDate(customer.lastOrderDate)}</p></td>
                    <td className="px-5 text-right">
                      <button type="button" onClick={() => openHistory(customer)} className="inline-flex h-8 items-center rounded-md border border-gold/20 px-3 text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-gold transition hover:bg-gold/10" aria-label={`${t("view_history", "View history")} ${customer.name}`}>{t("view", "View")}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">
            {paged.map((customer) => (
              <article key={customer.email} className="min-w-0 rounded-xl border border-white/[0.07] bg-[#121211] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold text-white">{customer.name}</h2>
                    <p className="mt-1 truncate text-xs text-white/40">{customer.email}</p>
                  </div>
                  <CustomerBadge repeat={customer.totalOrders > 1} labels={labels} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 border-y border-white/[0.06] py-4">
                  <div><p className="text-[0.58rem] uppercase tracking-[0.12em] text-white/35">{t("total_orders", "Orders")}</p><p className="mt-1 text-sm font-semibold text-white/80">{customer.totalOrders}</p></div>
                  <div className="text-right"><p className="text-[0.58rem] uppercase tracking-[0.12em] text-white/35">{t("total_spent", "Total spent")}</p><p className="mt-1 text-sm font-semibold text-gold">{customer.totalSpent.toFixed(2)} DH</p></div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="min-w-0"><p className="truncate font-mono text-xs text-white/60">{customer.lastOrderNumber || "—"}</p><p className="mt-1 text-[0.65rem] text-white/30">{formatDate(customer.lastOrderDate)}</p></div>
                  <button type="button" onClick={() => openHistory(customer)} className="inline-flex h-9 shrink-0 items-center rounded-md border border-gold/20 px-3 text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-gold">{t("view", "View")}</button>
                </div>
              </article>
            ))}
          </div>

          <nav className="mt-5 flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-[#121211] px-4 py-3 sm:flex-row sm:items-center sm:justify-between" aria-label={t("pagination", "Pagination")}>
            <p className="text-xs tabular-nums text-white/40">{t("showing", "Showing")} {firstVisible}–{lastVisible} {t("of_label", "of")} {filtered.length}</p>
            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <button type="button" disabled={currentPage === 0} onClick={() => setPage((value) => Math.max(value - 1, 0))} className="inline-flex h-9 items-center rounded-md border border-white/[0.08] px-3 text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-white/55 transition hover:border-gold/25 hover:text-gold disabled:cursor-not-allowed disabled:opacity-30">← <span className="ml-1 hidden sm:inline">{t("previous", "Previous")}</span></button>
              <span className="min-w-[92px] text-center text-xs tabular-nums text-white/50">{t("page_of", "Page")} {currentPage + 1} {t("of_label", "of")} {Math.max(totalPages, 1)}</span>
              <button type="button" disabled={currentPage >= totalPages - 1} onClick={() => setPage((value) => Math.min(value + 1, totalPages - 1))} className="inline-flex h-9 items-center rounded-md border border-white/[0.08] px-3 text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-white/55 transition hover:border-gold/25 hover:text-gold disabled:cursor-not-allowed disabled:opacity-30"><span className="mr-1 hidden sm:inline">{t("next", "Next")}</span> →</button>
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
