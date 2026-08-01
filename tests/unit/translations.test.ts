import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getLanguageFromCookie, LANGUAGE_COOKIE, SUPPORTED_LANGUAGES, type Language } from "@/lib/translations";

describe("lib/translations — cookie language helpers", () => {
  describe("SUPPORTED_LANGUAGES", () => {
    it("includes fr, en, ar", () => {
      expect(SUPPORTED_LANGUAGES).toEqual<Language[]>(["fr", "en", "ar"]);
    });
  });

  describe("LANGUAGE_COOKIE", () => {
    it("is a stable name", () => {
      expect(LANGUAGE_COOKIE).toBe("monadaty_lang");
    });
  });

  describe("getLanguageFromCookie", () => {
    it("returns fr for fr value", () => {
      expect(getLanguageFromCookie("fr")).toBe<Language>("fr");
    });

    it("returns en for en value", () => {
      expect(getLanguageFromCookie("en")).toBe<Language>("en");
    });

    it("returns ar for ar value", () => {
      expect(getLanguageFromCookie("ar")).toBe<Language>("ar");
    });

    it("falls back to fr for unknown or missing value", () => {
      expect(getLanguageFromCookie("de")).toBe<Language>("fr");
      expect(getLanguageFromCookie()).toBe<Language>("fr");
      expect(getLanguageFromCookie("")).toBe<Language>("fr");
    });
  });
});
