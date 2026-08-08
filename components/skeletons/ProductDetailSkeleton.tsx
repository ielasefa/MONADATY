import { Skeleton } from "./Skeleton";

export function ProductDetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-8 lg:px-12">
      {/* Breadcrumb */}
      <div className="pt-10 md:pt-16">
        <div className="flex items-center gap-3">
          <Skeleton className="h-2.5 w-10" rounded="full" />
          <Skeleton className="h-2.5 w-2" rounded="full" />
          <Skeleton className="h-2.5 w-10" rounded="full" />
          <Skeleton className="h-2.5 w-2" rounded="full" />
          <Skeleton className="h-2.5 w-16" rounded="full" />
        </div>
      </div>

      {/* Hero: gallery 5 / info 7 */}
      <section className="pb-24 pt-8 md:pb-32 md:pt-16">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-16 xl:gap-24">
          {/* Gallery column */}
          <div className="lg:col-span-5">
            <div className="flex flex-col items-center gap-6 md:gap-8">
              <div className="w-full max-w-[440px] overflow-hidden rounded-3xl border border-white/[0.06] bg-white">
                <div className="flex w-full items-center justify-center p-10 md:p-14" style={{ minHeight: "520px" }}>
                  <Skeleton className="h-full w-full" rounded="lg" />
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <Skeleton className="h-16 w-16" rounded="lg" />
                <Skeleton className="h-16 w-16" rounded="lg" />
                <Skeleton className="h-16 w-16" rounded="lg" />
              </div>
            </div>
          </div>

          {/* Info column */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-4">
              <Skeleton className="h-px w-10" rounded="none" />
              <Skeleton className="h-2.5 w-24" rounded="full" />
            </div>
            <Skeleton className="mt-8 h-11 w-4/5" rounded="md" />
            <Skeleton className="mt-8 h-3 w-32" rounded="full" />
            <Skeleton className="mt-10 h-9 w-36" rounded="md" />
            <div className="mt-8 space-y-3">
              <Skeleton className="h-3.5 w-full" rounded="full" />
              <Skeleton className="h-3.5 w-5/6" rounded="full" />
              <Skeleton className="h-3.5 w-2/3" rounded="full" />
            </div>

            {/* Purchase panel */}
            <div className="mt-10 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 md:p-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
                <Skeleton className="h-14 w-full lg:w-36" rounded="lg" />
                <Skeleton className="h-14 flex-1" rounded="lg" />
                <Skeleton className="h-14 flex-1" rounded="lg" />
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-6">
                <Skeleton className="h-3 w-20" rounded="full" />
                <Skeleton className="h-3 w-28" rounded="full" />
              </div>
            </div>

            {/* At-a-glance */}
            <div className="mt-14 grid grid-cols-1 gap-y-8 border-t border-white/[0.06] pt-10 sm:grid-cols-3 sm:gap-x-8">
              <Skeleton className="h-8" rounded="md" />
              <Skeleton className="h-8" rounded="md" />
              <Skeleton className="h-8" rounded="md" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}