import { Skeleton } from "./Skeleton";

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={`overflow-hidden rounded-md border border-ivory/[0.06] bg-black-surface ${className || ""}`}>
      <div className="relative aspect-[4/5] overflow-hidden p-6">
        <Skeleton className="absolute inset-0" rounded="none" />
        <div className="relative z-10 flex h-full w-full items-center justify-center">
          <Skeleton className="h-40 w-28" rounded="md" />
        </div>
      </div>
      <div className="space-y-3 px-5 pb-5 pt-5 md:px-6">
        <Skeleton className="h-3 w-24" rounded="full" />
        <Skeleton className="h-5 w-40" rounded="md" />
        <Skeleton className="h-5 w-20" rounded="md" />
      </div>
      <div className="px-5 pb-5 md:px-6">
        <Skeleton className="h-11 w-full" rounded="md" />
      </div>
    </div>
  );
}
