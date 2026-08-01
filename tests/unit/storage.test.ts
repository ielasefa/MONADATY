import { describe, it, expect } from "vitest";
import { validateFile, getPublicUrl, urlToFilepath } from "@/lib/storage";

function makeFile(name: string, type: string, sizeBytes: number): File {
  const buffer = new Uint8Array(Math.min(sizeBytes, 1024));
  return new File([buffer], name, { type });
}

describe("lib/storage — file validation", () => {
  describe("validateFile", () => {
    it("accepts a valid JPEG image", () => {
      const file = makeFile("photo.jpg", "image/jpeg", 1024 * 100);
      const result = validateFile(file);
      expect(result.valid).toBe(true);
    });

    it("accepts a valid PNG image", () => {
      const file = makeFile("logo.png", "image/png", 1024 * 50);
      const result = validateFile(file);
      expect(result.valid).toBe(true);
    });

    it("accepts a WebP image", () => {
      const file = makeFile("hero.webp", "image/webp", 1024 * 10);
      const result = validateFile(file);
      expect(result.valid).toBe(true);
    });

    it("rejects a file with a disallowed MIME type", () => {
      const file = makeFile("doc.pdf", "application/pdf", 1024);
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toMatch(/type/i);
      }
    });

    it("rejects a file with a disallowed extension", () => {
      const file = makeFile("payload.exe", "image/png", 1024);
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toMatch(/extension/i);
      }
    });

    it("rejects filename containing path traversal", () => {
      const file = makeFile("../../etc/passwd.png", "image/png", 1024);
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error).toMatch(/filename/i);
      }
    });
  });

  describe("getPublicUrl", () => {
    it("returns a path under /uploads/<subfolder>/<filename>", () => {
      expect(getPublicUrl("products", "abc.jpg")).toBe("/uploads/products/abc.jpg");
    });
  });

  describe("urlToFilepath", () => {
    it("returns the filesystem path for a public URL", () => {
      expect(urlToFilepath("/uploads/products/abc.jpg")).toContain("products/abc.jpg");
    });

    it("returns null for URLs outside /uploads", () => {
      expect(urlToFilepath("https://example.com/foo.jpg")).toBeNull();
    });
  });
});
