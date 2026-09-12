import { chromium } from '@playwright/test';
const BASE='http://localhost:4173/valeo-site/';
const dir='/Users/newmac/Work/SHAUNA/site-v1/screens/qa';
const browser=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
for (const [w,h,tag] of [[390,844,'m'],[1280,800,'d']]) {
  const page=await browser.newPage({viewport:{width:w,height:h},deviceScaleFactor:1});
  const errs=[]; page.on('console',m=>{ if(['error','warning'].includes(m.type())) errs.push(m.type()+': '+m.text()); }); page.on('pageerror',e=>errs.push('pageerror: '+e.message));
  await page.goto(BASE+'shop/?mode=flight&option=C',{waitUntil:'networkidle'}); await page.evaluate(()=>localStorage.clear()); await page.reload({waitUntil:'networkidle'}); await page.waitForTimeout(500);
  const state=async(label)=>{ const s=await page.evaluate(()=>{const slots=Array.from(document.querySelectorAll('.slot')).map(s=>`[${s.className}] ${s.innerText.replace(/\s+/g,' ').trim()}`); const tot=Array.from(document.querySelectorAll('*')).find(e=>e.children.length&&/Flight total/.test(e.innerText)&&e.innerText.length<400); const bar=document.querySelector('#bar-add')?.closest('div,section,footer')?.innerText.replace(/\s+/g,' ').trim(); const ptitle=Array.from(document.querySelectorAll('h2,h3,h4,.label,legend,p,div')).map(e=>e.innerText||'').filter(t=>/^Product/.test(t.trim())&&t.length<60)[0]; return {slots, totals: tot?tot.innerText.replace(/\s+/g,' ').trim():'?', bar, ptitle: ptitle?.replace(/\s+/g,' ').trim()};}); console.log(tag,label,JSON.stringify(s)); };
  const shot=async(n)=>{await page.waitForTimeout(400); await page.screenshot({path:`${dir}/${tag}-j3-${n}.png`});};
  const tile=(name)=>page.locator('.tile',{hasText:new RegExp('^\\s*'+name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*$')}).first();
  const ptile=(name)=>page.locator('.ptile',{hasText:name}).first();
  let taps=0;
  await shot('00-land'); await state('land');
  await tile('Honey Vanilla').scrollIntoViewIfNeeded(); await tile('Honey Vanilla').click(); taps++; await shot('01-honey-jar1'); await state('after honey vanilla');
  // Which slot is active now? Try product tiles: tap Salt Scrub and see which jar it applies to
  await page.evaluate(()=>window.scrollTo(0,0)); await shot('02-top-after-jar1');
  await ptile('Salt Scrub').scrollIntoViewIfNeeded(); await ptile('Salt Scrub').click(); taps++; await shot('03-salt-scrub'); await state('after salt scrub tap');
  await tile('Cinnamon Roll').scrollIntoViewIfNeeded(); await tile('Cinnamon Roll').click(); taps++; await shot('04-cinnamon-jar2'); await state('after cinnamon roll');
  await page.evaluate(()=>window.scrollTo(0,0)); await shot('05-top-complete'); 
  // Option A
  await page.locator('.seg-opt[data-option="A"]').click(); taps++; await shot('06-optionA'); await state('after option A');
  for (const n of ['Coffee','Watermelon','Birthday Cake']) { await tile(n).scrollIntoViewIfNeeded(); await tile(n).click(); taps++; }
  await shot('07-A-3scents'); await state('after 3 scents');
  await page.evaluate(()=>window.scrollTo(0,0)); await shot('08-A-top');
  await page.locator('.slot[data-slot="1"]').click(); taps++; await shot('09-A-jar2-selected'); await state('after jar2 slot tap');
  await ptile('Sugar Scrub').scrollIntoViewIfNeeded(); await ptile('Sugar Scrub').click(); taps++; await shot('10-A-jar2-sugar'); await state('after sugar scrub');
  await page.evaluate(()=>window.scrollTo(0,0)); await shot('11-A-top-final');
  await page.locator('#bar-add').click(); taps++; await shot('12-added');
  console.log(tag,'cart:',await page.evaluate(()=>document.querySelector('#cart-drawer')?.innerText.replace(/\s+/g,' ').trim()));
  console.log(tag,'taps',taps,'console',JSON.stringify(errs), 'overflow', await page.evaluate(()=>document.documentElement.scrollWidth));
  await page.close();
}
await browser.close();
