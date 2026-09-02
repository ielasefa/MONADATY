import { expect, test, type Page, type Route } from "@playwright/test";

const EN_HERO = "WHOLESALE DRINKS,\nDELIVERED TO YOUR BUSINESS.";

function watchRuntimeFailures(page: Page) {
  const errors: string[] = [];
  const failedAssets: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (request) => {
    if (request.url().includes("/_next/static/") || request.url().includes("/uploads/")) {
      failedAssets.push(`${request.url()} — ${request.failure()?.errorText ?? "failed"}`);
    }
  });
  page.on("response", (response) => {
    if (
      response.status() >= 400
      && (response.url().includes("/_next/static/") || response.url().includes("/uploads/"))
    ) {
      failedAssets.push(`${response.url()} — HTTP ${response.status()}`);
    }
  });

  return { errors, failedAssets };
}

async function expectRouteReady(page: Page, pathname: string) {
  await page.waitForURL((url) => url.pathname === pathname, { waitUntil: "commit" });
  await expect(page.locator("#main-content")).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, `${pathname} has horizontal overflow`).toBeLessThanOrEqual(0);
}

async function productSnapshot(page: Page) {
  const critical = page.locator('[data-image-priority="true"]').first();
  await expect(critical).toHaveAttribute("data-image-loaded", "true");
  await expect.poll(() => critical.locator("img").evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect.poll(() => critical.locator("img").evaluate((image) => getComputedStyle(image).opacity)).toBe("1");

  return {
    heading: (await page.locator("h1").first().innerText()).trim(),
    imageSource: await critical.locator("img").getAttribute("src"),
    imageWidth: await critical.locator("img").evaluate((image) => (image as HTMLImageElement).naturalWidth),
  };
}

test("critical images reserve space while blocked and only critical media is prioritized", async ({ page }) => {
  await page.context().addCookies([{
    name: "monadaty_lang",
    value: "en",
    domain: "localhost",
    path: "/",
  }]);

  let releaseImages!: () => void;
  const imageGate = new Promise<void>((resolve) => {
    releaseImages = resolve;
  });
  const blockedRoutes: Route[] = [];

  await page.route("**/uploads/**", async (route) => {
    blockedRoutes.push(route);
    await imageGate;
    await route.continue();
  });

  try {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").first()).toHaveText(EN_HERO);

    const critical = page.locator('[data-image-priority="true"]').first();
    await expect(critical).toBeVisible();
    await expect(critical).toHaveAttribute("data-image-loaded", "false");
    await expect(critical.locator("span[aria-hidden]")).toBeVisible();

    const reserved = await critical.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { width: rect.width, height: rect.height, opacity: getComputedStyle(element).opacity };
    });
    expect(reserved.width).toBeGreaterThan(200);
    expect(reserved.height).toBeGreaterThan(200);
    expect(reserved.opacity).toBe("1");
    expect(blockedRoutes.length).toBeGreaterThan(0);

    const criticalImage = critical.locator("img");
    expect(await criticalImage.evaluate((image) => (image as HTMLImageElement).loading)).not.toBe("lazy");
    await expect(page.locator('link[rel="preload"][as="image"]')).toHaveCount(1);

    const lazyImages = page.locator('[data-image-priority="false"] img');
    expect(await lazyImages.count()).toBeGreaterThan(0);
    expect(await lazyImages.evaluateAll((images) => images.every(
      (image) => (image as HTMLImageElement).loading === "lazy",
    ))).toBe(true);
  } finally {
    releaseImages();
  }

  const critical = page.locator('[data-image-priority="true"]').first();
  await expect(critical).toHaveAttribute("data-image-loaded", "true");
  await expect.poll(() => critical.locator("img").evaluate((image) => getComputedStyle(image).opacity)).toBe("1");
});

