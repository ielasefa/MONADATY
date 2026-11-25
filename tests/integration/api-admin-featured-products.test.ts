import { beforeEach, describe, expect, it, vi } from "vitest";

const origin = vi.fn();
const auth = vi.fn();
const transaction = { landingSection: { deleteMany: vi.fn(), createMany: vi.fn() } };
vi.mock("@/lib/csrf", () => ({ requireOrigin: () => origin() }));
vi.mock("@/lib/auth", () => ({ getAuthenticatedAdmin: () => auth() }));
vi.mock("@/lib/landing-cms", () => ({ saveSection: vi.fn() }));
vi.mock("@/lib/logger", () => ({ logError: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    landingConfig: { findFirst: vi.fn() },
    product: { count: vi.fn() },
    $transaction: vi.fn(),
  },
}));
import { prisma } from "@/lib/prisma";
import { saveSection } from "@/lib/landing-cms";
import { PUT } from "@/app/api/admin/landing/featured-products/route";
import { revalidateTag } from "next/cache";

const ids = ["cola", "water", "juice", "sprite"];
const request = (body: unknown = { productIds: ids }) => new Request("http://localhost/api/admin/landing/featured-products", {
  method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
});

describe("admin homepage selection", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    origin.mockReturnValue(null);
    auth.mockResolvedValue({ id: "admin", name: "Admin" });
    vi.mocked(prisma.landingConfig.findFirst).mockRejectedValue({ code: "P2021" });
    vi.mocked(prisma.product.count).mockResolvedValue(4);
    vi.mocked(prisma.$transaction).mockImplementation(async (callback: unknown) =>
      (callback as (tx: typeof transaction) => Promise<unknown>)(transaction) as never);
  });

  it("checks origin before authentication or writes", async () => {
    origin.mockReturnValue(new Response("Forbidden", { status: 403 }));
    expect((await PUT(request())).status).toBe(403);
    expect(auth).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("rejects an unauthenticated request", async () => {
    auth.mockResolvedValue(null);
    expect((await PUT(request())).status).toBe(401);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it.each([null, {}, { productIds: "a,b,c,d" }, { productIds: ["a", "b", "c"] }, { productIds: [...ids, "fifth"] }, { productIds: ["a", "a", "b", "c"] }])(
    "rejects incomplete, duplicate, and excessive selections without writes: %j", async body => {
      expect((await PUT(request(body))).status).toBe(400);
      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(saveSection).not.toHaveBeenCalled();
    },
  );

  it("does not replace saved entries when a selected product is unavailable", async () => {
    vi.mocked(prisma.product.count).mockResolvedValue(3);
    const response = await PUT(request());
    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe("PRODUCTS_UNAVAILABLE");
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("atomically persists all four positions on an existing legacy database", async () => {
    expect((await PUT(request())).status).toBe(200);
    expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function), { isolationLevel: "Serializable" });
    expect(transaction.landingSection.deleteMany).toHaveBeenCalledWith({ where: { section: "featured_products" } });
    expect(transaction.landingSection.createMany).toHaveBeenCalledWith({
      data: ids.map((productId, position) => ({ section: "featured_products", productId, position, enabled: true })),
    });
    expect(revalidateTag).toHaveBeenCalledWith("landing");
  });

  it("retains versioned CMS saving when those tables exist", async () => {
    vi.mocked(prisma.landingConfig.findFirst).mockResolvedValue({ id: "cms" } as never);
    expect((await PUT(request())).status).toBe(200);
    expect(saveSection).toHaveBeenCalledWith("cms", "featured", { productIds: ids.join(",") }, "Admin");
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("does not switch to legacy writes for an unrelated database failure", async () => {
    vi.mocked(prisma.landingConfig.findFirst).mockRejectedValue(new Error("connection failed"));
    expect((await PUT(request())).status).toBe(500);
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("reports a concurrent save conflict without invalidating the saved page", async () => {
    vi.mocked(prisma.$transaction).mockRejectedValue({ code: "P2034" });
    expect((await PUT(request())).status).toBe(409);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
