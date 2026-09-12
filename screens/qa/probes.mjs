import { chromium } from '@playwright/test';
const BASE='http://localhost:4173/valeo-site/';
const dir='/Users/newmac/Work/SHAUNA/site-v1/screens/qa';
const browser=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
const errs=[]; page.on('console',m=>{ if(['error','warning'].includes(m.type())) errs.push(m.type()+': '+m.text()); }); page.on('pageerror',e=>errs.push('pageerror: '+e.message));
const tile=(name)=>page.locator('.tile',{hasText:new RegExp('^\\s*'+name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*$')}).first();
// Probe A: Option C, pick jar1 then jar2 scent without choosing product
await page.goto(BASE+'shop/?mode=flight&option=C',{waitUntil:'networkidle'}); await page.evaluate(()=>localStorage.clear()); await page.reload({waitUntil:'networkidle'});
await tile('Honey Vanilla').click(); await tile('Cinnamon Roll').click(); await page.waitForTimeout(300);
console.log('PROBE A slots:', JSON.stringify(await page.evaluate(()=>Array.from(document.querySelectorAll('.slot')).map(s=>s.innerText.replace(/\s+/g,' ').trim()))), 'bar:', await page.evaluate(()=>document.querySelector('#bar-add')?.closest('div,section,footer')?.innerText.replace(/\s+/g,' ').trim()));
await page.evaluate(()=>window.scrollTo(0,0)); await page.waitForTimeout(300); await page.screenshot({path:`${dir}/m-probeA-optionC-noproduct.png`});
// Probe B: add flight, expand "jars on the slab" in cart
await page.locator('#bar-add').click(); await page.waitForTimeout(400);
const det=page.locator('#cart-drawer summary, #cart-drawer details, #cart-drawer :text("jars on the slab")').first(); await det.click(); await page.waitForTimeout(300);
await page.screenshot({path:`${dir}/m-probeB-cart-expanded.png`}); console.log('PROBE B cart expanded:', await page.evaluate(()=>document.querySelector('#cart-drawer')?.innerText.replace(/\s+/g,' ').trim()));
// Probe C: checkout with flight in cart — does the flight's contents show
await page.locator('#cart-drawer a[href*="checkout"]').first().click(); await page.waitForLoadState('networkidle'); await page.waitForTimeout(300);
await page.screenshot({path:`${dir}/m-probeC-checkout-flight-full.png`,fullPage:true}); console.log('PROBE C checkout text:', await page.evaluate(()=>document.querySelector('main')?.innerText.replace(/\s+/g,' ').trim()));
await page.fill('#f-name','Probe C'); await page.fill('#f-phone','2535550101'); await page.locator('#place-order').click(); await page.waitForTimeout(600);
await page.screenshot({path:`${dir}/m-probeC-confirm-flight-full.png`,fullPage:true}); console.log('PROBE C confirmation:', await page.evaluate(()=>document.querySelector('main')?.innerText.replace(/\s+/g,' ').trim()));
console.log('PROBE C links:', JSON.stringify(await page.evaluate(()=>Array.from(document.querySelectorAll('main a')).map(a=>({t:a.innerText.trim(),href:a.getAttribute('href')})))));
// Probe D: single mode empty-src image
await page.goto(BASE+'shop/',{waitUntil:'networkidle'}); await page.evaluate(()=>localStorage.clear()); await page.reload({waitUntil:'networkidle'});
console.log('PROBE D imgs w/o src:', JSON.stringify(await page.evaluate(()=>Array.from(document.images).filter(i=>!(i.complete&&i.naturalWidth>0)).map(i=>({html:i.outerHTML.slice(0,200), w:i.getBoundingClientRect().width, vis:getComputedStyle(i).visibility, disp:getComputedStyle(i).display})))));
// Probe E: "+ Other" tile
await tile('+ Other').scrollIntoViewIfNeeded(); await page.locator('.tile.other').click(); await page.waitForTimeout(400); await page.screenshot({path:`${dir}/m-probeE-other.png`});
console.log('PROBE E other-text visible', await page.locator('#other-text').isVisible(), 'bar:', await page.evaluate(()=>document.querySelector('#bar-add')?.closest('div,section,footer')?.innerText.replace(/\s+/g,' ').trim()));
// Probe F: filter chips rail — does it scroll horizontally within itself?
console.log('PROBE F chip rail', JSON.stringify(await page.evaluate(()=>{const c=document.querySelector('.chip'); const rail=c.parentElement; const cs=getComputedStyle(rail); return {overflowX:cs.overflowX, sw:rail.scrollWidth, cw:rail.clientWidth, docW:document.documentElement.scrollWidth};})));
// Probe G: tiny tap targets on shop single mode
console.log('PROBE G small targets', JSON.stringify(await page.evaluate(()=>Array.from(document.querySelectorAll('button,a')).filter(e=>{const r=e.getBoundingClientRect(); return r.width>0&&(r.width<40||r.height<40);}).map(e=>{const r=e.getBoundingClientRect(); return `${e.innerText.replace(/\s+/g,' ').trim().slice(0,20)} ${Math.round(r.width)}x${Math.round(r.height)}`;}))));
// Probe H: home page + shop + checkout images check & desktop shop overflow
for (const p of ['', 'shop/', 'shop/?mode=flight&option=B', 'checkout/']) { await page.goto(BASE+p,{waitUntil:'networkidle'}); console.log('IMG', p||'home', JSON.stringify(await page.evaluate(()=>({total:document.images.length, broken:Array.from(document.images).filter(i=>!(i.complete&&i.naturalWidth>0)).map(i=>i.outerHTML.slice(0,120)), docW:document.documentElement.scrollWidth})))); }
// Probe I: option B on phone
await page.goto(BASE+'shop/?mode=flight&option=B',{waitUntil:'networkidle'}); await page.waitForTimeout(300); await page.screenshot({path:`${dir}/m-probeI-optionB.png`});
console.log('console', JSON.stringify(errs));
await browser.close();
