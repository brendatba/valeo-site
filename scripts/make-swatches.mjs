// Generates the flat swatch illustrations in public/swatches/. One consistent style:
// 64×64 viewBox, no background (the tile supplies the scent tint), 2–3 flat shapes, soft ink outline.
import { writeFileSync, mkdirSync } from 'node:fs';

const INK = '#2F4A2A';
const wrap = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-hidden="true">${body}</svg>\n`;
const leaf = (x, y, r = 0, s = 1, fill = '#7BB48A') => `<path transform="translate(${x} ${y}) rotate(${r}) scale(${s})" d="M0 0c6-8 14-8 16 0-2 8-10 8-16 0z" fill="${fill}"/>`;
const drop = (x, y, s = 1, fill = '#E0A24B') => `<path transform="translate(${x} ${y}) scale(${s})" d="M0-9c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z" fill="${fill}"/>`;
const pod = (x, y, r, fill = '#5B3A22') => `<path transform="translate(${x} ${y}) rotate(${r})" d="M-16 2c8-6 22-6 32 0 1 1 0 3-2 3-10-4-20-4-28 0-2 0-3-2-2-3z" fill="${fill}"/>`;
const sprig = (x, y, r, fill = '#9C8AC4') => `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M0 14V-12" stroke="#6F8A63" stroke-width="2" stroke-linecap="round"/>${[-11, -6, -1, 4].map((yy) => `<ellipse cx="-3.5" cy="${yy}" rx="3.5" ry="2.4" fill="${fill}"/><ellipse cx="3.5" cy="${yy + 2}" rx="3.5" ry="2.4" fill="${fill}"/>`).join('')}</g>`;
const daisy = (x, y, s = 1, petal = '#FFF8EA', center = '#E8B84A') => `<g transform="translate(${x} ${y}) scale(${s})">${[0, 45, 90, 135].map((a) => `<ellipse rx="4" ry="11" transform="rotate(${a})" fill="${petal}" stroke="${INK}" stroke-opacity=".15"/>`).join('')}<circle r="4.5" fill="${center}"/></g>`;

