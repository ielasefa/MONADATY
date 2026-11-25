import { beforeEach, describe, expect, it, vi } from "vitest";
const auth = vi.fn();
vi.mock("@/lib/auth", () => ({ getAuthenticatedAdmin: () => auth() }));
import { GET } from "@/app/api/admin/session/route";

describe("admin session confirmation", () => {
  beforeEach(() => auth.mockReset());
  it("requires a retained and valid authenticated cookie", async () => {
    auth.mockResolvedValue(null);
    const response = await GET();
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ authenticated: false });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
  it("confirms the session without returning profile or token data", async () => {
    auth.mockResolvedValue({ email: "private@example.test", mustChangePassword: false });
    expect(await (await GET()).json()).toEqual({ authenticated: true, mustChangePassword: false });
  });
  it("retains the password-change requirement", async () => {
    auth.mockResolvedValue({ mustChangePassword: true });
    expect(await (await GET()).json()).toEqual({ authenticated: true, mustChangePassword: true });
  });
});
