import { describe, it, expect } from "vitest";
import { checkRateLimit, rateLimit } from "@/lib/rate-limiter";

describe("lib/rate-limiter", () => {
  describe("checkRateLimit", () => {
    it("allows first request", () => {
      const key = `test:first:${Date.now()}-${Math.random()}`;
      const result = checkRateLimit(key, 3, 1000);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
    });

    it("decrements remaining on each request", () => {
      const key = `test:decr:${Date.now()}-${Math.random()}`;
      checkRateLimit(key, 3, 1000);
      const second = checkRateLimit(key, 3, 1000);
      expect(second.allowed).toBe(true);
      expect(second.remaining).toBe(1);
    });

    it("blocks when limit exceeded", () => {
      const key = `test:block:${Date.now()}-${Math.random()}`;
      checkRateLimit(key, 2, 1000);
      checkRateLimit(key, 2, 1000);
      const blocked = checkRateLimit(key, 2, 1000);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
    });

    it("resets after the window expires", async () => {
      const key = `test:reset:${Date.now()}-${Math.random()}`;
      checkRateLimit(key, 1, 50);
      const blocked = checkRateLimit(key, 1, 50);
      expect(blocked.allowed).toBe(false);
      await new Promise((resolve) => setTimeout(resolve, 60));
      const afterReset = checkRateLimit(key, 1, 50);
      expect(afterReset.allowed).toBe(true);
    });

    it("isolates keys from each other", () => {
      const base = `${Date.now()}-${Math.random()}`;
      checkRateLimit(`k-a-${base}`, 1, 1000);
      checkRateLimit(`k-a-${base}`, 1, 1000);
      const otherKey = checkRateLimit(`k-b-${base}`, 1, 1000);
      expect(otherKey.allowed).toBe(true);
    });
  });

  describe("rateLimit", () => {
    it("returns true (blocked) when limit exceeded", () => {
      const key = `test:wrapper:${Date.now()}-${Math.random()}`;
      rateLimit(key, 1, 1000);
      expect(rateLimit(key, 1, 1000)).toBe(true);
    });

    it("returns false (allowed) when under limit", () => {
      const key = `test:wrapper-ok:${Date.now()}-${Math.random()}`;
      expect(rateLimit(key, 5, 1000)).toBe(false);
    });
  });
});
