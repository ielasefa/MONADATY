import { describe, it, expect } from "vitest";
import { getLanguageFromCookie } from "@/lib/translations";

describe("initial site language", () => {
  it("starts in Arabic without a saved choice", () => {
    expect(getLanguageFromCookie()).toBe("ar");
    expect(getLanguageFromCookie("")).toBe("ar");
  });

  it("keeps an explicit language choice", () => {
    for (const lang of ["ar", "fr", "en"]) {
      expect(getLanguageFromCookie(lang)).toBe(lang);
    }
  });

  it("uses Arabic for an unsupported saved value", () => {
    expect(getLanguageFromCookie("de")).toBe("ar");
  });
});
