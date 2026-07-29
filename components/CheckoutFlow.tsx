"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useCart } from "@/components/cart-context";
import { formatMoney, parseMoney } from "@/lib/money";
import { motion, useReducedMotion } from "framer-motion";
import { SodaCan } from "@/components/visuals/SodaCan";
import { SodaBottle } from "@/components/visuals/SodaBottle";
import { GlassDrink } from "@/components/visuals/GlassDrink";
import { SafeImage } from "@/components/SafeImage";

function formatPrice(price: string, quantity: number): string {
  const numeric = parseFloat(price.replace(/[^0-9.]/g, ""));
  const total = numeric * quantity;
  return total.toFixed(2).replace(/\.?0+$/, "") + " DH";
}

type City = { name: string };

type CheckoutFlowProps = {
  cities?: City[];
};

function generateIdempotencyKey(): string {
  if (typeof window === "undefined") return "";
  const key = `idem_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
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
  const { clearCart, items } = useCart();
  const [deliveryState, setDeliveryState] = useState<DeliveryState>(emptyDeliveryState);
  const [errors, setErrors] = useState<DeliveryErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const shouldReduce = useReducedMotion();
  const { t } = useTranslation("checkout");

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
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!items.length) return;

    const nextErrors: DeliveryErrors = {};

    const requiredFields: Array<keyof DeliveryState> = ["fullName", "email", "phone", "city", "address"];
    requiredFields.forEach((field) => {
      if (deliveryState[field].trim().length === 0) {
        nextErrors[field] = t("required_field");
      }
    });

    if (deliveryState.phone && !validateMoroccanPhone(deliveryState.phone)) {
      nextErrors.phone = t("invalid_phone");
    }

    if (deliveryState.postalCode && !validatePostalCode(deliveryState.postalCode)) {
      nextErrors.postalCode = t("invalid_postal");
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const idempotencyKey = getIdempotencyKey();
    if (!idempotencyKey) {
      setErrors({ fullName: t("session_error") });
      return;
    }

    setIsSubmitting(true);

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
        slug: item.id,
        image: item.image || "",
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
        const err = await res.json();
        setErrors({ fullName: err.error || t("order_failed") });
        setIsSubmitting(false);
        return;
      }

      const data = await res.json();
      clearIdempotencyKey();
      clearCart();
      router.push(`/success?order=${data.order.orderNumber}`);
    } catch {
      setErrors({ fullName: t("something_wrong") });
      setIsSubmitting(false);
    }
  }

  if (!items.length) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="max-w-lg text-center">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center">
            <svg className="h-8 w-8 text-ivory/8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121 0 2.09-.773 2.34-1.872l1.836-8.046A1.125 1.125 0 0018.054 3H5.106m2.394 11.25l-1.5-6h13.5" />
            </svg>
          </div>
          <h1 className="font-display text-2xl text-ivory md:text-3xl">
            {t("your_box_empty")}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[0.78rem] leading-relaxed text-ivory/25">
            {t("add_drinks_before_checkout")}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/shop" className="btn-primary">
              {t("explore_drinks", "Explore Drinks")}
            </Link>
            <Link href="/" className="btn-secondary">
              {t("back_to_home")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.section
      initial={shouldReduce ? false : { opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
  <div className="mb-10">
    <Link href="/shop" className="text-[0.5rem] font-semibold uppercase tracking-[0.3em] text-ivory/20 transition-colors duration-200 hover:text-ivory/40">
      &larr; {t("back_to_drinks")}
    </Link>
  </div>

  {items.length > 0 && (
    <div className="mb-8 sm:hidden">
      <div className="flex items-center justify-between rounded-input border border-ivory/[0.04] bg-black-surface px-5 py-4">
        <div>
          <p className="text-[0.5rem] uppercase tracking-[0.22em] text-ivory/30">{t("order_summary_title")}</p>
          <p className="mt-1 text-sm font-medium text-ivory">{items.length} {t("drinks_count")}</p>
        </div>
        <p className="font-display text-xl text-gold">{formatMoney(totalValue)}</p>
      </div>
    </div>
  )}

  <div className="grid gap-12 lg:grid-cols-[3fr_2fr] lg:items-start">
        <section>
          <form onSubmit={handleSubmit} className="space-y-10">
            <div>
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-burgundy text-[0.5rem] font-semibold text-ivory">1</span>
                <div>
                  <p className="text-[0.4rem] font-semibold uppercase tracking-[0.35em] text-ivory/20">{t("step_delivery", "Delivery")}</p>
                  <h2 className="text-lg font-medium text-ivory">{t("deliver_to_door")}</h2>
                </div>
              </div>
              <div className="ml-10 space-y-5">
                <label className="block space-y-2">
                  <span className="text-[0.62rem] font-medium text-ivory/45">{t("full_name")} *</span>
                  <input
                    type="text"
                    name="fullName"
                    value={deliveryState.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    placeholder={t("full_name_placeholder")}
                    className="h-11 w-full border-0 border-b border-ivory/[0.08] bg-transparent px-0 text-[0.85rem] text-ivory outline-none transition-all duration-200 placeholder:text-ivory/12 focus:border-gold/40"
                    aria-invalid={Boolean(errors.fullName)}
                    aria-describedby={errors.fullName ? "err-fullName" : undefined}
                    required
                  />
                  {errors.fullName && <p id="err-fullName" className="text-[0.6rem] text-burgundy">{errors.fullName}</p>}
                </label>

                <label className="block space-y-2">
                  <span className="text-[0.62rem] font-medium text-ivory/45">{t("email")} *</span>
                  <input
                    type="email"
                    name="email"
                    value={deliveryState.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder={t("email_placeholder")}
                    className="h-11 w-full border-0 border-b border-ivory/[0.08] bg-transparent px-0 text-[0.85rem] text-ivory outline-none transition-all duration-200 placeholder:text-ivory/12 focus:border-gold/40"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "err-email" : undefined}
                    required
                  />
                  {errors.email && <p id="err-email" className="text-[0.6rem] text-burgundy">{errors.email}</p>}
                </label>

                <label className="block space-y-2">
                  <span className="text-[0.62rem] font-medium text-ivory/45">{t("phone")} *</span>
                  <input
                    type="tel"
                    name="phone"
                    value={deliveryState.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder={t("phone_placeholder")}
                    className="h-11 w-full border-0 border-b border-ivory/[0.08] bg-transparent px-0 text-[0.85rem] text-ivory outline-none transition-all duration-200 placeholder:text-ivory/12 focus:border-gold/40"
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? "err-phone" : undefined}
                    required
                  />
                  {errors.phone && <p id="err-phone" className="text-[0.6rem] text-burgundy">{errors.phone}</p>}
                </label>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block space-y-2">
                    <span className="text-[0.62rem] font-medium text-ivory/45">{t("city")} *</span>
                    <select
                      name="city"
                      value={deliveryState.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      className="h-11 w-full border-0 border-b border-ivory/[0.08] bg-transparent px-0 text-[0.85rem] text-ivory outline-none transition-all duration-200 focus:border-gold/40"
                      aria-invalid={Boolean(errors.city)}
                      aria-describedby={errors.city ? "err-city" : undefined}
                      required
                    >
                      <option value="" className="bg-black">{t("select_city")}</option>
                      {cities.map((city) => (
                        <option key={city.name} value={city.name} className="bg-black">{city.name}</option>
                      ))}
                    </select>
                    {errors.city && <p id="err-city" className="text-[0.6rem] text-burgundy">{errors.city}</p>}
                  </label>

                  <label className="block space-y-2">
                    <span className="text-[0.62rem] font-medium text-ivory/45">{t("address")} *</span>
                    <input
                      type="text"
                      name="address"
                      value={deliveryState.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      placeholder={t("address_placeholder")}
                      className="h-11 w-full border-0 border-b border-ivory/[0.08] bg-transparent px-0 text-[0.85rem] text-ivory outline-none transition-all duration-200 placeholder:text-ivory/12 focus:border-gold/40"
                      aria-invalid={Boolean(errors.address)}
                      aria-describedby={errors.address ? "err-address" : undefined}
                      required
                    />
                    {errors.address && <p id="err-address" className="text-[0.6rem] text-burgundy">{errors.address}</p>}
                  </label>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block space-y-2">
                    <span className="text-[0.62rem] font-medium text-ivory/45">{t("postal_code")}</span>
                    <input
                      type="text"
                      name="postalCode"
                      value={deliveryState.postalCode}
                      onChange={(e) => handleChange("postalCode", e.target.value)}
                      placeholder={t("postal_placeholder")}
                      className="h-11 w-full border-0 border-b border-ivory/[0.08] bg-transparent px-0 text-[0.85rem] text-ivory outline-none transition-all duration-200 placeholder:text-ivory/12 focus:border-gold/40"
                    />
                    {errors.postalCode && <p className="text-[0.6rem] text-burgundy">{errors.postalCode}</p>}
                  </label>

                  <label className="block space-y-2">
                    <span className="text-[0.62rem] font-medium text-ivory/45">{t("country_label")}</span>
                    <input
                      type="text"
                      value={t("morocco")}
                      readOnly
                      className="h-11 w-full border-0 border-b border-ivory/[0.08] bg-transparent px-0 text-[0.85rem] text-ivory/40 outline-none"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-burgundy text-[0.5rem] font-semibold text-ivory">2</span>
                <div>
                  <p className="text-[0.4rem] font-semibold uppercase tracking-[0.35em] text-ivory/20">{t("step_payment", "Payment")}</p>
                  <h2 className="text-lg font-medium text-ivory">{t("cash_on_delivery")}</h2>
                </div>
              </div>
              <div className="ml-10">
                <div className="flex items-center gap-4 border-b border-ivory/[0.04] pb-4">
                  <svg aria-hidden="true" width={18} height={18} viewBox="0 0 24 24" className="shrink-0 text-ivory/30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a10 10 0 1 0 10 10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  <div>
                    <p className="text-[0.75rem] font-medium text-ivory">{t("cash_on_delivery")}</p>
                    <p className="text-[0.62rem] text-ivory/25">{t("cash_on_delivery_desc")}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-ivory/[0.04]">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary h-12 w-full text-[0.58rem]"
              >
                {isSubmitting ? t("confirming") : t("place_order")}
              </button>
            </div>
          </form>
        </section>

        <aside className="lg:sticky lg:top-28">
          <div className="space-y-6">
            <div className="border-b border-ivory/[0.04] pb-5">
              <p className="text-[0.4rem] font-semibold uppercase tracking-[0.35em] text-ivory/20">{t("order_summary_title")}</p>
              <p className="mt-1 font-display text-xl text-ivory">{items.length} {t("drinks_count")}</p>
            </div>

            <div className="space-y-4">
              {lineItems.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden">
                    {item.image ? (
                      <SafeImage
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-contain"
                        fallback={
                          <div className="flex h-full w-full items-center justify-center text-[0.45rem] font-semibold tracking-[0.24em] text-ivory/8">
                            {item.name.split(" ").slice(0, 2).map((part) => part[0]).join("")}
                          </div>
                        }
                      />
                    ) : item.visual ? (
                      <div className="flex h-full w-full items-center justify-center p-1.5">
                        {item.visual === "can" ? (
                          <SodaCan width={56} height={72} accent={item.accent} label={item.name} />
                        ) : item.visual === "bottle" ? (
                          <SodaBottle width={48} height={84} accent={item.accent} label={item.name} />
                        ) : (
                          <GlassDrink width={62} height={68} accent={item.accent} label={item.name} />
                        )}
                      </div>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-sm font-medium text-ivory/6">
                          {item.name.split(" ").slice(0, 2).map((s) => s[0]).join("")}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
                    <div>
                      {item.category && (
                        <p className="text-[0.38rem] uppercase tracking-[0.28em] text-ivory/12">{item.category}</p>
                      )}
                      <p className="truncate font-display text-[0.85rem] text-ivory">{item.name}</p>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-[0.6rem] text-ivory/25">
                      <span>{t("qty_label")} {item.quantity}</span>
                      <span className="font-medium text-gold">{item.lineTotal}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-ivory/[0.04] pt-5 space-y-3">
              <div className="flex items-center justify-between text-[0.68rem] text-ivory/35">
                <span>{t("cart_subtotal")}</span>
                <span className="font-medium text-ivory">{formatMoney(subtotalValue)}</span>
              </div>
              <div className="flex items-center justify-between text-[0.68rem] text-ivory/35">
                <span>{t("tax_rate")}</span>
                <span className="font-medium text-ivory">{formatMoney(taxValue)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-ivory/[0.04] pt-4">
                <span className="label-utility tracking-[0.22em] text-ivory/25">{t("cart_total")}</span>
                <span className="font-display text-xl text-gold">{formatMoney(totalValue)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </motion.section>
  );
}
