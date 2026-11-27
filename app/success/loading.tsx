import { CheckoutProgress } from "@/components/CheckoutProgress";

export default function SuccessLoading() {
  return (
    <div className="market-checkout">
      <div className="storefront-container">
        <CheckoutProgress />
      </div>
    </div>
  );
}
