const {chromium,expect}=require('@playwright/test');
const fs=require('node:fs/promises');
const base=process.env.MONADATY_QA_URL || 'http://127.0.0.1:3000';
const output=process.cwd()+'/visual-qa/refinement/after';
(async()=>{const browser=await chromium.launch();const p=await browser.newPage({reducedMotion:'reduce'});const checks=[];const accessibility=[];const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});try{
await p.goto(base+'/shop',{waitUntil:'networkidle'});await p.locator('.market-product .btn-primary').first().click();await expect(p.locator('[aria-labelledby="cart-title"]')).toBeVisible();await p.waitForTimeout(100);await p.keyboard.press('Escape');await expect(p.locator('[aria-labelledby="cart-title"]')).not.toBeVisible();
for(const language of ['fr','ar']){
await p.context().addCookies([{name:'monadaty_lang',value:language,url:base}]);
await p.goto(base+'/shop',{waitUntil:'networkidle'});await p.locator('#cart-button').click();await expect(p.locator('[aria-labelledby="cart-title"]')).toBeVisible();
for(const width of [360,390,768,1024,1440,1920]){await p.setViewportSize({width,height:1000});const dimensions=await p.locator('[aria-labelledby="cart-title"]').evaluate(e=>({left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right,width:innerWidth,overflow:e.scrollWidth>e.clientWidth}));expect(dimensions.left).toBeGreaterThanOrEqual(0);expect(dimensions.right).toBeLessThanOrEqual(width);expect(dimensions.overflow).toBe(false);checks.push({language,name:'cart',width,overflow:false});if([390,1440].includes(width))await p.screenshot({path:output+'/cart-'+language+'-'+width+'.jpg',type:'jpeg',quality:85})}
await p.keyboard.press('Escape');await expect(p.locator('[aria-labelledby="cart-title"]')).not.toBeVisible();
if(language==='ar'){
await p.goto(base+'/checkout',{waitUntil:'networkidle'});
for(const width of [360,390,768,1024,1440,1920]){await p.setViewportSize({width,height:1000});expect(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);checks.push({language,name:'checkout-populated',width,overflow:false});if([390,1440].includes(width))await p.screenshot({path:output+'/checkout-populated-ar-'+width+'.jpg',type:'jpeg',quality:85,fullPage:true})}
await p.addScriptTag({path:require.resolve('axe-core')});const violations=await p.evaluate(async()=> (await axe.run({runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(({id,nodes})=>({id,targets:nodes.map(n=>n.target)})));accessibility.push({language,name:'checkout-populated',violations});expect(violations).toEqual([]);
}
}
expect(errors).toEqual([]);await fs.writeFile(output+'/buying-checks.json',JSON.stringify({checks,accessibility,errors},null,2));console.log(JSON.stringify({viewportChecks:checks.length,errors}));}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1})
