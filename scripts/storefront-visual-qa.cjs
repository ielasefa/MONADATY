/* Read-only public QA. No login, order submission, or database writes. */
const { chromium, expect } = require('@playwright/test');
const fs = require('node:fs/promises');
const path = require('node:path');
const phase = process.argv[2] || 'after';
const base = process.env.MONADATY_QA_URL || 'http://127.0.0.1:3000';
const output = path.join(process.cwd(), 'visual-qa/refinement', phase);
const widths = [360, 390, 768, 1024, 1440, 1920];

async function capture(page, name, width) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (let y = 0; y < document.body.scrollHeight; y += innerHeight) {
      scrollTo(0, y);
      await new Promise(resolve => setTimeout(resolve, 40));
    }
    scrollTo(0, 0);
  });
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(output, `${name}-${width}.jpg`), type: 'jpeg', quality: 85, fullPage: true });
}

(async () => {
  await fs.mkdir(output, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const errors = [];
  const failedImages = [];
  const checks = [];
  const cardChecks = [];
  const accessibility = [];
  try {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    let page = await context.newPage();
    function watch(page) {
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => {
        if (message.type() === 'error' && !message.location().url.includes('/missing-refinement-page')) errors.push(message.text());
      });
      page.on('response', response => {
        if (response.status() >= 400 && /\/uploads\/|\/images\/|\/_next\/static\//.test(response.url())) failedImages.push(response.url());
      });
    }
    watch(page);
    await page.goto(`${base}/shop`, { waitUntil: 'networkidle', timeout: 90000 });
    const productPath = await page.locator('a[href^="/product/"]').first().getAttribute('href');
    const routes = { home: '/', catalogue: '/shop', emptyCatalogue: '/shop?search=unmatched-refinement-qa', product: productPath, collections: '/collections', favorites: '/wishlist', about: '/about', checkout: '/checkout', confirmation: '/success', login: '/admin/login', offline: '/offline', error: '/missing-refinement-page' };
    for (const language of ['fr', 'ar']) {
      await page.context().addCookies([{ name: 'monadaty_lang', value: language, url: base }]);
      for (const [name, route] of Object.entries(routes)) {
        await page.close();
        page = await context.newPage();
        watch(page);
        const response = await page.goto(base + route, { waitUntil: 'networkidle', timeout: 90000 });
        await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
        for (const width of widths) {
          await page.setViewportSize({ width, height: 1000 });
          await page.waitForTimeout(75);
          const result = await page.evaluate(() => ({
            overflow: document.documentElement.scrollWidth > innerWidth,
            direction: document.documentElement.dir,
            missingAlt: document.querySelectorAll('img:not([alt])').length,
            rawKeys: [...document.querySelectorAll('main p,main h1,main h2,main h3,main button,footer a')].filter(el => el.getBoundingClientRect().width && /^[a-z]+(?:_[a-z]+)+$/.test(el.textContent.trim())).map(el => el.textContent.trim()),
            unnamedFields: [...document.querySelectorAll('input:not([type="hidden"]),select,textarea')].filter(el => !el.labels?.length && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby')).length,
          }));
          checks.push({ language, name, width, status: response.status(), ...result });
          if ([390, 1440].includes(width)) await capture(page, language === 'fr' ? name : `${name}-ar`, width);
          if (name === 'catalogue') {
            cardChecks.push(await page.locator('.market-product').evaluateAll((cards, width) => {
              const firstRow = cards.filter(card => Math.abs(card.getBoundingClientRect().top - cards[0].getBoundingClientRect().top) < 2);
              const bottoms = firstRow.map(card => card.querySelector('.market-product-actions').getBoundingClientRect().bottom);
              return { width, count: firstRow.length, imageRatio: cards[0].querySelector('.market-product-image').clientWidth / cards[0].querySelector('.market-product-image').clientHeight, actionOffset: Math.max(...bottoms) - Math.min(...bottoms) };
            }, width));
          }
        }
        await page.setViewportSize({ width: 390, height: 1000 });
        await page.addScriptTag({ path: require.resolve('axe-core') });
        accessibility.push({ language, name, ...(await page.evaluate(async () => {
          const result = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } });
          return { violations: result.violations.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })) })) };
        })) });
        console.log(`Reviewed ${language} ${name}`);
      }
    }
    await page.context().addCookies([{ name: 'monadaty_lang', value: 'fr', url: base }]);
    await page.goto(`${base}/shop`, { waitUntil: 'networkidle' });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.locator('.market-product input').first().fill('2');
    await page.locator('.market-product button.btn-primary').first().click();
    await expect(page.locator('[aria-labelledby="cart-title"]')).toBeVisible();
    await page.waitForTimeout(350);
    await page.screenshot({ path: path.join(output, 'cart-1440.jpg'), type: 'jpeg', quality: 85 });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: path.join(output, 'cart-390.jpg'), type: 'jpeg', quality: 85 });
    await page.keyboard.press('Escape');
    await expect(page.locator('[aria-labelledby="cart-title"]')).not.toBeVisible();
    const bodyUnlocked = await page.evaluate(() => document.body.style.overflow !== 'hidden');
    await page.goto(`${base}/checkout`, { waitUntil: 'networkidle' });
    for (const width of widths) {
      await page.setViewportSize({ width, height: 1000 });
      checks.push({ language: 'fr', name: 'checkout-populated', width, overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth) });
      if ([390, 1440].includes(width)) await capture(page, 'checkout-populated', width);
    }
    await page.goto(base, { waitUntil: 'networkidle' });
    const sticky = [];
    for (const width of widths) {
      await page.setViewportSize({ width, height: 1000 });
      await page.evaluate(() => scrollTo(0, 1400));
      sticky.push(await page.locator('.market-header').evaluate((header, width) => ({ width, top: header.getBoundingClientRect().top, radius: getComputedStyle(header).borderRadius }), width));
    }
    const protectedRoutes = [];
    for (const route of ['/admin/dashboard', '/admin/products', '/admin/orders', '/admin/customers', '/admin/landing', '/admin/settings']) {
      await page.goto(base + route, { waitUntil: 'networkidle' });
      protectedRoutes.push({ route, redirectedToLogin: new URL(page.url()).pathname === '/admin/login' });
    }
    const result = { checks, cardChecks, accessibility, sticky, protectedRoutes, bodyUnlocked, errors, failedImages };
    await fs.writeFile(path.join(output, 'checks.json'), JSON.stringify(result, null, 2));
    expect(checks.filter(check => check.overflow || check.missingAlt || check.unnamedFields || check.rawKeys?.length)).toEqual([]);
    expect(checks.filter(check => check.direction && check.direction !== (check.language === 'ar' ? 'rtl' : 'ltr'))).toEqual([]);
    expect(cardChecks.every(check => Math.abs(check.imageRatio - 1) < .02 && check.actionOffset <= 1)).toBe(true);
    expect(sticky.every(check => check.top >= 0 && check.top <= 24 && check.radius === '20px')).toBe(true);
    expect(protectedRoutes.every(check => check.redirectedToLogin)).toBe(true);
    expect(accessibility.flatMap(check => check.violations)).toEqual([]);
    expect(bodyUnlocked).toBe(true);
    expect(errors).toEqual([]);
    expect(failedImages).toEqual([]);
    console.log(JSON.stringify({ viewportChecks: checks.length, cardChecks: cardChecks.length, errors: errors.length, failedImages: failedImages.length }));
  } finally {
    await fs.writeFile(path.join(output, 'audit-details.json'), JSON.stringify({ checks, cardChecks, accessibility, errors, failedImages }, null, 2));
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
