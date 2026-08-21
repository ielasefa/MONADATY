import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || "admin@monadaty.com";
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || "change-this-to-a-strong-password";
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3458";
const ORIGIN = new URL(BASE_URL).origin;

const FIXTURE_JPG = path.resolve(process.cwd(), "public/uploads/monadaty/about/5fb44afa0e6c41ab.jpg");
const FIXTURE_WEBP = path.resolve(process.cwd(), "public/uploads/monadaty/about/2789d4863fd742f1.webp");
const FIXTURE_PNG = path.resolve(process.cwd(), "public/icons/icon-192.png");
const ONE_BY_ONE_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

async function loginViaApi(page: Page) {
  const response = await page.request.post(`${ORIGIN}/api/admin/login`, {
    headers: { Origin: ORIGIN },
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  expect(response.status()).toBe(200);
}

async function upload(page: Page, file: { name: string; mimeType: string; buffer: Buffer }, folder = "products") {
  return page.request.post(`${ORIGIN}/api/admin/products/upload`, {
    headers: { Origin: ORIGIN },
    multipart: {
      files: {
        name: file.name,
        mimeType: file.mimeType,
        buffer: file.buffer,
      },
      folder,
    },
  });
}

test("upload validation accepts every supported format and rejects every invalid variant", async ({ page }) => {
  const validUploads: { url: string; publicId: string }[] = [];

  try {
    await loginViaApi(page);

    // Unauthenticated uploads must be rejected before any validation work.
    const anonContext = await page.context().browser()!.newContext();
    const anonymous = await anonContext.request.post(`${ORIGIN}/api/admin/products/upload`, {
      headers: { Origin: ORIGIN },
      multipart: {
        files: { name: "anon.png", mimeType: "image/png", buffer: readFileSync(FIXTURE_PNG) },
        folder: "products",
      },
    });
    await anonContext.close();
    expect(anonymous.status()).toBe(401);

    for (const [index, fixture] of [
      { name: "edge-jpg.jpg", mimeType: "image/jpeg", buffer: readFileSync(FIXTURE_JPG) },
      { name: "edge-webp.webp", mimeType: "image/webp", buffer: readFileSync(FIXTURE_WEBP) },
    ].entries()) {
      const response = await upload(page, fixture);
      expect(response.status(), `${fixture.mimeType} should be accepted`).toBe(200);
      const data = await response.json();
      expect(data.images).toHaveLength(1);
      expect(data.images[0].url).toMatch(new RegExp(`^/uploads/products/[a-zA-Z0-9_.-]+${index === 0 ? "\\.jpg" : "\\.webp"}$`));
      validUploads.push({ url: data.images[0].url, publicId: data.images[0].publicId });
      expect((await page.request.get(`${ORIGIN}${data.images[0].url}`)).status()).toBe(200);
    }

    const rejects: { label: string; file: { name: string; mimeType: string; buffer: Buffer }; folder?: string; status?: number; message?: RegExp }[] = [
      {
        label: "invalid extension",
        file: { name: "payload.txt", mimeType: "image/png", buffer: readFileSync(FIXTURE_PNG) },
        message: /Invalid file extension/,
      },
      {
        label: "undeclared MIME type",
        file: { name: "payload.png", mimeType: "application/octet-stream", buffer: readFileSync(FIXTURE_PNG) },
        message: /Invalid file type/,
      },
      {
        label: "MIME spoof (PNG bytes declared as GIF)",
        file: { name: "spoof.gif", mimeType: "image/gif", buffer: readFileSync(FIXTURE_PNG) },
        message: /File contents do not match the declared type/,
      },
      {
        label: "oversized file",
        file: { name: "huge.png", mimeType: "image/png", buffer: Buffer.concat([readFileSync(FIXTURE_PNG), Buffer.alloc(11 * 1024 * 1024, 1)]) },
        message: /File too large/,
      },
      {
        label: "dimensions below minimum",
        file: { name: "tiny.png", mimeType: "image/png", buffer: ONE_BY_ONE_PNG },
        message: /Image too small/,
      },
      {
        label: "path traversal folder",
        file: { name: "escape.png", mimeType: "image/png", buffer: readFileSync(FIXTURE_PNG) },
        folder: "../../etc",
        message: /Invalid upload folder/,
      },
      {
        label: "folder outside allowlist",
        file: { name: "legacy.png", mimeType: "image/png", buffer: readFileSync(FIXTURE_PNG) },
        folder: "monadaty/about",
        message: /Invalid upload folder/,
      },
    ];

    for (const candidate of rejects) {
      const response = await upload(page, candidate.file, candidate.folder);
      expect(response.status(), candidate.label).toBe(400);
      const body = await response.json();
      expect(body.error, candidate.label).toMatch(candidate.message!);
    }

    // Attach the valid uploads to one disposable product so cleanup exercises
    // the real reference-counted deletion path for every stored format.
    const created = await page.request.post(`${ORIGIN}/api/admin/products`, {
      headers: { Origin: ORIGIN, "Content-Type": "application/json" },
      data: {
        name: `E2E-EdgeFormat-${Date.now()}`,
        slug: `e2e-edge-format-${Date.now()}`,
        regularPrice: "5.00 MAD",
        stock: 1,
        status: "Draft",
        images: validUploads.map((image, idx) => ({
          ...image,
          alt: "",
          sortOrder: idx,
          isCover: idx === 0,
          width: 100,
          height: 100,
          format: "",
          bytes: 0,
          imageHash: "",
          blurDataURL: "",
        })),
      },
    });
    expect(created.status()).toBe(201);
    const { product } = await created.json();

    const deleted = await page.request.delete(`${ORIGIN}/api/admin/products/${product.id}`, {
      headers: { Origin: ORIGIN },
    });
    expect(deleted.status()).toBe(200);

    for (const image of validUploads) {
      await expect.poll(async () => (await page.request.get(`${ORIGIN}${image.url}`)).status()).toBe(404);
    }
  } finally {
    // Safety net if an assertion throws before the disposable product was removed.
    const list = await page.request.get(`${ORIGIN}/api/admin/products/list`);
    if (list.ok()) {
      const data = await list.json();
      const leftovers = (data.products || []).filter((candidate: { name: string }) =>
        candidate.name.startsWith("E2E-EdgeFormat-"),
      );
      for (const leftover of leftovers) {
        await page.request.delete(`${ORIGIN}/api/admin/products/${leftover.id}`, { headers: { Origin: ORIGIN } });
      }
    }
  }
});
