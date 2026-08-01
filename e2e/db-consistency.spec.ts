import { test, expect, Page } from "@playwright/test";

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || "admin@monadaty.com";
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || "change-this-to-a-strong-password";

async function loginViaApi(page: Page) {
  await page.goto("/admin/login");
  await page.waitForLoadState("domcontentloaded");
  const ok = await page.evaluate(async ({ email, password }) => {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return res.ok;
  }, { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  expect(ok).toBe(true);
  await page.context().addCookies([{
    name: "admin_must_change",
    value: "0",
    domain: "localhost",
    path: "/",
  }]);
}

test.describe("Database Consistency", () => {
  test("create product and verify via API", async ({ page }) => {
    await loginViaApi(page);

    const productName = `DB-CONSISTENCY-${Date.now()}`;
    const productSlug = `db-consistency-${Date.now()}`;

    const createRes = await page.request.post("/api/admin/products", {
      data: {
        name: productName,
        slug: productSlug,
        price: 29.99,
        currency: "EUR",
        description: "DB consistency test",
        categoryId: null,
        collectionId: null,
        published: true,
      },
      headers: { Origin: "http://localhost:3458" },
    });
    expect([200, 201]).toContain(createRes.status());
    const createBody = await createRes.json();
    const productId = createBody.product?.id || createBody.id;
    expect(productId).toBeTruthy();

    const getRes = await page.request.get(`/api/admin/products/${productId}`, {
      headers: { Origin: "http://localhost:3458" },
    });
    expect(getRes.status()).toBe(200);
    const getBody = await getRes.json();

    console.log(`\n=== CREATE CONSISTENCY CHECK ===`);
    console.log(`Product ID: ${productId}`);
    console.log(`name: "${getBody.product?.name}" (expected "${productName}")`);
    console.log(`price raw: "${getBody.product?.price}"`);

    expect(getBody.product?.name).toBe(productName);
    expect(getBody.product?.slug).toBe(productSlug);

    console.log("CREATE CONSISTENCY VERIFIED ✅");
  });

  test("update product and verify via API", async ({ page }) => {
    await loginViaApi(page);

    const productName = `UPDATE-TEST-${Date.now()}`;
    const productSlug = `update-test-${Date.now()}`;

    const createRes = await page.request.post("/api/admin/products", {
      data: {
        name: productName,
        slug: productSlug,
        price: 10.00,
        currency: "EUR",
        description: "Original description",
        published: true,
      },
      headers: { Origin: "http://localhost:3458" },
    });
    expect([200, 201]).toContain(createRes.status());
    const createBody = await createRes.json();
    const productId = createBody.product?.id || createBody.id;
    expect(productId).toBeTruthy();

    const updateRes = await page.request.put(`/api/admin/products/${productId}`, {
      data: {
        name: `${productName}-UPDATED`,
        slug: `${productSlug}-updated`,
        price: 15.00,
        description: "Updated description",
        published: false,
        images: [],
      },
      headers: { Origin: "http://localhost:3458" },
    });
    expect([200, 201]).toContain(updateRes.status());

    const getRes = await page.request.get(`/api/admin/products/${productId}`, {
      headers: { Origin: "http://localhost:3458" },
    });
    expect(getRes.status()).toBe(200);
    const getBody = await getRes.json();

    console.log(`\n=== UPDATE CONSISTENCY CHECK ===`);
    console.log(`name: "${getBody.product?.name}" (expected "${productName}-UPDATED")`);
    console.log(`slug: "${getBody.product?.slug}"`);

    expect(getBody.product?.name).toBe(`${productName}-UPDATED`);

    console.log("UPDATE CONSISTENCY VERIFIED ✅");
  });

  test("delete product and verify via API", async ({ page }) => {
    await loginViaApi(page);

    const testName = `DELETE-VERIFY-${Date.now()}`;
    const testSlug = `delete-verify-${Date.now()}`;

    const createRes = await page.request.post("/api/admin/products", {
      data: {
        name: testName,
        slug: testSlug,
        price: 19.99,
        currency: "EUR",
        description: "Delete verification test",
        published: true,
      },
      headers: { Origin: "http://localhost:3458" },
    });
    expect([200, 201]).toContain(createRes.status());
    const createBody = await createRes.json();
    const productId = createBody.product?.id || createBody.id;
    expect(productId).toBeTruthy();

    console.log(`\n=== DELETE CONSISTENCY CHECK ===`);
    console.log(`Created product ID: ${productId}`);

    const preGetRes = await page.request.get(`/api/admin/products/${productId}`, {
      headers: { Origin: "http://localhost:3458" },
    });
    expect(preGetRes.status()).toBe(200);
    console.log(`Pre-delete API state: FOUND ✅`);

    const deleteRes = await page.request.delete(`/api/admin/products/${productId}`, {
      headers: { Origin: "http://localhost:3458" },
    });
    console.log(`Delete API response: ${deleteRes.status()}`);
    expect(deleteRes.status()).toBe(200);

    const postGetRes = await page.request.get(`/api/admin/products/${productId}`, {
      headers: { Origin: "http://localhost:3458" },
    });
    console.log(`Post-delete API state: ${postGetRes.status() === 404 ? "DELETED ✅" : `STILL EXISTS (${postGetRes.status()}) ❌`}`);
    expect(postGetRes.status()).toBe(404);

    console.log("DELETE CONSISTENCY VERIFIED ✅");
  });

  test("bulk operations maintain consistency", async ({ page }) => {
    await loginViaApi(page);

    const bulkIds: string[] = [];

    for (let i = 0; i < 3; i++) {
      const res = await page.request.post("/api/admin/products", {
        data: {
          name: `BULK-TEST-${Date.now()}-${i}`,
          slug: `bulk-test-${Date.now()}-${i}`,
          price: 9.99 + i,
          currency: "EUR",
          description: "Bulk consistency test",
          published: true,
        },
        headers: { Origin: "http://localhost:3458" },
      });
      expect([200, 201]).toContain(res.status());
      const body = await res.json();
      bulkIds.push(body.product?.id || body.id);
    }

    console.log(`\n=== BULK CONSISTENCY CHECK ===`);
    console.log(`Created ${bulkIds.length} test products`);

    const archiveRes = await page.request.post("/api/admin/products/bulk", {
      data: { action: "archive", productIds: bulkIds },
      headers: { Origin: "http://localhost:3458" },
    });
    expect(archiveRes.status()).toBe(200);

    for (const id of bulkIds) {
      const res = await page.request.get(`/api/admin/products/${id}`, {
        headers: { Origin: "http://localhost:3458" },
      });
      expect(res.status()).toBe(200);
      const p = await res.json();
      console.log(`  Product ${id.slice(0, 8)}... status: ${p.product?.status}`);
      expect(p.product?.status).toBe("Archived");
    }

    const activateRes = await page.request.post("/api/admin/products/bulk", {
      data: { action: "activate", productIds: bulkIds },
      headers: { Origin: "http://localhost:3458" },
    });
    expect(activateRes.status()).toBe(200);

    for (const id of bulkIds) {
      const res = await page.request.get(`/api/admin/products/${id}`, {
        headers: { Origin: "http://localhost:3458" },
      });
      expect(res.status()).toBe(200);
      const p = await res.json();
      console.log(`  Product ${id.slice(0, 8)}... status: ${p.product?.status}`);
      expect(p.product?.status).toBe("Active");
    }

    const deleteRes = await page.request.post("/api/admin/products/bulk", {
      data: { action: "delete", productIds: bulkIds },
      headers: { Origin: "http://localhost:3458" },
    });
    expect(deleteRes.status()).toBe(200);

    for (const id of bulkIds) {
      const res = await page.request.get(`/api/admin/products/${id}`, {
        headers: { Origin: "http://localhost:3458" },
      });
      const exists = res.status() !== 404;
      console.log(`  Product ${id.slice(0, 8)}... exists: ${exists}`);
      expect(res.status()).toBe(404);
    }

    console.log("BULK OPERATIONS CONSISTENT ✅");
  });
});
