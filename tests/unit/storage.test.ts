import { describe, it, expect } from "vitest";
import { detectImageMimeType, validateFile, getPublicUrl, urlToFilepath } from "@/lib/storage";

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

    it("accepts a GIF image", () => {
      const file = makeFile("animation.gif", "image/gif", 1024 * 10);
      expect(validateFile(file).valid).toBe(true);
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

    it("rejects a mismatched MIME type and extension", () => {
      const file = makeFile("payload.jpg", "image/png", 1024);
      const result = validateFile(file);
      expect(result.valid).toBe(false);
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

  describe("detectImageMimeType", () => {
    it("detects image contents from magic bytes", () => {
      expect(detectImageMimeType(Buffer.from("89504e470d0a1a0a", "hex"))).toBe("image/png");
      expect(detectImageMimeType(Buffer.from("ffd8ff00", "hex"))).toBe("image/jpeg");
      expect(detectImageMimeType(Buffer.from("GIF89a", "ascii"))).toBe("image/gif");
    });

    it("rejects arbitrary bytes", () => {
      expect(detectImageMimeType(Buffer.from("not an image"))).toBeNull();
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

    it("returns null for nested traversal paths", () => {
      expect(urlToFilepath("/uploads/products/../../secret")).toBeNull();
      expect(urlToFilepath("/uploads/unknown/file.jpg")).toBeNull();
    });
  });
});
