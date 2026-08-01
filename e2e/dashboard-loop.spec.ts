import { test, expect, type Page } from "@playwright/test";

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || "admin@monadaty.com";
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || "change-this-to-a-strong-password";

async function login(page: Page) {
  await page.context().clearCookies();
  const loginRes = await page.request.post("/api/admin/login", {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    headers: { Origin: "http://localhost:3458" },
  });
  expect(loginRes.status()).toBe(200);
  await page.context().addCookies([{
    name: "admin_must_change",
    value: "0",
    domain: "localhost",
    path: "/",
  }]);
  await page.goto("/admin/dashboard", { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForURL(/\/admin\/dashboard/);
}

type RequestEntry = {
  url: string;
  timestamp: number;
};

test("dashboard must not produce repeated requests while idle", async ({ page }) => {
  const dashboardRscRequests: { url: string; method: string; timestamp: number }[] = [];
  const allRequests: { url: string; method: string; timestamp: number }[] = [];

  page.on("request", (req) => {
    const url = req.url();
    const entry = { url, method: req.method(), timestamp: Date.now() };
    allRequests.push(entry);
    if (url.includes("/admin/dashboard") || url.includes("_rsc")) {
      dashboardRscRequests.push(entry);
    }
  });

  await login(page);

  await page.waitForLoadState("networkidle");

  await page.waitForTimeout(10000);

  const initialCount = dashboardRscRequests.length;
  console.log(`Initial dashboard/RSC requests (first 10s): ${initialCount}`);
  dashboardRscRequests.forEach((r, i) => console.log(`  [${i}] ${r.method} ${r.url}`));

  expect(initialCount).toBeGreaterThanOrEqual(1);
  expect(initialCount).toBeLessThanOrEqual(5);

  await page.waitForTimeout(10000);

  const idleRequests = allRequests.filter(
    r => r.timestamp > dashboardRscRequests[dashboardRscRequests.length - 1]?.timestamp
  );
  
  const finalCount = dashboardRscRequests.length;
  const newRequests = finalCount - initialCount;
  console.log(`\nTotal requests during 10s idle: ${idleRequests.length}`);
  console.log(`Dashboard/RSC requests after 10s idle: ${finalCount}`);
  console.log(`New dashboard/RSC requests during 10s idle: ${newRequests}`);

  if (newRequests > 0) {
    const newOnes = dashboardRscRequests.slice(initialCount);
    console.log("New dashboard/RSC requests during idle:");
    newOnes.forEach((r, i) => console.log(`  [${i}] ${r.method} ${r.url} at t=${r.timestamp}`));
  }

  console.log("\nAll requests during 60s idle:");
  idleRequests.forEach((r, i) => console.log(`  [${i}] ${r.method} ${r.url}`));

  expect(newRequests).toBe(0);
});

test("manual refresh button still works", async ({ page }) => {
  const dashboardRequests: string[] = [];

  page.on("request", (req) => {
    if (req.url().includes("/admin/dashboard")) {
      dashboardRequests.push(req.url());
    }
  });

  await login(page);
  await page.waitForLoadState("networkidle");

  const before = dashboardRequests.length;

  const refreshBtn = page.locator('button:has-text("Actualiser"), button:has-text("Refresh")').first();
  await expect(refreshBtn).toBeVisible({ timeout: 5000 });
  await refreshBtn.click();

  await page.waitForTimeout(2000);

  const after = dashboardRequests.length;
  console.log(`Requests before click: ${before}, after click: ${after}`);

  expect(after).toBeGreaterThan(before);
});