const swatches = {
  'pistachio-salted-caramel': `
    <ellipse cx="24" cy="34" rx="15" ry="10" transform="rotate(-25 24 34)" fill="#D9C39A"/>
    <ellipse cx="24" cy="34" rx="9" ry="6" transform="rotate(-25 24 34)" fill="#9CBF5C"/>
    <ellipse cx="24" cy="34" rx="9" ry="6" transform="rotate(-25 24 34)" fill="none" stroke="#6F8A63" stroke-width="1.5"/>
    ${drop(46, 30, 1.1, '#E0A24B')}
    <circle cx="14" cy="20" r="1.6" fill="#fff"/><circle cx="41" cy="46" r="1.6" fill="#fff"/><circle cx="50" cy="16" r="1.6" fill="#fff"/>`,
  'cashmere-vanilla': `${pod(32, 40, -20)}${daisy(38, 24, 0.8)}`,
  'raspberry-lemonade': `
    <circle cx="40" cy="30" r="12" fill="#F6D45A"/><circle cx="40" cy="30" r="8" fill="#FFF3B0"/>
    ${[0,45,90,135,180,225,270,315].map((a)=>`<path d="M40 30 L${40+8*Math.cos(a*Math.PI/180)} ${30+8*Math.sin(a*Math.PI/180)}" stroke="#F6D45A" stroke-width="1.2"/>`).join('')}
    <g fill="#D65A7A">${[[18,30],[24,26],[30,30],[20,36],[27,36],[24,42],[18,42],[30,42]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="4"/>`).join('')}</g>
    ${leaf(20, 20, -20, 0.6)}`,
  'coconut-lime': `
    <circle cx="26" cy="36" r="15" fill="#7A5236"/><circle cx="26" cy="36" r="11" fill="#FFF8EA"/><circle cx="26" cy="36" r="4" fill="#F4EAD8"/>
    <circle cx="46" cy="24" r="10" fill="#8FC66B"/><circle cx="46" cy="24" r="7" fill="#DDF0BE"/>
    ${[0,60,120].map((a)=>`<path d="M46 24 l${7*Math.cos(a*Math.PI/180)} ${7*Math.sin(a*Math.PI/180)}M46 24 l${-7*Math.cos(a*Math.PI/180)} ${-7*Math.sin(a*Math.PI/180)}" stroke="#8FC66B" stroke-width="1.2"/>`).join('')}`,
  'vanilla-amber': `<path d="M32 12l12 12-4 16H24l-4-16z" fill="#E0A24B"/><path d="M32 12l12 12-8 4z" fill="#F2C577"/>${pod(30, 48, -12)}`,
  'chamomile-lavender': `${daisy(24, 34, 1)}${sprig(46, 32, 15)}`,
  'birthday-cake': `
    <path d="M14 30h36v18a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4z" fill="#F4C6D5"/>
    <path d="M14 30c6-6 12 6 18 0s12-6 18 0v6c-6 6-12-6-18 0s-12 6-18 0z" fill="#FFF8EA"/>
    <rect x="30" y="16" width="4" height="12" rx="1" fill="#7BB48A"/><ellipse cx="32" cy="14" rx="2.5" ry="4" fill="#E0A24B"/>
    <g stroke-width="2" stroke-linecap="round"><path d="M20 42l3-2" stroke="#D65A7A"/><path d="M40 44l3 2" stroke="#7BB48A"/><path d="M30 46l3-1" stroke="#E0A24B"/></g>`,
  'watermelon': `
    <path d="M10 26a22 22 0 0 0 44 0z" fill="#7BB48A"/><path d="M14 26a18 18 0 0 0 36 0z" fill="#FFF8EA"/><path d="M17 26a15 15 0 0 0 30 0z" fill="#E8607A"/>
    <g fill="#2F2A26"><ellipse cx="26" cy="32" rx="1.5" ry="2.5"/><ellipse cx="34" cy="34" rx="1.5" ry="2.5"/><ellipse cx="30" cy="38" rx="1.5" ry="2.5"/></g>`,
  'cinnamon-roll': `
    <circle cx="32" cy="32" r="17" fill="#D89A5C"/>
    <path d="M32 32m-12 0a12 12 0 1 1 24 0a8 8 0 1 1-16 0a4 4 0 1 1 8 0" fill="none" stroke="#8A4B22" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M22 22c6-4 14-4 20 0" stroke="#FFF8EA" stroke-width="4" stroke-linecap="round" fill="none" opacity=".9"/>`,
  'bubble-gum-cotton-candy': `
    <rect x="30" y="34" width="4" height="20" rx="1" fill="#FFF8EA" stroke="${INK}" stroke-opacity=".2"/>
    <circle cx="32" cy="26" r="13" fill="#F4A6D2"/><circle cx="22" cy="30" r="8" fill="#F8C1E0"/><circle cx="42" cy="30" r="8" fill="#F8C1E0"/><circle cx="32" cy="18" r="7" fill="#FBD3EA"/>`,
  'coffee': `
    <g fill="#5B3A22"><ellipse cx="24" cy="30" rx="9" ry="13" transform="rotate(-30 24 30)"/><ellipse cx="42" cy="36" rx="9" ry="13" transform="rotate(-30 42 36)"/></g>
    <g stroke="#E9DBCB" stroke-width="2" fill="none" stroke-linecap="round"><path d="M18 40c2-8 8-14 12-20" transform="rotate(-30 24 30)"/><path d="M36 46c2-8 8-14 12-20" transform="rotate(-30 42 36)"/></g>`,
  'vanilla-bean-lavender': `${pod(28, 44, -18)}${sprig(42, 28, 12)}`,
  'sandalwood-bergamot': `
    <circle cx="26" cy="36" r="14" fill="#C9A06B"/><circle cx="26" cy="36" r="10" fill="none" stroke="#A67B4B" stroke-width="1.5"/><circle cx="26" cy="36" r="5" fill="none" stroke="#A67B4B" stroke-width="1.5"/>
    <circle cx="46" cy="24" r="9" fill="#B7D46A"/>${leaf(44, 14, -30, 0.5)}`,
  'ocean-mist-sea-salt': `
    <path d="M10 36c6-8 12-8 18 0s12 8 18 0 6-8 8-4" fill="none" stroke="#5FA8BF" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M10 46c6-8 12-8 18 0s12 8 18 0 6-8 8-4" fill="none" stroke="#9CCFDD" stroke-width="3" stroke-linecap="round"/>
    <g fill="#FFFFFF" stroke="${INK}" stroke-opacity=".2"><rect x="22" y="16" width="6" height="6" rx="1" transform="rotate(15 25 19)"/><rect x="36" y="12" width="5" height="5" rx="1" transform="rotate(-20 38 14)"/><rect x="44" y="22" width="4" height="4" rx="1"/></g>`,
  'brazilian-orange-bourbon': `
    <circle cx="30" cy="34" r="16" fill="#F28C38"/><circle cx="30" cy="34" r="12" fill="#FFD48A"/>
    ${[0,45,90,135,180,225,270,315].map((a)=>`<path d="M30 34 L${30+11*Math.cos(a*Math.PI/180)} ${34+11*Math.sin(a*Math.PI/180)}" stroke="#F28C38" stroke-width="1.5"/>`).join('')}
    ${leaf(36, 16, -20, 0.6)}`,
  'honey-vanilla': `
    <g fill="#F2C24E" stroke="#D89A2B" stroke-width="1.2">${[[24,24],[36,24],[30,34],[42,34]].map(([x,y])=>`<path d="M${x} ${y-6}l5 3v6l-5 3-5-3v-6z"/>`).join('')}</g>
    ${drop(22, 46, 0.9, '#E0A24B')}`,
  'marshmallow-vanilla-kisses': `
    <g fill="#FFF8EA" stroke="${INK}" stroke-opacity=".2"><rect x="14" y="26" width="16" height="18" rx="4"/><rect x="34" y="30" width="16" height="18" rx="4"/></g>
    <ellipse cx="22" cy="26" rx="8" ry="3" fill="#F6ECEC"/><ellipse cx="42" cy="30" rx="8" ry="3" fill="#F6ECEC"/>
    <path d="M40 18c-3-4-8-1-6 3l6 5 6-5c2-4-3-7-6-3z" fill="#E8607A"/>`,
  'pumpkin-marshmallow': `
    <g fill="#EE8A3A"><ellipse cx="32" cy="36" rx="18" ry="14"/><ellipse cx="22" cy="36" rx="8" ry="14" fill="#E07A2C"/><ellipse cx="42" cy="36" rx="8" ry="14" fill="#E07A2C"/><ellipse cx="32" cy="36" rx="7" ry="14"/></g>
    <rect x="30" y="16" width="5" height="8" rx="2" fill="#6F8A63"/>${leaf(36, 18, -10, 0.5)}`,
  'other': `<path d="M32 18v28M18 32h28" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`,
};

mkdirSync('public/swatches', { recursive: true });
for (const [id, body] of Object.entries(swatches)) writeFileSync(`public/swatches/${id}.svg`, wrap(body.trim()));
console.log(`wrote ${Object.keys(swatches).length} swatches`);
