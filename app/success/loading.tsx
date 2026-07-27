import { Skeleton } from "@/components/skeletons/Skeleton";

export default function SuccessLoading() {
  return (
    <div className="container-premium flex min-h-[60vh] items-center justify-center py-20">
      <div className="border border-ivory/[0.06] bg-black-surface rounded-md px-12 py-16 max-w-lg text-center">
        <Skeleton className="mx-auto h-16 w-16" rounded="sm" />
        <Skeleton className="mx-auto mt-6 h-8 w-48" rounded="lg" />
        <Skeleton className="mx-auto mt-4 h-4 w-64" rounded="md" />
        <Skeleton className="mx-auto mt-2 h-4 w-48" rounded="md" />
        <Skeleton className="mx-auto my-8 h-px w-12" rounded="full" />
        <Skeleton className="mx-auto h-12 w-48 rounded-md" />
      </div>
    </div>
  );
}
