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
        slug: item.slug || item.id,
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
      <motion.div
        initial={shouldReduce ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex min-h-[60vh] items-center justify-center"
      >
        <div className="max-w-lg text-center">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-white/[0.06] bg-[#1E1E1E]">
            <svg className="h-8 w-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121 0 2.09-.773 2.34-1.872l1.836-8.046A1.125 1.125 0 0018.054 3H5.106m2.394 11.25l-1.5-6h13.5" />
            </svg>
          </div>
          <h2 className="font-display text-2xl text-white md:text-3xl">
            {t("your_box_empty")}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[0.82rem] leading-relaxed text-white/60">
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial={shouldReduce ? false : "hidden"}
      animate="visible"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-[0.52rem] font-semibold uppercase tracking-[0.32em] text-white/50 transition-colors duration-300 hover:text-gold"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="rtl:rotate-180">
            <path d="M19 12H5m7-7-7 7 7 7" />
          </svg>
          {t("back_to_drinks")}
        </Link>
      </motion.div>

      <div className="grid gap-10 lg:grid-cols-[65fr_35fr] lg:items-start">
        <motion.div variants={itemVariants}>
          <form onSubmit={handleSubmit} className="space-y-12">
            <div>
              <div className="mb-8 flex items-center gap-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#9B2638] text-[0.55rem] font-semibold text-white">1</span>
                <div>
                  <p className="label-utility text-gold/60">{t("step_delivery", "Delivery")}</p>
                  <h2 className="mt-1 font-display text-xl text-white">{t("deliver_to_door")}</h2>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="checkout-name" className="text-[0.62rem] font-medium text-white/60">
                      {t("full_name")} <span className="text-[#9B2638]">*</span>
                    </label>
                    <input
                      id="checkout-name"
                      type="text"
                      name="fullName"
                      value={deliveryState.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      placeholder={t("full_name_placeholder")}
                      className="input-premium"
                      style={{ caretColor: "#FFFFFF", WebkitTextFillColor: "#FFFFFF" }}
                      aria-invalid={Boolean(errors.fullName)}
                      aria-describedby={errors.fullName ? "err-fullName" : undefined}
                      required
                    />
                    {errors.fullName && <p id="err-fullName" className="text-[0.6rem] text-[#9B2638]">{errors.fullName}</p>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="checkout-email" className="text-[0.62rem] font-medium text-white/60">
                      {t("email")} <span className="text-[#9B2638]">*</span>
                    </label>
                    <input
                      id="checkout-email"
                      type="email"
                      name="email"
                      value={deliveryState.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder={t("email_placeholder")}
                      className="input-premium"
                      style={{ caretColor: "#FFFFFF", WebkitTextFillColor: "#FFFFFF" }}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? "err-email" : undefined}
                      required
                    />
                    {errors.email && <p id="err-email" className="text-[0.6rem] text-[#9B2638]">{errors.email}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="checkout-phone" className="text-[0.62rem] font-medium text-white/60">
                    {t("phone")} <span className="text-[#9B2638]">*</span>
                  </label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    name="phone"
                    value={deliveryState.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder={t("phone_placeholder")}
                    className="input-premium"
                    style={{ caretColor: "#FFFFFF", WebkitTextFillColor: "#FFFFFF" }}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? "err-phone" : undefined}
                    required
                  />
                  {errors.phone && <p id="err-phone" className="text-[0.6rem] text-[#9B2638]">{errors.phone}</p>}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="checkout-city" className="text-[0.62rem] font-medium text-white/60">
                      {t("city")} <span className="text-[#9B2638]">*</span>
                    </label>
                    <select
                      id="checkout-city"
                      name="city"
                      value={deliveryState.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      className="input-premium"
                      aria-invalid={Boolean(errors.city)}
                      aria-describedby={errors.city ? "err-city" : undefined}
                      required
                    >
                      <option value="" className="bg-[#171717]">{t("select_city")}</option>
                      {cities.map((city) => (
                        <option key={city.name} value={city.name} className="bg-[#171717]">{city.name}</option>
                      ))}
                    </select>
                    {errors.city && <p id="err-city" className="text-[0.6rem] text-[#9B2638]">{errors.city}</p>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="checkout-address" className="text-[0.62rem] font-medium text-white/60">
                      {t("address")} <span className="text-[#9B2638]">*</span>
                    </label>
                    <input
                      id="checkout-address"
                      type="text"
                      name="address"
                      value={deliveryState.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      placeholder={t("address_placeholder")}
                      className="input-premium"
                      style={{ caretColor: "#FFFFFF", WebkitTextFillColor: "#FFFFFF" }}
                      aria-invalid={Boolean(errors.address)}
                      aria-describedby={errors.address ? "err-address" : undefined}
                      required
                    />
                    {errors.address && <p id="err-address" className="text-[0.6rem] text-[#9B2638]">{errors.address}</p>}
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="checkout-postal" className="text-[0.62rem] font-medium text-white/60">
                      {t("postal_code")}
                    </label>
                    <input
                      id="checkout-postal"
                      type="text"
                      name="postalCode"
                      value={deliveryState.postalCode}
                      onChange={(e) => handleChange("postalCode", e.target.value)}
                      placeholder={t("postal_placeholder")}
                      className="input-premium"
                      style={{ caretColor: "#FFFFFF", WebkitTextFillColor: "#FFFFFF" }}
                    />
                    {errors.postalCode && <p className="text-[0.6rem] text-[#9B2638]">{errors.postalCode}</p>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="checkout-country" className="text-[0.62rem] font-medium text-white/60">
                      {t("country_label")}
                    </label>
                    <input
                      id="checkout-country"
                      type="text"
                      value={t("morocco")}
                      readOnly
                      className="input-premium cursor-default opacity-70"
                      style={{ caretColor: "#FFFFFF", WebkitTextFillColor: "#FFFFFF" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

            <div>
              <div className="mb-8 flex items-center gap-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#9B2638] text-[0.55rem] font-semibold text-white">2</span>
                <div>
                  <p className="label-utility text-gold/60">{t("step_payment", "Payment")}</p>
                  <h2 className="mt-1 font-display text-xl text-white">{t("cash_on_delivery")}</h2>
                </div>
              </div>

              <div className="rounded-card border border-white/[0.06] bg-[#1E1E1E] p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#9B2638]/10">
                    <svg aria-hidden="true" width={18} height={18} viewBox="0 0 24 24" className="shrink-0 text-[#C8A96A]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a10 10 0 1 0 10 10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[0.75rem] font-medium text-white">{t("cash_on_delivery")}</p>
                    <p className="mt-0.5 text-[0.62rem] text-white/50">{t("cash_on_delivery_desc")}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary h-12 w-full px-8 text-[0.58rem]"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-3">
                    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t("confirming")}
                  </span>
                ) : (
                  t("place_order")
                )}
              </button>
            </div>
          </form>
        </motion.div>

        <motion.aside
          variants={itemVariants}
          className="lg:sticky lg:top-28"
        >
          <div className="rounded-card border border-white/[0.06] bg-[#1E1E1E] p-6">
            <div className="mb-6">
              <p className="label-utility text-gold/60">{t("order_summary_title")}</p>
              <h2 className="mt-1 font-display text-white">{items.length} {t("drinks_count")}</h2>
            </div>

            <div className="space-y-4">
              {lineItems.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-md bg-[#171717]">
                    {item.image ? (
                      <SafeImage
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="56px"
                        className="object-contain p-1"
                        fallback={
                          <div className="flex h-full w-full items-center justify-center text-[0.4rem] font-semibold tracking-[0.24em] text-white/20">
                            {item.name.split(" ").slice(0, 2).map((part) => part[0]).join("")}
                          </div>
                        }
                      />
                    ) : item.visual ? (
                      <div className="flex h-full w-full items-center justify-center p-1">
                        {item.visual === "can" ? (
                          <SodaCan width={48} height={60} accent={item.accent} label={item.name} />
                        ) : item.visual === "bottle" ? (
                          <SodaBottle width={40} height={72} accent={item.accent} label={item.name} />
                        ) : (
                          <GlassDrink width={52} height={56} accent={item.accent} label={item.name} />
                        )}
                      </div>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-sm font-medium text-white/10">
                          {item.name.split(" ").slice(0, 2).map((s) => s[0]).join("")}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    {item.category && (
                      <p className="text-[0.38rem] uppercase tracking-[0.28em] text-white/30">{item.category}</p>
                    )}
                    <p className="truncate font-display text-[0.78rem] text-white">{item.name}</p>
                    <div className="mt-1 flex items-center justify-between gap-2 text-[0.6rem] text-white/40">
                      <span>{t("qty_label")} {item.quantity}</span>
                      <span className="font-medium text-[#C8A96A]">{item.lineTotal}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 border-t border-white/[0.06] pt-5">
              <div className="flex items-center justify-between text-[0.7rem]">
                <span className="text-white/50">{t("cart_subtotal")}</span>
                <span className="font-medium text-white">{formatMoney(subtotalValue)}</span>
              </div>
              <div className="flex items-center justify-between text-[0.7rem]">
                <span className="text-white/50">{t("tax_rate")}</span>
                <span className="font-medium text-white">{formatMoney(taxValue)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/[0.06] pt-4">
                <span className="label-utility tracking-[0.22em] text-[#C8A96A]">{t("cart_total")}</span>
                <span className="font-display text-xl text-[#C8A96A]">{formatMoney(totalValue)}</span>
              </div>
            </div>
          </div>
        </motion.aside>
      </div>
    </motion.div>
  );
}
