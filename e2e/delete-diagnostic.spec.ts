import { test, expect, type Page } from "@playwright/test";

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || "admin@monadaty.com";
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || "change-this-to-a-strong-password";

async function login(page: Page) {
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
  await page.goto("/admin/dashboard", { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForURL(/\/admin\/dashboard/);
}

test("diagnose: create and delete product via API, verify consistency", async ({ page }) => {
  await login(page);

  const createResult = await page.evaluate(async () => {
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `DELETE-TEST-${Date.now()}`,
        slug: `delete-test-${Date.now()}`,
        regularPrice: "19.99",
        stock: 5,
        status: "Active",
      }),
    });
    const data = await res.json();
    return { status: res.status, id: data.product?.id, name: data.product?.name };
  });
  console.log(`✅ Product created: id=${createResult.id} name=${createResult.name} status=${createResult.status}`);
  expect(createResult.status).toBe(201);
  expect(createResult.id).toBeTruthy();

  const preGet = await page.evaluate(async (id: string) => {
    const res = await fetch(`/api/admin/products/${id}`);
    return { status: res.status };
  }, createResult.id);
  console.log(`Pre-delete GET: ${preGet.status}`);
  expect(preGet.status).toBe(200);

  const deleteResult = await page.evaluate(async (id: string) => {
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    return { status: res.status, body: await res.json() };
  }, createResult.id);
  console.log(`Delete response: ${deleteResult.status}`);
  expect(deleteResult.status).toBe(200);
  expect(deleteResult.body.success).toBe(true);

  const postGet = await page.evaluate(async (id: string) => {
    const res = await fetch(`/api/admin/products/${id}`);
    return { status: res.status };
  }, createResult.id);
  console.log(`Post-delete GET: ${postGet.status}`);
  expect(postGet.status).toBe(404);

  console.log("✅ DELETE CONSISTENCY VERIFIED");
});
