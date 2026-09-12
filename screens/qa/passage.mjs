import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const BASE='http://localhost:4173/valeo-site/';
const dir='/Users/newmac/Work/SHAUNA/site-v1/screens/qa';
const browser=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
for (const [w,h,tag] of [[390,844,'m'],[1280,800,'d']]) {
  const page=await browser.newPage({viewport:{width:w,height:h},deviceScaleFactor:1});
  await page.goto(BASE,{waitUntil:'networkidle'}); await page.waitForTimeout(800);
  const passage=await page.evaluate(()=>{const p=document.querySelector('.passage'); const r=p.getBoundingClientRect(); return {top:r.top+scrollY, h:p.offsetHeight};});
  console.log(tag,'passage',JSON.stringify(passage));
  const rows=[];
  let y=0;
  const end=passage.top+passage.h+600;
  while(y<end){
    await page.mouse.wheel(0,300); y+=300; await page.waitForTimeout(150);
    const sy=await page.evaluate(()=>scrollY);
    if(sy>=passage.top-900){
      const info=await page.evaluate(()=>{
        const vs=Array.from(document.querySelectorAll('video'));
        return vs.map((v,i)=>{ const r=v.getBoundingClientRect(); const cs=getComputedStyle(v); const c=document.createElement('canvas'); c.width=32;c.height=32; let hash='';
          try{ c.getContext('2d').drawImage(v,0,0,32,32); const d=c.getContext('2d').getImageData(0,0,32,32).data; let s=0; for(let k=0;k<d.length;k+=4){ s=(s*31+d[k]+d[k+1]*3+d[k+2]*7)>>>0;} hash=s.toString(16);}catch(e){hash='err '+e.message}
          return {i,t:+v.currentTime.toFixed(2),op:cs.opacity,vis:cs.visibility,top:Math.round(r.top),hash}; });
      });
      const cap=await page.evaluate(()=>{const c=document.querySelector('.passage .caption, .passage [class*=caption], .passage figcaption'); return c? c.textContent.trim().slice(0,40):null;});
      rows.push({sy,cap,info}); await page.screenshot({path:`${dir}/${tag}-pass-${String(sy).padStart(4,'0')}.png`});
    }
  }
  writeFileSync(`${dir}/${tag}-passage-log.json`, JSON.stringify(rows,null,1));
  for(const r of rows) console.log(tag, r.sy, r.cap, r.info.map(v=>`${v.i}:t=${v.t} op=${v.op} ${v.hash}`).join(' | '));
  await page.close();
}
await browser.close();
