/** Absolute URL for a public asset or page, honoring the configured base path. */
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
export const page = (path: string) => asset(path);

export function el<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string | boolean | number | undefined> = {}, ...children: (Node | string | null | undefined | false)[]): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === false) continue;
    if (k === 'class') node.className = String(v);
    else if (k === 'html') node.innerHTML = String(v);
    else if (k.startsWith('on') && typeof v === 'function') (node as any)[k] = v;
    else node.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of children) if (c !== null && c !== undefined && c !== false) node.append(c);
  return node;
}

export const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export const uid = () => Math.random().toString(36).slice(2, 9);

export function qs(): URLSearchParams { return new URLSearchParams(location.search); }

/** Keep the sticky bar above the on-screen keyboard (iOS/Android visualViewport). */
export function trackVisualViewport(): void {
  const vv = window.visualViewport;
  if (!vv) return;
  const update = () => {
    const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
    document.documentElement.style.setProperty('--vv-offset', `${offset}px`);
  };
  vv.addEventListener('resize', update);
  vv.addEventListener('scroll', update);
  update();
}

let toastEl: HTMLElement | null = null;
let toastTimer: number | undefined;
export function toast(msg: string): void {
  if (!toastEl) { toastEl = el('div', { class: 'toast', role: 'status', 'aria-live': 'polite' }); document.body.append(toastEl); }
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toastEl?.classList.remove('show'), 2200);
}
