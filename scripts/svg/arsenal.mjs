import { C, OUT, RANKS, svgDoc, panel } from '../lib/kit.mjs';
import { FONT, textD, fit } from '../lib/text.mjs';

const ORDER = 'EDCBAS';

// Arsenal de habilidades por dominio. Cada habilidad lleva un rango (E..S) mostrado
// como seis pips. Los rangos son autoevaluación: se editan en data/skills.json.
export function arsenal({ categories }) {
  const W = 880;
  const PAD = 20;
  const GAP = 12;
  const n = categories.length;
  const colW = Math.floor((W - PAD * 2 - GAP * (n - 1)) / n);
  const maxSkills = Math.max(...categories.map((c) => c.skills.length));
  const ROW = 44;
  const HEAD = 46;
  const H = PAD + HEAD + maxSkills * ROW + PAD - 8;

  let k = 0;
  const cols = categories.map((cat, ci) => {
    const x = PAD + ci * (colW + GAP);
    const title = textD(FONT.display, cat.name.toUpperCase(), { x: x + 14, y: PAD + 28, size: 12.5, tracking: 3 });
    const rows = cat.skills.map((s, si) => {
      const y = PAD + HEAD + si * ROW;
      const idx = ORDER.indexOf(s.rank) + 1;
      const R = RANKS[s.rank] ?? RANKS.E;
      const name = textD(FONT.mono, fit(FONT.mono, s.name, 12.5, colW - 24), { x: x + 14, y: y + 14, size: 12.5 });
      const letter = textD(FONT.display, s.rank, { x: x + colW - 14, y: y + 31, size: 15, anchor: 'end' });
      const pips = Array.from({ length: 6 }, (_, p) => {
        const on = p < idx;
        const delay = 250 + (k++ % 40) * 30 + p * 40;
        return `<rect x="${x + 14 + p * 14}" y="${y + 22}" width="10" height="5" rx="1.5" fill="${on ? R.edge : C.line}"${on ? ` class="b" style="animation:rise 380ms ${OUT} ${delay}ms both"` : ''}/>`;
      }).join('');
      return `<path d="${name.d}" fill="${C.ink}"/>${pips}<path d="${letter.d}" fill="${R.edge}"/>`;
    });
    return `<g>
<rect x="${x + 0.5}" y="${PAD + 0.5}" width="${colW}" height="${H - PAD * 2 + 8}" rx="8" fill="${C.panel2}" fill-opacity=".55" stroke="${C.line}"/>
<path d="${title.d}" fill="${C.v300}"/>
<rect x="${x + 14}" y="${PAD + 38}" width="22" height="2" fill="${C.v500}"/>
${rows.join('\n')}
</g>`;
  });

  const body = `
${panel(W, H, { r: 12 })}
${cols.join('\n')}`;

  return svgDoc({
    w: W,
    h: H,
    title: 'Arsenal de habilidades',
    desc: categories
      .map((c) => `${c.name}: ${c.skills.map((s) => `${s.name} rango ${s.rank}`).join(', ')}`)
      .join('. '),
    body,
  });
}
