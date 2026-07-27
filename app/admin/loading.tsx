import { Skeleton } from "@/components/skeletons/Skeleton";

export default function AdminLoading() {
  return (
    <div className="flex min-h-screen">
      <div className="glass-strong flex w-64 flex-col border-r border-white/[0.06] bg-surface p-3">
        <div className="flex h-16 items-center gap-3 border-b border-white/[0.06] px-5">
          <Skeleton className="h-8 w-8 shrink-0" rounded="lg" />
          <Skeleton className="h-5 w-24" rounded="md" />
        </div>
        <div className="mt-4 space-y-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" rounded="lg" />
          ))}
        </div>
      </div>
      <div className="flex-1 p-6">
        <Skeleton className="h-8 w-48" rounded="lg" />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" rounded="card" />
          ))}
        </div>
      </div>
    </div>
  );
}
