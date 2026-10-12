import { C, OUT, svgDoc, panel } from '../lib/kit.mjs';
import { FONT, textD, fit } from '../lib/text.mjs';

// Últimas extracciones: los repos tocados más recientemente, con una barra de "energía"
// que mide cuán fresca está la actividad. Un resalte baja fila por fila, despacio.
//   rows = [{ repo, language, pushed (texto), days (número) }]
export function actividad({ rows }) {
  const W = 880;
  const TOP = 38;
  const ROW = 34;
  const H = TOP + rows.length * ROW + 14;
  const n = rows.length;

  const heads = [
    ['CUÁNDO', 28],
    ['SOMBRA', 190],
    ['LENGUAJE', 500],
    ['ENERGÍA', 690],
  ].map(([t, x]) => `<path d="${textD(FONT.mono, t, { x, y: 25, size: 9.5, tracking: 3 }).d}" fill="${C.faint}"/>`);

  const body_rows = rows.map((r, i) => {
    const y = TOP + i * ROW;
    const when = textD(FONT.mono, r.pushed, { x: 28, y: y + 22, size: 12.5 });
    const repo = textD(FONT.monoMid, fit(FONT.monoMid, r.repo, 13.5, 290), { x: 190, y: y + 22, size: 13.5 });
    const lang = textD(FONT.mono, r.language || '—', { x: 516, y: y + 22, size: 12.5 });
    const energy = Math.max(0.05, 1 - Math.min(r.days, 60) / 60);
    const w = Math.round(162 * energy);
    return `<g style="animation:rise 420ms ${OUT} ${100 + i * 55}ms both">
<path d="${when.d}" fill="${C.dim}"/>
<path d="${repo.d}" fill="${C.ink}"/>
<circle cx="505" cy="${y + 17.5}" r="3.5" fill="${C.v400}"/>
<path d="${lang.d}" fill="${C.dim}"/>
<rect x="690" y="${y + 15}" width="162" height="5" rx="2.5" fill="${C.line}"/>
<rect class="l" x="690" y="${y + 15}" width="${w}" height="5" rx="2.5" fill="${energy > 0.6 ? C.v300 : C.v500}" style="animation:grow 700ms ${OUT} ${260 + i * 55}ms both"/>
</g>`;
  });

  const css = `.sc{animation:sc ${(n * 1.3).toFixed(1)}s steps(${n}) 1.4s infinite}
@keyframes sc{from{transform:translateY(0)}to{transform:translateY(${n * ROW}px)}}`;

  const body = `
${panel(W, H, { r: 12 })}
${heads.join('')}
<rect x="1" y="${TOP - 4}" width="${W - 2}" height="1" fill="${C.line}"/>
<rect class="sc" x="1" y="${TOP}" width="${W - 2}" height="${ROW}" fill="${C.v500}" opacity=".1"/>
${body_rows.join('\n')}`;

  return svgDoc({
    w: W,
    h: H,
    title: 'Últimas extracciones',
    desc: rows.map((r) => `${r.repo}, ${r.pushed}`).join('; '),
    css,
    body,
  });
}
