import { HeroSkeleton } from "@/components/skeletons/HeroSkeleton";

export default function RootLoading() {
  return (
    <div className="min-h-screen">
      <HeroSkeleton />
    </div>
  );
}
