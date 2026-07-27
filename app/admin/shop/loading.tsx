import { Skeleton } from "@/components/skeletons/Skeleton";

export default function AdminShopLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" rounded="lg" />
        <Skeleton className="h-10 w-36 rounded-full" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-strong overflow-hidden rounded-2xl">
            <Skeleton className="aspect-[4/3] w-full" rounded="none" />
            <div className="space-y-2 p-4">
              <Skeleton className="h-4 w-32" rounded="md" />
              <Skeleton className="h-3 w-20" rounded="full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
