import { test, expect, Page } from "@playwright/test";

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || "admin@monadaty.com";
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || "change-this-to-a-strong-password";

type RequestRecord = {
  url: string;
  method: string;
  status: number;
  timestamp: number;
  resourceType: string;
};

const PAGES_TO_AUDIT = [
  { path: "/", name: "Home" },
  { path: "/shop", name: "Shop" },
  { path: "/admin/dashboard", name: "Dashboard" },
  { path: "/admin/shop", name: "Admin Shop" },
  { path: "/checkout", name: "Checkout" },
] as const;

async function loginViaApi(page: Page) {
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
}

test.describe("Network Audit", () => {
  for (const { path, name } of PAGES_TO_AUDIT) {
    test(`${name} (${path}) must not have request loops while idle`, async ({ page }) => {
      const requests: RequestRecord[] = [];
      const responsePromises: Promise<void>[] = [];

      page.on("request", (req) => {
        requests.push({
          url: req.url(),
          method: req.method(),
          status: 0,
          timestamp: Date.now(),
          resourceType: req.resourceType(),
        });
      });

      page.on("response", (res) => {
        const entry = requests.find(
          (r) => r.url === res.url() && r.method === res.request().method() && r.status === 0
        );
        if (entry) entry.status = res.status();
      });

      if (path.startsWith("/admin")) {
        await loginViaApi(page);
      }

      await page.goto(path, { timeout: 30000, waitUntil: "load" });
      await page.waitForTimeout(5000);
      try {
        await page.waitForLoadState("networkidle", { timeout: 15000 });
      } catch {
        console.log(`  [WARN] networkidle timeout on ${path} - continuing with current load state`);
      }

      const initialCount = requests.length;

      await page.waitForTimeout(10000);

      const idleRequests = requests.slice(initialCount);
      const totalDuringIdle = idleRequests.length;

      const byUrl = new Map<string, RequestRecord[]>();
      for (const r of idleRequests) {
        const key = `${r.method} ${r.url.split("#")[0]}`;
        if (!byUrl.has(key)) byUrl.set(key, []);
        byUrl.get(key)!.push(r);
      }

      const duplicates: string[] = [];
      const loops: string[] = [];
      const failing: string[] = [];

      for (const [url, reqs] of byUrl) {
        if (reqs.length > 1) {
          duplicates.push(`${url} (${reqs.length}x)`);
          const intervals: number[] = [];
          for (let i = 1; i < reqs.length; i++) {
            intervals.push(reqs[i].timestamp - reqs[i - 1].timestamp);
          }
          if (intervals.length >= 2) {
            const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            const allSimilar = intervals.every((d) => Math.abs(d - avg) < avg * 0.3);
            if (allSimilar && avg > 500 && avg < 65000) {
              loops.push(`${url} (every ~${Math.round(avg / 1000)}s)`);
            }
          }
        }
        const hasFailing = reqs.some((r) => r.status >= 400 && r.status !== 401 && r.status !== 403);
        if (hasFailing) {
          failing.push(
            `${url} [${reqs.find((r) => r.status >= 400 && r.status !== 401 && r.status !== 403)?.status}]`
          );
        }
      }

      console.log(`\n=== ${name} (${path}) ===`);
      console.log(`Total requests during 10s idle: ${totalDuringIdle}`);
      console.log(`Unique URL patterns: ${byUrl.size}`);

      if (duplicates.length > 0) {
        console.log(`\nDUPLICATE REQUESTS (same URL called multiple times):`);
        duplicates.forEach((d) => console.log(`  ${d}`));
      }

      if (loops.length > 0) {
        console.log(`\nPOLING DETECTED (regular intervals):`);
        loops.forEach((l) => console.log(`  ${l}`));
      }

      if (failing.length > 0) {
        console.log(`\nFAILING REQUESTS:`);
        failing.forEach((f) => console.log(`  ${f}`));
      }

      const rscRequests = requests.filter(
        (r) => r.url.includes("_rsc=") || (r.url.includes("/admin/dashboard") && r.resourceType === "fetch")
      );
      const rscDuringIdle = rscRequests.filter((r) => r.timestamp > (requests[initialCount - 1]?.timestamp ?? 0));

      if (rscDuringIdle.length > 0) {
        console.log(`\nRSC REQUESTS DURING IDLE (request loop indicator):`);
        rscDuringIdle.forEach((r) => console.log(`  ${r.method} ${r.url}`));
      }

      const isPolling = loops.some((l) => l.includes("_rsc") || l.includes("/admin/dashboard"));
      const hasRscLoop = rscDuringIdle.length > 1;

      console.log(`\nREQUESTS SUMMARY:`);
      console.log(`  Duplicate requests: ${duplicates.length > 0 ? `YES (${duplicates.join(", ")})` : "NONE"}`);
      console.log(`  Polling detected: ${isPolling ? "YES" : "NONE"}`);
      console.log(`  RSC request loop: ${hasRscLoop ? `YES (${rscDuringIdle.length} requests)` : "NONE"}`);

      if (duplicates.length > 0) {
        console.log("\nALL REQUESTS DURING IDLE:");
        idleRequests.forEach((r, i) =>
          console.log(`  [${i}] ${r.method} ${r.url.split("?")[0]} -> ${r.status}`)
        );
      }

      expect(rscDuringIdle.length).toBeLessThanOrEqual(1);
      expect(duplicates.length).toBe(0);
    });
  }
});
