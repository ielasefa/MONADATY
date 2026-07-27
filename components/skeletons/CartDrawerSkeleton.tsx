import { Skeleton } from "./Skeleton";

export function CartDrawerSkeleton() {
  return (
    <div className="space-y-4 px-6 py-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-4 rounded-md border border-ivory/[0.06] bg-black-surface p-3">
          <Skeleton className="h-24 w-20 shrink-0" rounded="md" />
          <div className="flex flex-1 flex-col justify-between py-1">
            <div className="space-y-2">
              <Skeleton className="h-2.5 w-20" rounded="full" />
              <Skeleton className="h-4 w-32" rounded="md" />
              <Skeleton className="h-4 w-16" rounded="md" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-7 w-24" rounded="md" />
              <Skeleton className="h-4 w-14" rounded="md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
