import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { signSessionToken, verifySessionToken } from "@/lib/session-token";

describe("admin session token HMAC", () => {
  it("verifies a freshly signed token and exposes its expiry", async () => {
    const sessionId = crypto.randomUUID();
    const expiresAt = Date.now() + 60_000;
    const verified = await verifySessionToken(await signSessionToken(sessionId, expiresAt));

    expect(verified).toEqual({ sessionId, expiresAt });
  });

  it("rejects an expired token", async () => {
    const signed = await signSessionToken(crypto.randomUUID(), Date.now() - 1);
    expect(await verifySessionToken(signed)).toBeNull();
  });

  it("rejects a tampered signature", async () => {
    const signed = await signSessionToken(crypto.randomUUID());
    const tampered = `${signed.slice(0, -1)}${signed.endsWith("a") ? "b" : "a"}`;
    expect(await verifySessionToken(tampered)).toBeNull();
  });

  it("rejects malformed signatures without throwing", async () => {
    await expect(verifySessionToken("session.short")).resolves.toBeNull();
    await expect(verifySessionToken("not-signed")).resolves.toBeNull();
    await expect(verifySessionToken("token.")).resolves.toBeNull();
  });
});
