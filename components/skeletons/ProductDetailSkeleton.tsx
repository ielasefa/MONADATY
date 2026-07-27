import { Skeleton } from "./Skeleton";

export function ProductDetailSkeleton() {
  return (
    <div className="container-premium py-12">
      <div className="grid gap-12 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-md bg-black-surface p-8">
          <Skeleton className="h-full w-full" rounded="md" />
        </div>
        <div className="flex flex-col justify-center space-y-6">
          <Skeleton className="h-3 w-24" rounded="full" />
          <Skeleton className="h-10 w-3/4" rounded="md" />
          <Skeleton className="h-7 w-28" rounded="md" />
          <div className="h-px w-12 bg-ivory/[0.08] my-2" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" rounded="md" />
            <Skeleton className="h-4 w-5/6" rounded="md" />
            <Skeleton className="h-4 w-4/6" rounded="md" />
          </div>
          <div className="flex gap-3 pt-4">
            <Skeleton className="h-12 w-36" rounded="md" />
            <Skeleton className="h-12 w-12" rounded="md" />
          </div>
        </div>
      </div>
    </div>
  );
}
