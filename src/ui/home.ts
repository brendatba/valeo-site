import { page } from '../lib/util.ts';
export function renderHome(root: HTMLElement): void { root.innerHTML = `<div class="section"><a class="btn btn-primary" href="${page('shop/')}">Shop scents</a></div>`; }
