import { describe, it, expect, beforeEach, vi } from "vitest";

const mockRequireOrigin = vi.fn<() => null | Response>(() => null);
const mockGetAuthenticatedAdmin = vi.fn();

vi.mock("@/lib/csrf", () => ({
  requireOrigin: () => mockRequireOrigin(),
}));
vi.mock("@/lib/auth", () => ({
  getAuthenticatedAdmin: () => mockGetAuthenticatedAdmin(),
}));
vi.mock("@/lib/landing-cms", () => ({
  saveSeo: vi.fn(() => Promise.resolve()),
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    landingConfig: {
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { PUT } from "@/app/api/admin/landing/seo/route";

const mockedFindUnique = vi.mocked(prisma.landingConfig.findUnique);

const validBody = {
  configId: "cfg-1",
  title: "MONADATY — Premium Moroccan Beverages",
  metaDescription: "Refined soda experience shaped in Morocco.",
  ogTitle: "MONADATY",
  ogDescription: "Premium Moroccan beverages",
  ogImage: "https://example.com/og.jpg",
  canonicalUrl: "https://example.com",
};

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/admin/landing/seo", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("PUT /api/admin/landing/seo", () => {
  beforeEach(() => {
    mockRequireOrigin.mockReset();
    mockRequireOrigin.mockReturnValue(null);
    mockGetAuthenticatedAdmin.mockReset();
    mockGetAuthenticatedAdmin.mockResolvedValue({
      id: "a1",
      name: "Admin",
      email: "admin@x.com",
      role: "ADMIN",
    });
    mockedFindUnique.mockReset();
    mockedFindUnique.mockResolvedValue({ id: "cfg-1" } as never);
  });

  it("rejects invalid CSRF origin", async () => {
    mockRequireOrigin.mockReturnValueOnce(
      new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 }),
    );

    const res = await PUT(makeRequest(validBody) as never);
    expect(res.status).toBe(403);
  });

  it("rejects unauthenticated requests", async () => {
    mockGetAuthenticatedAdmin.mockResolvedValueOnce(null as never);

    const res = await PUT(makeRequest(validBody) as never);
    expect(res.status).toBe(401);
  });

  it("rejects missing configId", async () => {
    const res = await PUT(makeRequest({ ...validBody, configId: undefined }) as never);
    expect(res.status).toBe(400);
  });

  it("returns 404 when config not found", async () => {
    mockedFindUnique.mockResolvedValueOnce(null as never);

    const res = await PUT(makeRequest(validBody) as never);
    expect(res.status).toBe(404);
  });

  it("rejects invalid canonical URL", async () => {
    const res = await PUT(makeRequest({ ...validBody, canonicalUrl: "not-a-url" }) as never);
    expect(res.status).toBe(400);
  });

  it("rejects invalid ogImage URL", async () => {
    const res = await PUT(makeRequest({ ...validBody, ogImage: "bad-url" }) as never);
    expect(res.status).toBe(400);
  });

  it("saves SEO on valid request", async () => {
    const res = await PUT(makeRequest(validBody) as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it("accepts empty optional fields", async () => {
    const body = {
      configId: "cfg-1",
      title: "",
      metaDescription: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      canonicalUrl: "",
    };
    const res = await PUT(makeRequest(body) as never);
    expect(res.status).toBe(200);
  });
});
