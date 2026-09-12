import { chromium } from '@playwright/test';
const BASE='http://localhost:4173/valeo-site/';
const dir='/Users/newmac/Work/SHAUNA/site-v1/screens/qa2';
const browser=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
const errs=[]; page.on('console',m=>{ if(['error','warning'].includes(m.type())) errs.push(m.type()+': '+m.text()); }); page.on('pageerror',e=>errs.push('pageerror: '+e.message));
const shot=async(n)=>{await page.waitForTimeout(400); await page.screenshot({path:`${dir}/${n}.png`});};
const tile=(name)=>page.locator('.tile',{hasText:new RegExp('^\\s*'+name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*$')}).first();
const ptile=(name)=>page.locator('.ptile',{hasText:name}).first();
const bar=async()=>page.evaluate(()=>document.querySelector('#bar-add')?.closest('div,section,footer')?.innerText.replace(/\s+/g,' ').trim());
const slots=async()=>page.evaluate(()=>Array.from(document.querySelectorAll('.slot')).map(s=>s.innerText.replace(/\s+/g,' ').trim()));
const totals=async()=>page.evaluate(()=>{const t=Array.from(document.querySelectorAll('*')).find(e=>e.children.length&&/Flight total/.test(e.innerText)&&e.innerText.length<400); return t?t.innerText.replace(/\s+/g,' ').trim():'?';});
const ptitle=async()=>page.evaluate(()=>{const c=Array.from(document.querySelectorAll('.ptile')).find(p=>/selected|active|is-on/.test(p.className)||p.getAttribute('aria-pressed')==='true'); return {checked:c?.innerText.trim(), heading:Array.from(document.querySelectorAll('h2,h3,h4,p,div,span')).map(e=>e.innerText||'').find(t=>/^Product for/.test(t.trim())&&t.length<60)?.replace(/\s+/g,' ').trim()};});
const clipped=async()=>page.evaluate(()=>Array.from(document.querySelectorAll('.slot *, #bar-add ~ *, [class*=bar] *')).filter(e=>e.children.length===0&&e.innerText&&getComputedStyle(e).textOverflow==='ellipsis'&&e.scrollWidth>e.clientWidth+1).map(e=>e.innerText.trim().slice(0,30)));

// HOME passage hint (F7)
await page.goto(BASE,{waitUntil:'networkidle'}); await page.waitForTimeout(600);
await shot('home-000'); await page.mouse.wheel(0,600); await page.waitForTimeout(500); await shot('home-0600');
await page.mouse.wheel(0,900); await page.waitForTimeout(500); await shot('home-1500');
await page.mouse.wheel(0,1800); await page.waitForTimeout(500); await shot('home-3300');
await page.mouse.wheel(0,900); await page.waitForTimeout(500); await shot('home-4200');
console.log('home overflow', await page.evaluate(()=>document.documentElement.scrollWidth));

// SINGLE (B3, F9)
await page.goto(BASE+'shop/',{waitUntil:'networkidle'}); await page.evaluate(()=>localStorage.clear()); await page.reload({waitUntil:'networkidle'}); await page.waitForTimeout(400);
await shot('single-00-land'); console.log('single bar land:', await bar());
console.log('size/chip targets', JSON.stringify(await page.evaluate(()=>Array.from(document.querySelectorAll('.seg-opt,.chip')).map(e=>{const r=e.getBoundingClientRect();return `${e.innerText.replace(/\s+/g,' ').trim().slice(0,14)} ${Math.round(r.width)}x${Math.round(r.height)}`;}))));
await ptile('Coffee Scrub').click(); await page.locator('.seg-opt',{hasText:/^8 oz/}).click(); await shot('single-01-scrub-8oz');
await tile('Watermelon').scrollIntoViewIfNeeded(); await tile('Watermelon').click(); await shot('single-02-watermelon'); console.log('single bar after watermelon:', await bar(), 'clipped:', JSON.stringify(await clipped()));
await page.locator('#bar-add').click(); await shot('single-03-cart'); console.log('cart:', await page.evaluate(()=>document.querySelector('#cart-drawer')?.innerText.replace(/\s+/g,' ').trim()));
await page.locator('#cart-close').click();

// FLIGHT C (B2, F1, F2, F3, F5)
await page.goto(BASE+'shop/?mode=flight&option=C',{waitUntil:'networkidle'}); await page.evaluate(()=>localStorage.clear()); await page.reload({waitUntil:'networkidle'}); await page.waitForTimeout(400);
await shot('flightC-00-land'); console.log('C land | totals:', await totals(), '| bar:', await bar(), '| slots:', JSON.stringify(await slots()));
await tile('Honey Vanilla').scrollIntoViewIfNeeded(); await tile('Honey Vanilla').click(); await page.evaluate(()=>window.scrollTo(0,0)); await shot('flightC-01-jar1-top');
console.log('C after jar1 | totals:', await totals(), '| bar:', await bar(), '| slots:', JSON.stringify(await slots()), '| product row:', JSON.stringify(await ptitle()));
await page.evaluate(()=>{const p=document.querySelector('.ptile'); p.scrollIntoView({block:'center'});}); await shot('flightC-02-product-row-jar2');
await ptile('Salt Scrub').click(); await tile('Cinnamon Roll').scrollIntoViewIfNeeded(); await tile('Cinnamon Roll').click(); await page.evaluate(()=>window.scrollTo(0,0)); await shot('flightC-03-complete-top');
console.log('C complete | totals:', await totals(), '| bar:', await bar(), '| slots:', JSON.stringify(await slots()), '| clipped:', JSON.stringify(await clipped()));
// probe: jar2 without product choice
await page.goto(BASE+'shop/?mode=flight&option=C',{waitUntil:'networkidle'}); await page.evaluate(()=>localStorage.clear()); await page.reload({waitUntil:'networkidle'});
await tile('Honey Vanilla').click(); await tile('Cinnamon Roll').click(); await page.waitForTimeout(300); await page.evaluate(()=>window.scrollTo(0,0)); await shot('flightC-04-noproduct-probe');
console.log('C no-product probe | slots:', JSON.stringify(await slots()), '| product row:', JSON.stringify(await ptitle()));
// Option A switch (F2)
await page.locator('.seg-opt[data-option="A"]').click(); await page.waitForTimeout(300); await shot('flightA-05-switched');
console.log('A after switch | totals:', await totals(), '| bar:', await bar(), '| slots:', JSON.stringify(await slots()), '| product row:', JSON.stringify(await ptitle()));
for (const n of ['Coffee','Watermelon','Birthday Cake']) { await tile(n).scrollIntoViewIfNeeded(); await tile(n).click(); }
await page.evaluate(()=>window.scrollTo(0,0)); await shot('flightA-06-3jars');
console.log('A 3 jars | totals:', await totals(), '| bar:', await bar(), '| slots:', JSON.stringify(await slots()));
await page.locator('.slot[data-slot="1"]').click(); await ptile('Sugar Scrub').scrollIntoViewIfNeeded(); await ptile('Sugar Scrub').click(); await page.evaluate(()=>window.scrollTo(0,0)); await shot('flightA-07-jar2-sugar');
console.log('A jar2 sugar | slots:', JSON.stringify(await slots()), '| bar:', await bar());
await page.locator('#bar-add').click(); await shot('flightA-08-cart'); console.log('flight cart:', await page.evaluate(()=>document.querySelector('#cart-drawer')?.innerText.replace(/\s+/g,' ').trim()));
await page.locator('#cart-close').click();

// SAMPLE + CHECKOUT (B1, B3, F5)
await page.goto(BASE+'shop/?mode=sample',{waitUntil:'networkidle'}); await page.evaluate(()=>localStorage.clear()); await page.reload({waitUntil:'networkidle'}); await page.waitForTimeout(400);
await shot('sample-00-land'); console.log('sample bar land:', await bar());
for (const n of ['Coffee','Watermelon','Honey Vanilla','Cinnamon Roll','Coconut Lime']){ await tile(n).scrollIntoViewIfNeeded(); await tile(n).click(); }
await page.evaluate(()=>window.scrollTo(0,0)); await shot('sample-01-5picked'); console.log('sample bar 5:', await bar(), '| slots:', JSON.stringify(await slots()));
await page.locator('#bar-add').click(); await shot('sample-02-cart'); console.log('sample cart:', await page.evaluate(()=>document.querySelector('#cart-drawer')?.innerText.replace(/\s+/g,' ').trim()));
await page.locator('#cart-drawer a[href*="checkout"]').first().click(); await page.waitForLoadState('networkidle'); await page.waitForTimeout(400);
await page.locator('#place-order').click(); await shot('checkout-01-empty-submit');
await page.locator('#f-name').click(); await page.keyboard.type('Test Customer'); await shot('checkout-02-name-typed');
await page.locator('#f-phone').click(); await page.keyboard.type('2535550100'); await shot('checkout-03-phone-typed');
console.log('errors visible after typing:', JSON.stringify(await page.evaluate(()=>Array.from(document.querySelectorAll('.err')).filter(e=>e.getBoundingClientRect().height>0).map(e=>e.innerText.trim())), null), 'invalid fields:', JSON.stringify(await page.evaluate(()=>Array.from(document.querySelectorAll('[data-invalid="true"]')).map(e=>e.id))));
await page.locator('label:has-text("Local delivery")').click(); await page.locator('#f-address').click(); await page.keyboard.type('123 Main St, Tacoma WA 98402'); await shot('checkout-04-filled');
await page.locator('#place-order').click(); await page.waitForTimeout(700); await shot('checkout-05-confirmation'); await page.screenshot({path:`${dir}/checkout-05-confirmation-full.png`,fullPage:true});
console.log('confirmation:', await page.evaluate(()=>document.querySelector('main')?.innerText.replace(/\s+/g,' ').trim().slice(0,700)));
console.log('links:', JSON.stringify(await page.evaluate(()=>Array.from(document.querySelectorAll('main a')).map(a=>({t:a.innerText.trim(),href:(a.getAttribute('href')||'').slice(0,120)})))));
console.log('cart badge:', (await page.locator('#cart-open').innerText()).replace(/\s+/g,' '));
console.log('imgs broken:', JSON.stringify(await page.evaluate(()=>Array.from(document.images).filter(i=>!(i.complete&&i.naturalWidth>0)).length)), 'overflow', await page.evaluate(()=>document.documentElement.scrollWidth));
console.log('console:', JSON.stringify(errs));
await browser.close();
