"use client";

import dynamic from "next/dynamic";

type City = { name: string };

const CheckoutFlow = dynamic<{ cities: City[] }>(() => import("@/components/CheckoutFlow").then((mod) => mod.CheckoutFlow), {
  ssr: false,
  loading: () => (
    <div className="checkout-grid mt-8 animate-pulse" aria-busy="true">
      <div className="checkout-card space-y-6">
        <div className="h-6 w-1/2 rounded bg-stone-100" />
        <div className="h-12 rounded-lg bg-stone-100" />
        <div className="h-12 rounded-lg bg-stone-100" />
        <div className="h-12 rounded-lg bg-stone-100" />
      </div>
      <div className="checkout-card h-80 bg-stone-50" />
    </div>
  ),
});

export function CheckoutClient({ cities }: { cities: City[] }) {
  return <CheckoutFlow cities={cities} />;
}
