import { CheckoutClient } from "@/components/CheckoutClient";
import { getCities } from "@/lib/db";
import { getLanguage } from "@/lib/translations";
import { getLandingCopy } from "@/lib/landing-copy";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const lang = await getLanguage();
  const copy = getLandingCopy(lang);
  const cities = await getCities();
  const cityNames = cities.map((c) => ({ name: c.name }));

  return (
    <div className="bg-black">
      <section className="relative overflow-hidden border-b border-gold/[0.16] bg-surface">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(214,179,90,0.09)_0%,transparent_48%)]" />

        <div className="storefront-container storefront-section relative">
            <p className="storefront-eyebrow">
              <span className="h-px w-9 bg-gold" />
              {copy.checkout.eyebrow}
            </p>

            <h1 className="storefront-page-title mt-6">
              {copy.checkout.title}
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-[1.85] text-white/58 sm:text-[0.95rem]">
              {copy.checkout.description}
            </p>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <div className="storefront-container py-12 md:py-16 lg:py-20">
          <CheckoutClient cities={cityNames} />
        </div>
      </section>
    </div>
  );
}
