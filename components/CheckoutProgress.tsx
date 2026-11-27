"use client";

import { useEffect, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";

const copy = {
  ar: {
    confirming: "جارٍ تأكيد طلبك",
    loading: "جارٍ تحميل تفاصيل طلبك",
    description: "انتظر لحظات من فضلك، ستظهر تفاصيل طلبك هنا.",
  },
  fr: {
    confirming: "Confirmation de votre commande",
    loading: "Chargement de votre commande",
    description: "Encore un instant, les détails de votre commande vont s’afficher.",
  },
  en: {
    confirming: "Confirming your order",
    loading: "Loading your order details",
    description: "Just a moment, your order details will appear here.",
  },
};

export function CheckoutProgress({ confirming = false }: { confirming?: boolean }) {
  const { lang } = useLanguage();
  const card = useRef<HTMLDivElement>(null);

  useEffect(() => {
    card.current?.scrollIntoView({ block: "center", behavior: "instant" });
  }, []);

  return (
    <div className="checkout-progress" role="status" aria-live="polite" aria-busy="true">
      <div ref={card} className="checkout-progress-card">
        <div className="checkout-progress-spinner" aria-hidden="true" />
        <p className="checkout-progress-brand">MONADATY</p>
        <h2>{confirming ? copy[lang].confirming : copy[lang].loading}</h2>
        <p className="checkout-progress-description">{copy[lang].description}</p>
      </div>
    </div>
  );
}
