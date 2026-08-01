import { describe, it, expect } from "vitest";
import type { Language } from "@/lib/translation-utils";

function detectInitialLanguage(opts: {
  htmlLang?: string | null;
  cookie?: string | null;
  browser?: string;
}): Language {
  const lang = (opts.cookie ?? opts.htmlLang ?? opts.browser ?? "fr").toLowerCase().split("-")[0];
  if (lang === "en") return "en";
  if (lang === "ar") return "ar";
  return "fr";
}

describe("language detection (cookie > html > browser)", () => {
  it("prefers cookie over html and browser", () => {
    expect(
      detectInitialLanguage({ htmlLang: "en", cookie: "ar", browser: "en-US" }),
    ).toBe<Language>("ar");
  });

  it("falls back to html lang when no cookie", () => {
    expect(detectInitialLanguage({ cookie: undefined, htmlLang: "en", browser: "fr-FR" })).toBe<Language>("en");
  });

  it("falls back to browser lang when no cookie and no html", () => {
    expect(detectInitialLanguage({ browser: "ar-MA" })).toBe<Language>("ar");
  });

  it("defaults to French (brand language)", () => {
    expect(detectInitialLanguage({})).toBe<Language>("fr");
    expect(detectInitialLanguage({ htmlLang: "de", browser: "es" })).toBe<Language>("fr");
  });

  it("handles locale tags by taking the primary subtag", () => {
    expect(detectInitialLanguage({ browser: "en-GB" })).toBe<Language>("en");
    expect(detectInitialLanguage({ browser: "ar-SA" })).toBe<Language>("ar");
  });
});
