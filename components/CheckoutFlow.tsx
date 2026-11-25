"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useCart } from "@/components/cart-context";
import { formatMoney, parseMoney } from "@/lib/money";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ProductImage } from "@/components/ProductImage";
import { resolveDatabaseProductImage } from "@/lib/product-images";
import { PREMIUM_EASE } from "@/lib/motion";
import { isCheckoutCity, isValidCheckoutEmail } from "@/lib/checkout-validators";

function formatPrice(price: string, quantity: number): string {
  return formatMoney(parseMoney(price) * quantity);
}

type City = { name: string };

type CheckoutFlowProps = {
  cities?: City[];
};

function generateIdempotencyKey(): string {
  if (typeof window === "undefined") return "";
  const entropy = typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
  const key = `idem_${entropy}`;
  sessionStorage.setItem("monadaty-checkout-idem", key);
  return key;
}

function getIdempotencyKey(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem("monadaty-checkout-idem") || generateIdempotencyKey();
}

function clearIdempotencyKey() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("monadaty-checkout-idem");
  }
}

const MOROCCAN_PHONE_REGEX = /^(\+212|0)([5-7]\d{8})$/;

function validateMoroccanPhone(phone: string): boolean {
  return MOROCCAN_PHONE_REGEX.test(phone.replace(/\s/g, ""));
}

const MOROCCAN_POSTAL_REGEX = /^\d{5}$/;

function validatePostalCode(code: string): boolean {
  return code === "" || MOROCCAN_POSTAL_REGEX.test(code);
}

type DeliveryState = {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  postalCode: string;
};

type DeliveryErrors = Partial<Record<keyof DeliveryState, string>>;

type CheckoutErrorCode =
  | "VALIDATION_ERROR"
  | "PRODUCT_UNAVAILABLE"
  | "OUT_OF_STOCK"
  | "COUPON_INVALID"
  | "RATE_LIMITED"
  | "ORDER_CREATE_FAILED";

const checkoutErrorCopy = {
  en: {
    validation: "Please review your delivery details and try again.",
    unavailable: "One of your drinks is no longer available. Please return to your cart and update it.",
    stock: "Stock changed while you were checking out. Please return to your cart and adjust the quantity.",
    coupon: "This offer is no longer valid. Please review your order and try again.",
    retry: "We could not confirm the response. Retry safely — the same order will not be created twice.",
    session: "Your checkout session expired. Please refresh the page and try again.",
    retryButton: "Retry confirmation",
  },
  fr: {
    validation: "Vérifiez vos informations de livraison, puis réessayez.",
    unavailable: "Une boisson n’est plus disponible. Revenez au panier pour le mettre à jour.",
    stock: "Le stock a changé pendant votre commande. Revenez au panier pour ajuster la quantité.",
    coupon: "Cette offre n’est plus valide. Vérifiez votre commande, puis réessayez.",
    retry: "La réponse n’a pas pu être confirmée. Réessayez sans risque : la commande ne sera pas créée deux fois.",
    session: "Votre session de commande a expiré. Actualisez la page, puis réessayez.",
    retryButton: "Vérifier la commande",
  },
  ar: {
    validation: "يرجى مراجعة معلومات التوصيل ثم المحاولة من جديد.",
    unavailable: "أحد المشروبات لم يعد متوفراً. ارجع إلى السلة لتحديثها.",
    stock: "تغيّر المخزون أثناء الطلب. ارجع إلى السلة لتعديل الكمية.",
    coupon: "هذا العرض لم يعد صالحاً. راجع طلبك ثم حاول من جديد.",
    retry: "تعذر تأكيد الاستجابة. أعد المحاولة بأمان، ولن يتم إنشاء الطلب مرتين.",
    session: "انتهت جلسة الطلب. حدّث الصفحة ثم حاول من جديد.",
    retryButton: "التحقق من الطلب",
  },
} as const;

const emptyDeliveryState: DeliveryState = {
  fullName: "",
  email: "",
  phone: "",
  city: "",
  address: "",
  postalCode: "",
};

