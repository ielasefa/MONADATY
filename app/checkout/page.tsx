import { CheckoutClient } from "@/components/CheckoutClient";
import { getCities } from "@/lib/db";
import { getLanguage } from "@/lib/translations";
import { getLandingCopy } from "@/lib/landing-copy";
import { CHECKOUT_CITIES } from "@/lib/checkout-validators";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const lang = await getLanguage();
  const copy = getLandingCopy(lang);
  const cities = await getCities();
  const cityNames = CHECKOUT_CITIES
    .filter((name) => cities.some((city) => city.name === name))
    .map((name) => ({ name }));

  return (
    <div className="market-checkout">
      <div className="storefront-container">
        <header className="checkout-intro">
          <p className="storefront-eyebrow"><span className="h-px w-9 bg-gold" />{copy.checkout.eyebrow}</p>
          <h1 className="storefront-page-title">{copy.checkout.title}</h1>
          <p className="checkout-intro-description">{copy.checkout.description}</p>
        </header>
        <CheckoutClient cities={cityNames} />
      </div>
    </div>
  );
}
