"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

type InvoiceWithOrder = {
  id: string;
  invoiceNumber: string;
  status: string;
  pdfPath: string | null;
  signedToken: string | null;
  createdAt: string;
  order: {
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    total: string;
    createdAt: string;
  } | null;
  events: { id: string; event: string; createdAt: string }[];
};

type ListResponse = {
  total: number;
  invoices: InvoiceWithOrder[];
  totalPages: number;
};

export default function AdminInvoicesPage() {
  const { t } = useTranslation("admin");
  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const pageSize = 20;

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      sortField,
      sortDir,
      status: statusFilter,
    });
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/invoices/list?${params}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [page, sortField, sortDir, statusFilter, search]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  useEffect(() => {
    setPage(0);
    setSelected(new Set());
  }, [search, statusFilter]);

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const handleBulkCancel = async () => {
    if (selected.size === 0) return;
    if (!confirm(t("cancel_confirm", { count: selected.size }))) return;
    for (const id of selected) {
      await fetch(`/api/admin/invoices/${id}/cancel`, { method: "POST" });
    }
    setSelected(new Set());
    fetchInvoices();
  };

  const handleSelectAll = () => {
    if (!data) return;
    if (selected.size === data.invoices.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(data.invoices.map((i) => i.id)));
    }
  };

  const handleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleExportCsv = () => {
    window.open("/api/admin/invoices/export/csv", "_blank");
  };

  const sortArrow = (field: string) => {
    if (sortField !== field) return "";
    return sortDir === "asc" ? " ↑" : " ↓";
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      Issued: "badge-emerald",
      Draft: "badge-gold",
      Cancelled: "bg-red/10 text-red",
    };
    return `inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] ${map[status] || "bg-white/10 text-white/60"}`;
  };

  return (
    <div className="container-shell py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-white md:text-4xl">{t("invoices")}</h1>
          <p className="mt-1 text-sm text-muted">
            {data ? t("invoice_count", { count: data.total }) : t("loading")}
          </p>
        </div>
        <div className="flex gap-3">
          {selected.size > 0 && (
            <button onClick={handleBulkCancel} className="btn-secondary h-10 rounded-button px-4 text-xs font-semibold uppercase tracking-[0.1em]">
              {t("cancel")} ({selected.size})
            </button>
          )}
          <button onClick={handleExportCsv} className="btn-secondary h-10 rounded-button px-4 text-xs font-semibold uppercase tracking-[0.1em]">
            {t("csv_export")}
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder={t("search_invoices")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-button border border-white/[0.06] bg-card py-2.5 pl-10 pr-4 text-sm text-white placeholder-muted outline-none transition focus:border-gold/30"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full rounded-button border border-white/[0.06] bg-card px-4 py-2.5 text-sm text-white outline-none transition focus:border-gold/30 sm:w-40"
        >
          <option value="all">{t("all_status")}</option>
          <option value="Issued">{t("issued")}</option>
          <option value="Draft">{t("draft")}</option>
          <option value="Cancelled">{t("cancelled")}</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-xs uppercase tracking-[0.1em] text-muted">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={data ? data.invoices.length > 0 && selected.size === data.invoices.length : false}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-white/20 bg-white/5 accent-gold"
                  />
                </th>
                <th className="cursor-pointer px-4 py-3 hover:text-white" onClick={() => toggleSort("invoiceNumber")}>
                  {t("invoice_number")}{sortArrow("invoiceNumber")}
                </th>
                <th className="cursor-pointer px-4 py-3 hover:text-white" onClick={() => toggleSort("status")}>
                  {t("status")}{sortArrow("status")}
                </th>
                <th className="cursor-pointer px-4 py-3 hover:text-white" onClick={() => toggleSort("orderNumber")}>
                  {t("order")}{sortArrow("orderNumber")}
                </th>
                <th className="px-4 py-3">{t("customer")}</th>
                <th className="cursor-pointer px-4 py-3 text-right hover:text-white" onClick={() => toggleSort("total")}>
                  {t("amount")}{sortArrow("total")}
                </th>
                <th className="cursor-pointer px-4 py-3 text-right hover:text-white" onClick={() => toggleSort("createdAt")}>
                  {t("date")}{sortArrow("createdAt")}
                </th>
                <th className="px-4 py-3 text-right">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/[0.04]">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 w-full animate-pulse rounded bg-white/5" />
                        </td>
                      ))}
                    </tr>
                  ))
                : data?.invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-white/[0.04] transition hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(inv.id)}
                          onChange={() => handleSelect(inv.id)}
                          className="h-4 w-4 rounded border-white/20 bg-white/5 accent-gold"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm font-medium text-white">{inv.invoiceNumber}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={statusBadge(inv.status)}>{inv.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${inv.order?.orderNumber || "#"}`}
                          className="font-mono text-sm text-gold transition hover:brightness-110"
                        >
                          {inv.order?.orderNumber || "—"}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-white">{inv.order?.customerName || "—"}</p>
                        <p className="text-xs text-muted">{inv.order?.customerEmail}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-white">
                        {inv.order?.total || "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-muted">
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {inv.status === "Issued" && inv.pdfPath && (
                            <a
                              href={`/api/admin/invoices/${inv.id}/download`}
                              className="text-xs font-semibold uppercase tracking-[0.1em] text-gold transition hover:brightness-110"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {t("pdf")}
                            </a>
                          )}
                          {inv.status === "Issued" && (
                            <button
                              onClick={async () => {
                                if (confirm(t("cancel_invoice_confirm"))) {
                                  await fetch(`/api/admin/invoices/${inv.id}/cancel`, { method: "POST" });
                                  fetchInvoices();
                                }
                              }}
                              className="text-xs font-semibold uppercase tracking-[0.1em] text-red transition hover:brightness-110"
                            >
                              {t("cancel")}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              {!loading && data?.invoices.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted">
                    {t("no_invoices")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="btn-secondary h-10 rounded-button px-4 text-xs font-semibold uppercase tracking-[0.1em] disabled:opacity-30"
          >
            {t("previous")}
          </button>
          <span className="px-4 text-sm text-muted">
            {t("page")} {page + 1} {t("of")} {data.totalPages}
          </span>
          <button
            disabled={page >= data.totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="btn-secondary h-10 rounded-button px-4 text-xs font-semibold uppercase tracking-[0.1em] disabled:opacity-30"
          >
            {t("next")}
          </button>
        </div>
      )}
    </div>
  );
}
