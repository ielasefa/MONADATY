const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  // Collect console errors
  const errors = [];
  page.on("console", msg => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  
  await page.goto("http://localhost:3002", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  
  console.log("=== CONSOLE ERRORS ===");
  if (errors.length) errors.forEach(e => console.log("  ", e.substring(0, 200)));
  else console.log("  None");
  
  // FinalCTA detailed investigation
  const ctaDetail = await page.evaluate(() => {
    const sections = document.querySelectorAll("section");
    const lastSection = sections[sections.length - 1];
    if (!lastSection) return { error: "no sections" };
    
    const html = lastSection.innerHTML.substring(0, 300);
    const allText = lastSection.textContent;
    const classes = lastSection.className;
    const rect = lastSection.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(lastSection);
    
    return {
      classes,
      html,
      text: allText,
      rect: { w: Math.round(rect.width), h: Math.round(rect.height), y: Math.round(rect.top) },
      display: computedStyle.display,
      visibility: computedStyle.visibility,
      opacity: computedStyle.opacity,
      overflow: computedStyle.overflow
    };
  });
  console.log("\n=== FINAL CTA DETAIL ===");
  console.log(JSON.stringify(ctaDetail, null, 2));
  
  // Find and inspect the star element specifically
  const starDetail = await page.evaluate(() => {
    const allSpans = document.querySelectorAll("span");
    // Find span containing star characters
    let starSpan = null;
    for (const s of allSpans) {
      if (s.textContent && s.textContent.includes("\u2605")) {
        starSpan = s;
        break;
      }
    }
    if (!starSpan) return { error: "no star span found" };
    
    const style = window.getComputedStyle(starSpan);
    return {
      text: starSpan.textContent?.substring(0, 10),
      color: style.color,
      fontSize: style.fontSize,
      className: starSpan.className.substring(0, 100),
      parentClass: (starSpan.parentElement?.className || "").substring(0, 100)
    };
  });
  console.log("\n=== STARS DETAIL ===");
  console.log(JSON.stringify(starDetail, null, 2));
  
  // Check hero image more carefully
  const heroImgDetail = await page.evaluate(() => {
    const hero = document.querySelector("section");
    if (!hero) return { error: "no hero" };
    
    // Look for any element with background-image
    const allEls = hero.querySelectorAll("*");
    const bgImages = [];
    for (const el of allEls) {
      const bg = window.getComputedStyle(el).backgroundImage;
      if (bg && bg !== "none" && bg.includes("url")) {
        bgImages.push({
          tag: el.tagName,
          w: Math.round(el.getBoundingClientRect().width),
          h: Math.round(el.getBoundingClientRect().height),
          bg: bg.substring(0, 80)
        });
      }
    }
    
    // Check for picture elements
    const pictures = hero.querySelectorAll("picture");
    
    // Check for next/image spans
    const nextImgSpans = hero.querySelectorAll("span[style]");
    
    return {
      bgImages,
      pictureCount: pictures.length,
      nextImgSpans: Array.from(nextImgSpans).slice(0, 3).map(s => ({
        w: Math.round(s.getBoundingClientRect().width),
        h: Math.round(s.getBoundingClientRect().height),
        style: s.getAttribute("style")?.substring(0, 100)
      }))
    };
  });
  console.log("\n=== HERO IMAGE ===");
  console.log(JSON.stringify(heroImgDetail, null, 2));
  
  // Check the overall hero layout image - look at the main layout flex/grid children
  const heroLayout = await page.evaluate(() => {
    const sections = document.querySelectorAll("section");
    const hero = sections[0];
    if (!hero) return { error: "no hero" };
    
    const allDivs = hero.querySelectorAll("div");
    const flexContainer = Array.from(allDivs).find(d => 
      d.className.includes("flex-col") && d.className.includes("lg:grid")
    );
    
    if (!flexContainer) return { error: "no flex container" };
    
    const children = Array.from(flexContainer.children).map(c => ({
      className: c.className.substring(0, 80),
      w: Math.round(c.getBoundingClientRect().width),
      h: Math.round(c.getBoundingClientRect().height),
      tag: c.tagName
    }));
    
    return {
      childrenCount: children.length,
      children
    };
  });
  console.log("\n=== HERO LAYOUT ===");
  console.log(JSON.stringify(heroLayout, null, 2));
  
  // Check the page for ALL section elements and their rendered content
  const allSections = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("section")).map((s, i) => {
      const rect = s.getBoundingClientRect();
      return {
        index: i,
        height: Math.round(rect.height),
        y: Math.round(rect.top),
        textLen: (s.textContent || "").trim().length,
        firstWords: (s.textContent || "").trim().substring(0, 40).replace(/\n/g, " ")
      };
    });
  });
  console.log("\n=== ALL SECTIONS ===");
  allSections.forEach(s => console.log(`  ${s.index}: y=${s.y} h=${s.height} chars=${s.textLen} "${s.firstWords}"`));
  
  await browser.close();
})();
