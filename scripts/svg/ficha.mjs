import { C, OUT, RANKS, svgDoc, panel, hex } from '../lib/kit.mjs';
import { FONT, textD, measure } from '../lib/text.mjs';

// Ficha del jugador: retrato con monograma, nivel, rango, experiencia y atributos.
export function ficha({ name, handle, titles, level, rank, xp, xpFloor, xpCeil, attributes }) {
  const W = 880;
  const H = 240;
  const R = RANKS[rank] ?? RANKS.E;

  const label = textD(FONT.display, 'FICHA DEL JUGADOR', { x: 28, y: 36, size: 13, tracking: 4 });
  const mono = textD(FONT.display, name[0].toUpperCase(), { x: 100, y: 158, size: 104, anchor: 'middle' });
  const nameP = textD(FONT.display, name.toUpperCase(), { x: 206, y: 98, size: 42, tracking: 5 });
  const handleP = textD(FONT.mono, `@${handle}`, { x: 208, y: 122, size: 13 });

  // Títulos como fichas
  let cx = 208;
  const chips = titles.map((t) => {
    const w = Math.ceil(measure(FONT.mono, t, 11.5)) + 22;
    const p = textD(FONT.mono, t, { x: cx + 11, y: 153, size: 11.5 });
    const chip = `<rect x="${cx + 0.5}" y="138.5" width="${w}" height="22" rx="3" fill="${C.v700}" fill-opacity=".2" stroke="${C.v600}" stroke-opacity=".7"/><path d="${p.d}" fill="${C.v200}"/>`;
    cx += w + 8;
    return chip;
  });

  const lvlLabel = textD(FONT.mono, 'NIVEL', { x: 208, y: 186, size: 10, tracking: 3 });
  const lvlValue = textD(FONT.display, String(level), { x: 206, y: 224, size: 40 });
  const rankLabel = textD(FONT.mono, 'RANGO', { x: 300, y: 186, size: 10, tracking: 3 });
  const rankLetter = textD(FONT.display, rank, { x: 326, y: 219, size: 22, anchor: 'middle' });
  const xpLabel = textD(FONT.mono, 'EXPERIENCIA', { x: 396, y: 186, size: 10, tracking: 3 });
  const xpNums = textD(FONT.monoMid, `${xp} / ${xpCeil} XP`, { x: 396, y: 226, size: 11 });
  const ratio = Math.min(1, Math.max(0.03, (xp - xpFloor) / Math.max(1, xpCeil - xpFloor)));

  const head = textD(FONT.mono, 'ATRIBUTOS', { x: 604, y: 70, size: 10, tracking: 3 });
  const attrs = attributes.map((a, i) => {
    const y = 100 + i * 28;
    const n = textD(FONT.mono, a.name, { x: 604, y, size: 12.5 });
    const v = textD(FONT.monoMid, String(a.value), { x: 852, y, size: 12, anchor: 'end' });
    const w = Math.round((120 * a.value) / 100);
    return `<path d="${n.d}" fill="${C.dim}"/>
<rect x="702" y="${y - 8}" width="120" height="6" rx="3" fill="${C.line}"/>
<rect class="l" x="702" y="${y - 8}" width="${w}" height="6" rx="3" fill="url(#bar)" style="animation:grow 700ms ${OUT} ${320 + i * 70}ms both"/>
<path d="${v.d}" fill="${C.ink}"/>`;
  });

  const portrait = '28,72 46,54 172,54 172,196 154,214 28,214';

  const defs = `
<clipPath id="pc"><polygon points="${portrait}"/></clipPath>
<linearGradient id="mono" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.v100}"/><stop offset="1" stop-color="${C.v400}"/></linearGradient>
<linearGradient id="bar" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.v600}"/><stop offset="1" stop-color="${C.v300}"/></linearGradient>
<radialGradient id="pg" cx=".5" cy=".55" r=".6"><stop offset="0" stop-color="${C.v500}" stop-opacity=".5"/><stop offset="1" stop-color="${C.v500}" stop-opacity="0"/></radialGradient>
<linearGradient id="scanl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.v300}" stop-opacity="0"/><stop offset=".5" stop-color="${C.v300}" stop-opacity=".7"/><stop offset="1" stop-color="${C.v300}" stop-opacity="0"/></linearGradient>`;

  const css = `
.pan{animation:rise 520ms ${OUT} both}
.scan{animation:scan 4.8s linear 1.2s infinite}
@keyframes scan{0%{transform:translateY(0);opacity:0}8%{opacity:1}92%{opacity:1}100%{transform:translateY(158px);opacity:0}}
.rk{animation:rk 3.4s ${OUT} 1.2s infinite}
@keyframes rk{0%{opacity:.8;transform:scale(1)}100%{opacity:0;transform:scale(1.5)}}`;

  const body = `
<g class="pan">
  ${panel(W, H, { r: 12 })}
  <path d="${label.d}" fill="${C.v300}"/>
  <rect x="28" y="42" width="40" height="2" fill="${C.v500}"/>

  <polygon points="${portrait}" fill="${C.panel2}" stroke="${C.v600}" stroke-opacity=".8" stroke-width="1.2"/>
  <g clip-path="url(#pc)">
    <rect x="28" y="54" width="144" height="160" fill="url(#pg)"/>
    <path d="${mono.d}" fill="url(#mono)"/>
    <rect class="scan" x="28" y="54" width="144" height="2" fill="url(#scanl)"/>
  </g>
  <path d="M20 66V50H36M180 202V218H164" fill="none" stroke="${C.v500}" stroke-width="1.5" opacity=".8"/>

  <path d="${nameP.d}" fill="#ffffff"/>
  <path d="${handleP.d}" fill="${C.dim}"/>
  ${chips.join('\n  ')}

  <path d="${lvlLabel.d}" fill="${C.faint}"/>
  <path d="${lvlValue.d}" fill="${C.v100}"/>
  <path d="${rankLabel.d}" fill="${C.faint}"/>
  <polygon class="o rk" points="${hex(326, 211, 19)}" fill="none" stroke="${R.edge}" stroke-width="1.2"/>
  <polygon points="${hex(326, 211, 19)}" fill="${R.fill}" stroke="${R.edge}" stroke-width="1.5"/>
  <path d="${rankLetter.d}" fill="${R.ink}"/>
  <path d="${xpLabel.d}" fill="${C.faint}"/>
  <path d="${xpNums.d}" fill="${C.ink}"/>
  <rect x="396" y="196" width="160" height="8" rx="4" fill="${C.line}"/>
  <rect class="l" x="396" y="196" width="${(160 * ratio).toFixed(1)}" height="8" rx="4" fill="url(#bar)" style="animation:grow 900ms ${OUT} 500ms both"/>

  <rect x="580" y="54" width="1" height="160" fill="${C.line}"/>
  <path d="${head.d}" fill="${C.faint}"/>
  ${attrs.join('\n  ')}
</g>`;

  return svgDoc({
    w: W,
    h: H,
    title: `Ficha del jugador: ${name}`,
    desc: `Nivel ${level}, rango ${rank}, ${xp} de ${xpCeil} de experiencia. Atributos: ${attributes
      .map((a) => `${a.name} ${a.value}`)
      .join(', ')}.`,
    defs,
    css,
    body,
  });
}
