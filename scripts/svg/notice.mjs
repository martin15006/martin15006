import { C, OUT, svgDoc } from '../lib/kit.mjs';
import { FONT, textD } from '../lib/text.mjs';

// Aviso del Sistema: único lugar donde aparece el cian. Dos mensajes que se escriben
// y se relevan en un ciclo de 16 s. El "tapa" se desliza con steps() para simular tipeo.
export function notice({ messages }) {
  const W = 880;
  const H = 64;
  const BG = '#07131c';
  const X = 122;
  const CYCLE = 16;

  const label = textD(FONT.mono, 'AVISO', { x: 48, y: 36, size: 10, tracking: 3 });
  const bang = textD(FONT.display, '!', { x: 26, y: 38, size: 16, anchor: 'middle' });

  const msgs = messages.slice(0, 2).map((text) => {
    const t = textD(FONT.monoMid, text, { x: X, y: 39, size: 14.5, tracking: 0.3 });
    return { text, t, run: Math.ceil(t.width) + 6, steps: text.length };
  });

  const css = msgs
    .map((m, i) => {
      const first = i === 0;
      const cv = first
        ? `@keyframes cv${i}{0%{transform:translateX(0);animation-timing-function:steps(${m.steps})}9%{transform:translateX(${m.run}px)}100%{transform:translateX(${m.run}px)}}`
        : `@keyframes cv${i}{0%{transform:translateX(0)}50%{transform:translateX(0);animation-timing-function:steps(${m.steps})}59%{transform:translateX(${m.run}px)}100%{transform:translateX(${m.run}px)}}`;
      const op = first
        ? `@keyframes op${i}{0%{opacity:1}42%{opacity:1}46%{opacity:0}99%{opacity:0}100%{opacity:1}}`
        : `@keyframes op${i}{0%{opacity:0}49.9%{opacity:0}50%{opacity:1}92%{opacity:1}96%{opacity:0}100%{opacity:0}}`;
      return `${cv}${op}.m${i}{animation:op${i} ${CYCLE}s linear infinite}.c${i}{animation:cv${i} ${CYCLE}s linear infinite}`;
    })
    .join('');

  const body = `
<g style="animation:rise 520ms ${OUT} both">
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="8" fill="${BG}" stroke="${C.cyanDim}"/>
  <rect x="1" y="1" width="100" height="${H - 2}" rx="7" fill="#0a2431"/>
  <rect x="100" y="1" width="1" height="${H - 2}" fill="${C.cyanDim}"/>
  <polygon points="26,21 38,32 26,43 14,32" fill="none" stroke="${C.cyan}" stroke-width="1.6"/>
  <path d="${bang.d}" fill="${C.cyan}"/>
  <path d="${label.d}" fill="${C.cyan}" opacity=".85"/>
  <g clip-path="url(#inner)">
  ${msgs
    .map(
      (m, i) => `<g class="m${i}">
    <path d="${m.t.d}" fill="#c8f6ff"/>
    <g class="c${i}">
      <rect x="${X - 3}" y="20" width="${m.run + 14}" height="26" fill="${BG}"/>
      <rect class="cur" x="${X - 1}" y="22" width="8" height="21" fill="${C.cyan}"/>
    </g>
  </g>`,
    )
    .join('\n  ')}
  </g>
</g>`;

  return svgDoc({
    w: W,
    h: H,
    title: 'Aviso del Sistema',
    desc: messages.join(' '),
    defs: `<clipPath id="inner"><rect x="102" y="2" width="${W - 104}" height="${H - 4}"/></clipPath>`,
    css: `${css}.cur{animation:blink 1s steps(1) infinite}`,
    body,
  });
}
