import { describe, it, expect } from "vitest";
import {
  generateSignedToken,
  verifySignedToken,
} from "@/lib/invoice";

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
  });
});
