import { describe, it, expect, beforeEach, vi } from "vitest";

const mockRequireOrigin = vi.fn<() => null | Response>(() => null);
const mockRequireAdmin = vi.fn<() => Promise<null | Response>>(() => Promise.resolve(null));

vi.mock("@/lib/csrf", () => ({
  requireOrigin: () => mockRequireOrigin(),
}));
vi.mock("@/lib/auth-guard", () => ({
  requireAdmin: () => mockRequireAdmin(),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    adminNotification: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { POST } from "@/app/api/admin/notifications/read/route";

const mockedFindUnique = vi.mocked(prisma.adminNotification.findUnique);
const mockedUpdate = vi.mocked(prisma.adminNotification.update);

function makeRequest(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/admin/notifications/read", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

describe("POST /api/admin/notifications/read", () => {
  beforeEach(() => {
    mockRequireOrigin.mockReset();
    mockRequireOrigin.mockReturnValue(null);
    mockRequireAdmin.mockReset();
    mockRequireAdmin.mockResolvedValue(null);
    mockedFindUnique.mockReset();
    mockedUpdate.mockReset();
    mockedUpdate.mockResolvedValue({ id: "n1", read: true } as never);
  });

  it("rejects requests with invalid CSRF origin", async () => {
    mockRequireOrigin.mockReturnValueOnce(
      new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 }),
    );

    const res = await POST(makeRequest({ id: "n1" }) as never);
    expect(res.status).toBe(403);
  });

  it("rejects unauthenticated requests", async () => {
    mockRequireAdmin.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }),
    );

    const res = await POST(makeRequest({ id: "n1" }) as never);
    expect(res.status).toBe(401);
  });

  it("rejects invalid id", async () => {
    const res = await POST(makeRequest({ id: 123 }) as never);
    expect(res.status).toBe(400);
  });

  it("rejects missing id", async () => {
    const res = await POST(makeRequest({}) as never);
    expect(res.status).toBe(400);
  });

  it("returns 404 when notification does not exist", async () => {
    mockedFindUnique.mockResolvedValueOnce(null as never);

    const res = await POST(makeRequest({ id: "missing" }) as never);
    expect(res.status).toBe(404);
  });

  it("marks notification as read on success", async () => {
    mockedFindUnique.mockResolvedValueOnce({ id: "n1", read: false } as never);

    const res = await POST(makeRequest({ id: "n1" }) as never);
    expect(res.status).toBe(200);
    expect(mockedUpdate).toHaveBeenCalledWith({
      where: { id: "n1" },
      data: { read: true },
    });
  });

  it("returns 500 on database error", async () => {
    mockedFindUnique.mockRejectedValueOnce(new Error("db down"));

    const res = await POST(makeRequest({ id: "n1" }) as never);
    expect(res.status).toBe(500);
  });
});
