import { CheckoutClient } from "@/components/CheckoutClient";
import { getCities } from "@/lib/db";
import { loadTranslations, t, getLanguage } from "@/lib/translations";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const lang = await getLanguage();
  const translations = await loadTranslations("checkout");
  const cities = await getCities();
  const cityNames = cities.map((c) => ({ name: c.name }));

  return (
    <div className="bg-black">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(184,155,94,0.04)_0%,transparent_55%)]" />

        <div className="mx-auto max-w-[1400px] px-6 md:px-10 lg:px-16">
          <div className="py-16 md:py-20 lg:py-24">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-gold" />
              <span className="label-utility tracking-[0.55em] text-gold">
                {t(translations, "secure_checkout", lang)}
              </span>
            </div>

            <h1 className="mt-6 font-display text-[clamp(2rem,4.5vw,3.5rem)] leading-[0.9] tracking-[-0.04em] text-white">
              {t(translations, "complete_order_heading", lang)}
            </h1>

            <p className="mt-6 max-w-lg text-[0.82rem] leading-[1.85] text-white/65">
              {t(translations, "checkout_description", lang)}
            </p>
          </div>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
      </section>

      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-[1400px] px-6 py-12 md:px-10 md:py-16 lg:px-16 lg:py-20">
          <CheckoutClient cities={cityNames} />
        </div>
      </section>
    </div>
  );
}
