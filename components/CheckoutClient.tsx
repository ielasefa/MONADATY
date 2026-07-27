"use client";

import dynamic from "next/dynamic";

type City = { name: string };

const CheckoutFlow = dynamic<{ cities: City[] }>(() => import("@/components/CheckoutFlow").then((mod) => mod.CheckoutFlow), {
  ssr: false,
  loading: () => <div className="rounded-md border border-ivory/[0.06] bg-black-surface p-6 md:p-8 animate-pulse" />,
});

export function CheckoutClient({ cities }: { cities: City[] }) {
  return <CheckoutFlow cities={cities} />;
}
