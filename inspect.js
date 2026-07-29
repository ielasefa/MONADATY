const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ headless: true });
  
  // === DESKTOP (1440px) ===
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktop.goto("http://localhost:3002", { waitUntil: "networkidle" });
  await desktop.waitForTimeout(1500);
  
  console.log("=== DESKTOP 1440px ===\n");
  
  const heroInfo = await desktop.evaluate(() => {
    const allDivs = document.querySelectorAll("div");
    const layoutContainer = Array.from(allDivs).find(d => 
      d.className.includes("lg:grid")
    );
    const gridStyle = layoutContainer ? window.getComputedStyle(layoutContainer) : null;
    
    const allImgs = document.querySelectorAll("img");
    const hero = document.querySelector("section");
    const heroImgs = hero ? hero.querySelectorAll("img") : [];
    const heading = hero ? hero.querySelector("h1") : null;
    const heroHeadings = hero ? hero.querySelectorAll("h2, h1") : [];
    
    const btns = hero ? hero.querySelectorAll('a[href]') : [];
    
    // Get desktop column widths
    let imageColW = 0, textColW = 0;
    if (layoutContainer) {
      const children = layoutContainer.children;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const cls = child.className;
        if (cls.includes("order-2") || cls.includes("col-span-1:first")) {
          imageColW = Math.round(child.getBoundingClientRect().width);
        }
        if (cls.includes("order-1") && cls.includes("col-span-1")) {
          textColW = Math.round(child.getBoundingClientRect().width);
        }
      }
    }
    
    return {
      gridDisplay: gridStyle ? gridStyle.display : "N/A",
      gridTemplate: gridStyle ? gridStyle.gridTemplateColumns : "N/A",
      heroHeight: hero ? Math.round(hero.getBoundingClientRect().height) : 0,
      heroImages: Array.from(heroImgs).map(i => ({
        w: Math.round(i.getBoundingClientRect().width),
        h: Math.round(i.getBoundingClientRect().height),
        y: Math.round(i.getBoundingClientRect().top),
        loaded: i.complete && i.naturalWidth > 0
      })),
      heading: heading ? {
        text: heading.textContent.substring(0, 60),
        w: Math.round(heading.getBoundingClientRect().width),
        y: Math.round(heading.getBoundingClientRect().top)
      } : null,
      firstCtaY: btns[0] ? Math.round(btns[0].getBoundingClientRect().top) : null,
      imageColumnWidth: imageColW,
      textColumnWidth: textColW,
      imageTextOverlap: (() => {
        if (heroImgs.length === 0) return false;
        const imgRect = heroImgs[0].getBoundingClientRect();
        const textRects = Array.from(heroHeadings).map(h => h.getBoundingClientRect());
        return textRects.some(r => !(r.right < imgRect.left || r.left > imgRect.right));
      })()
    };
  });
  console.log("HERO:");
  console.log(JSON.stringify(heroInfo, null, 2));
  
  // Sections
  const sections = await desktop.evaluate(() => {
    return Array.from(document.querySelectorAll("section")).map((s, i) => {
      const h = s.querySelector("h1") || s.querySelector("h2");
      return {
        index: i,
        heading: h ? h.textContent.substring(0, 50).replace(/\n/g, " ") : "(none)",
        height: Math.round(s.getBoundingClientRect().height),
        y: Math.round(s.getBoundingClientRect().top)
      };
    });
  });
  console.log("\nSECTIONS:");
  sections.forEach(s => console.log(`  ${s.index}: y=${s.y} h=${s.height} "${s.heading}"`));
  
  // Footer
  const footerInfo = await desktop.evaluate(() => {
    const footer = document.querySelector("footer");
    if (!footer) return null;
    const links = footer.querySelectorAll("a");
    return {
      height: Math.round(footer.getBoundingClientRect().height),
      y: Math.round(footer.getBoundingClientRect().top),
      linkSamples: Array.from(links).slice(0, 3).map(l => ({
        text: (l.textContent || "").substring(0, 25),
        color: window.getComputedStyle(l).color,
        opacity: window.getComputedStyle(l).opacity
      }))
    };
  });
  console.log("\nFOOTER:", JSON.stringify(footerInfo, null, 2));
  
  // Navbar
  const navInfo = await desktop.evaluate(() => {
    const header = document.querySelector("header");
    return header ? Math.round(header.getBoundingClientRect().height) : 0;
  });
  console.log("\nNAVBAR HEIGHT:", navInfo);
  
  // Raw translation keys
  const bodyText = await desktop.evaluate(() => document.body.textContent || "");
  const rawKeys = [
    "faq_title", "faq_subtitle",
    "bundle_eyebrow", "bundle_title", "bundle_desc", "bundle_select",
    "step_1_title", "step_1_desc", "step_2_title", "step_2_desc",
    "step_3_title", "step_3_desc",
    "bestsellers_eyebrow", "bestsellers_title", "bestsellers_desc",
    "step_delivery", "step_payment",
  ];
  const found = rawKeys.filter(k => bodyText.includes(k));
  console.log("\nRAW KEYS:", found.length ? found : "NONE - all clean");
  
  await desktop.close();
  
  // === MOBILE (375px) ===
  console.log("\n=== MOBILE 375px ===");
  
  const mobile = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await mobile.goto("http://localhost:3002", { waitUntil: "networkidle" });
  await mobile.waitForTimeout(1500);
  
  const mobileInfo = await mobile.evaluate(() => {
    const hero = document.querySelector("section");
    if (!hero) return null;
    const img = hero.querySelector("img");
    const heading = hero.querySelector("h1");
    const btns = Array.from(hero.querySelectorAll('a[href]'));
    const heroDivs = hero.querySelectorAll("div");
    
    // Find the image container (likely has aspect-4/5 class or order-2)
    let imgDiv = null;
    let textDiv = null;
    for (const d of heroDivs) {
      if (d.className.includes("order-2")) imgDiv = d;
      if (d.className.includes("order-1") && d.className.includes("justify")) textDiv = d;
    }
    
    return {
      heroHeight: Math.round(hero.getBoundingClientRect().height),
      imgRect: img ? {
        w: Math.round(img.getBoundingClientRect().width),
        h: Math.round(img.getBoundingClientRect().height),
        y: Math.round(img.getBoundingClientRect().top),
        pageWidth: Math.round(img.getBoundingClientRect().width / window.innerWidth * 100) + "%"
      } : null,
      heading: heading ? {
        y: Math.round(heading.getBoundingClientRect().top),
        text: heading.textContent.substring(0, 40)
      } : null,
      firstBtnY: btns[0] ? Math.round(btns[0].getBoundingClientRect().top) : null,
      imgBelowCta: (img && btns[0]) ? (img.getBoundingClientRect().top > btns[0].getBoundingClientRect().bottom) : null,
      textDivY: textDiv ? Math.round(textDiv.getBoundingClientRect().top) : null,
      imgDivY: imgDiv ? Math.round(imgDiv.getBoundingClientRect().top) : null,
    };
  });
  console.log("HERO MOBILE:", JSON.stringify(mobileInfo, null, 2));
  
  const navMobile = await mobile.evaluate(() => {
    const header = document.querySelector("header");
    return header ? Math.round(header.getBoundingClientRect().height) : 0;
  });
  console.log("NAVBAR MOBILE:", navMobile);
  
  await mobile.close();
  
  // === TABLET (768px) ===
  console.log("\n=== TABLET 768px ===");
  const tablet = await browser.newPage({ viewport: { width: 768, height: 1024 } });
  await tablet.goto("http://localhost:3002", { waitUntil: "networkidle" });
  await tablet.waitForTimeout(1500);
  
  const tabletInfo = await tablet.evaluate(() => {
    const hero = document.querySelector("section");
    if (!hero) return null;
    const img = hero.querySelector("img");
    const heading = hero.querySelector("h1");
    const btns = Array.from(hero.querySelectorAll('a[href]'));
    
    // Check if layout is still stacked (mobile behavior) at 768px
    const allDivs = hero.querySelectorAll("div");
    const hasLgGrid = Array.from(allDivs).some(d => d.className.includes("lg:grid"));
    
    return {
      imgRect: img ? {
        w: Math.round(img.getBoundingClientRect().width),
        h: Math.round(img.getBoundingClientRect().height)
      } : null,
      imgBelowCta: (img && btns[0]) ? (img.getBoundingClientRect().top > btns[0].getBoundingClientRect().bottom) : null,
      heroHeight: Math.round(hero.getBoundingClientRect().height),
      layout: hasLgGrid ? "expected to be stacked below lg" : "flex stacked (mobile layout)"
    };
  });
  console.log("TABLET:", JSON.stringify(tabletInfo, null, 2));
  
  await tablet.close();
  await browser.close();
  console.log("\nInspection complete");
})();
