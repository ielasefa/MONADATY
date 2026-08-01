import { describe, it, expect } from "vitest";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  CURRENCY_SYMBOL,
  CURRENCY_CODE,
  PAYMENT_METHOD_LABELS,
  getPaymentMethodLabel,
  ORDER_STATUS_WORKFLOW,
  TERMINAL_STATUSES,
  getStatusMeta,
  isTerminalStatus,
  getWorkflowIndex,
} from "@/lib/config";

describe("lib/config — order/payment status workflow", () => {
  describe("ORDER_STATUSES", () => {
    it("contains every expected lifecycle status", () => {
      expect(ORDER_STATUSES).toContain("pending");
      expect(ORDER_STATUSES).toContain("processing");
      expect(ORDER_STATUSES).toContain("shipped");
      expect(ORDER_STATUSES).toContain("out_for_delivery");
      expect(ORDER_STATUSES).toContain("delivered");
      expect(ORDER_STATUSES).toContain("completed");
      expect(ORDER_STATUSES).toContain("cancelled");
      expect(ORDER_STATUSES).toContain("refunded");
    });
  });

  describe("PAYMENT_STATUSES", () => {
    it("contains pending, paid, refunded", () => {
      expect(PAYMENT_STATUSES).toEqual(["pending", "paid", "refunded"]);
    });
  });

  describe("CURRENCY", () => {
    it("uses DH for display and MAD for ISO", () => {
      expect(CURRENCY_SYMBOL).toBe("DH");
      expect(CURRENCY_CODE).toBe("MAD");
    });
  });

  describe("getPaymentMethodLabel", () => {
    it("returns the human label for known methods", () => {
      expect(getPaymentMethodLabel("cash_on_delivery")).toBe("Cash on Delivery");
      expect(getPaymentMethodLabel("card")).toBe("Card Payment");
      expect(getPaymentMethodLabel("bank_transfer")).toBe("Bank Transfer");
    });

    it("falls back to the raw method id when unknown", () => {
      expect(getPaymentMethodLabel("crypto")).toBe("crypto");
    });
  });

  describe("ORDER_STATUS_WORKFLOW", () => {
    it("covers all linear statuses", () => {
      const statuses = ORDER_STATUS_WORKFLOW.map((s) => s.status);
      expect(statuses).toContain("pending");
      expect(statuses).toContain("delivered");
      expect(statuses).toContain("completed");
    });

    it("does not include terminal statuses in the linear workflow", () => {
      const statuses = ORDER_STATUS_WORKFLOW.map((s) => s.status);
      expect(statuses).not.toContain("cancelled");
      expect(statuses).not.toContain("refunded");
    });
  });

  describe("TERMINAL_STATUSES", () => {
    it("only contains cancelled and refunded", () => {
      expect(Object.keys(TERMINAL_STATUSES).sort()).toEqual(["cancelled", "refunded"]);
    });
  });

  describe("getStatusMeta", () => {
    it("returns workflow step for linear status", () => {
      const meta = getStatusMeta("shipped");
      expect(meta?.label).toBe("Shipped");
    });

    it("returns terminal meta for cancelled", () => {
      expect(getStatusMeta("cancelled")?.label).toBe("Cancelled");
    });

    it("returns undefined for unknown status", () => {
      expect(getStatusMeta("unknown")).toBeUndefined();
    });
  });

  describe("isTerminalStatus", () => {
    it("returns true for cancelled and refunded", () => {
      expect(isTerminalStatus("cancelled")).toBe(true);
      expect(isTerminalStatus("refunded")).toBe(true);
    });

    it("returns false for linear and unknown statuses", () => {
      expect(isTerminalStatus("shipped")).toBe(false);
      expect(isTerminalStatus("anything")).toBe(false);
    });
  });

  describe("getWorkflowIndex", () => {
    it("returns the workflow index for a linear status", () => {
      expect(getWorkflowIndex("pending")).toBe(0);
      expect(getWorkflowIndex("delivered")).toBeGreaterThan(0);
    });

    it("returns -1 for unknown status", () => {
      expect(getWorkflowIndex("unknown")).toBe(-1);
    });
  });
});
