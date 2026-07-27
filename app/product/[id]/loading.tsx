import { ProductDetailSkeleton } from "@/components/skeletons/ProductDetailSkeleton";

export default function ProductLoading() {
  return (
    <div className="min-h-screen">
      <ProductDetailSkeleton />
    </div>
  );
}
