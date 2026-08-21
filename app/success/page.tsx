import Link from "next/link";
import { getOrderConfirmation } from "@/lib/orders";
import { getLanguage, loadTranslations, t } from "@/lib/translations";
import { FadeIn } from "@/components/MotionWrappers";
import { SuccessClient } from "./SuccessClient";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ order?: string; key?: string }>;
};

const fallbackCopy = {
  en: {
    title: "Thank you. Your order is confirmed.",
    description: "We’ve received your order and will prepare it carefully.",
    orderNumber: "Order number",
    total: "Total",
    status: "Status",
    confirmed: "Confirmed",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
    note: "Keep your order number. We’ll contact you if we need any delivery details.",
    continueShopping: "Continue shopping",
    returnHome: "Return home",
    notFoundTitle: "Order not found",
    notFoundDescription: "We couldn’t find this order confirmation. Please check your link or return home.",
  },
  fr: {
    title: "Merci. Votre commande est confirmée.",
    description: "Nous avons bien reçu votre commande et allons la préparer avec soin.",
    orderNumber: "Numéro de commande",
    total: "Total",
    status: "Statut",
    confirmed: "Confirmée",
    processing: "En préparation",
    shipped: "Expédiée",
    delivered: "Livrée",
    cancelled: "Annulée",
    note: "Conservez votre numéro de commande. Nous vous contacterons si une précision de livraison est nécessaire.",
    continueShopping: "Continuer mes achats",
    returnHome: "Retour à l’accueil",
    notFoundTitle: "Commande introuvable",
    notFoundDescription: "Cette confirmation est introuvable. Vérifiez votre lien ou revenez à l’accueil.",
  },
  ar: {
    title: "شكراً لك. تم تأكيد طلبك.",
    description: "توصلنا بطلبك وسنقوم بتحضيره بعناية.",
    orderNumber: "رقم الطلب",
    total: "المجموع",
    status: "الحالة",
    confirmed: "مؤكد",
    processing: "قيد التحضير",
    shipped: "تم الشحن",
    delivered: "تم التوصيل",
    cancelled: "ملغى",
    note: "احتفظ برقم طلبك. سنتواصل معك إذا احتجنا إلى أي تفاصيل إضافية للتوصيل.",
    continueShopping: "متابعة التسوق",
    returnHome: "العودة إلى الرئيسية",
    notFoundTitle: "لم يتم العثور على الطلب",
    notFoundDescription: "تعذر العثور على تأكيد هذا الطلب. تحقق من الرابط أو عد إلى الصفحة الرئيسية.",
  },
} as const;

export default async function SuccessPage({ searchParams }: Props) {
  const lang = await getLanguage();
  const translations = await loadTranslations("success");
  const copy = fallbackCopy[lang];
  const translated = (key: string, fallback: string) => {
    const value = t(translations, key, lang);
    return value === key ? fallback : value;
  };

  const params = await searchParams;
  const order = params.order && params.key
    ? await getOrderConfirmation(params.order, params.key)
    : null;

  if (!order) {
    return (
      <div className="container-premium flex min-h-[calc(100vh-10rem)] items-center justify-center py-16 md:py-24">
        <FadeIn>
          <section className="w-full max-w-xl rounded-2xl border border-white/[0.07] bg-card px-6 py-14 text-center shadow-2xl shadow-black/20 sm:px-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-rouge/25 bg-rouge/10 text-rouge">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="mt-7 font-display text-3xl text-white md:text-4xl">
              {translated("order_not_found_title", copy.notFoundTitle)}
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-white/55">
              {translated("order_not_found_desc", copy.notFoundDescription)}
            </p>
            <Link href="/" className="btn-primary mt-8 inline-flex h-12 items-center justify-center px-8">
              {translated("return_home", copy.returnHome)}
            </Link>
          </section>
        </FadeIn>
      </div>
    );
  }

  const statusKey =
    order.orderStatus === "processing"
      ? "processing"
      : order.orderStatus === "shipped" || order.orderStatus === "out_for_delivery"
        ? "shipped"
        : order.orderStatus === "delivered" || order.orderStatus === "completed"
          ? "delivered"
          : order.orderStatus === "cancelled" || order.orderStatus === "refunded"
            ? "cancelled"
            : "confirmed";

  return (
    <div className="container-premium flex min-h-[calc(100vh-8rem)] items-center justify-center py-14 md:py-24">
      <FadeIn>
        <section className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-gold/[0.16] bg-card px-6 py-12 text-center shadow-2xl shadow-black/30 sm:px-10 md:py-16">
          <div className="pointer-events-none absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />

          <SuccessClient />

          <p className="mt-7 text-[0.55rem] font-semibold uppercase tracking-[0.3em] text-gold/70">
            MONADATY
          </p>
          <h1 className="mx-auto mt-4 max-w-xl font-display text-[clamp(2rem,5vw,3.3rem)] leading-[1.02] tracking-[-0.025em] text-white">
            {translated("order_confirmed_title", copy.title)}
          </h1>
          <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-white/58">
            {translated("order_confirmed_desc", copy.description)}
          </p>

          <div className="mx-auto mt-9 grid max-w-lg overflow-hidden rounded-xl border border-white/[0.07] bg-black/25 text-start sm:grid-cols-3">
            <div className="border-b border-white/[0.07] px-5 py-4 sm:border-b-0 sm:border-e">
              <p className="text-[0.52rem] uppercase tracking-[0.18em] text-white/35">
                {translated("order_number", copy.orderNumber)}
              </p>
              <p className="mt-2 break-all font-mono text-[0.78rem] font-semibold text-white">{order.orderNumber}</p>
            </div>
            <div className="border-b border-white/[0.07] px-5 py-4 sm:border-b-0 sm:border-e">
              <p className="text-[0.52rem] uppercase tracking-[0.18em] text-white/35">
                {translated("total", copy.total)}
              </p>
              <p className="mt-2 text-sm font-semibold text-gold">{order.total}</p>
            </div>
            <div className="px-5 py-4">
              <p className="text-[0.52rem] uppercase tracking-[0.18em] text-white/35">{copy.status}</p>
              <p className="mt-2 text-sm font-semibold text-white">{copy[statusKey]}</p>
            </div>
          </div>

          <p className="mx-auto mt-6 max-w-lg text-[0.68rem] leading-6 text-white/42">{copy.note}</p>

          <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link href="/shop" className="btn-primary inline-flex h-12 items-center justify-center px-8">
              {translated("continue_shopping", copy.continueShopping)}
            </Link>
            <Link href="/" className="btn-secondary inline-flex h-12 items-center justify-center px-8">
              {translated("return_home", copy.returnHome)}
            </Link>
          </div>
        </section>
      </FadeIn>
    </div>
  );
}
