import { catalog } from '../lib/catalog.ts';
import { cart } from '../lib/cart.ts';
import { page } from '../lib/util.ts';
import { openDrawer } from './cart-drawer.ts';

export const LOTUS = `<svg class="lotus" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c2 3 2.6 6 2 9-1.5-2.4-2.5-5-2-9z" fill="#C9A24A"/><path d="M12 12c-2.5-.5-5-2-7-5 .5 4 2.5 6.5 5 8-3 .5-5.5 0-7.5-1.5C4.5 17 8 19 12 19s7.5-2 9.5-5.5C19.5 15 17 15.5 14 15c2.5-1.5 4.5-4 5-8-2 3-4.5 4.5-7 5z" fill="#2F4A2A"/></svg>`;

export function mountHeader(): void {
  const host = document.getElementById('site-header');
  if (!host) return;
  host.className = 'site-header';
  host.innerHTML = `
    <div class="wrap">
      <a class="wordmark" href="${page('')}" aria-label="${catalog.business.wordmark} home">${LOTUS}<span>${catalog.business.wordmark}</span></a>
      <nav class="nav" aria-label="Site">
        <a href="${page('shop/')}">Shop</a>
        <button class="cart-btn" type="button" id="cart-open" aria-haspopup="dialog" aria-controls="cart-drawer">
          <span>Cart</span><span class="count" id="cart-count" data-zero="true" aria-label="0 items">0</span>
        </button>
      </nav>
    </div>`;
  const count = host.querySelector<HTMLElement>('#cart-count')!;
  cart.subscribe(() => {
    const n = cart.count;
    count.textContent = String(n);
    count.dataset.zero = String(n === 0);
    count.setAttribute('aria-label', `${n} item${n === 1 ? '' : 's'}`);
  });
  host.querySelector('#cart-open')!.addEventListener('click', () => openDrawer());
}

export function mountFooter(): void {
  const host = document.getElementById('site-footer');
  if (!host) return;
  const b = catalog.business;
  host.className = 'site-footer';
  host.innerHTML = `
    <div class="wrap">
      <div>
        <a class="wordmark" href="${page('')}">${LOTUS}<span>${b.wordmark}</span></a>
        <p class="muted" style="margin-top:8px;max-width:46ch">${b.about}</p>
        <p class="small muted" style="margin-top:10px">${b.altName} · Est. ${b.est}</p>
      </div>
      <div class="contact">
        <span class="eyebrow">Get in touch</span>
        <a href="tel:${b.phoneDigits}">${b.phone}</a>
        <a href="mailto:${b.email}">${b.email}</a>
        <a href="https://instagram.com/${b.instagram}" rel="noopener">@${b.instagram}</a>
        <span class="muted">${b.domain}</span>
      </div>
    </div>`;
}
