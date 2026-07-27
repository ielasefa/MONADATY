"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";

type Props = {
  orderId: string;
};

export function CustomerInvoiceDownload({ orderId }: Props) {
  const { t } = useTranslation("invoice");
  const [invoice, setInvoice] = useState<{ id: string; invoiceNumber: string; status: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/invoices/by-order?orderId=${orderId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.invoice) setInvoice(data.invoice);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [orderId]);

  if (loading) return null;
  if (!invoice || invoice.status !== "Issued") return null;

  return (
    <div className="rounded-md border border-ivory/[0.06] bg-black-surface p-6 md:p-8">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <div className="flex h-14 w-14 items-center justify-center rounded-md bg-ivory/[0.04]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C6A15B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-display text-lg font-semibold text-ivory">{t("invoice_available")}</p>
          <p className="text-sm text-ivory/35">
            {t("invoice_ready", { number: invoice.invoiceNumber })}
          </p>
        </div>
        <a
          href={`/api/public/invoices/download?token=${invoice.id}`}
          className="btn-primary h-12 rounded-md px-6 text-xs font-semibold uppercase tracking-[0.1em]"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {t("download_pdf")}
          </span>
        </a>
      </div>
    </div>
  );
}
