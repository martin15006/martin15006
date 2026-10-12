import { C, OUT, svgDoc, panel } from '../lib/kit.mjs';
import { FONT, textD, fit } from '../lib/text.mjs';

const TIER = {
  común: { edge: '#3a2a66', tag: C.faint, ink: C.dim, glow: 0 },
  raro: { edge: C.v700, tag: C.v400, ink: C.v300, glow: 0.12 },
  épico: { edge: C.v500, tag: C.v300, ink: C.v200, glow: 0.2 },
  legendario: { edge: C.v300, tag: C.v100, ink: C.v100, glow: 0.38 },
};

// Runa única por objeto: patrón simétrico de 5x5 derivado del nombre (como un identicon).
function rune(name, x, y, size, color) {
  let h = 2166136261;
  for (const ch of name) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  const cell = size / 5;
  let out = '';
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 3; c++) {
      const bit = (h >>> (r * 3 + c)) & 1;
      if (!bit) continue;
      out += `<rect x="${(x + c * cell).toFixed(1)}" y="${(y + r * cell).toFixed(1)}" width="${(cell - 1).toFixed(1)}" height="${(cell - 1).toFixed(1)}" rx="1"/>`;
      if (c < 2) out += `<rect x="${(x + (4 - c) * cell).toFixed(1)}" y="${(y + r * cell).toFixed(1)}" width="${(cell - 1).toFixed(1)}" height="${(cell - 1).toFixed(1)}" rx="1"/>`;
    }
  }
  return `<g fill="${color}">${out}</g>`;
}

// Equipo: herramientas con su rareza (la rareza es violeta más o menos intenso).
export function equipo({ items }) {
  const W = 880;
  const PAD = 20;
  const GAP = 12;
  const COLS = 4;
  const SW = Math.floor((W - PAD * 2 - GAP * (COLS - 1)) / COLS);
  const SH = 76;
  const rowsN = Math.ceil(items.length / COLS);
  const H = PAD * 2 + rowsN * SH + (rowsN - 1) * GAP;

  const slots = items.map((it, i) => {
    const T = TIER[it.tier] ?? TIER.común;
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x = PAD + col * (SW + GAP);
    const y = PAD + row * (SH + GAP);
    const name = textD(FONT.display, fit(FONT.display, it.name, 15, SW - 92), { x: x + 76, y: y + 33, size: 15, tracking: 0.5 });
    const role = textD(FONT.mono, fit(FONT.mono, it.role, 11, SW - 90), { x: x + 76, y: y + 54, size: 11 });
    const tag = textD(FONT.mono, it.tier.toUpperCase(), { x: x + SW - 12, y: y + 17, size: 8.5, tracking: 2, anchor: 'end' });
    const glow =
      T.glow > 0
        ? `<rect class="gl" x="${x}" y="${y}" width="${SW}" height="${SH}" rx="8" fill="${T.edge}" opacity="${T.glow}" style="animation-delay:${(i * 0.6).toFixed(1)}s"/>`
        : '';
    return `<g style="animation:rise 460ms ${OUT} ${120 + i * 60}ms both">
${glow}
<rect x="${x + 0.5}" y="${y + 0.5}" width="${SW - 1}" height="${SH - 1}" rx="8" fill="${C.panel2}" fill-opacity=".8" stroke="${T.edge}"/>
<rect x="${x + 12}" y="${y + 12}" width="52" height="52" rx="6" fill="${C.void}" stroke="${T.edge}" stroke-opacity=".7"/>
${rune(it.name, x + 22, y + 22, 32, T.ink)}
<path d="${name.d}" fill="${C.v100}"/>
<path d="${role.d}" fill="${C.dim}"/>
<path d="${tag.d}" fill="${T.tag}"/>
</g>`;
  });

  const css = `.gl{animation:glp 4.5s ease-in-out infinite alternate}
@keyframes glp{from{opacity:.08}to{opacity:.3}}`;

  const body = `
${panel(W, H, { r: 12 })}
${slots.join('\n')}`;

  return svgDoc({
    w: W,
    h: H,
    title: 'Equipo',
    desc: items.map((i) => `${i.name} (${i.role}, ${i.tier})`).join('; '),
    css,
    body,
  });
}
