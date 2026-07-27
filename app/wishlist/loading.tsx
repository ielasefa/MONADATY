import { Skeleton } from "@/components/skeletons/Skeleton";

export default function WishlistLoading() {
  return (
    <div className="container-premium py-12">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-3 w-20" rounded="full" />
        <Skeleton className="h-10 w-48" rounded="lg" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-md border border-ivory/[0.06] bg-black-surface">
            <Skeleton className="aspect-[4/5] w-full" rounded="none" />
            <div className="space-y-3 p-6">
              <Skeleton className="h-5 w-36" rounded="md" />
              <Skeleton className="h-5 w-20" rounded="md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
