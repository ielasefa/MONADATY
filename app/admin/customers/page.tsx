import type { Metadata } from "next";
import { getCustomers } from "@/lib/customers";
import { CustomersClient } from "./CustomersClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Customers",
};

export default async function AdminCustomersPage() {
  const customers = await getCustomers();
  return (
    <div className="min-h-screen bg-bg">
      <div className="container-shell mx-auto px-6 py-10">
        <CustomersClient customers={customers} />
      </div>
    </div>
  );
}
