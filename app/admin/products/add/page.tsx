import { ProductForm } from "@/components/admin/ProductForm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Add Product — Admin",
};

export default function AddProductPage() {
  return (
    <div className="container-shell py-10">
      <ProductForm />
    </div>
  );
}
