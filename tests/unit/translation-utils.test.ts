import { describe, it, expect } from "vitest";
import {
  interpolate,
  resolveTranslation,
  NAMESPACES,
  DEFAULT_LANGUAGE,
  type Language,
} from "@/lib/translation-utils";

describe("lib/translation-utils", () => {
  describe("interpolate", () => {
    it("replaces single placeholder", () => {
      expect(interpolate("Hello {{name}}", { name: "World" })).toBe("Hello World");
    });

    it("replaces multiple placeholders", () => {
      expect(interpolate("{{a}} and {{b}}", { a: "1", b: "2" })).toBe("1 and 2");
    });

    it("keeps placeholder when replacement is undefined", () => {
      expect(interpolate("{{x}}", {})).toBe("{{x}}");
    });

    it("returns template unchanged when no replacements", () => {
      expect(interpolate("Hello {{name}}")).toBe("Hello {{name}}");
      expect(interpolate("Hello {{name}}", undefined)).toBe("Hello {{name}}");
    });

    it("converts numbers to strings", () => {
      expect(interpolate("Count: {{n}}", { n: 42 })).toBe("Count: 42");
    });
  });

  describe("resolveTranslation", () => {
    it("returns translation for requested language", () => {
      expect(resolveTranslation({ fr: "Bonjour", en: "Hello" }, "en")).toBe("Hello");
    });

    it("falls back to French when target language missing", () => {
      expect(resolveTranslation({ fr: "Bonjour" }, "en")).toBe("Bonjour");
    });

    it("returns undefined when entry is not provided", () => {
      expect(resolveTranslation(undefined, "en")).toBeUndefined();
      expect(resolveTranslation(undefined, "en", "Fallback")).toBeUndefined();
    });

    it("skips empty translations", () => {
      expect(resolveTranslation({ fr: "  ", en: "Hello" }, "en")).toBe("Hello");
    });

    it("falls back from French to itself correctly", () => {
      expect(resolveTranslation({ fr: "Bonjour" }, "fr")).toBe("Bonjour");
    });
  });

  describe("NAMESPACES", () => {
    it("includes expected critical namespaces", () => {
      expect(NAMESPACES).toContain("common");
      expect(NAMESPACES).toContain("products");
      expect(NAMESPACES).toContain("checkout");
      expect(NAMESPACES).toContain("cart");
      expect(NAMESPACES).toContain("admin");
    });
  });

  describe("DEFAULT_LANGUAGE", () => {
    it("is French for a Moroccan brand", () => {
      expect(DEFAULT_LANGUAGE).toBe<Language>("fr");
    });
  });
});
