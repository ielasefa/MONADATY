"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import type { StoredOrder } from "@/types";
import Link from "next/link";
import { STATUS_COLORS, getPaymentMethodLabel, PAYMENT_STATUSES } from "@/lib/config";
import { useTranslation } from "@/hooks/useTranslation";
import { OrderStatusWorkflow } from "@/components/admin/OrderStatusWorkflow";
import { OrderTimeline } from "@/components/OrderTimeline";
import { InvoicePanel } from "@/components/admin/InvoicePanel";

function toDateInputValue(iso: string): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { t } = useTranslation("admin");
  const [order, setOrder] = useState<StoredOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [dateSaved, setDateSaved] = useState(false);
  const [deliveryCompany, setDeliveryCompany] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [actualDeliveryDate, setActualDeliveryDate] = useState("");
  const [invoice, setInvoice] = useState<{
    id: string;
    invoiceNumber: string;
    orderId: string;
    status: string;
    pdfPath: string | null;
    createdAt: string;
  } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/orders/get?id=${id}`).then((r) => r.json()),
      fetch(`/api/admin/invoices/by-order?orderId=${id}`).then((r) => r.json().catch(() => ({}))),
    ])
      .then(([orderData, invoiceData]) => {
        const o = orderData.order as StoredOrder | null;
        setOrder(o);
        if (invoiceData.invoice) {
          setInvoice(invoiceData.invoice);
        }
        if (o) {
          setDeliveryDate(toDateInputValue(o.estimatedDelivery));
          setDeliveryCompany(o.deliveryCompany || "");
          setTrackingNumber(o.trackingNumber || "");
          setDeliveryNotes(o.deliveryNotes || "");
          setActualDeliveryDate(toDateInputValue(o.actualDeliveryDate));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const refreshOrder = useCallback(async () => {
    const res = await fetch(`/api/orders/get?id=${id}`);
    const data = await res.json();
    const o = data.order as StoredOrder | null;
    if (o) {
      setOrder(o);
      setDeliveryDate(toDateInputValue(o.estimatedDelivery));
      setDeliveryCompany(o.deliveryCompany || "");
      setTrackingNumber(o.trackingNumber || "");
      setDeliveryNotes(o.deliveryNotes || "");
      setActualDeliveryDate(toDateInputValue(o.actualDeliveryDate));
    }
  }, [id]);

  const updateStatus = useCallback(async (field: "orderStatus" | "paymentStatus", value: string) => {
    if (!order) return;
    setUpdating(true);
    try {
      const res = await fetch("/api/orders/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.id, [field]: value }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
      }
    } catch {
      // ignore
    }
    setUpdating(false);
  }, [order]);

  async function saveDeliveryDate() {
    if (!order) return;
    setUpdating(true);
    try {
      const res = await fetch("/api/orders/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.id, estimatedDelivery: deliveryDate }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
        setDateSaved(true);
        setTimeout(() => setDateSaved(false), 2000);
      }
    } catch {
      // ignore
    }
    setUpdating(false);
  }

  async function saveDeliveryField(field: string, value: string) {
    if (!order) return;
    setUpdating(true);
    try {
      const res = await fetch("/api/orders/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.id, [field]: value }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
      }
    } catch {
      // ignore
    }
    setUpdating(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20" role="status">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        <span className="sr-only">{t("loading_order")}</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="container-shell mx-auto px-6 py-10">
          <div className="glass rounded-card border border-white/[0.06] p-10 text-center">
            <p className="text-sm text-muted">{t("order_not_found_admin")}</p>
            <Link href="/admin/orders" className="mt-4 inline-flex items-center text-sm text-gold hover:underline">
              {t("back_to_orders")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const estimatedDate = order.estimatedDelivery
    ? new Date(order.estimatedDelivery).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "\u2014";

  const actualDate = order.actualDeliveryDate
    ? new Date(order.actualDeliveryDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : t("not_delivered");

  const paymentMethodLabel = getPaymentMethodLabel(order.paymentMethod);

  return (
    <div className="min-h-screen bg-bg">
      <div className="container-shell mx-auto px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/admin/orders" className="text-sm text-muted transition hover:text-white">
              {t("back_to_orders")}
            </Link>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-white">{order.orderNumber}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.15em] ${STATUS_COLORS[order.orderStatus] || ""}`}>
              {order.orderStatus.replace(/_/g, " ")}
            </span>
            <button
              onClick={refreshOrder}
              className="btn-secondary h-12 rounded-button border border-white/[0.06] bg-card px-4 text-sm text-muted transition hover:bg-surface hover:text-white"
              aria-label={t("refresh_data")}
            >
              {t("refresh")}
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="glass rounded-card border border-white/[0.06] p-6">
              <h2 className="luxury-label text-[10px] text-muted">{t("order_items")}</h2>
              <div className="mt-4 divide-y divide-white/[0.06]">
                {order.items.map((item, idx) => (
                  <div key={`${item.productId}-${idx}`} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3 min-w-0">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt={item.name} className="h-10 w-10 shrink-0 rounded-[12px] bg-white/5 object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-white/5 text-[0.55rem] font-bold tracking-[0.15em] text-white/30">
                          {item.name.split(" ").slice(0, 2).map((s) => s[0]).join("")}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">{item.name}</p>
                        <p className="text-sm text-muted">{t("unit_label")} {item.quantity} \u00D7 {item.unitPrice}</p>
                      </div>
                    </div>
                    <p className="shrink-0 font-medium text-white">{item.totalPrice}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-2 border-t border-white/[0.06] pt-5">
                <div className="flex items-center justify-between text-sm text-muted">
                  <span>{t("subtotal")}</span>
                  <span>{order.subtotal}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted">
                  <span>{t("tax")}</span>
                  <span>{order.tax}</span>
                </div>
                <div className="divider-gold flex items-center justify-between border-t border-gold/20 pt-3 text-base font-medium text-white">
                  <span>{t("total")}</span>
                  <span className="font-display text-lg font-semibold text-gold">{order.total}</span>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="glass rounded-card border border-white/[0.06] p-6">
              <h2 className="luxury-label text-[10px] text-muted">{t("customer_section")}</h2>
              <div className="mt-3 space-y-3">
                <div>
                  <p className="text-xs text-muted">{t("name_label")}</p>
                  <p className="text-sm font-medium text-white">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">{t("email_label")}</p>
                  <p className="text-sm text-white">{order.customerEmail}</p>
                </div>
                {order.phone ? (
                  <div>
                    <p className="text-xs text-muted">{t("phone_label_customer")}</p>
                    <p className="text-sm text-white">{order.phone}</p>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="glass rounded-card border border-white/[0.06] p-6">
              <h2 className="luxury-label text-[10px] text-muted">{t("shipping_section")}</h2>
              <div className="mt-3 space-y-2">
                <p className="text-sm text-white">{order.address || "\u2014"}</p>
                <p className="text-sm text-muted">
                  {[order.city, order.postalCode, order.country].filter(Boolean).join(", ") || "\u2014"}
                </p>
              </div>
            </section>

            <section className="glass rounded-card border border-white/[0.06] p-6">
              <h2 className="luxury-label text-[10px] text-muted">{t("status_section")}</h2>
              <div className="mt-4 space-y-4">
                <OrderStatusWorkflow
                  orderStatus={order.orderStatus}
                  updating={updating}
                  onUpdateStatus={(status) => updateStatus("orderStatus", status)}
                />
                <fieldset>
                  <legend className="text-xs text-muted">{t("payment_status_section")}</legend>
                  <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label={t("payment_status", "Payment status")}>
                    {PAYMENT_STATUSES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        disabled={updating || order.paymentStatus === s}
                        onClick={() => updateStatus("paymentStatus", s)}
                        className={`rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.15em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 ${
                          order.paymentStatus === s
                            ? `${STATUS_COLORS[s]} cursor-default`
                            : "bg-white/5 text-muted hover:bg-white/10"
                        } disabled:opacity-50`}
                        aria-pressed={order.paymentStatus === s}
                        aria-label={`Set payment status to ${s}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>
            </section>

            <section className="glass rounded-card border border-white/[0.06] p-6">
              <h2 className="luxury-label text-[10px] text-muted">{t("delivery_tracking")}</h2>
              <div className="mt-3 space-y-4">
                <div>
                  <label htmlFor="tracking-number" className="text-xs text-muted">{t("tracking_number")}</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      id="tracking-number"
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder={t("tracking_placeholder")}
                      className="input-premium h-12 flex-1 rounded-input border border-white/[0.06] bg-surface px-3 text-sm text-white outline-none transition focus:border-gold/40 focus:ring-1 focus:ring-gold/20"
                      aria-label={t("tracking_number")}
                    />
                    <button
                      type="button"
                      disabled={updating || trackingNumber === (order.trackingNumber || "")}
                      onClick={() => saveDeliveryField("trackingNumber", trackingNumber)}
                      className="btn-primary h-12 rounded-button bg-burgundy px-4 text-xs font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-burgundy/90 disabled:opacity-50"
                      aria-label={t("save")}
                    >
                      {t("save")}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="delivery-company" className="text-xs text-muted">{t("delivery_company")}</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      id="delivery-company"
                      type="text"
                      value={deliveryCompany}
                      onChange={(e) => setDeliveryCompany(e.target.value)}
                      placeholder={t("company_placeholder")}
                      className="input-premium h-12 flex-1 rounded-input border border-white/[0.06] bg-surface px-3 text-sm text-white outline-none transition focus:border-gold/40 focus:ring-1 focus:ring-gold/20"
                      aria-label={t("delivery_company")}
                    />
                    <button
                      type="button"
                      disabled={updating || deliveryCompany === (order.deliveryCompany || "")}
                      onClick={() => saveDeliveryField("deliveryCompany", deliveryCompany)}
                      className="btn-primary h-12 rounded-button bg-burgundy px-4 text-xs font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-burgundy/90 disabled:opacity-50"
                      aria-label={t("save")}
                    >
                      {t("save")}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="delivery-notes" className="text-xs text-muted">{t("delivery_notes")}</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      id="delivery-notes"
                      type="text"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder={t("notes_placeholder")}
                      className="input-premium h-12 flex-1 rounded-input border border-white/[0.06] bg-surface px-3 text-sm text-white outline-none transition focus:border-gold/40 focus:ring-1 focus:ring-gold/20"
                      aria-label={t("delivery_notes")}
                    />
                    <button
                      type="button"
                      disabled={updating || deliveryNotes === (order.deliveryNotes || "")}
                      onClick={() => saveDeliveryField("deliveryNotes", deliveryNotes)}
                      className="btn-primary h-12 rounded-button bg-burgundy px-4 text-xs font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-burgundy/90 disabled:opacity-50"
                      aria-label={t("save")}
                    >
                      {t("save")}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="actual-delivery-date" className="text-xs text-muted">{t("actual_delivery_date")}</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      id="actual-delivery-date"
                      type="date"
                      value={actualDeliveryDate}
                      onChange={(e) => setActualDeliveryDate(e.target.value)}
                      className="input-premium h-12 flex-1 rounded-input border border-white/[0.06] bg-surface px-3 text-sm text-white outline-none transition focus:border-gold/40 focus:ring-1 focus:ring-gold/20"
                      aria-label={t("actual_delivery_date")}
                    />
                    <button
                      type="button"
                      disabled={updating || actualDeliveryDate === toDateInputValue(order.actualDeliveryDate)}
                      onClick={() => saveDeliveryField("actualDeliveryDate", actualDeliveryDate)}
                      className="btn-primary h-12 rounded-button bg-burgundy px-4 text-xs font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-burgundy/90 disabled:opacity-50"
                      aria-label={t("save")}
                    >
                      {t("save")}
                    </button>
                  </div>
                </div>
              </div>
              {order.trackingNumber ? (
                <div className="mt-3 rounded-[14px] bg-white/[0.03] p-3">
                  <p className="text-xs text-muted">{t("current_tracking")}</p>
                  <p className="text-sm font-medium text-white">{order.trackingNumber}</p>
                  {order.deliveryCompany ? <p className="text-xs text-muted">{order.deliveryCompany}</p> : null}
                  {order.deliveryNotes ? <p className="mt-1 text-xs text-muted">{order.deliveryNotes}</p> : null}
                </div>
              ) : null}
            </section>

            <section className="glass rounded-card border border-white/[0.06] p-6">
              <h2 className="luxury-label text-[10px] text-muted">{t("estimated_delivery")}</h2>
              <div className="mt-3 space-y-3">
                <div>
                  <p className="text-xs text-muted">{t("current")}</p>
                  <p className="text-sm text-white">{estimatedDate}</p>
                </div>
                <div>
                  <label htmlFor="delivery-date" className="text-xs text-muted">{t("update_date")}</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      id="delivery-date"
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => { setDeliveryDate(e.target.value); setDateSaved(false); }}
                      className="input-premium h-12 flex-1 rounded-input border border-white/[0.06] bg-surface px-3 text-sm text-white outline-none transition focus:border-gold/40 focus:ring-1 focus:ring-gold/20"
                      aria-label={t("estimated_delivery")}
                    />
                    <button
                      type="button"
                      disabled={updating || !deliveryDate}
                      onClick={saveDeliveryDate}
                      className="btn-primary h-12 rounded-button bg-burgundy px-4 text-xs font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-burgundy/90 disabled:opacity-50"
                      aria-label={t("save")}
                    >
                      {dateSaved ? t("saved_label") : t("save")}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="glass rounded-card border border-white/[0.06] p-6">
              <h2 className="luxury-label text-[10px] text-muted">{t("details")}</h2>
              <div className="mt-3 space-y-3">
                <div>
                  <p className="text-xs text-muted">{t("order_date")}</p>
                  <p className="text-sm text-white">{orderDate}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">{t("payment_method")}</p>
                  <p className="text-sm text-white">{paymentMethodLabel}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">{t("actual_delivery")}</p>
                  <p className="text-sm text-white">{actualDate}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">{t("currency")}</p>
                  <p className="text-sm text-white">{order.currency}</p>
                </div>
              </div>
            </section>

            <InvoicePanel orderId={order.id} initialInvoice={invoice} />

            <section className="glass rounded-card border border-white/[0.06] p-6">
              <OrderTimeline
                orderStatus={order.orderStatus}
                updatedAt={order.updatedAt}
                createdAt={order.createdAt}
                actualDeliveryDate={order.actualDeliveryDate}
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
