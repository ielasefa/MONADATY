import { Skeleton } from "@/components/skeletons/Skeleton";

export default function CollectionsLoading() {
  return (
    <div className="container-premium py-12">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-3 w-24" rounded="full" />
        <Skeleton className="h-10 w-64" rounded="lg" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-md border border-ivory/[0.06] bg-black-surface">
            <Skeleton className="aspect-[16/9] w-full" rounded="none" />
            <div className="space-y-3 p-6">
              <Skeleton className="h-5 w-40" rounded="md" />
              <Skeleton className="h-3 w-28" rounded="full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
