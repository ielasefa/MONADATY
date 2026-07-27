import { Skeleton } from "@/components/skeletons/Skeleton";

export default function CheckoutLoading() {
  return (
    <div className="container-premium py-12">
      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" rounded="lg" />
          <div className="border border-ivory/[0.06] bg-black-surface space-y-4 rounded-md p-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-24" rounded="sm" />
                <Skeleton className="h-12 w-full" rounded="sm" />
              </div>
            ))}
          </div>
        </div>
        <div className="border border-ivory/[0.06] bg-black-surface space-y-4 rounded-md p-6">
          <Skeleton className="h-5 w-32" rounded="md" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-16 w-14 shrink-0" rounded="lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-28" rounded="md" />
                <Skeleton className="h-3 w-16" rounded="md" />
              </div>
            </div>
          ))}
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}
