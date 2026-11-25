import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({ prisma: { translation: { findMany: vi.fn() } } }));
import { prisma } from "@/lib/prisma";
import { loadTranslationNamespaces } from "@/lib/translations";

const findMany = vi.mocked(prisma.translation.findMany);

describe("administration translation defaults", () => {
  beforeEach(() => { findMany.mockReset(); });

  it("provides all three languages when the earlier database lacks UI entries", async () => {
    findMany.mockResolvedValue([]);
    const copy = await loadTranslationNamespaces(["admin"]);
    expect(copy.admin.product_management).toEqual({ fr: "Gestion des produits", en: "Product management", ar: "إدارة المنتجات" });
    expect(copy.admin.welcome_back.fr).toBe("Bon retour");
    expect(copy.admin.welcome_back.ar).not.toBe(copy.admin.welcome_back.en);
  });

  it("preserves nonempty CMS text verbatim and fills only empty languages", async () => {
    findMany.mockResolvedValue([{ namespace: "admin", key: "product_management", fr: "Mon catalogue personnalisé", en: "", ar: "  " }] as never);
    const copy = await loadTranslationNamespaces(["admin"]);
    expect(copy.admin.product_management).toEqual({ fr: "Mon catalogue personnalisé", en: "Product management", ar: "إدارة المنتجات" });
  });

  it("does not invent defaults in a public or custom namespace", async () => {
    findMany.mockResolvedValue([]);
    expect(await loadTranslationNamespaces(["common", "custom"])).toEqual({ common: {}, custom: {} });
  });

  it("keeps administration labels available during a translation database failure", async () => {
    findMany.mockRejectedValue(new Error("translation database unavailable"));
    const copy = await loadTranslationNamespaces(["admin", "auth"]);
    expect(copy.admin.product_management.fr).toBe("Gestion des produits");
    expect(copy.auth.password_changed_success.ar).toBe("تم تغيير كلمة المرور.");
  });

  it("retains new CMS keys without substituting another label", async () => {
    findMany.mockResolvedValue([{ namespace: "admin", key: "custom_title", fr: "Sur mesure", en: "Custom", ar: "مخصص" }] as never);
    const copy = await loadTranslationNamespaces(["admin"]);
    expect(copy.admin.custom_title).toEqual({ fr: "Sur mesure", en: "Custom", ar: "مخصص" });
  });
});
