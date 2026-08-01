import { describe, it, expect } from "vitest";
import { parseMoney, formatMoney, formatPrice } from "@/lib/money";

describe("lib/money", () => {
  describe("parseMoney", () => {
    it("extracts numeric value from 'DH' price string", () => {
      expect(parseMoney("120.50 DH")).toBe(120.5);
    });

    it("returns 0 for empty string", () => {
      expect(parseMoney("")).toBe(0);
    });

    it("returns 0 for non-numeric string", () => {
      expect(parseMoney("abc")).toBe(0);
    });

    it("strips currency symbols and spaces", () => {
      expect(parseMoney("€ 99.99")).toBe(99.99);
      expect(parseMoney("$120")).toBe(120);
    });

    it("handles integer values", () => {
      expect(parseMoney("50 DH")).toBe(50);
    });

    it("strips text but keeps digits and dots", () => {
      expect(parseMoney("1,200.50 DH")).toBe(1200.5);
    });
  });

  describe("formatMoney", () => {
    it("formats with two decimals and DH suffix", () => {
      expect(formatMoney(99.5)).toBe("99.50 DH");
      expect(formatMoney(0)).toBe("0.00 DH");
      expect(formatMoney(1200)).toBe("1200.00 DH");
    });

    it("rounds to two decimal places", () => {
      expect(formatMoney(99.999)).toBe("100.00 DH");
      expect(formatMoney(99.994)).toBe("99.99 DH");
    });
  });

  describe("formatPrice", () => {
    it("parses and formats a price string", () => {
      expect(formatPrice("49.99 DH")).toBe("49.99 DH");
      expect(formatPrice("100")).toBe("100.00 DH");
    });

    it("returns 0.00 DH for invalid price", () => {
      expect(formatPrice("abc")).toBe("0.00 DH");
    });
  });
});
