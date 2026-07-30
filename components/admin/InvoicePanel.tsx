"use client";

import { useState, useCallback } from "react";
import { useTranslation } from "@/hooks/useTranslation";

type InvoiceData = {
  id: string;
  invoiceNumber: string;
  orderId: string;
  status: string;
  pdfPath: string | null;
  createdAt: string;
};

type Props = {
  orderId: string;
  initialInvoice: InvoiceData | null;
};

export function InvoicePanel({ orderId, initialInvoice }: Props) {
  const { t } = useTranslation("invoice");
  const [invoice, setInvoice] = useState<InvoiceData | null>(initialInvoice);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/invoices/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t("create_invoice_error"));
      }
      const data = await res.json();
      setInvoice(data.invoice);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("create_invoice_error"));
    }
    setLoading(false);
  }, [orderId, t]);

  const handleDownload = useCallback(async () => {
    if (!invoice) return;
    setError("");
    try {
      const res = await fetch(`/api/admin/invoices/${invoice.id}/download`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t("download_invoice_error"));
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("download_invoice_error"));
    }
  }, [invoice, t]);

  const handlePrint = useCallback(async () => {
    if (!invoice) return;
    setError("");
    try {
      const res = await fetch(`/api/admin/invoices/${invoice.id}/download`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t("print_invoice_error"));
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const win = window.open(url, "_blank");
      if (win) {
        win.onload = () => {
          win.print();
          URL.revokeObjectURL(url);
        };
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("print_invoice_error"));
    }
  }, [invoice, t]);

  const handleCancel = useCallback(async () => {
    if (!invoice) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/invoices/${invoice.id}/cancel`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t("cancel_invoice_error"));
      }
      const data = await res.json();
      setInvoice(data.invoice);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("cancel_invoice_error"));
    }
    setLoading(false);
  }, [invoice, t]);

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      Draft: "bg-white/10 text-white/50 border-white/[0.06]",
      Issued: "bg-yellow/10 text-yellow border-yellow/20",
      Cancelled: "bg-red/10 text-red border-red/20",
    };
    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.1em] ${colors[status] || colors.Draft}`}>
        {status}
      </span>
    );
  };

  return (
    <section className="rounded-xl border border-white/[0.06] p-6">
      <h2 className="luxury-label text-[10px] text-white/50">{t("invoice")}</h2>

      {!invoice ? (
        <div className="mt-4">
          <p className="text-sm text-white/50">{t("no_invoice")}</p>
          <button
            type="button"
            disabled={loading}
            onClick={handleCreate}
            className="btn-secondary mt-4 h-12 rounded-button border border-white/[0.06] bg-surface px-5 text-sm font-medium text-white transition hover:bg-bg disabled:opacity-50"
            aria-label={t("create_invoice")}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-gold border-t-transparent" />
                {t("creating")}
             </span>
            ) : (
              <span className="flex items-center gap-2">
                <span></span> {t("create_invoice")}
             </span>
            )}
         </button>
          {error && <p className="mt-2 text-xs text-burgundy" role="alert">{error}</p>}
      </div>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/50">{t("invoice_number")}</p>
              <p className="font-mono text-sm font-medium text-white">{invoice.invoiceNumber}</p>
          </div>
            {statusBadge(invoice.status)}
        </div>

          <div>
            <p className="text-xs text-white/50">{t("created")}</p>
            <p className="text-sm text-white">
              {new Date(invoice.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {invoice.status === "Cancelled" ? (
            <div className="rounded-[14px] border border-burgundy/20 bg-burgundy/5 p-4 text-center">
              <p className="text-sm font-medium text-burgundy">{t("invoice_cancelled")}</p>
          </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={handleDownload}
                className="btn-primary h-12 flex-1 rounded-button bg-burgundy px-4 text-xs font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-burgundy-dark disabled:opacity-50"
                aria-label={t("download_invoice_aria", { number: invoice.invoiceNumber })}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {t("loading")}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    {t("download_pdf")}
                  </span>
                )}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handlePrint}
                className="btn-secondary h-12 flex-1 rounded-button border border-white/[0.06] bg-surface px-4 text-xs font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-bg disabled:opacity-50"
                aria-label={t("print_invoice_aria", { number: invoice.invoiceNumber })}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 6 2 18 2 18 9" />
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <rect x="6" y="14" width="12" height="8" />
                  </svg>
                  {t("print")}
                </span>
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleCancel}
                className="h-12 flex-1 rounded-button border border-burgundy/20 bg-burgundy/5 px-4 text-xs font-semibold uppercase tracking-[0.1em] text-burgundy transition hover:bg-burgundy/10 disabled:opacity-50"
                aria-label={t("cancel_invoice_aria", { number: invoice.invoiceNumber })}
              >
                {t("cancel_invoice")}
              </button>
            </div>
          )}

          {error && <p className="text-xs text-red-400" role="alert">{error}</p>}
        </div>
      )}
    </section>
  );
}
