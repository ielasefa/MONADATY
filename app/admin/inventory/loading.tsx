import { Skeleton } from "@/components/skeletons/Skeleton";

export default function InventoryLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" rounded="md" />
          <Skeleton className="h-8 w-48" rounded="lg" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" rounded="card" />
        ))}
      </div>
      <Skeleton className="h-64 w-full" rounded="card" />
    </div>
  );
}
