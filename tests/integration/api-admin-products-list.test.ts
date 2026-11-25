import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const mocks = vi.hoisted(() => ({ auth: vi.fn(), raw: vi.fn(), products: vi.fn(), transaction: vi.fn() }));
vi.mock("@/lib/auth-guard", () => ({ requireAdmin: mocks.auth }));
vi.mock("@/lib/prisma", () => ({ prisma: { $transaction: mocks.transaction } }));
import { GET } from "@/app/api/admin/products/list/route";
const request = (query = "") => new NextRequest(`http://localhost/api/admin/products/list${query}`);
describe("GET /api/admin/products/list", () => {
  beforeEach(() => {
    vi.clearAllMocks(); mocks.raw.mockReset(); mocks.auth.mockResolvedValue(null);
    mocks.raw.mockResolvedValueOnce([{ total: 21 }]).mockResolvedValueOnce([{ id: "p1" }]);
    mocks.products.mockResolvedValue([{ id: "p1", name: "Coca Cola", stock: 3, lowStockThreshold: 3 }]);
    mocks.transaction.mockImplementation(callback => callback({ $queryRaw: mocks.raw, product: { findMany: mocks.products } }));
  });
  it("returns filtered totals and a consistent paginated stock snapshot", async () => {
    const response = await GET(request("?search=COCA&stock=low&page=2&pageSize=10"));
    const body = await response.json();
    expect(response.status).toBe(200); expect(response.headers.get("cache-control")).toBe("no-store");
    expect(body.products[0]).toMatchObject({ stock: 3, lowStockThreshold: 3 });
    expect(body.pagination).toEqual({ page: 2, pageSize: 10, total: 21, totalPages: 3 });
    const count = mocks.raw.mock.calls[0][0], page = mocks.raw.mock.calls[1][0];
    expect(count.text).toContain('p.stock <= p."lowStockThreshold"');
    expect(count.values).toContain("%coca%"); expect(page.values.slice(-2)).toEqual([10, 10]);
    expect(mocks.transaction.mock.calls[0][1]).toEqual({ isolationLevel: "RepeatableRead" });
  });
  it("combines category, normalized terms and stable stock sorting without interpolating input", async () => {
    await GET(request("?categoryId=cat-1&search=cola&sort=stock-desc&page=3&pageSize=5"));
    const query = mocks.raw.mock.calls[1][0];
    expect(query.values).toContain("cat-1"); expect(query.text).not.toContain("cat-1");
    expect(query.text).toContain("p.stock DESC, p.id ASC"); expect(query.values.slice(-2)).toEqual([5,10]);
  });
  it("does not query products for an unauthenticated request", async () => {
    mocks.auth.mockResolvedValueOnce(new Response("Unauthorized", { status: 401 }));
    expect((await GET(request())).status).toBe(401); expect(mocks.transaction).not.toHaveBeenCalled();
  });
});
