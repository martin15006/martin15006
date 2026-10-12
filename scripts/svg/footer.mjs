import { C, OUT, IN_OUT, svgDoc } from '../lib/kit.mjs';
import { FONT, textD } from '../lib/text.mjs';

// Cierre: la frase, una línea con una chispa y la marca de sincronización.
export function footer({ tagline, date, portals = [] }) {
  const W = 880;
  const H = 150;

  const line = textD(FONT.display, tagline.toUpperCase(), { x: W / 2, y: 70, size: 30, tracking: 7, anchor: 'middle' });
  const status = `[ FIN DE LA TRANSMISIÓN ]  ·  SINCRONIZADO ${date}  ·  EL SISTEMA SIGUE ESCUCHANDO`;
  const st = textD(FONT.mono, status, { x: W / 2, y: 112, size: 10.5, tracking: 2, anchor: 'middle' });
  const cursorX = Math.round(st.x + st.width + 8);

  const body = `
<rect x="0" y="22" width="${W}" height="1" fill="${C.line}"/>
<rect x="${W / 2 - 150}" y="22" width="300" height="1" fill="${C.v600}" opacity=".7"/>
<polygon points="${W / 2},17 ${W / 2 + 6},22.5 ${W / 2},28 ${W / 2 - 6},22.5" fill="${C.v500}"/>
<circle cx="0" cy="22.5" r="2.4" fill="${C.v300}" style="--run:${W}px;animation:drift 9s ${IN_OUT} infinite"/>
<path d="${line.d}" fill="${C.v100}" style="animation:rise 600ms ${OUT} both"/>
<path d="${st.d}" fill="${C.faint}" style="animation:fade 900ms ease 400ms both"/>
<rect x="${cursorX}" y="103" width="7" height="11" fill="${C.v400}" style="animation:blink 1.1s steps(1) infinite"/>
<rect x="0" y="${H - 1}" width="${W}" height="1" fill="${C.line}"/>`;

  return svgDoc({
    w: W,
    h: H,
    title: tagline,
    desc: `${tagline} Fin de la transmisión. Sincronizado el ${date}.`,
    body,
  });
}