test("public client navigation matches a hard load without hydration, chunk, or image failures", async ({ page, context }) => {
  const runtime = watchRuntimeFailures(page);
  await context.addCookies([{
    name: "monadaty_lang",
    value: "en",
    domain: "localhost",
    path: "/",
  }]);
  await page.addInitScript(() => {
    const count = Number(sessionStorage.getItem("document-load-count") || "0") + 1;
    sessionStorage.setItem("document-load-count", String(count));
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("h1").first()).toHaveText(EN_HERO);
  await expect(page.locator('[data-image-priority="true"]').first()).toHaveAttribute("data-image-loaded", "true");
  await page.locator('a[href="/shop"]:visible').first().click();
  await expectRouteReady(page, "/shop");

  const productLink = page.locator('a[href^="/product/"]:visible').first();
  const productPath = await productLink.getAttribute("href");
  expect(productPath).toBeTruthy();
  await productLink.click();
  await expectRouteReady(page, productPath!);
  const clientSnapshot = await productSnapshot(page);

  const hardPage = await context.newPage();
  const hardRuntime = watchRuntimeFailures(hardPage);
  await hardPage.goto(productPath!, { waitUntil: "domcontentloaded" });
  const hardSnapshot = await productSnapshot(hardPage);
  expect(clientSnapshot).toEqual(hardSnapshot);
  await hardPage.close();

  await page.locator('nav[aria-label] a[href="/shop"]').first().click();
  await expectRouteReady(page, "/shop");
  await page.locator("article button.btn-primary").first().click();
  await page.locator('a[href="/checkout"]:visible').first().click();
  await expectRouteReady(page, "/checkout");

  await page.locator('a[href="/"]:visible').first().click();
  await expectRouteReady(page, "/");
  await expect(page.locator("h1").first()).toHaveText(EN_HERO);
  await page.locator('a[href="/about"]:visible').first().click();
  await expectRouteReady(page, "/about");
  await page.locator('a[href="/collections"]:visible').first().click();
  await expectRouteReady(page, "/collections");

  expect(await page.evaluate(() => sessionStorage.getItem("document-load-count"))).toBe("1");
  expect(runtime.errors.filter((message) => /hydration|text content.*match|chunkloaderror|server action/i.test(message))).toEqual([]);
  expect(runtime.failedAssets).toEqual([]);
  expect(hardRuntime.errors.filter((message) => /hydration|text content.*match|chunkloaderror|server action/i.test(message))).toEqual([]);
  expect(hardRuntime.failedAssets).toEqual([]);

  const serviceWorkerState = await page.evaluate(async () => ({
    controlled: Boolean(navigator.serviceWorker.controller),
    registrations: (await navigator.serviceWorker.getRegistrations()).length,
    legacyCaches: (await caches.keys()).filter((name) => name === "monadaty-v1" || name === "monadaty-v2"),
  }));
  expect(serviceWorkerState).toEqual({ controlled: false, registrations: 0, legacyCaches: [] });
});

test("crossing from admin login to the storefront updates the persistent root shell", async ({ page }) => {
  const runtime = watchRuntimeFailures(page);
  await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#login-email")).toBeVisible();
  await expect(page.locator("h1")).not.toHaveText("admin_login");
  const password = page.locator("#login-password");
  const passwordToggle = page.locator("#login-password ~ button");
  await expect(async () => {
    if (await password.getAttribute("type") === "password") {
      await passwordToggle.click();
    }
    await expect(password).toHaveAttribute("type", "text");
  }).toPass({ timeout: 15_000 });

  await page.getByRole("button", { name: /MONADATY/ }).click();
  await expectRouteReady(page, "/");
  await expect(page.locator("#main-content")).toHaveClass(/storefront-shell/);
  await expect(page.locator("nav").first()).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(page.locator("h1").first()).toBeVisible();

  const clientState = await page.evaluate(() => ({
    heading: document.querySelector("h1")?.textContent?.trim(),
    navCount: document.querySelectorAll("nav").length,
    shellClass: document.querySelector("#main-content")?.className,
  }));
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("h1").first()).toBeVisible();
  const hardState = await page.evaluate(() => ({
    heading: document.querySelector("h1")?.textContent?.trim(),
    navCount: document.querySelectorAll("nav").length,
    shellClass: document.querySelector("#main-content")?.className,
  }));
  expect(clientState).toEqual(hardState);
  expect(runtime.errors.filter((message) => /hydration|text content.*match|chunkloaderror|server action/i.test(message))).toEqual([]);
  expect(runtime.failedAssets).toEqual([]);
});
