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
    <div className="container-premium py-8 md:py-14">
      <div className="mb-8 text-center animate-fade-in">
        <p className="label-utility">{t(translations, "secure_checkout", lang)}</p>
        <h1 className="font-display mt-4 text-display-sm sm:text-display-md text-ivory">
          {t(translations, "complete_order_heading", lang)}
        </h1>
        <div className="mx-auto mt-5 h-px w-8 bg-ivory/[0.05]" />
      </div>

      <CheckoutClient cities={cityNames} />
    </div>
  );
}
