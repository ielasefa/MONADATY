import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { mockRequireAdmin, lowStockThreshold, findMany, count } = vi.hoisted(() => ({
  mockRequireAdmin: vi.fn<() => Promise<Response | null>>(),
  lowStockThreshold: { _ref: "lowStockThreshold", _container: "Product" },
  findMany: vi.fn(),
  count: vi.fn(),
}));

vi.mock("@/lib/auth-guard", () => ({ requireAdmin: () => mockRequireAdmin() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      fields: { lowStockThreshold },
      findMany,
      count,
    },
  },
}));

import { GET } from "@/app/api/admin/products/list/route";

const request = (query = "") => new NextRequest(`http://localhost/api/admin/products/list${query}`);

describe("GET /api/admin/products/list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAdmin.mockResolvedValue(null);
    findMany.mockResolvedValue([{ id: "p1", name: "Coca Cola", stock: 3, lowStockThreshold: 3 }]);
    count.mockResolvedValue(21);
  });

  it("returns stock data with filtered pagination totals", async () => {
    const response = await GET(request("?search=COCA&stock=low&page=2&pageSize=10"));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.products[0]).toMatchObject({ stock: 3, lowStockThreshold: 3 });
    expect(body.pagination).toEqual({ page: 2, pageSize: 10, total: 21, totalPages: 3 });

    const listWhere = findMany.mock.calls[0][0].where;
    expect(listWhere.stock).toEqual({ gt: 0, lte: lowStockThreshold });
    expect(listWhere.OR[0]).toEqual({ name: { contains: "COCA", mode: "insensitive" } });
    expect(findMany.mock.calls[0][0]).toMatchObject({ skip: 10, take: 10 });
    expect(count).toHaveBeenCalledWith({ where: listWhere });
  });

  it("keeps category, search, sort and pagination in one server query", async () => {
    await GET(request("?categoryId=cat-1&search=cola&sort=stock-desc&page=3&pageSize=5"));
    const query = findMany.mock.calls[0][0];
    expect(query.where.categoryId).toBe("cat-1");
    expect(query.where.OR).toBeDefined();
    expect(query.orderBy).toEqual([{ stock: "desc" }, { id: "asc" }]);
    expect(query).toMatchObject({ skip: 10, take: 5 });
    expect(count.mock.calls[0][0].where).toBe(query.where);
  });

  it("does not query products for an unauthenticated request", async () => {
    mockRequireAdmin.mockResolvedValueOnce(new Response("Unauthorized", { status: 401 }));
    const response = await GET(request());
    expect(response.status).toBe(401);
    expect(findMany).not.toHaveBeenCalled();
  });
});
