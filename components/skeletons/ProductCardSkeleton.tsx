import { Skeleton } from "./Skeleton";

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`overflow-hidden rounded-2xl border border-line bg-card p-2 sm:p-3 ${className || ""}`}>
      <div className="relative aspect-square overflow-hidden rounded-xl">
        <Skeleton className="absolute inset-0" rounded="none" />
        <div className="relative z-10 flex h-full w-full items-center justify-center">
          <Skeleton className="h-40 w-28" rounded="md" />
        </div>
      </div>
      <div className="space-y-3 px-1 pb-3 pt-4">
        <Skeleton className="h-3 w-24" rounded="full" />
        <Skeleton className="h-12 w-full" rounded="md" />
        <Skeleton className="h-5 w-20" rounded="md" />
      </div>
      <div className="grid grid-cols-[48px_minmax(0,1fr)] gap-2 px-1 pb-1">
        <Skeleton className="h-11 w-full" rounded="md" />
        <Skeleton className="h-11 w-full" rounded="md" />
      </div>
    </div>
  );
}
