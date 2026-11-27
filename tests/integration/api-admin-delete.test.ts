import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({ prisma: {} }));
vi.mock("@/lib/logger", () => ({ logError: vi.fn() }));
vi.mock("@/lib/auth-guard", () => ({ requireSuperAdmin: vi.fn() }));
vi.mock("@/lib/csrf", () => ({ requireOrigin: vi.fn() }));
vi.mock("@/lib/auth", () => ({ getAuthenticatedAdmin: vi.fn() }));
vi.mock("@/lib/audit", () => ({ createAuditLog: vi.fn() }));
vi.mock("@/lib/admin-deletion", async importOriginal => ({
  ...await importOriginal<typeof import("@/lib/admin-deletion")>(),
  deleteAdminAccount: vi.fn(),
}));

import { requireSuperAdmin } from "@/lib/auth-guard";
import { requireOrigin } from "@/lib/csrf";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { AdminDeletionError, deleteAdminAccount } from "@/lib/admin-deletion";
import { DELETE } from "@/app/api/admin/admins/[id]/route";

const remove = () => DELETE(new Request("http://localhost/api/admin/admins/target", { method: "DELETE" }), { params: Promise.resolve({ id: "target" }) });

describe("administrator deletion API", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(requireSuperAdmin).mockResolvedValue(null);
    vi.mocked(requireOrigin).mockReturnValue(null);
    vi.mocked(getAuthenticatedAdmin).mockResolvedValue({ id: "owner", name: "Owner", role: "SUPER_ADMIN" } as never);
    vi.mocked(deleteAdminAccount).mockResolvedValue({ id: "target", name: "Target", email: "target@example.test", role: "ADMIN" });
  });

  it("rejects a request without super administrator access before any mutation", async () => {
    vi.mocked(requireSuperAdmin).mockResolvedValue(new Response("Forbidden", { status: 403 }) as never);
    expect((await remove()).status).toBe(403);
    expect(deleteAdminAccount).not.toHaveBeenCalled();
  });

  it("rejects an untrusted origin before any mutation", async () => {
    vi.mocked(requireOrigin).mockReturnValue(new Response("Forbidden", { status: 403 }) as never);
    expect((await remove()).status).toBe(403);
    expect(deleteAdminAccount).not.toHaveBeenCalled();
  });

  it("rejects an expired session before any mutation", async () => {
    vi.mocked(getAuthenticatedAdmin).mockResolvedValue(null);
    expect((await remove()).status).toBe(401);
    expect(deleteAdminAccount).not.toHaveBeenCalled();
  });

  it("deletes only the requested account and records its identity", async () => {
    const response = await remove();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(deleteAdminAccount).toHaveBeenCalledTimes(1);
    expect(deleteAdminAccount).toHaveBeenCalledWith("target", "owner");
    expect(createAuditLog).toHaveBeenCalledWith(expect.objectContaining({ adminId: "owner", adminName: "Owner", action: "delete", entityId: "target", oldValue: JSON.stringify({ name: "Target", email: "target@example.test", role: "ADMIN" }) }));
  });

  it.each([
    ["ADMIN_NOT_FOUND", 404],
    ["CANNOT_DELETE_LAST_ADMIN", 400],
    ["CANNOT_DELETE_LAST_SUPER_ADMIN", 400],
    ["CANNOT_DELETE_CURRENT_ADMIN", 400],
    ["FORBIDDEN", 403],
  ] as const)("returns %s without creating a deletion audit event", async (code, status) => {
    vi.mocked(deleteAdminAccount).mockRejectedValue(new AdminDeletionError(code, status));
    const response = await remove();
    expect(response.status).toBe(status);
    expect(await response.json()).toEqual({ error: code });
    expect(createAuditLog).not.toHaveBeenCalled();
  });

  it.each([
    ["P2003", 409, "ADMIN_HAS_HISTORY"],
    ["P2034", 409, "ADMIN_DELETE_CONFLICT"],
    ["P2025", 404, "ADMIN_NOT_FOUND"],
    ["P1001", 500, "DELETE_FAILED"],
  ])("handles database failure %s with a usable error code", async (code, status, error) => {
    vi.mocked(deleteAdminAccount).mockRejectedValue({ code });
    const response = await remove();
    expect(response.status).toBe(status);
    expect(await response.json()).toEqual({ error });
    expect(createAuditLog).not.toHaveBeenCalled();
  });
});
