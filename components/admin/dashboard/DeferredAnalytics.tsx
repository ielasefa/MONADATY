"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

type Props = {
  revenueData: { date: string; revenue: number }[];
  ordersData: { date: string; orders: number }[];
  topProducts: { name: string; value: number }[];
  collectionSales: { name: string; value: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
};

function AnalyticsPlaceholder() {
  return (
    <section className="space-y-4" aria-label="Analytics" aria-busy="true">
      <div className="h-5 w-32 animate-pulse rounded bg-white/[0.04]" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {[0, 1].map((item) => (
          <div key={item} className="h-72 animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.02]" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-64 animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.02]" />
        ))}
      </div>
    </section>
  );
}

const AnalyticsSection = dynamic(
  () => import("./AnalyticsSection").then((mod) => mod.AnalyticsSection),
  { ssr: false, loading: AnalyticsPlaceholder },
);

export function DeferredAnalytics(props: Props) {
  const boundaryRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const boundary = boundaryRef.current;
    if (!boundary || !("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: "320px 0px" },
    );
    observer.observe(boundary);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={boundaryRef}>
      {shouldLoad ? <AnalyticsSection {...props} /> : <AnalyticsPlaceholder />}
    </div>
  );
}
