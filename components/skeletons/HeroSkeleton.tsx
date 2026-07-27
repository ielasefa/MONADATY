import { Skeleton } from "./Skeleton";

export function HeroSkeleton() {
  return (
    <div className="flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 py-24 md:px-12 lg:flex-row lg:items-center lg:gap-16 lg:py-0">
      <div className="flex-1 space-y-8 lg:max-w-2xl">
        <Skeleton className="h-3 w-32" rounded="full" />
        <div className="space-y-3">
          <Skeleton className="h-16 w-3/4 md:h-24" rounded="md" />
          <Skeleton className="h-16 w-2/3 md:h-24" rounded="md" />
        </div>
        <Skeleton className="h-5 w-80 max-w-full" rounded="md" />
        <Skeleton className="h-5 w-64 max-w-full" rounded="md" />
        <div className="flex gap-4 pt-4">
          <Skeleton className="h-12 w-40" rounded="md" />
          <Skeleton className="h-12 w-40" rounded="md" />
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center pt-16 lg:pt-0">
        <Skeleton className="h-[320px] w-[320px] md:h-[400px] md:w-[400px]" rounded="md" />
      </div>
    </div>
  );
}
