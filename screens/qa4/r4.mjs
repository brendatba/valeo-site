import { webkit, devices } from '@playwright/test';
const BASE='http://localhost:4173/valeo-site/';
const dir='/Users/newmac/Work/SHAUNA/site-v1/screens/qa4';
const browser=await webkit.launch();
const ctx=await browser.newContext({ ...devices['iPhone 14'], viewport:{width:390,height:844}, deviceScaleFactor:1 });
const page=await ctx.newPage();
console.log('UA', await page.evaluate(()=>navigator.userAgent));
const errs=[]; page.on('console',m=>{ if(['error','warning'].includes(m.type())) errs.push(m.type()+': '+m.text()); }); page.on('pageerror',e=>errs.push('pageerror: '+e.message)); page.on('requestfailed',r=>errs.push('reqfail: '+r.url().slice(0,80)));
const shot=async(n)=>{await page.waitForTimeout(400); await page.screenshot({path:`${dir}/${n}.png`});};
const vids=async()=>page.evaluate(()=>Array.from(document.querySelectorAll('video')).map(v=>{const r=v.getBoundingClientRect(); const c=document.createElement('canvas'); c.width=24;c.height=24; let hash=''; try{c.getContext('2d').drawImage(v,0,0,24,24); const d=c.getContext('2d').getImageData(0,0,24,24).data; let s=0; for(let k=0;k<d.length;k+=4){s=(s*31+d[k]+d[k+1]*3+d[k+2]*7)>>>0;} hash=s.toString(16);}catch(e){hash='err'} return {t:+v.currentTime.toFixed(2),ready:v.readyState,op:getComputedStyle(v).opacity,top:Math.round(r.top),hash};}));
// (1) HOME
await page.goto(BASE,{waitUntil:'networkidle'}); await page.waitForTimeout(1500);
await shot('home-0000');
const total=await page.evaluate(()=>document.documentElement.scrollHeight); console.log('scrollHeight', total);
const log=[];
for (let y=300; y<total; y+=300){ await page.evaluate((y)=>window.scrollTo(0,y),y); await page.waitForTimeout(200); const sy=await page.evaluate(()=>scrollY); const v=await vids(); log.push({sy, v:v.map(x=>`${x.t}/${x.op}/${x.hash}`).join(' ')}); if (sy<=4800 || sy%900===0 || y+300>=total) await shot(`home-${String(sy).padStart(4,'0')}`); }
console.log(log.map(l=>`${l.sy}: ${l.v}`).join('\n'));
console.log('overflow', await page.evaluate(()=>document.documentElement.scrollWidth), 'broken imgs', await page.evaluate(()=>Array.from(document.images).filter(i=>!(i.complete&&i.naturalWidth>0)).length));
// (2) single: 8oz Coffee Scrub, Marshmallow Vanilla Kisses
const tile=(name)=>page.locator('.tile',{hasText:new RegExp('^\\s*'+name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*$')}).first();
const ptile=(name)=>page.locator('.ptile',{hasText:name}).first();
const bar=async()=>page.evaluate(()=>document.querySelector('#bar-add')?.closest('div,section,footer')?.innerText.replace(/\s+/g,' ').trim());
await page.goto(BASE+'shop/',{waitUntil:'networkidle'}); await page.evaluate(()=>localStorage.clear()); await page.reload({waitUntil:'networkidle'}); await page.waitForTimeout(500);
await shot('single-00-land');
await ptile('Coffee Scrub').tap(); await page.locator('.seg-opt',{hasText:/^8 oz/}).tap(); await shot('single-01-scrub-8oz');
await tile('Marshmallow Vanilla Kisses').scrollIntoViewIfNeeded(); await tile('Marshmallow Vanilla Kisses').tap(); await shot('single-02-mvk'); console.log('single bar:', await bar());
await page.locator('#bar-add').tap(); await shot('single-03-cart'); console.log('cart:', await page.evaluate(()=>document.querySelector('#cart-drawer')?.innerText.replace(/\s+/g,' ').trim()));
await page.locator('#cart-close').tap();
// (3) flight C with product change
await page.goto(BASE+'shop/?mode=flight&option=C',{waitUntil:'networkidle'}); await page.evaluate(()=>localStorage.clear()); await page.reload({waitUntil:'networkidle'}); await page.waitForTimeout(500);
await shot('flight-00-land');
await tile('Honey Vanilla').scrollIntoViewIfNeeded(); await tile('Honey Vanilla').tap(); await page.evaluate(()=>window.scrollTo(0,0)); await shot('flight-01-jar1');
await ptile('Salt Scrub').scrollIntoViewIfNeeded(); await ptile('Salt Scrub').tap(); await shot('flight-02-salt');
await tile('Cinnamon Roll').scrollIntoViewIfNeeded(); await tile('Cinnamon Roll').tap(); await page.evaluate(()=>window.scrollTo(0,0)); await shot('flight-03-complete');
console.log('flight slots:', JSON.stringify(await page.evaluate(()=>Array.from(document.querySelectorAll('.slot')).map(s=>s.innerText.replace(/\s+/g,' ').trim()))), 'bar:', await bar());
await page.locator('#bar-add').tap(); await shot('flight-04-cart'); console.log('flight cart:', await page.evaluate(()=>document.querySelector('#cart-drawer')?.innerText.replace(/\s+/g,' ').trim()));
// (4) checkout
await page.locator('#cart-drawer a[href*="checkout"]').first().tap(); await page.waitForLoadState('networkidle'); await page.waitForTimeout(500); await shot('checkout-00');
await page.locator('#f-name').tap(); await page.keyboard.type('Brenda Test'); await page.locator('#f-phone').tap(); await page.keyboard.type('2535550100');
await page.locator('label:has-text("Local delivery")').tap(); await page.locator('#f-address').tap(); await page.keyboard.type('123 Main St, Tacoma WA 98402'); await shot('checkout-01-filled');
await page.locator('#place-order').tap(); await page.waitForTimeout(900); await shot('checkout-02-confirmation'); await page.screenshot({path:`${dir}/checkout-02-confirmation-full.png`,fullPage:true});
console.log('URL', page.url()); console.log('confirmation:', await page.evaluate(()=>document.querySelector('main')?.innerText.replace(/\s+/g,' ').trim().slice(0,600)));
console.log('links:', JSON.stringify(await page.evaluate(()=>Array.from(document.querySelectorAll('main a')).map(a=>({t:a.innerText.trim(),href:(a.getAttribute('href')||'').slice(0,90)})))));
console.log('cart badge:', (await page.locator('#cart-open').innerText()).replace(/\s+/g,' '));
console.log('console/network:', JSON.stringify(errs));
await browser.close();
