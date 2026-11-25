import { Skeleton } from "./Skeleton";

export function ProductDetailSkeleton() {
  return (
    <div className="storefront-container py-5" style={{ maxWidth: 1280 }} aria-busy="true">
      <Skeleton className="h-4 w-48" />
      <div className="mt-6 grid items-start gap-7 md:grid-cols-[0.85fr_1.15fr] lg:gap-12">
        <div className="mx-auto w-full max-w-[420px] rounded-2xl border border-line bg-white p-5">
          <Skeleton className="h-[220px] w-full md:h-[350px]" rounded="lg" />
        </div>
        <div className="space-y-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-4/5" />
          <Skeleton className="h-4 w-28" />
          <div className="border-y border-line py-4"><Skeleton className="h-8 w-32" /></div>
          <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></div>
          <div className="space-y-4 rounded-xl border border-line bg-white p-4">
            <Skeleton className="h-12 w-36" />
            <div className="grid grid-cols-2 gap-3"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
