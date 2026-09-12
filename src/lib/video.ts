/** Scent-world loops: play on intersection, never on load; skipped entirely for reduced motion / data saver / slow networks. */
const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
export const skipMotion =
  matchMedia('(prefers-reduced-motion: reduce)').matches || !!conn?.saveData || ['slow-2g', '2g', '3g'].includes(conn?.effectiveType ?? '');

let io: IntersectionObserver | null = null;
function observer(): IntersectionObserver {
  if (io) return io;
  io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const v = e.target as HTMLVideoElement;
      if (e.isIntersecting) {
        if (!v.src && v.dataset.src) v.src = v.dataset.src;
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    }
  }, { rootMargin: '200px', threshold: 0.25 });
  return io;
}

/** Observe every `.scent-world` video under `root` that isn't observed yet. */
export function watchWorldVideos(root: ParentNode = document): void {
  if (skipMotion) return;
  root.querySelectorAll<HTMLVideoElement>('video.scent-world:not([data-watched])').forEach((v) => { v.dataset.watched = '1'; observer().observe(v); });
}

/** Markup for a world: video with poster when a loop exists, a still otherwise, nothing when neither. */
export function worldMedia(opts: { still?: string; stillM?: string; video?: string; alt: string; cls?: string; eager?: boolean }): string {
  const cls = opts.cls ?? '';
  if (opts.video && opts.still) {
    return `<video class="scent-world ${cls}" poster="${opts.still}" data-src="${opts.video}" muted playsinline loop preload="none" aria-hidden="true"></video>`;
  }
  if (opts.still) return `<img class="${cls}" src="${opts.still}" ${opts.stillM ? `srcset="${opts.stillM} 720w, ${opts.still} 1200w" sizes="(min-width: 900px) 360px, 100vw"` : ''} alt="${opts.alt}" ${opts.eager ? 'fetchpriority="high"' : 'loading="lazy"'} width="1200" height="800">`;
  return '';
}
