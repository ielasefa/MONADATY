import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    translation: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import { GET } from "@/app/api/translations/route";

const mockedFindMany = vi.mocked(prisma.translation.findMany);

function makeRequest(url = "http://localhost/api/translations?namespace=common"): Request {
  return new Request(url);
}

describe("GET /api/translations", () => {
  beforeEach(() => {
    mockedFindMany.mockReset();
  });

  it("returns translations for the requested namespace", async () => {
    mockedFindMany.mockResolvedValueOnce([
      { key: "hello", fr: "Bonjour", en: "Hello", ar: "مرحبا" },
      { key: "bye", fr: "Au revoir", en: "Goodbye", ar: "وداعا" },
    ] as never);

    const res = await GET(makeRequest() as never);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.namespace).toBe("common");
    expect(body.translations.hello.fr).toBe("Bonjour");
    expect(body.translations.bye.en).toBe("Goodbye");
  });

  it("defaults to the common namespace", async () => {
    mockedFindMany.mockResolvedValueOnce([] as never);

    await GET(makeRequest("http://localhost/api/translations") as never);

    expect(mockedFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { namespace: "common" } }),
    );
  });

  it("returns empty translations object when no rows", async () => {
    mockedFindMany.mockResolvedValueOnce([] as never);

    const res = await GET(makeRequest() as never);
    const body = await res.json();

    expect(body.translations).toEqual({});
  });

  it("returns empty translations on database error (graceful)", async () => {
    mockedFindMany.mockRejectedValueOnce(new Error("db down"));

    const res = await GET(makeRequest() as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.translations).toEqual({});
  });
});
