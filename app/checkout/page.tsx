import { CheckoutClient } from "@/components/CheckoutClient";
import { getCities } from "@/lib/db";
import { loadTranslations, t, getLanguage } from "@/lib/translations";

export const dynamic = "force-dynamic";

/* ============================================================
   CHECKOUT PAGE — minimal luxury
   ============================================================ */

export default async function CheckoutPage() {
  const lang = await getLanguage();
  const translations = await loadTranslations("checkout");
  const cities = await getCities();
  const cityNames = cities.map((c) => ({ name: c.name }));

return (
<div className="bg-[#171717]">
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-[1600px] px-6 py-24 md:px-10 md:py-32 lg:px-16 lg:py-40">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-gold/30" />
            <span className="label-utility tracking-[0.55em] text-gold/40">
              {t(translations, "secure_checkout", lang)}
      </span>
    </div>

          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-2">
              <span className="font-display text-[4.5rem] font-light leading-none tracking-[-0.04em] text-ivory/[0.06] md:text-[6rem]">
                03
      </span>
    </div>

            <div className="lg:col-span-9">
              <h1 className="font-display text-[clamp(2.5rem,6vw,6rem)] leading-[0.86] tracking-[-0.05em] text-ivory">
                {t(translations, "complete_order_heading", lang)}
    </h1>
    </div>
    </div>

          <div className="mt-16 h-px w-full bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
  </div>
</section>

      <section className="relative overflow-hidden border-t border-ivory/[0.04]">
        <div className="mx-auto max-w-[1600px] px-6 py-12 md:px-10 md:py-16 lg:px-16 lg:py-20">
          <CheckoutClient cities={cityNames} />
       </div>
     </section>
   </div>
  );
}
