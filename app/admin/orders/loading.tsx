import { Skeleton } from "@/components/skeletons/Skeleton";

export default function AdminOrdersLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" rounded="lg" />
        <Skeleton className="h-4 w-24" rounded="full" />
      </div>
      <div className="glass-strong overflow-hidden rounded-2xl">
        <div className="space-y-0">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-white/[0.04] px-6 py-4">
              <Skeleton className="h-4 w-20" rounded="full" />
              <Skeleton className="h-4 w-32" rounded="md" />
              <Skeleton className="h-4 w-24" rounded="full" />
              <Skeleton className="ml-auto h-4 w-16" rounded="full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
