import { Skeleton } from "./Skeleton";
import { ProductCardSkeleton } from "./ProductCardSkeleton";

export function ShopSkeleton() {
  return (
    <div className="storefront-container py-7">
      <div className="mb-7 space-y-3">
        <Skeleton className="h-3 w-16" rounded="full" />
        <Skeleton className="h-10 w-64" rounded="md" />
      </div>
      <div className="mb-5 flex flex-wrap gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24" rounded="md" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
