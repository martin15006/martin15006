import { C, OUT, svgDoc, panel } from '../lib/kit.mjs';
import { FONT, textD, fit } from '../lib/text.mjs';

// Misiones. La diaria y la semanal salen de la actividad real de tus repos (push recientes);
// la principal es una declaración de intención.
//   quest = { kind, title, done, progress: [n, total] | null }
export function mision({ quests }) {
  const W = 880;
  const ROW = 44;
  const TOP = 56;
  const H = TOP + quests.length * ROW + 14;

  const head = textD(FONT.display, 'MISIONES', { x: 28, y: 36, size: 13, tracking: 4 });
  const sub = textD(FONT.mono, 'EL SISTEMA REGISTRA TU PROGRESO', { x: 852, y: 35, size: 10, tracking: 2, anchor: 'end' });

  const rows = quests.map((q, i) => {
    const y = TOP + i * ROW;
    const kind = textD(FONT.mono, q.kind, { x: 66, y: y + 14, size: 9.5, tracking: 3 });
    const title = textD(FONT.monoMid, fit(FONT.monoMid, q.title, 14, 470), { x: 66, y: y + 33, size: 14 });
    const box = q.done
      ? `<rect x="28.5" y="${y + 11.5}" width="22" height="22" rx="4" fill="${C.v600}" stroke="${C.v300}"/><path d="M34 ${y + 22.5}l4.5 4.5 8-9.5" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`
      : `<rect x="28.5" y="${y + 11.5}" width="22" height="22" rx="4" fill="none" stroke="${C.v500}" stroke-opacity=".8"/>`;

    let right = '';
    if (q.progress) {
      const [n, total] = q.progress;
      const w = Math.round((150 * Math.min(n, total)) / total);
      const num = textD(FONT.monoMid, `${n}/${total}`, { x: 852, y: y + 28, size: 13, anchor: 'end' });
      right = `<rect x="600" y="${y + 20}" width="150" height="6" rx="3" fill="${C.line}"/>
<rect class="l" x="600" y="${y + 20}" width="${Math.max(w, 0)}" height="6" rx="3" fill="${q.done ? C.v300 : C.v500}" style="animation:grow 700ms ${OUT} ${300 + i * 90}ms both"/>
<path d="${num.d}" fill="${q.done ? C.v200 : C.dim}"/>`;
    } else {
      const state = textD(FONT.mono, 'EN CURSO', { x: 852, y: y + 28, size: 11, tracking: 3, anchor: 'end' });
      right = `<rect x="600" y="${y + 20}" width="150" height="6" rx="3" fill="${C.line}"/>
<rect x="600" y="${y + 20}" width="150" height="6" rx="3" fill="${C.v700}" opacity=".5"/>
<rect class="run" x="600" y="${y + 20}" width="50" height="6" rx="3" fill="${C.v300}" style="--run:100px"/>
<path d="${state.d}" fill="${C.v300}"/>`;
    }
    const sep = i < quests.length - 1 ? `<rect x="28" y="${y + ROW - 0.5}" width="824" height="1" fill="${C.line}"/>` : '';
    return `<g style="animation:rise 480ms ${OUT} ${160 + i * 70}ms both">${box}<path d="${kind.d}" fill="${C.faint}"/><path d="${title.d}" fill="${q.done ? C.v100 : C.ink}"/>${right}${sep}</g>`;
  });

  const css = `.run{animation:drift 2.8s ease-in-out infinite alternate}`;

  const body = `
${panel(W, H, { r: 12 })}
<path d="${head.d}" fill="${C.v300}"/>
<path d="${sub.d}" fill="${C.faint}"/>
<rect x="28" y="${TOP - 8}" width="824" height="1" fill="${C.line}"/>
${rows.join('\n')}`;

  return svgDoc({
    w: W,
    h: H,
    title: 'Misiones',
    desc: quests
      .map((q) => `${q.kind}: ${q.title}${q.progress ? ` (${q.progress[0]}/${q.progress[1]})` : ''}${q.done ? ', completada' : ''}`)
      .join('. '),
    css,
    body,
  });
}
