import { Skeleton } from "./Skeleton";

export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" rounded="lg" />
        <Skeleton className="h-4 w-32" rounded="full" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="skeleton-shimmer-wave animate-pulse rounded-xl border border-white/[0.06] bg-[#11100F] p-5">
            <Skeleton className="h-3 w-8" rounded="full" />
            <Skeleton className="mt-3 h-2 w-16" rounded="full" />
            <Skeleton className="mt-2 h-5 w-20" rounded="md" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/[0.06] bg-[#11100F] p-6">
            <Skeleton className="mb-4 h-4 w-32" rounded="md" />
            <Skeleton className="h-48 w-full" rounded="lg" />
          </div>
        ))}
      </div>
      <div>
        <Skeleton className="mb-4 h-4 w-24" rounded="md" />
        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-white/[0.06] bg-[#11100F] p-4">
              <Skeleton className="mx-auto h-6 w-6" rounded="full" />
              <Skeleton className="mx-auto mt-2 h-3 w-16" rounded="full" />
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-strong rounded-2xl p-6">
            <Skeleton className="h-3 w-20" rounded="full" />
            <Skeleton className="mt-3 h-7 w-28" rounded="md" />
            <Skeleton className="mt-2 h-3 w-16" rounded="full" />
          </div>
        ))}
      </div>
      <div className="glass-strong rounded-2xl p-6">
        <Skeleton className="mb-4 h-5 w-36" rounded="md" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" rounded="lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
