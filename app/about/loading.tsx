import { Skeleton } from "@/components/skeletons/Skeleton";

export default function AboutLoading() {
  return (
    <div className="container-premium py-12">
      <div className="mx-auto max-w-4xl space-y-12">
        <div className="text-center space-y-4">
          <Skeleton className="mx-auto h-3 w-24" rounded="full" />
          <Skeleton className="mx-auto h-12 w-80" rounded="lg" />
          <Skeleton className="mx-auto h-5 w-96 max-w-full" rounded="md" />
        </div>
        <Skeleton className="mx-auto h-px w-12" rounded="full" />
        <div className="grid gap-8 md:grid-cols-2">
          <Skeleton className="aspect-[4/3] w-full" rounded="card" />
          <div className="space-y-4">
            <Skeleton className="h-5 w-48" rounded="md" />
            <Skeleton className="h-4 w-full" rounded="md" />
            <Skeleton className="h-4 w-5/6" rounded="md" />
            <Skeleton className="h-4 w-4/6" rounded="md" />
          </div>
        </div>
      </div>
    </div>
  );
}