export function CheckoutFlow({ cities = [] }: CheckoutFlowProps) {
  const router = useRouter();
  const { clearCart, items, openDrawer } = useCart();
  const [deliveryState, setDeliveryState] = useState<DeliveryState>(emptyDeliveryState);
  const [errors, setErrors] = useState<DeliveryErrors>({});
  const [submissionError, setSubmissionError] = useState("");
  const [canRetryConfirmation, setCanRetryConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionLock = useRef(false);
  const shouldReduce = useReducedMotion();
  const { t, lang } = useTranslation("checkout");
  const errorCopy = checkoutErrorCopy[lang];
  const deliveryCities = cities.filter((city) => isCheckoutCity(city.name));

  const subtotalValue = useMemo(
    () => items.reduce((total, item) => total + parseMoney(item.price) * item.quantity, 0),
    [items],
  );

  const taxValue = useMemo(() => subtotalValue * 0.08, [subtotalValue]);
  const totalValue = subtotalValue + taxValue;

  const lineItems = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        lineTotal: formatPrice(item.price, item.quantity),
      })),
    [items],
  );

  function handleChange(field: keyof DeliveryState, value: string) {
    setDeliveryState((currentState) => ({ ...currentState, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
    setSubmissionError("");
    setCanRetryConfirmation(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submissionLock.current) return;
    if (!items.length) return;

    const nextErrors: DeliveryErrors = {};

    const requiredFields: Array<keyof DeliveryState> = ["fullName", "phone", "city", "address"];
    requiredFields.forEach((field) => {
      if (deliveryState[field].trim().length === 0) {
        nextErrors[field] = t("required_field");
      }
    });

    // Explicit address guard — belt-and-suspenders on top of the loop above
    if (!deliveryState.address.trim()) {
      nextErrors.address = t("required_field");
    }

    if (!isValidCheckoutEmail(deliveryState.email)) {
      nextErrors.email = t("invalid_email");
    }
    if (!deliveryCities.some((city) => city.name === deliveryState.city)) {
      nextErrors.city = t("select_city");
    }

    if (deliveryState.phone && !validateMoroccanPhone(deliveryState.phone)) {
      nextErrors.phone = t("invalid_phone");
    }

    if (deliveryState.postalCode && !validatePostalCode(deliveryState.postalCode)) {
      nextErrors.postalCode = t("invalid_postal");
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      const firstField = Object.keys(nextErrors)[0];
      const firstEl = event.currentTarget.querySelector<HTMLElement>(`[name="${firstField}"]`);
      firstEl?.focus();
      firstEl?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const idempotencyKey = getIdempotencyKey();
    if (!idempotencyKey) {
      setSubmissionError(errorCopy.session);
      return;
    }

    submissionLock.current = true;
    setIsSubmitting(true);
    setSubmissionError("");
    setCanRetryConfirmation(false);

    const body = {
      customerName: deliveryState.fullName.trim(),
      customerEmail: deliveryState.email.trim(),
      phone: deliveryState.phone.trim(),
      address: deliveryState.address.trim(),
      city: deliveryState.city.trim(),
      postalCode: deliveryState.postalCode.trim(),
      country: "Morocco",
      paymentMethod: "cash_on_delivery",
      shippingMethod: "delivery",
      idempotencyKey,
      subtotal: formatMoney(subtotalValue),
      shipping: "0.00 DH",
      tax: formatMoney(taxValue),
      total: formatMoney(totalValue),
      items: items.map((item) => ({
        productId: item.id,
        name: item.name,
        slug: item.slug || item.id,
        image: resolveDatabaseProductImage(item),
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: formatPrice(item.price, item.quantity),
      })),
    };

    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { code?: CheckoutErrorCode };
        const message =
          err.code === "OUT_OF_STOCK"
            ? errorCopy.stock
            : err.code === "PRODUCT_UNAVAILABLE"
              ? errorCopy.unavailable
              : err.code === "COUPON_INVALID"
                ? errorCopy.coupon
                : err.code === "VALIDATION_ERROR"
                  ? errorCopy.validation
                  : errorCopy.retry;
        setSubmissionError(message);
        setCanRetryConfirmation(
          err.code === "ORDER_CREATE_FAILED" || err.code === "RATE_LIMITED" || res.status >= 500,
        );
        submissionLock.current = false;
        setIsSubmitting(false);
        return;
      }

      const data = await res.json();
      clearIdempotencyKey();
      clearCart();
      router.push(
        `/success?order=${encodeURIComponent(data.order.orderNumber)}&key=${encodeURIComponent(idempotencyKey)}`,
      );
    } catch {
      setSubmissionError(errorCopy.retry);
      setCanRetryConfirmation(true);
      submissionLock.current = false;
      setIsSubmitting(false);
    }
  }

  if (!items.length) {
    return (
      <motion.div
        initial={shouldReduce ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: shouldReduce ? 0 : 0.6, ease: PREMIUM_EASE }}
        className="flex min-h-[60vh] items-center justify-center"
      >
        <div className="max-w-lg text-center">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-line bg-card">
            <svg className="h-8 w-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121 0 2.09-.773 2.34-1.872l1.836-8.046A1.125 1.125 0 0018.054 3H5.106m2.394 11.25l-1.5-6h13.5" />
            </svg>
          </div>
          <h2 className="font-display text-2xl text-foreground md:text-3xl">
            {t("your_box_empty")}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-secondary">
            {t("add_drinks_before_checkout")}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/shop" className="btn-primary h-12 px-8">
              {t("explore_drinks", "Explore Drinks")}
            </Link>
            <Link href="/" className="btn-secondary h-12 px-8">
              {t("back_to_home")}
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  function renderInput(
    field: Exclude<keyof DeliveryState, "city" | "address">,
    label: string,
    type: string,
    autoComplete: string,
    placeholder: string,
    optional = false,
  ) {
    const id = field === "fullName" ? "checkout-name" : field === "postalCode" ? "checkout-postal" : `checkout-${field}`;
    const hint = field === "email" ? t("email_optional_hint") : undefined;
    return (
      <div className="checkout-field">
        <label htmlFor={id}>
          {label} {optional ? <span className="checkout-optional">({t("optional")})</span> : <span className="checkout-required" aria-hidden="true">*</span>}
        </label>
        <input
          id={id}
          name={field}
          type={type}
          autoComplete={autoComplete}
          inputMode={field === "postalCode" ? "numeric" : undefined}
          maxLength={field === "postalCode" ? 5 : field === "email" ? 254 : 160}
          value={deliveryState[field]}
          onChange={(e) => handleChange(field, e.target.value)}
          placeholder={placeholder}
          className="input-premium"
          dir={field === "phone" || field === "email" ? "ltr" : undefined}
          aria-invalid={Boolean(errors[field])}
          aria-describedby={errors[field] ? `err-${field}` : hint ? `hint-${field}` : undefined}
          required={!optional}
        />
        {errors[field] ? <p id={`err-${field}`} className="checkout-field-error">{errors[field]}</p>
          : hint && <p id={`hint-${field}`} className="checkout-field-hint">{hint}</p>}
      </div>
    );
  }

  return (
    <motion.div
      initial={shouldReduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduce ? 0 : 0.4, ease: PREMIUM_EASE }}
      className="checkout-content"
    >
      <div className="checkout-toolbar">
        <Link href="/shop" className="checkout-back">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="rtl:rotate-180"><path d="M19 12H5m7-7-7 7 7 7" /></svg>
          {t("back_to_drinks")}
        </Link>
        <span className="checkout-area"><CheckoutIcon name="pin" />{t("delivery_area")}</span>
      </div>

      <div className="checkout-grid">
        <form id="checkout-form" onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
          <fieldset disabled={isSubmitting} className="checkout-form-sections">
            <section className="checkout-card" aria-labelledby="contact-heading">
              <div className="checkout-card-heading">
                <span className="checkout-step" aria-hidden="true">01</span>
                <div><h2 id="contact-heading">{t("contact_title")}</h2><p>{t("contact_description")}</p></div>
              </div>
              <div className="checkout-fields">
                <div className="checkout-field-row">
                  {renderInput("fullName", t("full_name"), "text", "name", t("full_name_placeholder"))}
                  {renderInput("phone", t("phone"), "tel", "tel", t("phone_example"))}
                </div>
                {renderInput("email", t("email"), "email", "email", t("email_placeholder"), true)}
              </div>
            </section>

            <section className="checkout-card" aria-labelledby="delivery-heading">
              <div className="checkout-card-heading">
                <span className="checkout-step" aria-hidden="true">02</span>
                <div><h2 id="delivery-heading">{t("delivery_title")}</h2><p>{t("delivery_description")}</p></div>
              </div>
              <div className="checkout-fields">
                <div className="checkout-field-row">
                  <div className="checkout-field">
                    <label htmlFor="checkout-city">{t("city")} <span className="checkout-required" aria-hidden="true">*</span></label>
                    <select
                      id="checkout-city"
                      name="city"
                      autoComplete="address-level2"
                      value={deliveryState.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      className="input-premium"
                      aria-invalid={Boolean(errors.city)}
                      aria-describedby={errors.city ? "err-city" : "hint-city"}
                      required
                    >
                      <option value="">{t("select_city")}</option>
                      {deliveryCities.map((city) => <option key={city.name} value={city.name}>{lang === "ar" ? city.name === "Rabat" ? "الرباط" : "سلا" : city.name}</option>)}
                    </select>
                    {errors.city && <p id="err-city" className="checkout-field-error">{errors.city}</p>}
                  </div>
                  {renderInput("postalCode", t("postal_code"), "text", "postal-code", t("postal_example"), true)}
                </div>
                <div className="checkout-field">
                  <label htmlFor="checkout-address">{t("address")} <span className="checkout-required" aria-hidden="true">*</span></label>
                  <textarea
                    id="checkout-address"
                    name="address"
                    autoComplete="street-address"
                    rows={3}
                    maxLength={500}
                    value={deliveryState.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder={t("address_placeholder")}
                    className="input-premium"
                    aria-required="true"
                    aria-invalid={Boolean(errors.address)}
                    aria-describedby={errors.address ? "err-address" : undefined}
                    required
                  />
                  {errors.address && <p id="err-address" className="checkout-field-error">{errors.address}</p>}
                </div>
                <p id="hint-city" className="checkout-delivery-note"><CheckoutIcon name="pin" />{deliveryCities.length ? t("delivery_area_hint") : t("no_delivery_cities")}</p>
              </div>
            </section>

            <section className="checkout-card" aria-labelledby="payment-heading">
              <div className="checkout-card-heading">
                <span className="checkout-step" aria-hidden="true">03</span>
                <div><h2 id="payment-heading">{t("step_payment")}</h2><p>{t("payment_at_delivery")}</p></div>
              </div>
              <div className="checkout-payment">
                <span className="checkout-payment-icon"><CheckoutIcon name="wallet" /></span>
                <div><h3>{t("cash_on_delivery")}</h3><p>{t("cash_on_delivery_desc")}</p></div>
                <span className="checkout-payment-check" role="img" aria-label={t("payment_selected")}><CheckoutIcon name="check" /></span>
              </div>
            </section>
          </fieldset>
        </form>

        <aside className="checkout-summary" aria-labelledby="summary-heading">
          <div className="checkout-summary-heading">
            <div><p>MONADATY</p><h2 id="summary-heading">{t("order_summary_title")}</h2></div>
            <span className="checkout-summary-count">{items.length} {t(items.length === 1 ? "order_line" : "order_lines")}</span>
          </div>
          <div className="checkout-summary-body">
            <div className="checkout-summary-toolbar"><p>{t("checkout_review")}</p><button type="button" onClick={openDrawer} disabled={isSubmitting} aria-haspopup="dialog">{t("edit_cart")}</button></div>
            <div className="checkout-items">
              {lineItems.map((item) => (
                <div key={item.id} className="checkout-item">
                  <div className="checkout-item-image"><ProductImage product={item} alt={item.name} fill sizes="68px" className="object-contain p-2" /></div>
                  <div className="checkout-item-details">
                    {item.brand && <p className="checkout-item-brand">{item.brand}</p>}
                    <h3>{item.name}</h3>
                    <div><span>{t("qty_label")} {item.quantity}</span><span className="checkout-item-price" dir="ltr">{item.lineTotal}</span></div>
                  </div>
                </div>
              ))}
            </div>
            <dl className="checkout-totals">
              <div><dt>{t("cart_subtotal")}</dt><dd dir="ltr">{formatMoney(subtotalValue)}</dd></div>
              <div><dt>{t("tax_rate")}</dt><dd dir="ltr">{formatMoney(taxValue)}</dd></div>
              <div><dt>{t("delivery_fee")}</dt><dd className="checkout-free">{t("delivery_included")}</dd></div>
            </dl>
            <div className="checkout-grand-total"><div><p>{t("cart_total")}</p><span>{t("payment_at_delivery")}</span></div><strong dir="ltr">{formatMoney(totalValue)}</strong></div>
            {submissionError && <div role="alert" className="checkout-submission-error">{submissionError}</div>}
            <button type="submit" form="checkout-form" disabled={isSubmitting || !deliveryCities.length} className="checkout-submit btn-primary">
              {isSubmitting ? <><svg aria-hidden="true" className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>{t("confirming")}</> : <>{canRetryConfirmation ? errorCopy.retryButton : t("place_order")}<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="rtl:rotate-180"><path d="M5 12h14m-7-7 7 7-7 7" /></svg></>}
            </button>
            <p className="checkout-privacy"><CheckoutIcon name="shield" />{t("checkout_privacy")}</p>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}

function CheckoutIcon({ name }: { name: "pin" | "wallet" | "check" | "shield" }) {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {name === "pin" && <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>}
      {name === "wallet" && <><rect x="3" y="5" width="18" height="15" rx="3" /><path d="M3 9h18M16 15h2M7 5V3h11" /></>}
      {name === "check" && <path d="m5 12 4 4L19 6" />}
      {name === "shield" && <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" /><path d="m8 12 3 3 5-6" /></>}
    </svg>
  );
}
