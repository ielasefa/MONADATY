import puppeteer from 'puppeteer-core';
import fs from 'fs';
import http from 'http';

const BASE = 'http://localhost:3000';
const CHROMIUM_PATH = '/usr/bin/chromium';

async function loginViaAPI() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ email: 'ilyass@gmail.com', password: 'ilyass123ilyass123' });
    const options = {
      hostname: 'localhost', port: 3000, path: '/api/admin/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData), 'Origin': BASE },
    };
    const req = http.request(options, (res) => {
      const cookies = res.headers['set-cookie'] || [];
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try { resolve({ ok: res.statusCode === 200, cookies, body: JSON.parse(body) }); }
        catch { resolve({ ok: false, cookies: [], body: {} }); }
      });
    });
    req.on('error', (e) => { console.error('Login request failed:', e.message); resolve({ ok: false, cookies: [], body: {} }); });
    req.write(postData);
    req.end();
  });
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log('=== REAL BROWSER TEST ===\n');
  
  const login = await loginViaAPI();
  if (!login.ok) { console.log('LOGIN FAILED'); process.exit(1); }
  
  const sessionValue = login.cookies.find(c => c.startsWith('admin_session='))
    ?.split(';')[0].split('=')[1] || '';
  const mustChange = login.cookies.find(c => c.startsWith('admin_must_change='))
    ?.split(';')[0].split('=')[1] || '0';
  
  const browser = await puppeteer.launch({
    executablePath: CHROMIUM_PATH, headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(20000);

  try {
    await page.setCookie(
      { name: 'admin_session', value: sessionValue, domain: 'localhost', path: '/', httpOnly: true, sameSite: 'Strict' },
      { name: 'admin_must_change', value: mustChange, domain: 'localhost', path: '/', httpOnly: true, sameSite: 'Strict' },
    );

    console.log('1. Open /admin/products/add');
    await page.goto(`${BASE}/admin/products/add`, { waitUntil: 'networkidle0' });
    await sleep(2000);
    console.log(`   URL: ${page.url()}`);

    if (page.url().includes('/admin/login')) {
      console.log('   Login required - submitting form');
      await page.type('input[type="email"]', 'ilyass@gmail.com');
      await page.type('input[type="password"]', 'ilyass123ilyass123');
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
        page.click('button[type="submit"]'),
      ]);
      await sleep(1000);
      await page.goto(`${BASE}/admin/products/add`, { waitUntil: 'networkidle0' });
      await sleep(2000);
      console.log(`   After login: ${page.url()}`);
    }

    console.log('2. Fill product form');
    const nameInput = await page.$('#p-name');
    if (nameInput) {
      await nameInput.click({ clickCount: 3 });
      await nameInput.type('BrowserTest ' + Date.now().toString(36).substring(0, 8), { delay: 5 });
      console.log('   Name filled');
    }

    const priceInputs = await page.$$('input[inputmode="decimal"]');
    for (const pi of priceInputs) {
      const ph = await page.evaluate(el => el.placeholder, pi);
      if (ph === '0.00') {
        await pi.click({ clickCount: 3 });
        await pi.type('49.99', { delay: 5 });
        console.log('   Price filled');
        break;
      }
    }

    const stockInput = await page.$('input[type="number"]');
    if (stockInput) {
      await stockInput.click({ clickCount: 3 });
      await stockInput.type('10');
      console.log('   Stock filled');
    }

    console.log('3. Upload image');
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent.toLowerCase(), btn);
      if (text.includes('browse')) {
        await btn.click();
        await sleep(500);
        console.log('   Browse button clicked');
        break;
      }
    }

    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      await fileInput.uploadFile('/tmp/browser-test-img.jpg');
      console.log('   File uploaded');
      for (let i = 0; i < 20; i++) {
        await sleep(1000);
        const svgs = await page.$$('svg polyline');
        const done = await page.$$('[class*="done"]');
        if (svgs.length > 0 || done.length > 0) {
          console.log(`   Upload completed after ${i + 1}s`);
          break;
        }
      }
    }

    await page.screenshot({ path: '/tmp/after-upload.png' });

    console.log('4. Save product');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(500);
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      const disabled = await page.evaluate(el => el.disabled, submitBtn);
      console.log(`   Submit disabled: ${disabled}`);
      if (!disabled) {
        await submitBtn.click();
        let saved = false;
        for (let i = 0; i < 15; i++) {
          await sleep(1000);
          const url = page.url();
          if (!url.includes('/admin/products/add')) { saved = true; break; }
          const html = await page.content();
          if (html.includes('product_created') || html.includes('✓')) { saved = true; break; }
        }
        console.log(`   Product saved: ${saved}`);
      }
    }

    await page.screenshot({ path: '/tmp/after-save.png' });

    console.log('5. Open /shop');
    await page.goto(`${BASE}/shop`, { waitUntil: 'networkidle0' });
    await sleep(3000);
    await page.screenshot({ path: '/tmp/shop.png' });

    const allImgs = await page.evaluate(() => Array.from(document.querySelectorAll('img')).map(i => i.src));
    const uploadImgs = [...new Set(allImgs.filter(s => s.includes('/uploads/')))];
    console.log(`   Uploaded images on /shop: ${uploadImgs.length}`);

    console.log('6. Check DB');
    const { execSync } = await import('child_process');
    const pgCount = execSync(
      `PGPASSWORD="" psql -h localhost -p 5433 -U postgres -d monadaty -t -A -c "SELECT COUNT(*) FROM product_images;"`,
      { encoding: 'utf8', timeout: 10000 }
    );
    console.log(`   ProductImage count: ${pgCount.trim()}`);

    const pgRows = execSync(
      `PGPASSWORD="" psql -h localhost -p 5433 -U postgres -d monadaty -t -A -F'|' -c "SELECT id, url FROM product_images ORDER BY \\"createdAt\\" DESC LIMIT 5;"`,
      { encoding: 'utf8', timeout: 10000 }
    );
    
    if (pgRows.trim()) {
      const lines = pgRows.trim().split('\n').filter(l => l.trim());
      for (const line of lines) {
        const parts = line.split('|');
        if (parts.length >= 2) {
          const url = parts[1].trim();
          const localPath = '/home/ielasef/Desktop/osamav@/public' + url;
          const exists = fs.existsSync(localPath);
          console.log(`   ${url}: DISK=${exists ? 'OK' : 'MISS'} DB=EXISTS`);
          if (exists) {
            const resp = await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle0' });
            console.log(`     HTTP ${resp.status()}`);
          }
        }
      }
    } else {
      console.log('   No ProductImage records found');
    }

    console.log('7. Files on disk');
    const files = fs.readdirSync('/home/ielasef/Desktop/osamav@/public/uploads/products').filter(f => f !== '.gitkeep');
    console.log(`   ${files.length} files`);

    console.log('8. Refresh');
    await page.goto(`${BASE}/shop`, { waitUntil: 'networkidle0' });
    await sleep(2000);
    const refreshImgs = await page.evaluate(() =>
      Array.from(document.querySelectorAll('img')).map(i => i.src).filter(s => s.includes('/uploads/'))
    );
    console.log(`   After refresh: ${refreshImgs.length}`);

    console.log('\n=== RESULT ===');
    if (uploadImgs.length > 0) {
      console.log('PASS');
    } else {
      console.log('FAIL');
    }
  } catch (err) {
    console.error('ERROR:', err.message);
    await page.screenshot({ path: '/tmp/fatal.png' });
    console.log('FAIL');
  }
  await browser.close();
}

main();
