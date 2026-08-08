import { chromium } from 'playwright';
import fs from 'fs';

const VIEWPORTS = [
  { name: 'mobile-375', width: 375, height: 812 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-430', width: 430, height: 932 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'tablet-820', width: 820, height: 1180 },
  { name: 'desktop-1024', width: 1024, height: 768 },
  { name: 'desktop-1280', width: 1280, height: 800 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1920', width: 1920, height: 1080 },
];

const PAGES = [
  { path: '/', name: 'home' },
  { path: '/shop', name: 'shop' },
  { path: '/product/02e77537-64bc-4910-8c06-2990167b6bc9', name: 'product' },
  { path: '/about', name: 'about' },
  { path: '/collections', name: 'collections' },
  { path: '/wishlist', name: 'wishlist' },
  { path: '/checkout', name: 'checkout' },
];

const LANGUAGES = ['fr', 'en', 'ar'];

async function runQA() {
  const browser = await chromium.launch({ headless: true });
  
  for (const lang of LANGUAGES) {
    for (const page of PAGES) {
      for (const vp of VIEWPORTS) {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          locale: lang,
        });
        
        const p = await context.newPage();
        
        // Listen for console errors
        const errors = [];
        p.on('console', msg => {
          if (msg.type() === 'error') errors.push(msg.text());
        });
        p.on('pageerror', err => errors.push(err.message));
        
        try {
          await p.goto(`http://localhost:3000${page.path}`, { 
            waitUntil: 'networkidle',
            timeout: 30000 
          });
          
          // Wait for animations
          await p.waitForTimeout(1000);
          
          // Check for CartProvider/hydration errors
          const useCartErrors = errors.filter(e => e.includes('useCart must be used within CartProvider'));
          const hydrationErrors = errors.filter(e => e.includes('Hydration failed'));
          
          if (useCartErrors.length > 0 || hydrationErrors.length > 0) {
            console.log(`❌ ERRORS on ${lang}/${page.name}/${vp.name}:`, { useCartErrors, hydrationErrors });
          }
          
          // Take screenshot
          const dir = `./visual-qa/${lang}/${page.name}`;
          fs.mkdirSync(dir, { recursive: true });
          await p.screenshot({ path: `${dir}/${vp.name}.png`, fullPage: true });
          
          console.log(`✅ ${lang}/${page.name}/${vp.name}`);
        } catch (e) {
          console.log(`❌ FAILED ${lang}/${page.name}/${vp.name}:`, e.message);
        }
        
        await context.close();
      }
    }
  }
  
  // Admin pages (no RTL needed for admin)
  for (const page of [{ path: '/admin/dashboard', name: 'admin-dashboard' }, { path: '/admin/landing', name: 'admin-landing' }]) {
    for (const vp of VIEWPORTS.filter(v => v.width >= 1024)) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      
      const p = await context.newPage();
      try {
        await p.goto(`http://localhost:3000${page.path}`, { 
          waitUntil: 'networkidle',
          timeout: 30000 
        });
        await p.waitForTimeout(1000);
        
        const dir = `./visual-qa/en/${page.name}`;
        fs.mkdirSync(dir, { recursive: true });
        await p.screenshot({ path: `${dir}/${vp.name}.png`, fullPage: true });
        
        console.log(`✅ en/${page.name}/${vp.name}`);
      } catch (e) {
        console.log(`❌ FAILED en/${page.name}/${vp.name}:`, e.message);
      }
      await context.close();
    }
  }
  
  await browser.close();
  console.log('\n✅ Visual QA complete. Check ./visual-qa/ for screenshots.');
}

runQA().catch(console.error);