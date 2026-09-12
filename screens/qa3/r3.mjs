import { chromium } from '@playwright/test';
const BASE='http://localhost:4173/valeo-site/';
const dir='/Users/newmac/Work/SHAUNA/site-v1/screens/qa3';
const browser=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
const errs=[]; page.on('console',m=>{ if(['error','warning'].includes(m.type())) errs.push(m.type()+': '+m.text()); }); page.on('pageerror',e=>errs.push('pageerror: '+e.message));
const shot=async(n)=>{await page.waitForTimeout(400); await page.screenshot({path:`${dir}/${n}.png`});};
const tile=(name)=>page.locator('.tile',{hasText:new RegExp('^\\s*'+name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*$')}).first();
const ptile=(name)=>page.locator('.ptile',{hasText:name}).first();
const bar=async()=>page.evaluate(()=>document.querySelector('#bar-add')?.closest('div,section,footer')?.innerText.replace(/\s+/g,' ').trim());
const barClip=async()=>page.evaluate(()=>{const b=document.querySelector('#bar-add').closest('div,section,footer'); return Array.from(b.querySelectorAll('*')).filter(e=>e.children.length===0&&e.innerText&&e.scrollWidth>e.clientWidth+1).map(e=>e.innerText.trim().slice(0,40));});
const vids=async()=>page.evaluate(()=>Array.from(document.querySelectorAll('video')).map(v=>{const r=v.getBoundingClientRect(); return {t:+v.currentTime.toFixed(2),paused:v.paused,w:Math.round(r.width),h:Math.round(r.height),vw:v.videoWidth,vh:v.videoHeight,op:getComputedStyle(v).opacity,top:Math.round(r.top)};}));
// (a) HOME
await page.goto(BASE,{waitUntil:'networkidle'}); await page.waitForTimeout(600); await shot('home-000');
const rows=[];
for (const y of [600,1200,1800,2400,3000,3600,4200]) { await page.evaluate((y)=>window.scrollTo(0,y),y); await page.waitForTimeout(500); rows.push({y, v:await vids()}); await shot(`home-${String(y).padStart(4,'0')}`); }
await page.evaluate(()=>window.scrollTo(0,900)); await page.waitForTimeout(300); const a=await vids(); await page.waitForTimeout(1500); const b=await vids(); console.log('loop check at 900 (static scroll):', JSON.stringify(a), '->', JSON.stringify(b));
console.log('home videos', JSON.stringify(rows)); console.log('home overflow', await page.evaluate(()=>document.documentElement.scrollWidth));
// (b) sticky bars
await page.goto(BASE+'shop/',{waitUntil:'networkidle'}); await page.evaluate(()=>localStorage.clear()); await page.reload({waitUntil:'networkidle'}); await page.waitForTimeout(400);
await shot('bar-single-00'); console.log('single land:', await bar(), 'clip', JSON.stringify(await barClip()));
await ptile('Coffee Scrub').click(); await page.locator('.seg-opt',{hasText:/^8 oz/}).click(); await tile('Watermelon').scrollIntoViewIfNeeded(); await tile('Watermelon').click(); await shot('bar-single-01-watermelon'); console.log('single picked:', await bar(), 'clip', JSON.stringify(await barClip()));
await tile('Marshmallow Vanilla Kisses').scrollIntoViewIfNeeded(); await tile('Marshmallow Vanilla Kisses').click(); await shot('bar-single-02-longname'); console.log('single long:', await bar(), 'clip', JSON.stringify(await barClip()));
// flight C
await page.goto(BASE+'shop/?mode=flight&option=C',{waitUntil:'networkidle'}); await page.evaluate(()=>localStorage.clear()); await page.reload({waitUntil:'networkidle'}); await page.waitForTimeout(400);
const totals=async()=>page.evaluate(()=>{const t=Array.from(document.querySelectorAll('*')).find(e=>e.children.length&&/Flight total/.test(e.innerText)&&e.innerText.length<400); return t?t.innerText.replace(/\s+/g,' ').trim():'?';});
await shot('flight-00-land'); console.log('flight land:', await bar(), 'clip', JSON.stringify(await barClip()), '| totals:', await totals());
await tile('Honey Vanilla').scrollIntoViewIfNeeded(); await tile('Honey Vanilla').click(); await page.evaluate(()=>window.scrollTo(0,0)); await shot('flight-01-jar1'); console.log('flight 1of2:', await bar(), 'clip', JSON.stringify(await barClip()), '| totals:', await totals());
await tile('Cinnamon Roll').scrollIntoViewIfNeeded(); await tile('Cinnamon Roll').click(); await page.evaluate(()=>window.scrollTo(0,0)); await shot('flight-02-complete'); console.log('flight 2of2:', await bar(), 'clip', JSON.stringify(await barClip()), '| totals:', await totals());
await page.locator('.seg-opt[data-option="A"]').click(); await page.waitForTimeout(300); await shot('flight-03-optionA'); console.log('flight A 0of3:', await bar(), '| totals:', await totals());
// sample
await page.goto(BASE+'shop/?mode=sample',{waitUntil:'networkidle'}); await page.evaluate(()=>localStorage.clear()); await page.reload({waitUntil:'networkidle'}); await page.waitForTimeout(400);
await shot('bar-sample-00'); console.log('sample land:', await bar(), 'clip', JSON.stringify(await barClip()));
for (const n of ['Coffee','Watermelon','Honey Vanilla']) { await tile(n).scrollIntoViewIfNeeded(); await tile(n).click(); }
await shot('bar-sample-01-3of5'); console.log('sample 3of5:', await bar(), 'clip', JSON.stringify(await barClip()));
console.log('phone console', JSON.stringify(errs));
await page.close();
// (d) desktop side panel animation
const d=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1});
await d.goto(BASE+'shop/',{waitUntil:'networkidle'}); await d.evaluate(()=>localStorage.clear()); await d.reload({waitUntil:'networkidle'}); await d.waitForTimeout(400);
const dtile=(name)=>d.locator('.tile',{hasText:new RegExp('^\\s*'+name+'\\s*$')}).first();
await dtile('Watermelon').click(); await d.waitForTimeout(800);
const pv=async()=>d.evaluate(()=>Array.from(document.querySelectorAll('video')).map(v=>{const r=v.getBoundingClientRect(); const c=document.createElement('canvas'); c.width=32;c.height=32; let hash=''; try{c.getContext('2d').drawImage(v,0,0,32,32); const dd=c.getContext('2d').getImageData(0,0,32,32).data; let s=0; for(let k=0;k<dd.length;k+=4){s=(s*31+dd[k]+dd[k+1]*3+dd[k+2]*7)>>>0;} hash=s.toString(16);}catch(e){hash='err'} return {src:(v.currentSrc||'').split('/').pop().slice(0,40),t:+v.currentTime.toFixed(2),paused:v.paused,loop:v.loop,x:Math.round(r.x),w:Math.round(r.width),h:Math.round(r.height),hash};}));
await d.screenshot({path:`${dir}/desk-panel-watermelon-a.png`}); const p1=await pv(); await d.waitForTimeout(1500); await d.screenshot({path:`${dir}/desk-panel-watermelon-b.png`}); const p2=await pv();
console.log('desktop panel videos A:', JSON.stringify(p1)); console.log('desktop panel videos B:', JSON.stringify(p2));
// spot-check all 18 have a video source in the panel
const names=await d.evaluate(()=>Array.from(document.querySelectorAll('.tile:not(.other)')).map(t=>t.innerText.replace(/\s+/g,' ').replace(/^\d+\s*/,'').trim()));
const res=[]; for (const n of names){ await d.locator('.tile',{hasText:new RegExp('^\\s*'+n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*$')}).first().click(); await d.waitForTimeout(700); const v=await pv(); const panel=v.find(x=>x.x>800&&x.w>0); res.push(`${n}: ${panel?`${panel.src} t=${panel.t} paused=${panel.paused} loop=${panel.loop}`:'NO PANEL VIDEO'}`);}
console.log(res.join('\n'));
await d.screenshot({path:`${dir}/desk-panel-last.png`});
console.log('desktop overflow', await d.evaluate(()=>document.documentElement.scrollWidth));
await browser.close();
