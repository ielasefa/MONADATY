import { afterEach, describe, it, expect, vi } from "vitest";
import { validateOrigin } from "@/lib/csrf";

function makeRequest(origin?: string, referer?: string, host?: string): Request {
  const headers = new Headers();
  if (origin) headers.set("origin", origin);
  if (referer) headers.set("referer", referer);
  if (host) headers.set("host", host);
  return new Request("http://localhost:3000/api/test", { headers });
}

describe("lib/csrf — validateOrigin", () => {
  afterEach(() => vi.unstubAllEnvs());
  it.each(["127.0.0.1", "192.168.1.10", "10.0.0.5", "[::1]"])("handles Next development host normalization for %s", host => {
    vi.stubEnv("NODE_ENV", "development");
    const origin = "http://" + host + ":3459";
    expect(validateOrigin(new Request("http://localhost:3459/api/admin/login", { headers: { origin, host: host + ":3459" } }))).toBe(true);
  });
  it("does not accept a forged different local port", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(validateOrigin(new Request("http://localhost:3000/api/admin/login", { headers: {
      origin: "http://127.0.0.1:3459", host: "127.0.0.1:3459",
    } }))).toBe(false);
  });
  it.each(["http://localhost:3001", "http://127.0.0.1:3459", "http://[::1]:3002"])("accepts same-origin local development on %s", origin => {
    vi.stubEnv("NODE_ENV", "development");
    expect(validateOrigin(new Request(origin + "/api/admin/login", { headers: { origin } }))).toBe(true);
  });
  it("keeps the production origin allowlist strict", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("APP_URL", "https://monadaty.com");
    vi.stubEnv("ALLOWED_ORIGINS", "https://monadaty.com");
    expect(validateOrigin(new Request("http://localhost:3001/api/admin/login", { headers: { origin: "http://localhost:3001" } }))).toBe(false);
  });
  it("rejects unconfigured public same-origin hosts in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(validateOrigin(new Request("http://evil.test/api/admin/login", { headers: { origin: "http://evil.test" } }))).toBe(false);
  });
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
