import { chromium } from '@playwright/test';
const BASE='http://localhost:4173/valeo-site/';
const dir='/Users/newmac/Work/SHAUNA/site-v1/screens/qa';
const browser=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
for (const [w,h,tag] of [[390,844,'m'],[1280,800,'d']]) {
  const page=await browser.newPage({viewport:{width:w,height:h},deviceScaleFactor:1});
  const errs=[]; page.on('console',m=>{ if(['error','warning'].includes(m.type())) errs.push(m.type()+': '+m.text()); }); page.on('pageerror',e=>errs.push('pageerror: '+e.message));
  await page.goto(BASE+'shop/',{waitUntil:'networkidle'}); await page.evaluate(()=>localStorage.clear()); await page.reload({waitUntil:'networkidle'}); await page.waitForTimeout(500);
  const bar=async()=>page.evaluate(()=>{const b=document.querySelector('#bar-add'); const p=b?.closest('div,section,footer'); return (p?.innerText||'').replace(/\s+/g,' ').trim();});
  const shot=async(n)=>{await page.waitForTimeout(400); await page.screenshot({path:`${dir}/${tag}-j2-${n}.png`});};
  await shot('00-land'); console.log(tag,'bar@land:',await bar());
  let taps=0;
  // tap 1: Coffee Scrub product tile
  const cs=page.getByRole('button',{name:/Coffee Scrub/}).first(); await cs.scrollIntoViewIfNeeded(); await cs.click(); taps++; await shot('01-coffee-scrub'); console.log(tag,'bar after coffee scrub:',await bar());
  // tap 2: 8 oz
  const sz=page.getByRole('button',{name:/^8 oz/}).first(); await sz.scrollIntoViewIfNeeded(); await sz.click(); taps++; await shot('02-8oz'); console.log(tag,'bar after 8oz:',await bar());
  // tap 3: Watermelon
  const wm=page.locator(".tile",{hasText:/^\s*Watermelon\s*$/}).first(); await wm.scrollIntoViewIfNeeded(); await page.waitForTimeout(200); await wm.click(); taps++; await shot('03-watermelon'); console.log(tag,'bar after watermelon:',await bar());
  const wmBox=await wm.boundingBox(); console.log(tag,'watermelon tile box',JSON.stringify(wmBox), 'covered by bar?', wmBox && wmBox.y+wmBox.height > h-90);
  // tap 4: add to cart
  await page.locator('#bar-add').click(); taps++; await shot('04-added'); 
  const drawerOpen=await page.evaluate(()=>{const d=document.querySelector('#cart-drawer'); if(!d) return 'no drawer'; const r=d.getBoundingClientRect(); const cs=getComputedStyle(d); return {vis:cs.visibility, disp:cs.display, op:cs.opacity, x:Math.round(r.x), w:Math.round(r.width), text:d.innerText.replace(/\s+/g,' ').trim().slice(0,300)};});
  console.log(tag,'after add drawer:',JSON.stringify(drawerOpen));
  console.log(tag,'header cart:',await page.locator('#cart-open').innerText());
  // if drawer didn't auto-open, open via header cart
  if(!(drawerOpen.vis==='visible' && drawerOpen.x < w)){ await page.locator('#cart-open').click(); taps++; await shot('05-cart-open'); }
  else { await shot('05-cart-open'); }
  console.log(tag,'cart text:',await page.evaluate(()=>document.querySelector('#cart-drawer')?.innerText.replace(/\s+/g,' ').trim()));
  const closeBtn=page.locator('#cart-close'); console.log(tag,'close box',JSON.stringify(await closeBtn.boundingBox()));
  await closeBtn.click(); taps++; await shot('06-cart-closed');
  const m=await page.evaluate(()=>({scrollW:document.documentElement.scrollWidth,innerW:innerWidth}));
  const imgs=await page.evaluate(()=>Array.from(document.images).map(i=>({src:i.currentSrc.split('/').slice(-2).join('/'),ok:i.complete&&i.naturalWidth>0})).filter(i=>!i.ok));
  console.log(tag,'taps',taps,'overflow',JSON.stringify(m),'broken',JSON.stringify(imgs),'console',JSON.stringify(errs));
  await page.close();
}
await browser.close();
