import { describe, expect, it } from "vitest";
import { adminLoginDestination } from "@/lib/admin-login-destination";

describe("admin login destination", () => {
  it("retains a requested admin page and its query", () => {
    expect(adminLoginDestination("/admin/landing?section=featured", false)).toBe("/admin/landing?section=featured");
  });
  it.each([undefined, "/admin/login", "/admin/login/", "/admin/login?redirect=/admin/login", "//evil.test", "https://evil.test", "/admin/../../shop", "/admin/\\evil.test"])(
    "avoids login loops and external redirects for %s", requested => {
      expect(adminLoginDestination(requested, false)).toBe("/admin/dashboard");
    },
  );
  it("prioritizes the required password change", () => {
    expect(adminLoginDestination("/admin/landing", true)).toBe("/admin/change-password");
  });
});
