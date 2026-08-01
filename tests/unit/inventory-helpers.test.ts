import { describe, it, expect } from "vitest";
import { generateBarcode, generateQRData } from "@/lib/inventory";

describe("lib/inventory — pure helpers", () => {
  describe("generateBarcode", () => {
    it("prefixes the cleaned id with the given prefix", () => {
      const result = generateBarcode("MON", "abc-123");
      expect(result.startsWith("MON")).toBe(true);
      expect(result).toMatch(/^MON[A-Z0-9]+\d$/);
    });

    it("strips dashes from the id", () => {
      const a = generateBarcode("X", "id-with-dashes-12345");
      expect(a).not.toContain("-");
    });

    it("produces deterministic output for the same input", () => {
      expect(generateBarcode("X", "id-1")).toBe(generateBarcode("X", "id-1"));
    });

    it("produces different output for different inputs", () => {
      expect(generateBarcode("X", "id-1")).not.toBe(generateBarcode("X", "id-2"));
    });

    it("ends with a single check digit", () => {
      const result = generateBarcode("P", "prod-1");
      expect(result).toMatch(/\d$/);
      expect(result.slice(-1)).toMatch(/^\d$/);
    });
  });

  describe("generateQRData", () => {
    it("includes type, id, and sku", () => {
      const qr = generateQRData("product", "p1", "sku-1");
      expect(qr).toContain("product");
      expect(qr).toContain("p1");
      expect(qr).toContain("sku-1");
    });

    it("produces deterministic output", () => {
      expect(generateQRData("a", "b", "c")).toBe(generateQRData("a", "b", "c"));
    });
  });
});
