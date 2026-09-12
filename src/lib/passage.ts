/**
 * The scrollcraft passage: a pinned stage where the jar stays and the scent worlds change behind it.
 * Structure (built by home.ts):
 *   <section class="passage" style="--n: 4">        height = (n + 1) * 100svh → scroll distance drives progress
 *     <div class="stage">                            position: sticky; top: 0; height: 100svh
 *       <div class="world" data-i>  <img poster> <video> </div> × n     crossfaded by progress
 *       <div class="stage-jar"> <img jar> </div>      never moves
 *       <div class="stage-text"> name / note </div>   updates with the active world
 *     </div>
 *   </section>
 * Videos: fetched as blobs once the passage is near (so currentTime scrubbing is instant), then scrubbed by
 * the local progress inside each world's window. Reduced motion / data saver: stills only, still crossfaded.
 */
import { skipMotion } from './video.ts';

export function mountPassage(section: HTMLElement): void {
  const worlds = [...section.querySelectorAll<HTMLElement>('.pworld')];
  const n = worlds.length;
  if (!n) return;
  const nameEl = section.querySelector<HTMLElement>('[data-passage-name]');
  const noteEl = section.querySelector<HTMLElement>('[data-passage-note]');
  const rail = section.querySelector<HTMLElement>('[data-passage-rail]');
  const videos = worlds.map((w) => w.querySelector<HTMLVideoElement>('video'));
  let active = -1;
  let loaded = false;

  // Stills beyond the first attach when the passage is near; clips are fetched one at a time, in order,
  // as blobs (so seeking is instant), and only after the page has finished its first load.
  const phone = matchMedia('(max-width: 719px)').matches;
  const attachStills = () => worlds.forEach((w) => {
    w.querySelectorAll<HTMLSourceElement>('source[data-srcset]').forEach((src) => { src.srcset = src.dataset.srcset!; delete src.dataset.srcset; });
    w.querySelectorAll<HTMLImageElement>('img[data-src]').forEach((img) => { if (img.dataset.srcset) img.srcset = img.dataset.srcset; img.src = img.dataset.src!; delete img.dataset.src; });
  });
  const load = async () => {
    if (loaded) return;
    loaded = true;
    attachStills();
    if (skipMotion) return;
    for (const v of videos) {
      if (!v?.dataset.src) continue;
      const url = (phone && v.dataset.srcP) || v.dataset.src;
      try { const blob = await (await fetch(url)).blob(); v.src = URL.createObjectURL(blob); } catch { /* poster stays */ }
    }
  };
  const arm = () => new IntersectionObserver((es, io) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); load(); } }, { rootMargin: '40% 0px' }).observe(section);
  if (document.readyState === 'complete') arm(); else window.addEventListener('load', () => setTimeout(arm, 300), { once: true });

  const setActive = (i: number) => {
    if (i === active) return;
    active = i;
    worlds.forEach((w, j) => w.classList.toggle('is-live', j === i));
    const w = worlds[i];
    if (nameEl) nameEl.textContent = w.dataset.name ?? '';
    if (noteEl) noteEl.innerHTML = w.dataset.noteHtml ?? '';
    rail?.querySelectorAll('span').forEach((s, j) => s.classList.toggle('on', j === i));
    section.style.setProperty('--tint', w.dataset.tint ?? 'transparent');
    section.style.setProperty('--bg', w.dataset.bg || 'transparent');
  };

  let ticking = false;
  const tick = () => {
    ticking = false;
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    const travel = section.offsetHeight - vh;               // pinned distance
    const p = Math.min(1, Math.max(0, -rect.top / travel)); // 0 → 1 across the pin
    const slot = 1 / n;
    const i = Math.min(n - 1, Math.floor(p / slot));
    setActive(i);
    // scrub the live clip across its window
    const v = videos[i];
    if (v && v.readyState >= 1 && v.duration) {
      const local = (p - i * slot) / slot;
      const t = Math.min(v.duration - 0.05, local * v.duration);
      if (Math.abs(v.currentTime - t) > 0.04) v.currentTime = t;
    }
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(tick); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  tick();
}
