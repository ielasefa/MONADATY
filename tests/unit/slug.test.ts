import { describe, it, expect } from "vitest";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

describe("slug helpers (slugify)", () => {
  it("lowercases the input", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("removes accents", () => {
    expect(slugify("café crème brûlée")).toBe("cafe-creme-brulee");
  });

  it("replaces spaces with dashes", () => {
    expect(slugify("Premium Moroccan Soda")).toBe("premium-moroccan-soda");
  });

  it("collapses multiple separators into one dash", () => {
    expect(slugify("foo   --   bar___baz")).toBe("foo-bar-baz");
  });

  it("strips leading and trailing dashes", () => {
    expect(slugify("---hello---")).toBe("hello");
  });

  it("truncates to 80 characters", () => {
    const long = "a".repeat(120);
    expect(slugify(long).length).toBe(80);
  });

  it("handles Arabic by stripping all non-ASCII characters (empty slug)", () => {
    // Arabic has no ASCII representation; the slug becomes empty after stripping.
    const result = slugify("مرحبا بالعالم");
    expect(result).toBe("");
  });

  it("handles empty input", () => {
    expect(slugify("")).toBe("");
  });
});
