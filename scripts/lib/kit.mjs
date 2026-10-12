// Paleta, movimiento y envoltorio común de todos los SVG.
//
// Reglas de color (cada color significa algo):
//   violeta  -> la base de todo: sombras, rangos, marcos
//   rojo     -> SOLO una puerta abierta (en curso)
//   cian     -> SOLO los avisos [SISTEMA]
//
// Reglas de movimiento: entradas con ease-out fuerte y escalonadas (60 ms),
// loops lentos y sutiles, y todo se apaga con prefers-reduced-motion.

import { flushText } from './text.mjs';

export const C = {
  void: '#07040d',
  panel: '#0e0720',
  panel2: '#150a2b',
  line: '#2b1853',
  v700: '#5b21b6',
  v600: '#7c3aed',
  v500: '#8b5cf6',
  v400: '#a78bfa',
  v300: '#c4b5fd',
  v200: '#ddd6fe',
  v100: '#f1ecff',
  ink: '#ece6ff',
  dim: '#9a8cc4',
  faint: '#6a5d96',
  cyan: '#5ee7ff',
  cyanDim: '#0e7490',
  red: '#ef4444',
  redDim: '#7f1d1d',
};

export const OUT = 'cubic-bezier(0.23,1,0.32,1)';
export const IN_OUT = 'cubic-bezier(0.77,0,0.175,1)';

export const RANKS = {
  E: { fill: '#2a1653', edge: '#5b3aa0', ink: '#c4b5fd' },
  D: { fill: '#3b1a73', edge: '#6d4cc0', ink: '#ddd6fe' },
  C: { fill: '#4c1d95', edge: '#7c5ad6', ink: '#ede9fe' },
  B: { fill: '#5b21b6', edge: '#9b7bf0', ink: '#f5f3ff' },
  A: { fill: '#7c3aed', edge: '#b79cff', ink: '#ffffff' },
  S: { fill: '#a855f7', edge: '#e9d5ff', ink: '#ffffff' },
  '?': { fill: '#1b1230', edge: '#4b3a78', ink: '#8b7bb8' },
};

export const MONO_STACK = "ui-monospace,'Cascadia Code',Consolas,monospace";

export function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Generador pseudoaleatorio determinista: el mismo build da el mismo SVG. */
export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BASE_CSS = `
.o{transform-box:fill-box;transform-origin:50% 50%}
.l{transform-box:fill-box;transform-origin:0 50%}
.b{transform-box:fill-box;transform-origin:50% 100%}
@keyframes rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes fade{from{opacity:0}to{opacity:1}}
@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes spinr{to{transform:rotate(-360deg)}}
@keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}
@keyframes ring{0%{opacity:.85;transform:scale(1)}100%{opacity:0;transform:scale(2.6)}}
@keyframes drift{from{transform:translateX(0)}to{transform:translateX(var(--run,800px))}}
@media (prefers-reduced-motion:reduce){
  *{animation-duration:.001s!important;animation-iteration-count:1!important;animation-delay:0s!important}
}`;

/** Envoltorio común. `body` y `defs` son strings SVG; `css` se suma al base. */
export function svgDoc({ w, h, title, desc, defs = '', css = '', body }) {
  const flushed = flushText(body);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-labelledby="t d">
<title id="t">${esc(title)}</title>
<desc id="d">${esc(desc)}</desc>
<defs>${flushed.defs}${defs}</defs>
<style>${BASE_CSS}${css}</style>
${flushed.body}
</svg>
`;
}

/** Panel base: fondo + marco fino con esquinas cortadas (estética de ventana del Sistema). */
export function panel(w, h, { r = 10, stroke = C.line, fill = C.panel } = {}) {
  return `<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`;
}

/** Hexágono "plano arriba" para insignias de rango. */
export function hex(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(' ');
}

/** Esquinas tipo HUD. */
export function brackets(w, h, { inset = 10, arm = 18, color = C.v500, opacity = 0.7 } = {}) {
  const i = inset;
  const a = arm;
  const d =
    `M${i} ${i + a}V${i}H${i + a}` +
    `M${w - i - a} ${i}H${w - i}V${i + a}` +
    `M${w - i} ${h - i - a}V${h - i}H${w - i - a}` +
    `M${i + a} ${h - i}H${i}V${h - i - a}`;
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="square" opacity="${opacity}"/>`;
}

/** Fecha "hace N …" en español. */
export function haceCuanto(iso, now = new Date()) {
  const ms = now - new Date(iso);
  const d = Math.floor(ms / 86400000);
  if (d <= 0) return 'hoy';
  if (d === 1) return 'ayer';
  if (d < 7) return `hace ${d} días`;
  if (d < 30) return `hace ${Math.floor(d / 7)} sem`;
  if (d < 365) return `hace ${Math.floor(d / 30)} meses`;
  return `hace ${Math.floor(d / 365)} a`;
}
