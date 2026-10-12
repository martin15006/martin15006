import { C, OUT, IN_OUT, svgDoc, rng } from '../lib/kit.mjs';
import { FONT, glyphsD, textD } from '../lib/text.mjs';
import { sigilParts } from '../lib/sigil.mjs';

// Portada: ARISE letra por letra, un sigilo que gira despacio, brasas que suben
// y un destello que cruza el título cada nueve segundos.
export function banner({ name, alias, date, open, shadows }) {
  const W = 880;
  const H = 280;

  const title = glyphsD(FONT.display, 'ARISE', { x: 58, y: 170, size: 128, tracking: 16 });
  const letters = title.letters.filter((l) => l.d);

  const sub = textD(FONT.mono, `${name.toUpperCase()} · ${alias.toUpperCase()}`, {
    x: 62, y: 210, size: 14, tracking: 5,
  });
  const tag = textD(FONT.mono, 'SISTEMA // MONARCA', { x: 30, y: 44, size: 11, tracking: 3 });
  const hint = textD(FONT.mono, 'CLIC: ENTRAR A LA SALA', { x: Math.round(tag.x + tag.width + 26), y: 44, size: 11, tracking: 3 });

  const hud = [
    `[ PUERTAS ABIERTAS ${open} ]`,
    `[ SOMBRAS ${shadows} ]`,
    `[ SINCRONIZADO ${date} ]`,
  ];
  let hx = 62;
  const hudPaths = hud.map((t) => {
    const p = textD(FONT.mono, t, { x: hx, y: 248, size: 11, tracking: 2 });
    hx += p.width + 26;
    return p.d;
  });

  // Sigilo (centro 730,140)
  const cx = 730;
  const cy = 140;
  const { ticks, poly, eye, diamonds, corners } = sigilParts(cx, cy);

  // Brasas
  const rand = rng(11);
  const embers = Array.from({ length: 18 }, (_, i) => {
    const x = 24 + rand() * (W - 48);
    const y = 150 + rand() * 120;
    const r = 0.8 + rand() * 1.5;
    const dur = 6 + rand() * 7;
    const delay = -(rand() * dur);
    const fill = i % 3 === 0 ? C.v300 : C.v500;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${fill}" style="animation:ember ${dur.toFixed(1)}s linear ${delay.toFixed(1)}s infinite both"/>`;
  }).join('');

  // Cada letra se define una vez y se reutiliza (letras, resplandor y recorte del destello).
  const glyphDefs = letters.map((l, i) => `<path id="l${i}" d="${l.d}"/>`).join('');
  const letterPaths = letters
    .map((_, i) => `<use href="#l${i}" class="o lt" style="animation-delay:${200 + i * 70}ms" fill="url(#ttl)"/>`)
    .join('');
  const glowPaths = letters.map((_, i) => `<use href="#l${i}" fill="${C.v500}"/>`).join('');
  const clipPaths = letters.map((_, i) => `<use href="#l${i}"/>`).join('');

  const defs = `
${glyphDefs}
<clipPath id="card"><rect width="${W}" height="${H}" rx="14"/></clipPath>
<clipPath id="tc">${clipPaths}</clipPath>
<linearGradient id="ttl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="${C.v300}"/></linearGradient>
<radialGradient id="g1" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${C.v600}" stop-opacity=".34"/><stop offset="1" stop-color="${C.v600}" stop-opacity="0"/></radialGradient>
<radialGradient id="g2" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${C.v500}" stop-opacity=".22"/><stop offset="1" stop-color="${C.v500}" stop-opacity="0"/></radialGradient>
<linearGradient id="shine" gradientTransform="rotate(18)"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#fff" opacity=".035"/></pattern>
<filter id="b14" x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur stdDeviation="14"/></filter>
<clipPath id="eyeclip"><path d="${eye.almond}"/></clipPath>
<radialGradient id="iris" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${C.v200}"/><stop offset=".4" stop-color="${C.v400}"/><stop offset=".8" stop-color="${C.v600}"/><stop offset="1" stop-color="${C.v700}"/></radialGradient>
<radialGradient id="eg" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${C.v500}" stop-opacity=".5"/><stop offset="1" stop-color="${C.v500}" stop-opacity="0"/></radialGradient>`;

  const css = `
.lt{animation:lt 640ms ${OUT} both}
@keyframes lt{from{opacity:0;transform:translateY(12px);filter:blur(6px)}to{opacity:1;transform:none;filter:blur(0)}}
.glow{animation:fade 900ms ease 900ms both}
.glow g{animation:breathe 5s ease-in-out 1.8s infinite alternate both}
@keyframes breathe{from{opacity:.32}to{opacity:.7}}
.sw{animation:sweep 9s ${IN_OUT} 2.4s infinite}
@keyframes sweep{0%{transform:translateX(0)}12%{transform:translateX(720px)}100%{transform:translateX(720px)}}
@keyframes ember{0%{opacity:0;transform:translateY(0)}20%{opacity:.9}100%{opacity:0;transform:translateY(-110px)}}
@keyframes draw{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}
.br{stroke-dasharray:100;animation:draw 900ms ${OUT} 120ms both}
.s1{animation:spin 160s linear infinite}
.s2{animation:spinr 110s linear infinite}
.s3{animation:spin 70s linear infinite}
.sub{animation:rise 520ms ${OUT} 700ms both}
.hud{animation:fade 700ms ease 1000ms both}
.tag{animation:fade 700ms ease 200ms both}
.hint{animation:hintp 2.6s ease-in-out 1.4s infinite alternate}
@keyframes hintp{from{opacity:.4}to{opacity:1}}
.lid{animation:open 700ms ${OUT} 900ms both,lid 7s ease-in-out 3.2s infinite}
@keyframes open{from{transform:scaleY(.08)}to{transform:scaleY(1)}}
@keyframes lid{0%,92%{transform:scaleY(1)}95%{transform:scaleY(.08)}98%,100%{transform:scaleY(1)}}
.gaze{animation:gaze 12s ease-in-out 2s infinite}
@keyframes gaze{0%,100%{transform:translateX(0)}28%{transform:translateX(-7px)}62%{transform:translateX(6px)}}
.eglow{animation:breathe 4s ease-in-out infinite alternate}`;

  const body = `
<g clip-path="url(#card)">
  <rect width="${W}" height="${H}" fill="${C.void}"/>
  <rect width="${W}" height="${H}" fill="url(#scan)"/>
  <ellipse cx="270" cy="150" rx="360" ry="170" fill="url(#g1)"/>
  <ellipse cx="${cx}" cy="${cy}" rx="210" ry="170" fill="url(#g2)"/>

  <g>
    <ellipse class="eglow" cx="${cx}" cy="${cy}" rx="92" ry="64" fill="url(#eg)"/>
    <g opacity=".9">
      <g class="o s3"><path d="${ticks}" stroke="${C.v400}" stroke-opacity=".5" stroke-width="1.2" fill="none"/></g>
      <g class="o s1"><circle cx="${cx}" cy="${cy}" r="96" fill="none" stroke="${C.v600}" stroke-opacity=".6" stroke-dasharray="2 9"/></g>
      <g class="o s2"><circle cx="${cx}" cy="${cy}" r="84" fill="none" stroke="${C.v500}" stroke-opacity=".65" stroke-dasharray="46 14 6 14"/></g>
      <g class="o s1"><polygon points="${poly(6, 74, 0)}" fill="none" stroke="${C.v400}" stroke-opacity=".4"/></g>
      <circle cx="${cx}" cy="${cy}" r="64" fill="none" stroke="${C.v400}" stroke-opacity=".4"/>
      <path d="${diamonds}" fill="${C.v300}" opacity=".85"/>
    </g>

    <path d="${eye.brow}" fill="none" stroke="${C.v400}" stroke-opacity=".5" stroke-linecap="round"/>
    <g class="o lid">
      <path d="${eye.almond}" fill="#0a0414" stroke="${C.v300}" stroke-width="1.6" stroke-linejoin="round"/>
      <g clip-path="url(#eyeclip)">
        <g class="o gaze">
          <circle cx="${cx}" cy="${cy}" r="19.5" fill="url(#iris)"/>
          <path d="${eye.fibers}" stroke="${C.v100}" stroke-opacity=".35" stroke-width=".8" fill="none"/>
          <circle cx="${cx}" cy="${cy}" r="19.5" fill="none" stroke="${C.v100}" stroke-opacity=".75" stroke-width="1"/>
          <ellipse cx="${cx}" cy="${cy}" rx="4.4" ry="12.5" fill="#05020a"/>
          <circle cx="${cx + 7}" cy="${cy - 7}" r="2.2" fill="#fff" opacity=".9"/>
        </g>
      </g>
    </g>
    <path d="${corners}" fill="${C.v300}"/>
  </g>

  ${embers}

  <g class="glow" filter="url(#b14)"><g>${glowPaths}</g></g>
  ${letterPaths}
  <g clip-path="url(#tc)"><rect class="sw" x="-130" y="60" width="90" height="130" fill="url(#shine)"/></g>

  <path class="sub" d="${sub.d}" fill="${C.v300}"/>
  <rect class="sub" x="62" y="222" width="132" height="2" fill="${C.v500}"/>
  <path class="tag" d="${tag.d}" fill="${C.v400}" opacity=".8"/>
  <path class="hint" d="${hint.d}" fill="${C.v200}"/>
  <g class="hud" fill="#8576b5">${hudPaths.map((d) => `<path d="${d}"/>`).join('')}</g>

  <path class="br" pathLength="100" d="M10 28V10H28M${W - 28} 10H${W - 10}V28M${W - 10} ${H - 28}V${H - 10}H${W - 28}M28 ${H - 10}H10V${H - 28}" fill="none" stroke="${C.v500}" stroke-width="1.5" stroke-linecap="square" opacity=".75"/>
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="14" fill="none" stroke="${C.line}"/>`;

  return svgDoc({
    w: W,
    h: H,
    title: `ARISE — ${name}, ${alias}`,
    desc: `Portada del perfil de ${name}: título ARISE sobre un sigilo violeta. ${open} puertas abiertas, ${shadows} sombras, sincronizado el ${date}.`,
    defs,
    css,
    body,
  });
}
