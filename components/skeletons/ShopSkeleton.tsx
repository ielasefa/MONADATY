import { Skeleton } from "./Skeleton";
import { ProductCardSkeleton } from "./ProductCardSkeleton";

export function ShopSkeleton() {
  return (
    <div className="container-premium py-12">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-3 w-16" rounded="full" />
        <Skeleton className="h-8 w-48" rounded="md" />
      </div>
      <div className="mb-8 flex gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24" rounded="md" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
