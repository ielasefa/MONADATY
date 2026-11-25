import { Skeleton } from "@/components/skeletons/Skeleton";

export default function CheckoutLoading() {
  return (
    <div className="market-checkout" aria-busy="true">
      <div className="storefront-container">
        <div className="checkout-intro space-y-5">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-12 w-4/5" rounded="lg" />
          <Skeleton className="h-5 w-3/4" />
        </div>
        <div className="checkout-toolbar"><Skeleton className="h-4 w-36" /></div>
        <div className="checkout-grid">
          <div className="checkout-form-sections">
            {[3, 3].map((fields, section) => (
              <div key={section} className="checkout-card space-y-6">
                <Skeleton className="h-7 w-1/2" rounded="lg" />
                {Array.from({ length: fields }, (_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-12 w-full" rounded="lg" />
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="checkout-card space-y-6">
            <Skeleton className="h-7 w-1/2" rounded="lg" />
            <Skeleton className="h-20 w-full" rounded="lg" />
            <Skeleton className="h-20 w-full" rounded="lg" />
            <Skeleton className="h-14 w-full" rounded="lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
