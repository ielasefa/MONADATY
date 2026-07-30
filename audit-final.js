const { chromium } = require('playwright');

(async () => {
  const errors = [];
  const failures = [];
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => {
    const t = msg.text();
    if (msg.type() === 'error' && !t.includes('font-display') && !t.includes('worker-src') && !t.includes('_next/webpack')) errors.push(t.substring(0,120));
  });
  page.on('requestfailed', r => {
    const u = r.url();
    if (!u.includes('webpack') && !u.includes('fonts.g')) failures.push(u.substring(0,80) + ' ' + (r.failure()?.errorText||'').substring(0,40));
  });

  const vs = [375,390,430,768,1024,1280,1440,1920];
  for (const w of vs) {
    page.setViewportSize({ width: w, height: 900 });
    await page.goto('http://localhost:3002', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    const r = await page.evaluate(() => {
      const main = document.querySelector('main');
      const sections = main ? Array.from(main.querySelectorAll('section')) : [];
      const hero = sections[0];
      const grid = hero ? hero.querySelector('[class*="grid-cols"]') : null;
      const gc = grid ? Array.from(grid.children).map(c => Math.round(c.getBoundingClientRect().width)) : [];
      const img = hero ? hero.querySelector('img') : null;
      const navH = Math.round((document.querySelector('header')||{}).getBoundingClientRect().height||0);
      const footerH = Math.round((document.querySelector('footer')||{}).getBoundingClientRect().height||0);
      const cta = (sections[6]?.textContent||'').trim().substring(0,30);
      return {
        secs: sections.length,
        navH,
        footerH,
        heroImg: img ? Math.round(img.getBoundingClientRect().width) : 0,
        grid: gc,
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        cta,
        newsHidden: !(document.body.textContent||'').includes('LAISSEZ-VOUS TENTER'),
        rawKeys: ['faq_title','bundle_title','benefit_1','step_1_title','bestsellers_title'].filter(k => (document.body.textContent||'').includes(k)),
        stars: !!document.querySelector('[class*="text-gold"]')
      };
    });
    console.log(w+'px nav='+r.navH+' sec='+r.secs+' heroImg='+r.heroImg+'px grid='+JSON.stringify(r.grid)+' overflow='+r.overflow+'px cta='+r.cta.substring(0,15)+' news='+r.newsHidden+' stars='+r.stars+' rawKeys='+r.rawKeys.length);
  }

  console.log('\nConsole errors:', errors.length, errors.slice(0,3));
  console.log('Network failures:', failures.length, failures.slice(0,3));
  await browser.close();
})();
