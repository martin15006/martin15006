import { C, OUT, IN_OUT, RANKS, svgDoc, panel, hex } from '../lib/kit.mjs';
import { FONT, textD, measure, wrap, fit } from '../lib/text.mjs';

const STATE = {
  abierta: { label: 'ABIERTA', edge: C.red, text: '#fecaca', fill: C.redDim, fillOp: 0.28, stripe: C.red },
  despejada: { label: 'DESPEJADA', edge: C.v500, text: C.v200, fill: C.v700, fillOp: 0.25, stripe: C.v500 },
  sellada: { label: 'SELLADA', edge: C.faint, text: C.dim, fill: '#1b1230', fillOp: 0.5, stripe: C.faint },
};

const star = (cx, cy, r) => {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (Math.PI * i) / 5;
    const rr = i % 2 === 0 ? r : r * 0.45;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
};

// Una puerta del registro: rango, estado, qué es, qué sombra dejó y cuándo se tocó por última vez.
export function gate({ repo, rank, state, blurb, shadows = [], language, pushed, stars = 0, index = 0, sealed = false }) {
  const W = 880;
  const H = 140;
  const S = STATE[sealed ? 'sellada' : state];
  const R = RANKS[sealed ? '?' : rank] ?? RANKS.E;

  const nameText = sealed ? repo : repo;
  const name = textD(FONT.display, fit(FONT.display, nameText, 24, 360, 0.5), { x: 134, y: 47, size: 24, tracking: 0.5 });
  const letter = textD(FONT.display, sealed ? '?' : rank, { x: 76, y: 83, size: 34, anchor: 'middle' });

  // Pastilla de estado
  const pillLabel = textD(FONT.mono, S.label, { x: 0, y: 0, size: 10, tracking: 2 });
  const pillW = Math.ceil(pillLabel.width) + 38;
  const pillX = Math.round(134 + name.width + 16);
  const pillT = textD(FONT.monoMid, S.label, { x: pillX + 28, y: 44, size: 10, tracking: 2 });
  let icon = '';
  if (sealed) {
    icon = `<rect x="${pillX + 9.5}" y="35.5" width="10" height="8" rx="1.5" fill="none" stroke="${S.text}" stroke-width="1.3"/><path d="M${pillX + 11.5} 35.5v-2.2a3 3 0 0 1 6 0v2.2" fill="none" stroke="${S.text}" stroke-width="1.3"/>`;
  } else if (state === 'despejada') {
    icon = `<path d="M${pillX + 9} 40l3.2 3.2 6-7" fill="none" stroke="${S.text}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
  } else {
    icon = `<circle class="o dotp" cx="${pillX + 15}" cy="40" r="3.6" fill="none" stroke="${C.red}" style="animation-delay:${index * 0.45}s"/><circle cx="${pillX + 15}" cy="40" r="3.6" fill="${C.red}"/>`;
  }
  const pill = `<rect x="${pillX + 0.5}" y="29.5" width="${pillW}" height="22" rx="11" fill="${S.fill}" fill-opacity="${S.fillOp}" stroke="${S.edge}" stroke-opacity=".75"/>${icon}<path d="${pillT.d}" fill="${S.text}"/>`;

  // Descripción
  const lines = wrap(FONT.mono, blurb, 12.5, 520, 2);
  const blurbP = lines.map((l, i) => `<path d="${textD(FONT.mono, l, { x: 134, y: 74 + i * 18, size: 12.5 }).d}" fill="${C.dim}"/>`).join('');

  // Sombras extraídas
  let chips = '';
  if (shadows.length) {
    const lab = textD(FONT.mono, 'SOMBRA', { x: 134, y: 119, size: 9.5, tracking: 2 });
    let x = 134 + Math.ceil(lab.width) + 12;
    chips = `<path d="${lab.d}" fill="${C.faint}"/>`;
    for (const s of shadows.slice(0, 4)) {
      const w = Math.ceil(measure(FONT.mono, s, 11)) + 16;
      if (x + w > 650) break;
      const t = textD(FONT.mono, s, { x: x + 8, y: 119, size: 11 });
      chips += `<rect x="${x + 0.5}" y="105.5" width="${w}" height="20" rx="3" fill="${C.v700}" fill-opacity=".16" stroke="${C.v700}"/><path d="${t.d}" fill="${C.v200}"/>`;
      x += w + 6;
    }
  }

  // Columna derecha
  let right = '';
  if (sealed) {
    const t = textD(FONT.mono, 'ACCESO RESTRINGIDO', { x: 852, y: 124, size: 10, tracking: 2, anchor: 'end' });
    right = `<path d="${t.d}" fill="${C.faint}"/>`;
  } else {
    const lp = language ? textD(FONT.mono, language, { x: 852, y: 40, size: 12, anchor: 'end' }) : null;
    const lab = textD(FONT.mono, 'ÚLTIMA EXTRACCIÓN', { x: 852, y: 70, size: 9, tracking: 2, anchor: 'end' });
    const val = textD(FONT.monoMid, pushed, { x: 852, y: 90, size: 13, anchor: 'end' });
    const enter = textD(FONT.mono, 'ENTRAR', { x: 828, y: 124, size: 10.5, tracking: 3, anchor: 'end' });
    right = `${lp ? `<circle cx="${(lp.x - 11).toFixed(1)}" cy="36" r="4" fill="${C.v400}"/><path d="${lp.d}" fill="${C.ink}"/>` : ''}
<path d="${lab.d}" fill="${C.faint}"/>
<path d="${val.d}" fill="${C.ink}"/>
<path d="${enter.d}" fill="${C.v300}"/>
<path d="M834 120h12m-4-4 4 4-4 4" fill="none" stroke="${C.v300}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (stars > 0) {
      const st = textD(FONT.monoMid, String(stars), { x: enter.x - 20, y: 124, size: 12, anchor: 'end' });
      right += `<polygon points="${star(st.x - 11, 119.5, 5.5)}" fill="${C.v300}"/><path d="${st.d}" fill="${C.ink}"/>`;
    }
  }

  const isS = rank === 'S' && !sealed;
  const defs = `
<clipPath id="cc"><rect width="${W}" height="${H}" rx="10"/></clipPath>
<linearGradient id="edge" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.v300}" stop-opacity="0"/><stop offset=".5" stop-color="${C.v300}"/><stop offset="1" stop-color="${C.v300}" stop-opacity="0"/></linearGradient>
<filter id="gb" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>`;

  const css = `
.edge{animation:edge 10s ${IN_OUT} ${(index * 1.7).toFixed(1)}s infinite}
@keyframes edge{0%{transform:translateX(0)}26%{transform:translateX(1020px)}100%{transform:translateX(1020px)}}
.dotp{animation:ring 2.4s ${OUT} infinite}
.hp{animation:ring 3.4s ${OUT} infinite}`;

  const body = `
<g clip-path="url(#cc)">
  <rect width="${W}" height="${H}" fill="${C.panel}"/>
  <rect x="0" y="0" width="4" height="${H}" fill="${S.stripe}" opacity="${sealed ? 0.5 : 0.9}"/>
  ${isS ? `<polygon points="${hex(76, 70, 36)}" fill="${R.fill}" filter="url(#gb)" opacity=".8"/>` : ''}
  <rect class="edge" x="-160" y="0" width="160" height="1.6" fill="url(#edge)" opacity="${sealed ? 0.3 : 0.7}"/>
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="10" fill="none" stroke="${C.line}"/>
${isS ? `<polygon class="o hp" points="${hex(76, 70, 36)}" fill="none" stroke="${R.edge}" stroke-width="1.2"/>` : ''}
<polygon points="${hex(76, 70, 36)}" fill="${R.fill}" stroke="${R.edge}" stroke-width="1.6"/>
<polygon points="${hex(76, 70, 30)}" fill="none" stroke="${R.edge}" stroke-opacity=".35"/>
<path d="${letter.d}" fill="${R.ink}"/>
<path d="${name.d}" fill="${sealed ? C.dim : C.v100}"/>
${pill}
${blurbP}
${chips}
${right}`;

  return svgDoc({
    w: W,
    h: H,
    title: sealed ? 'Puerta sellada' : `Puerta ${repo}, rango ${rank}, ${S.label.toLowerCase()}`,
    desc: `${blurb}${shadows.length ? ` Sombras extraídas: ${shadows.join(', ')}.` : ''}${language ? ` Lenguaje: ${language}.` : ''}${pushed ? ` Última extracción: ${pushed}.` : ''}`,
    defs,
    css,
    body,
  });
}
