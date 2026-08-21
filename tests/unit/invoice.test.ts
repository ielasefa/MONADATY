import { describe, it, expect } from "vitest";
import {
  generateSignedToken,
  verifySignedToken,
} from "@/lib/invoice";
import path from "path";
import { INVOICE_ROOT, invoiceFilePath } from "@/lib/invoice-storage";

describe("lib/invoice — token helpers", () => {
  describe("generateSignedToken / verifySignedToken", () => {
    it("verifies a freshly generated token", () => {
      const token = generateSignedToken("INV-2024-05-001");
      const verified = verifySignedToken(token);
      expect(verified).toBe("INV-2024-05-001");
    });

    it("rejects a tampered token", () => {
      const token = generateSignedToken("INV-2024-05-001");
      const tampered = token.slice(0, -2) + "AA";
      expect(verifySignedToken(tampered)).toBeNull();
    });

    it("rejects a malformed token (no signature)", () => {
      expect(verifySignedToken("no-signature-here")).toBeNull();
    });

    it("rejects a malformed signature length without throwing", () => {
      expect(verifySignedToken("cGF5bG9hZA.short")).toBeNull();
    });
  });

  describe("invoiceFilePath", () => {
    it("resolves a valid virtual invoice path inside the configured root", () => {
      expect(invoiceFilePath("/invoices/MON-INV-000001-safe.pdf")).toBe(
        path.join(INVOICE_ROOT, "MON-INV-000001-safe.pdf"),
      );
    });

    it("rejects traversal and non-PDF paths", () => {
      expect(invoiceFilePath("/invoices/../../secret.pdf")).toBeNull();
      expect(invoiceFilePath("/invoices/file.svg")).toBeNull();
    });
  });
});
