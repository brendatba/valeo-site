import { chromium } from '@playwright/test';
const BASE='http://localhost:4173/valeo-site/';
const dir='/Users/newmac/Work/SHAUNA/site-v1/screens/qa';
const browser=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
for (const [w,h,tag] of [[390,844,'m'],[1280,800,'d']]) {
  const page=await browser.newPage({viewport:{width:w,height:h},deviceScaleFactor:1});
  const errs=[]; page.on('console',m=>{ if(['error','warning'].includes(m.type())) errs.push(m.type()+': '+m.text()); }); page.on('pageerror',e=>errs.push('pageerror: '+e.message)); page.on('requestfailed',r=>errs.push('reqfail: '+r.url()));
  await page.goto(BASE,{waitUntil:'networkidle'}); await page.waitForTimeout(800);
  await page.screenshot({path:`${dir}/${tag}-home-000.png`});
  const total=await page.evaluate(()=>document.documentElement.scrollHeight);
  console.log(tag,'scrollHeight',total);
  let y=0, lastShot=0, n=1;
  const vidlog=[];
  while(y<total-h){
    y+=300; await page.mouse.wheel(0,300); await page.waitForTimeout(150);
    const sy=await page.evaluate(()=>window.scrollY);
    if(sy-lastShot>=900 || y>=total-h){ lastShot=sy; 
      const info=await page.evaluate(()=>Array.from(document.querySelectorAll('video')).map(v=>{const r=v.getBoundingClientRect();return {t:+v.currentTime.toFixed(2),paused:v.paused,ready:v.readyState,top:Math.round(r.top),h:Math.round(r.height),vis:r.bottom>0&&r.top<innerHeight,src:(v.currentSrc||v.src||'').split('/').pop()}}));
      vidlog.push({sy,info}); 
      await page.screenshot({path:`${dir}/${tag}-home-${String(sy).padStart(4,'0')}.png`}); n++; }
  }
  const m=await page.evaluate(()=>({scrollW:document.documentElement.scrollWidth,innerW:innerWidth, bodyW:document.body.scrollWidth}));
  const imgs=await page.evaluate(()=>Array.from(document.images).map(i=>({src:i.currentSrc.split('/').slice(-2).join('/'),ok:i.complete&&i.naturalWidth>0,w:i.naturalWidth})).filter(i=>!i.ok));
  console.log(tag,'overflow',JSON.stringify(m)); console.log(tag,'broken imgs',JSON.stringify(imgs)); console.log(tag,'console',JSON.stringify(errs));
  console.log(tag,'videos', JSON.stringify(vidlog));
  await page.close();
}
await browser.close();
