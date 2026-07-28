import Link from "next/link";
import { getOrderByNumber } from "@/lib/orders";
import { getPaymentMethodLabel } from "@/lib/config";
import { loadTranslations, t, getLanguage } from "@/lib/translations";
import { SuccessClient } from "./SuccessClient";
import { OrderTimeline } from "@/components/OrderTimeline";
import { CustomerInvoiceDownload } from "@/components/customer/InvoiceDownload";
import { FadeIn } from "@/components/MotionWrappers";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ order?: string }>;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function SuccessPage({ searchParams }: Props) {
  const lang = await getLanguage();
  const translations = await loadTranslations("success");
  const params = await searchParams;
  const orderNumber = params.order;
  const order = orderNumber ? await getOrderByNumber(orderNumber) : undefined;

  if (!order) {
    return (
      <div className="container-premium flex min-h-[calc(100vh-10rem)] items-center justify-center py-16 md:py-24">
        <FadeIn>
          <section className="relative max-w-xl px-6 py-20 text-center md:px-12 md:py-24">
<div className="relative mx-auto max-w-md space-y-8">
  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-md border border-burgundy/[0.08] bg-burgundy/[0.04] text-burgundy">
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
 </div>
  <h1 className="font-display text-3xl text-ivory md:text-4xl">{t(translations, "order_not_found_title", lang)}</h1>
  <p className="text-[0.82rem] text-ivory/22">{t(translations, "order_not_found_desc", lang)}</p>
              <Link href="/" className="btn-primary mt-4 inline-flex h-11 items-center justify-center rounded-md px-7 text-[0.65rem] font-semibold uppercase tracking-[0.14em]" aria-label={t(translations, "return_home", lang)}>
                {t(translations, "return_home", lang)}
              </Link>
            </div>
          </section>
        </FadeIn>
      </div>
    );
  }

  const orderDate = formatDate(order.createdAt);
  const estimatedDate = formatDate(order.estimatedDelivery);
  const paymentMethodLabel = getPaymentMethodLabel(order.paymentMethod);
  const actualDateDisplay = order.actualDeliveryDate ? formatDate(order.actualDeliveryDate) : null;

  return (
    <div className="container-premium py-16 md:py-24 lg:py-32">
      <div className="mx-auto max-w-3xl space-y-12 md:space-y-16">

        {/* Success Hero — editorial, restrained */}
        <FadeIn>
          <section className="relative px-6 py-16 text-center md:px-12 md:py-20">
            <div className="relative mx-auto max-w-2xl space-y-8">
              <SuccessClient />

              <div className="space-y-4">
                <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-[0.9] tracking-[-0.03em] text-ivory">{t(translations, "order_confirmed_title", lang)}</h1>
                <p className="mx-auto max-w-md text-[0.82rem] leading-[1.9] text-ivory/22">
                  {t(translations, "order_confirmed_desc", lang)}
               </p>
              </div>

              <div className="inline-flex items-center gap-3 rounded-md border border-ivory/[0.04] bg-ivory/[0.015] px-5 py-2.5">
                <span className="text-[0.55rem] uppercase tracking-[0.2em] text-ivory/22">{t(translations, "order_label", lang)}</span>
                <span className="font-mono text-[0.85rem] font-semibold text-ivory">{order.orderNumber}</span>
              </div>
            </div>
          </section>
        </FadeIn>

        {/* Gold divider */}
        <div className="mx-auto h-px w-12 bg-gold/12" />

        {/* Delivery Timeline */}
        <FadeIn delay={0.1}>
          <section className="space-y-6">
            <OrderTimeline
              orderStatus={order.orderStatus}
              updatedAt={order.updatedAt}
              createdAt={order.createdAt}
              actualDeliveryDate={order.actualDeliveryDate}
            />
          </section>
        </FadeIn>

        {/* Delivery Status Highlight */}
        <FadeIn delay={0.2}>
          <section className="space-y-6 text-center">
            {order.orderStatus === "delivered" || order.orderStatus === "completed" ? (
              <>
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-ivory/22">{t(translations, "delivered_on", lang)}</p>
                <p className="text-2xl font-medium text-ivory md:text-3xl">
                  {order.actualDeliveryDate ? formatDate(order.actualDeliveryDate) : estimatedDate}
              </p>
             </>
            ) : order.orderStatus === "out_for_delivery" ? (
              <>
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-ivory/22">{t(translations, "out_for_delivery", lang)}</p>
                <p className="text-xl font-medium text-ivory md:text-2xl">
                  {t(translations, "arriving_today", lang).replace("{date}", estimatedDate)}
              </p>
             </>
            ) : (
              <>
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-ivory/22">{t(translations, "estimated_delivery", lang)}</p>
                <p className="text-2xl font-medium text-ivory md:text-3xl">{estimatedDate}</p>
             </>
            )}
            <p className="text-[0.78rem] text-ivory/25">
              {order.orderStatus === "delivered" || order.orderStatus === "completed"
                ? t(translations, "package_delivered", lang)
                : order.orderStatus === "out_for_delivery"
                  ? t(translations, "package_on_way", lang)
                  : order.orderStatus === "cancelled"
                    ? t(translations, "order_cancelled", lang)
                    : t(translations, "notify_when_ships", lang)}
            </p>
            {order.deliveryCompany && order.trackingNumber ? (
              <p className="mt-2 text-[0.75rem] text-ivory/40">
                {order.deliveryCompany}: {order.trackingNumber}
             </p>
            ) : order.trackingNumber ? (
              <p className="mt-2 text-[0.75rem] text-ivory/40">
                {t(translations, "tracking_label", lang)}: {order.trackingNumber}
             </p>
            ) : null}
          </section>
        </FadeIn>

        {/* Invoice */}
        <FadeIn delay={0.25}>
          <CustomerInvoiceDownload orderId={order.id} />
        </FadeIn>

        {/* Order Details Grid — minimal, clean */}
        <FadeIn delay={0.3}>
          <section className="space-y-6">
            <p className="text-[0.48rem] uppercase tracking-[0.22em] text-ivory/15">{t(translations, "order_details", lang)}</p>
            <div className="h-px w-full bg-ivory/[0.03]" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <p className="text-[0.55rem] text-ivory/15">{t(translations, "order_number", lang)}</p>
                <p className="font-mono text-[0.78rem] font-medium text-ivory">{order.orderNumber}</p>
             </div>
              <div className="space-y-1.5">
                <p className="text-[0.55rem] text-ivory/15">{t(translations, "date", lang)}</p>
                <p className="text-[0.78rem] font-medium text-ivory">{orderDate}</p>
             </div>
              <div className="space-y-1.5">
                <p className="text-[0.55rem] text-ivory/15">{t(translations, "payment_method", lang)}</p>
                <p className="text-[0.78rem] font-medium text-ivory">{paymentMethodLabel}</p>
             </div>
              <div className="space-y-1.5">
                <p className="text-[0.55rem] text-ivory/15">{t(translations, "delivery_status", lang)}</p>
                <p><span className="inline-flex rounded-md border border-ivory/[0.04] bg-ivory/[0.02] px-3 py-1 text-[0.52rem] font-semibold uppercase tracking-[0.2em] text-gold/60">{order.orderStatus}</span></p>
             </div>
              <div className="space-y-1.5">
                <p className="text-[0.55rem] text-ivory/15">{t(translations, "estimated_delivery", lang)}</p>
                <p className="text-[0.78rem] font-medium text-ivory">{estimatedDate}</p>
             </div>
              <div className="space-y-1.5">
                <p className="text-[0.55rem] text-ivory/15">{t(translations, "payment_status", lang)}</p>
                <p>
                  <span className={`inline-flex rounded-md px-3 py-1 text-[0.52rem] font-semibold uppercase tracking-[0.2em] ${order.paymentStatus === "paid" ? "border border-gold/[0.12] bg-gold/[0.04] text-gold/60" : "border border-ivory/[0.04] bg-ivory/[0.02] text-ivory/40"}`}>
                    {order.paymentStatus}
                  </span>
                </p>
              </div>
            </div>
          </section>
        </FadeIn>

        {/* Customer & Shipping */}
        <FadeIn delay={0.35}>
          <section className="space-y-6">
            <p className="text-[0.48rem] uppercase tracking-[0.22em] text-ivory/15">{t(translations, "customer_shipping", lang)}</p>
            <div className="h-px w-full bg-ivory/[0.03]" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <p className="text-[0.55rem] text-ivory/15">{t(translations, "customer", lang)}</p>
                <p className="text-[0.78rem] font-medium text-ivory">{order.customerName}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[0.55rem] text-ivory/15">{t(translations, "email", lang)}</p>
                <p className="text-[0.78rem] text-ivory/40">{order.customerEmail}</p>
              </div>
              {order.phone && (
                <div className="space-y-1.5">
                  <p className="text-[0.55rem] text-ivory/15">{t(translations, "phone", lang)}</p>
                  <p className="text-[0.78rem] text-ivory/40">{order.phone}</p>
                </div>
              )}
              {order.address && (
                <div className="space-y-1.5 lg:col-span-2">
                  <p className="text-[0.55rem] text-ivory/15">{t(translations, "shipping_address", lang)}</p>
                  <p className="text-[0.78rem] text-ivory/40">{order.address}</p>
                  {(order.city || order.postalCode) && (
                    <p className="text-[0.65rem] text-ivory/22">
                      {[order.city, order.postalCode, order.country].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              )}
              {order.deliveryCompany && (
                <div className="space-y-1.5">
                  <p className="text-[0.55rem] text-ivory/15">{t(translations, "delivery_company", lang)}</p>
                  <p className="text-[0.78rem] text-ivory/40">{order.deliveryCompany}</p>
                </div>
              )}
              {order.trackingNumber && (
                <div className="space-y-1.5">
                  <p className="text-[0.55rem] text-ivory/15">{t(translations, "tracking_number", lang)}</p>
                  <p className="font-mono text-[0.78rem] text-ivory/40">{order.trackingNumber}</p>
                </div>
              )}
              {actualDateDisplay && (
                <div className="space-y-1.5">
                  <p className="text-[0.55rem] text-ivory/15">{t(translations, "actual_delivery", lang)}</p>
                  <p className="text-[0.78rem] text-ivory/40">{actualDateDisplay}</p>
                </div>
              )}
              {order.deliveryNotes && (
                <div className="space-y-1.5">
                  <p className="text-[0.55rem] text-ivory/15">{t(translations, "delivery_notes", lang)}</p>
                  <p className="text-[0.78rem] text-ivory/40">{order.deliveryNotes}</p>
                </div>
              )}
            </div>
          </section>
        </FadeIn>

        {/* Order Summary — editorial */}
        <FadeIn delay={0.4}>
          <section className="space-y-6">
            <p className="text-[0.48rem] uppercase tracking-[0.22em] text-ivory/15">{t(translations, "order_summary", lang)}</p>

            <div className="divide-y divide-ivory/[0.03]">
              {order.items.map((item: { productId: string; name: string; image: string; quantity: number; unitPrice: string; totalPrice: string }, idx: number) => (
                <div key={`${item.productId}-${idx}`} className="flex items-center justify-between gap-5 py-5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-5 min-w-0">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} className="h-16 w-16 shrink-0 rounded-md bg-black-surface object-contain" />
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-black-surface text-[0.55rem] font-semibold tracking-[0.2em] text-ivory/15">
                        {item.name.split(" ").slice(0, 2).map((s) => s[0]).join("")}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-display text-[0.82rem] text-ivory">{item.name}</p>
                      <p className="mt-1 text-[0.6rem] text-ivory/22">{t(translations, "qty_label", lang).replace("{qty}", String(item.quantity)).replace("{price}", item.unitPrice)}</p>
                    </div>
                  </div>
                  <p className="shrink-0 text-[0.82rem] font-semibold text-ivory">{item.totalPrice}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 border-t border-ivory/[0.03] pt-5">
              <div className="flex items-center justify-between text-[0.72rem] text-ivory/28">
                <span>{t(translations, "subtotal", lang)}</span>
                <span>{order.subtotal}</span>
              </div>
              <div className="flex items-center justify-between text-[0.72rem] text-ivory/28">
                <span>{t(translations, "tax", lang)}</span>
                <span>{order.tax}</span>
              </div>
              <div className="flex items-center justify-between border-t border-ivory/[0.03] pt-4">
                <span className="text-[0.72rem] font-medium text-ivory">{t(translations, "total", lang)}</span>
                <span className="text-xl font-semibold text-ivory">{order.total}</span>
              </div>
            </div>
          </section>
        </FadeIn>

        {/* CTA Buttons — restrained */}
        <FadeIn delay={0.45}>
          <div className="flex flex-col items-center justify-center gap-3 pt-8 sm:flex-row">
            <Link href="/shop" className="btn-primary h-11 w-full items-center justify-center rounded-md px-7 text-[0.65rem] font-semibold uppercase tracking-[0.14em] sm:w-auto" aria-label={t(translations, "continue_shopping", lang)}>
              {t(translations, "continue_shopping", lang)}
            </Link>
            <Link href="/collections" className="btn-secondary h-11 w-full items-center justify-center rounded-md px-7 text-[0.65rem] font-semibold uppercase tracking-[0.14em] sm:w-auto" aria-label={t(translations, "view_collections", lang)}>
              {t(translations, "view_collections", lang)}
            </Link>
            <Link href="/" className="btn-secondary h-11 w-full items-center justify-center rounded-md px-7 text-[0.65rem] font-semibold uppercase tracking-[0.14em] sm:w-auto" aria-label={t(translations, "return_home", lang)}>
              {t(translations, "return_home", lang)}
            </Link>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
