import { describe, expect, it } from "vitest";
import { landingText } from "@/lib/landing-text";

describe("landing CMS text", () => {
  it("uses localized copy for empty and bundled seed values", () => {
    expect(landingText("  ", "Boissons en gros")).toBe("Boissons en gros");
    expect(landingText("Our Story", "Notre histoire", ["Our Story"])).toBe("Notre histoire");
  });

  it("preserves authored overrides, including Arabic and line breaks", () => {
    expect(landingText("  مخزون متجرك\nفي مكان واحد  ", "Fallback", ["Our Story"]))
      .toBe("مخزون متجرك\nفي مكان واحد");
  });
});
