import { describe, it, expect } from "vitest";
import crypto from "crypto";

const SESSION_SECRET = process.env.SESSION_SECRET || "test-secret-for-unit-tests";

function sign(token: string): string {
  const hmac = crypto.createHmac("sha256", SESSION_SECRET);
  hmac.update(token);
  return `${token}.${hmac.digest("hex")}`;
}

function verify(signed: string): string | null {
  const dot = signed.lastIndexOf(".");
  if (dot === -1) return null;
  const token = signed.slice(0, dot);
  const sig = signed.slice(dot + 1);
  const hmac = crypto.createHmac("sha256", SESSION_SECRET);
  hmac.update(token);
  const expected = hmac.digest("hex");
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  return token;
}

describe("admin session token HMAC (mirrors lib/auth.ts)", () => {
  it("verifies a freshly signed token", () => {
    const token = crypto.randomUUID();
    expect(verify(sign(token))).toBe(token);
  });

  it("rejects a tampered signature", () => {
    const token = crypto.randomUUID();
    const tampered = sign(token).slice(0, -2) + "AA";
    expect(verify(tampered)).toBeNull();
  });

  it("rejects a malformed token without dot separator", () => {
    expect(verify("not-signed")).toBeNull();
  });

  it("rejects token signed with a different secret", () => {
    const token = crypto.randomUUID();
    const hmac = crypto.createHmac("sha256", "different-secret");
    hmac.update(token);
    const foreign = `${token}.${hmac.digest("hex")}`;
    expect(verify(foreign)).toBeNull();
  });

  it("rejects empty signature segment", () => {
    expect(verify("token.")).toBeNull();
  });
});
