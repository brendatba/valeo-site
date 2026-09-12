import { chromium } from '@playwright/test';
const BASE='http://localhost:4173/valeo-site/';
const dir='/Users/newmac/Work/SHAUNA/site-v1/screens/qa';
const browser=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
const [w,h,tag]=[390,844,'m'];
const page=await browser.newPage({viewport:{width:w,height:h},deviceScaleFactor:1});
const errs=[]; page.on('console',m=>{ if(['error','warning'].includes(m.type())) errs.push(m.type()+': '+m.text()); }); page.on('pageerror',e=>errs.push('pageerror: '+e.message));
page.on('dialog',async d=>{console.log('DIALOG',d.message()); await d.dismiss();});
await page.goto(BASE+'shop/?mode=sample',{waitUntil:'networkidle'}); await page.evaluate(()=>localStorage.clear()); await page.reload({waitUntil:'networkidle'}); await page.waitForTimeout(500);
const shot=async(n)=>{await page.waitForTimeout(400); await page.screenshot({path:`${dir}/${tag}-j4-${n}.png`});};
const bar=async()=>page.evaluate(()=>document.querySelector('#bar-add')?.closest('div,section,footer')?.innerText.replace(/\s+/g,' ').trim());
const tile=(name)=>page.locator('.tile',{hasText:new RegExp('^\\s*'+name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*$')}).first();
let taps=0;
await shot('00-land'); await page.screenshot({path:`${dir}/${tag}-j4-00-land-full.png`,fullPage:true}); console.log('bar@land',await bar());
const picks=['Coffee','Watermelon','Honey Vanilla','Cinnamon Roll','Coconut Lime'];
for (const n of picks){ await tile(n).scrollIntoViewIfNeeded(); await tile(n).click(); taps++; console.log('after',n,'|',await bar()); }
await shot('01-5picked');
await page.evaluate(()=>window.scrollTo(0,0)); await shot('02-5picked-top');
// try a 6th
const sixth=tile('Birthday Cake'); await sixth.scrollIntoViewIfNeeded(); const sixthInfo=await sixth.evaluate(e=>({cls:e.className,disabled:e.disabled,aria:e.getAttribute('aria-disabled'),op:getComputedStyle(e).opacity,pe:getComputedStyle(e).pointerEvents}));
console.log('6th tile before tap',JSON.stringify(sixthInfo));
await sixth.click({force:true}); taps++; await shot('03-sixth-attempt'); console.log('bar after 6th',await bar());
console.log('selected tiles now',JSON.stringify(await page.evaluate(()=>Array.from(document.querySelectorAll('.tile')).filter(t=>/selected|active|picked|is-on|chosen/.test(t.className)||t.getAttribute('aria-pressed')==='true').map(t=>t.innerText.replace(/\s+/g,' ').trim()))));
console.log('any toast/message', JSON.stringify(await page.evaluate(()=>Array.from(document.querySelectorAll('[role=status],[role=alert],.toast,.note,.hint,.msg')).map(e=>e.innerText.trim()).filter(Boolean))));
// add to cart
await page.locator('#bar-add').click(); taps++; await shot('04-added'); console.log('cart:',await page.evaluate(()=>document.querySelector('#cart-drawer')?.innerText.replace(/\s+/g,' ').trim()));
await page.locator('#cart-drawer a[href*="checkout"], #cart-drawer button:has-text("Checkout")').first().click(); taps++; await page.waitForLoadState('networkidle'); await page.waitForTimeout(400);
await shot('05-checkout'); await page.screenshot({path:`${dir}/${tag}-j4-05-checkout-full.png`,fullPage:true});
console.log('checkout controls', (await page.evaluate(()=>Array.from(document.querySelectorAll('button,a,input,select,textarea,label')).filter(e=>e.getBoundingClientRect().width>0).map(e=>{const r=e.getBoundingClientRect();return `${e.tagName}${e.id?'#'+e.id:''}${e.name?'[name='+e.name+']':''}${e.type?'[type='+e.type+']':''}${e.htmlFor?'[for='+e.htmlFor+']':''} "${(e.innerText||e.placeholder||e.value||'').replace(/\s+/g,' ').trim().slice(0,50)}" @${Math.round(r.left)},${Math.round(r.top+scrollY)} ${Math.round(r.width)}x${Math.round(r.height)}`;}))).join('\n'));
await browser.close();
