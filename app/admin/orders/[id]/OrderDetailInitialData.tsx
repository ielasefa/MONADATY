"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { StoredOrder } from "@/types";

export type InitialInvoice = {
  id: string;
  invoiceNumber: string;
  orderId: string;
  status: string;
  pdfPath: string | null;
  createdAt: string;
};

type OrderDetailInitialData = {
  order: StoredOrder | null;
  invoice: InitialInvoice | null;
};

const InitialDataContext = createContext<OrderDetailInitialData | null>(null);

export function OrderDetailInitialDataProvider({
  children,
  order,
  invoice,
}: OrderDetailInitialData & { children: ReactNode }) {
  return (
    <InitialDataContext.Provider value={{ order, invoice }}>
      {children}
    </InitialDataContext.Provider>
  );
}

export function useOrderDetailInitialData() {
  const value = useContext(InitialDataContext);
  if (!value) throw new Error("Order detail initial data is unavailable");
  return value;
}
