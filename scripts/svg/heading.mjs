import { C, svgDoc } from '../lib/kit.mjs';
import { FONT, textD } from '../lib/text.mjs';

// Encabezado de sección: rombo, título en mayúsculas, línea con una chispa que la recorre.
export function heading({ title, note = '', index = 0 }) {
  const W = 880;
  const H = 52;
  const t = textD(FONT.display, title.toUpperCase(), { x: 34, y: 32, size: 21, tracking: 5 });
  const n = note ? textD(FONT.mono, note.toUpperCase(), { x: W - 6, y: 30, size: 11, tracking: 2, anchor: 'end' }) : null;

  const x1 = Math.ceil(t.x + t.width) + 18;
  const x2 = n ? Math.floor(n.x) - 18 : W - 6;
  const len = Math.max(0, x2 - x1);

  const body = `
<polygon points="14,26 21,19 28,26 21,33" fill="${C.v500}"/>
<path d="${t.d}" fill="${C.v100}"/>
<rect x="${x1}" y="25.5" width="${len}" height="1" fill="${C.line}"/>
<rect x="${x1}" y="25.5" width="${Math.min(60, len)}" height="1" fill="${C.v500}" opacity=".9"/>
<circle cx="${x1}" cy="26" r="2.2" fill="${C.v300}" style="--run:${len}px;animation:drift 7s linear ${index * 0.9}s infinite"/>
${n ? `<path d="${n.d}" fill="${C.faint}"/>` : ''}`;

  return svgDoc({
    w: W,
    h: H,
    title,
    desc: note ? `${title} — ${note}` : title,
    body,
  });
}
