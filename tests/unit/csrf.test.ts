import { describe, it, expect } from "vitest";
import { validateOrigin } from "@/lib/csrf";

function makeRequest(origin?: string, referer?: string, host?: string): Request {
  const headers = new Headers();
  if (origin) headers.set("origin", origin);
  if (referer) headers.set("referer", referer);
  if (host) headers.set("host", host);
  return new Request("http://localhost:3000/api/test", { headers });
}

describe("lib/csrf — validateOrigin", () => {
  it("rejects when neither origin nor referer present", () => {
    expect(validateOrigin(makeRequest())).toBe(false);
  });

  it("accepts when origin matches allowed", () => {
    expect(validateOrigin(makeRequest("http://localhost:3000"))).toBe(true);
  });

  it("rejects when origin does not match", () => {
    expect(validateOrigin(makeRequest("http://evil.com"))).toBe(false);
  });

  it("does not trust a matching Host header as an origin allowlist", () => {
    expect(validateOrigin(makeRequest("http://evil.com", undefined, "evil.com"))).toBe(false);
  });

  it("falls back to referer when origin absent", () => {
    expect(validateOrigin(makeRequest(undefined, "http://localhost:3000/page"))).toBe(true);
  });

  it("rejects malformed referer", () => {
    expect(validateOrigin(makeRequest(undefined, "not-a-url"))).toBe(false);
  });

  it("rejects referer from disallowed host", () => {
    expect(validateOrigin(makeRequest(undefined, "http://evil.com/page"))).toBe(false);
  });
});
