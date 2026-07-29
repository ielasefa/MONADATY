const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:3002", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  
  // Detailed hero inspection
  const heroDetail = await page.evaluate(() => {
    const allSections = document.querySelectorAll("section");
    const hero = allSections[0];
    if (!hero) return { error: "no hero" };
    
    // Find the image element (could be inside a next/image or SafeImage component)
    const allImgs = hero.querySelectorAll("img, [role=img], [data-loaded=true]");
    const imgElements = hero.querySelectorAll("img");
    const bgDivs = Array.from(hero.querySelectorAll("div")).filter(d => {
      const bg = window.getComputedStyle(d).backgroundImage;
      return bg && bg !== "none" && bg.includes("url");
    });
    
    const heading = hero.querySelector("h1");
    const paragraph = hero.querySelector("p");
    const ctas = Array.from(hero.querySelectorAll('a[href]')).filter(a => 
      a.className.includes("btn-primary") || a.className.includes("btn-link")
    );
    
    // Text styling
    const headingStyle = heading ? window.getComputedStyle(heading) : null;
    const paraStyle = paragraph ? window.getComputedStyle(paragraph) : null;
    
    return {
      imgTags: Array.from(imgElements).map(i => ({
        src: (i.src || "").substring(0, 100),
        w: Math.round(i.getBoundingClientRect().width),
        h: Math.round(i.getBoundingClientRect().height),
        loaded: i.complete,
        naturalW: i.naturalWidth,
        naturalH: i.naturalHeight
      })),
      bgImages: bgDivs.slice(0, 2).map(d => ({
        w: Math.round(d.getBoundingClientRect().width),
        h: Math.round(d.getBoundingClientRect().height),
        bg: window.getComputedStyle(d).backgroundImage.substring(0, 60)
      })),
      heading: {
        text: heading ? heading.textContent : "",
        fontSize: headingStyle ? headingStyle.fontSize : "",
        color: headingStyle ? headingStyle.color : "",
        fontWeight: headingStyle ? headingStyle.fontWeight : "",
        w: heading ? Math.round(heading.getBoundingClientRect().width) : 0,
        h: heading ? Math.round(heading.getBoundingClientRect().height) : 0,
        y: heading ? Math.round(heading.getBoundingClientRect().top) : 0
      },
      description: {
        text: paragraph ? paragraph.textContent?.substring(0, 80) : "",
        fontSize: paraStyle ? paraStyle.fontSize : "",
        color: paraStyle ? paraStyle.color : "",
        w: paragraph ? Math.round(paragraph.getBoundingClientRect().width) : 0,
        y: paragraph ? Math.round(paragraph.getBoundingClientRect().top) : 0
      },
      ctas: ctas.map(c => ({
        text: c.textContent?.substring(0, 30),
        y: Math.round(c.getBoundingClientRect().top),
        w: Math.round(c.getBoundingClientRect().width),
        bg: window.getComputedStyle(c).backgroundColor,
        color: window.getComputedStyle(c).color,
        fontSize: window.getComputedStyle(c).fontSize,
        borderRadius: window.getComputedStyle(c).borderRadius
      })),
      heroHeight: Math.round(hero.getBoundingClientRect().height)
    };
  });
  
  console.log("=== HERO DETAIL ===");
  console.log(JSON.stringify(heroDetail, null, 2));
  
  // Check FinalCTA is visible
  const ctaCheck = await page.evaluate(() => {
    const sections = document.querySelectorAll("section");
    const lastSection = sections[sections.length - 1];
    if (!lastSection) return { error: "no last section" };
    const text = lastSection.textContent || "";
    const h2 = lastSection.querySelector("h2");
    const height = lastSection.getBoundingClientRect().height;
    return {
      heading: h2 ? h2.textContent?.substring(0, 50) : "no h2",
      textSample: text.substring(0, 100).replace(/\n/g, " "),
      height: Math.round(height),
      visible: height > 0 && lastSection.getBoundingClientRect().top < 10000,
      y: Math.round(lastSection.getBoundingClientRect().top)
    };
  });
  console.log("\n=== FINAL CTA ===");
  console.log(JSON.stringify(ctaCheck));
  
  // Testimonials card heights
  const testDetail = await page.evaluate(() => {
    const sections = document.querySelectorAll("section");
    // Try to find testimonials by looking for star characters
    let testSection = null;
    for (const s of sections) {
      if (s.textContent && s.textContent.includes("\u2605")) {
        testSection = s;
        break;
      }
    }
    if (!testSection) return { error: "no testimonials section found" };
    
    const cards = testSection.querySelectorAll('[class*="rounded-xl"]');
    return {
      cardCount: cards.length,
      cardHeights: Array.from(cards).map(c => Math.round(c.getBoundingClientRect().height)),
      cardsY: Array.from(cards).slice(0, 3).map(c => Math.round(c.getBoundingClientRect().top)),
      starColor: (() => {
        const star = testSection.querySelector("span");
        return star ? window.getComputedStyle(star).color : "N/A";
      })(),
      sectionHeight: Math.round(testSection.getBoundingClientRect().height)
    };
  });
  console.log("\n=== TESTIMONIALS ===");
  console.log(JSON.stringify(testDetail, null, 2));
  
  // Collection cards
  const colDetail = await page.evaluate(() => {
    const sections = document.querySelectorAll("section");
    // Find collections by "CURATED" or "COLLECTIONS" text
    let colSection = null;
    for (const s of sections) {
      const t = s.textContent || "";
      if (t.includes("COLLECT") || t.includes("CURATED")) {
        colSection = s;
        break;
      }
    }
    if (!colSection) return { error: "no collections" };
    
    const allLinks = colSection.querySelectorAll("a");
    const collectionLinks = Array.from(allLinks).filter(a => {
      const rect = a.getBoundingClientRect();
      return rect.width > 100 && rect.height > 100;
    });
    
    return {
      sectionHeight: Math.round(colSection.getBoundingClientRect().height),
      linkCount: collectionLinks.length,
      linkRects: collectionLinks.slice(0, 3).map(a => ({
        w: Math.round(a.getBoundingClientRect().width),
        h: Math.round(a.getBoundingClientRect().height),
        text: (a.textContent || "").substring(0, 40)
      })),
      mainCardWidth: collectionLinks[0] ? Math.round(collectionLinks[0].getBoundingClientRect().width) : 0,
    };
  });
  console.log("\n=== COLLECTIONS ===");
  console.log(JSON.stringify(colDetail, null, 2));
  
  // Check product cards for consistency
  const productDetail = await page.evaluate(() => {
    const products = document.querySelectorAll('[class*="flex flex-col"]');
    const productArticles = Array.from(document.querySelectorAll("article"));
    return {
      articleCount: productArticles.length,
      articleSizes: productArticles.slice(0, 4).map(a => ({
        w: Math.round(a.getBoundingClientRect().width),
        h: Math.round(a.getBoundingClientRect().height),
        text: (a.textContent || "").substring(0, 30)
      }))
    };
  });
  console.log("\n=== PRODUCT CARDS ===");
  console.log(JSON.stringify(productDetail, null, 2));
  
  await browser.close();
  console.log("\nDetailed inspection complete");
})();
