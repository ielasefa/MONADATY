import { chromium } from "playwright";
import fs from "fs";

const BASE = "http://localhost:3458";

const env = {};
for (const line of fs.readFileSync("/home/iel-asef/Desktop/MONADATY/.env", "utf8").split("\n")) {
  if (line.trim() && !line.trim().startsWith("#")) {
    const i = line.indexOf("=");
    env[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"|"$/g, "");
  }
}

const browser = await chromium.launch();
const page = await browser.newPage();
const captured = [];

page.on("response", async (res) => {
  const url = new URL(res.url());
  if (url.pathname.startsWith("/api/admin")) {
    captured.push({
      status: res.status(),
      method: res.request().method(),
      path: url.pathname + url.search,
      origin: res.request().headers()["origin"] ?? null,
      referer: res.request().headers()["referer"] ?? null,
      cookieSent: !!res.request().headers()["cookie"],
    });
  }
});

page.on("request", (req) => {
  const url = new URL(req.url());
  if (url.pathname.startsWith("/api/admin")) {
    const h = req.headers();
    console.log(
      `>> ${req.method()} ${url.pathname} origin=${h["origin"] ?? "-"} referer=${h["referer"] ?? "-"} cookie=${h["cookie"] ? "yes" : "NO"} host=${h["host"] ?? "-"}`,
    );
  }
});

console.log("--- open login page");
await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });

console.log("--- fill login form (server action)");
await page.fill("#login-email", env.ADMIN_EMAIL);
await page.fill("#login-password", env.ADMIN_PASSWORD);
await page.click('button[type="submit"]');
await page.waitForTimeout(2500);
console.log("URL after login:", page.url());

console.log("--- cookies after login:");
const cookies = await page.context().cookies();
for (const c of cookies) {
  console.log(
    `cookie name=${c.name} host=${c.domain} path=${c.path} sameSite=${c.sameSite} secure=${c.secure} httpOnly=${c.httpOnly} expiry=${c.expires}`,
  );
}

console.log("--- navigate to /admin/products");
await page.goto(`${BASE}/admin/products`, { waitUntil: "networkidle" });

console.log("--- navigate to add product");
await page.goto(`${BASE}/admin/products/add`, { waitUntil: "networkidle" });

console.log("--- in-page fetch POST (simulating ProductForm submit)");
const evalResult = await page.evaluate(async () => {
  const out = {};
  try {
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "PW Test Product", regularPrice: "5.00 DH" }),
    });
    out.status = res.status;
    out.body = await res.text();
  } catch (e) {
    out.error = String(e);
  }
  return out;
});
console.log("in-page POST result:", JSON.stringify(evalResult));

console.log("--- in-page PUT (simulating EditProductForm submit)");
const putResult = await page.evaluate(async () => {
  const out = {};
  try {
    const res = await fetch("/api/admin/products/00000000-0000-0000-0000-000000000000", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "PW Test", regularPrice: "5.00 DH" }),
    });
    out.status = res.status;
    out.body = await res.text();
  } catch (e) {
    out.error = String(e);
  }
  return out;
});
console.log("in-page PUT result:", JSON.stringify(putResult));

await browser.close();
console.log("--- captured api/admin responses:");
for (const c of captured) {
  console.log(`${c.method} ${c.path} -> ${c.status} origin=${c.origin} referer=${c.referer} cookie=${c.cookieSent}`);
}
