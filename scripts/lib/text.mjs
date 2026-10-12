// Texto -> trazados SVG. Todo el texto de los SVG sale como path para que se vea
// idéntico en cualquier pantalla (GitHub no deja cargar fuentes web dentro de un <img>).
import opentype from 'opentype.js';
import { readFileSync } from 'node:fs';

function load(file) {
  const buf = readFileSync(new URL(`../../fonts/${file}`, import.meta.url));
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

export const FONT = {
  display: load('oxanium-latin-700-normal.woff'),
  displayMid: load('oxanium-latin-600-normal.woff'),
  mono: load('jetbrains-mono-latin-400-normal.woff'),
  monoMid: load('jetbrains-mono-latin-500-normal.woff'),
};

function layout(font, text, size, tracking = 0) {
  const scale = size / font.unitsPerEm;
  const glyphs = font.stringToGlyphs(text);
  const items = [];
  let x = 0;
  glyphs.forEach((glyph, i) => {
    if (i > 0) x += font.getKerningValue(glyphs[i - 1], glyph) * scale;
    items.push({ glyph, x });
    x += glyph.advanceWidth * scale + tracking;
  });
  const width = glyphs.length ? Math.max(0, x - tracking) : 0;
  return { items, width };
}

export function measure(font, text, size, tracking = 0) {
  return layout(font, text, size, tracking).width;
}

function originX(x, width, anchor) {
  if (anchor === 'middle') return x - width / 2;
  if (anchor === 'end') return x - width;
  return x;
}

// --- Diccionario de letras por documento -------------------------------------------------
// El texto chico (< 40 px) no se escribe como un path enorme: cada letra se define una vez
// en <defs> y se coloca con <use>. textD devuelve un marcador en `d`, y flushText() (lo llama
// svgDoc) lo cambia por <g> con los <use>. Los atributos del <path> original pasan al <g>.
const fontIds = new Map();
let registry = new Map(); // clave -> { id, d }
let tokens = []; // índice -> string de <use>

/** Comandos de opentype.js -> `d` compacto (sin repetir la letra del comando). */
function compactPath(commands) {
  const n = (v) => String(+v.toFixed(1));
  let prev = '';
  let out = '';
  for (const c of commands) {
    let args = '';
    if (c.type === 'M' || c.type === 'L') args = `${n(c.x)} ${n(c.y)}`;
    else if (c.type === 'Q') args = `${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`;
    else if (c.type === 'C') args = `${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`;
    if (c.type === 'Z') {
      out += 'Z';
      prev = 'Z';
      continue;
    }
    // "M x y x y" equivale a M + L: no se puede repetir la M como si fuera una línea.
    out += c.type === prev && c.type !== 'M' ? ` ${args}` : `${c.type}${args}`;
    prev = c.type;
  }
  return out;
}

function fontId(font) {
  if (!fontIds.has(font)) fontIds.set(font, fontIds.size);
  return fontIds.get(font);
}

/** Una sola cadena `d` para todo el texto (o un marcador si es texto chico). */
export function textD(font, text, { x = 0, y = 0, size = 16, tracking = 0, anchor = 'start' } = {}) {
  const { items, width } = layout(font, text, size, tracking);
  const ox = originX(x, width, anchor);

  if (size >= 40) {
    const d = items
      .map(({ glyph, x: gx }) => glyph.getPath(ox + gx, y, size).toPathData(2))
      .filter(Boolean)
      .join('');
    return { d, width, x: ox };
  }

  // Cada letra se define una sola vez, en unidades de la fuente (enteros, sin pérdida),
  // y se escala al colocarla. El eje Y de la fuente va hacia arriba: de ahí el scale(s -s).
  // Toda la línea comparte un solo transform; cada letra solo lleva su desplazamiento en unidades.
  const s = size / font.unitsPerEm;
  const uses = items
    .map(({ glyph, x: gx }) => {
      const cmds = glyph.path.commands;
      if (!cmds.length) return '';
      const key = `${fontId(font)}|${glyph.index}`;
      let entry = registry.get(key);
      if (!entry) {
        entry = { id: `g${registry.size}`, d: compactPath(cmds) };
        registry.set(key, entry);
      }
      return `<use href="#${entry.id}" x="${Math.round(gx / s)}"/>`;
    })
    .join('');
  const run = `<g transform="translate(${ox.toFixed(1)} ${y}) scale(${+s.toFixed(5)} -${+s.toFixed(5)})">${uses}</g>`;
  tokens.push(run);
  return { d: `@@T${tokens.length - 1}@@`, width, x: ox };
}

/** Reemplaza los marcadores del cuerpo y devuelve las definiciones de letras usadas. */
export function flushText(body) {
  const out = body.replace(/<path([^>]*?) d="@@T(\d+)@@"([^>]*?)\/>/g, (_, pre, idx, post) => {
    const attrs = `${pre}${post}`.trim();
    return `<g${attrs ? ` ${attrs}` : ''}>${tokens[Number(idx)]}</g>`;
  });
  const used = new Set([...out.matchAll(/href="#(g\d+)"/g)].map((m) => m[1]));
  const defs = [...registry.values()]
    .filter((e) => used.has(e.id))
    .map((e) => `<path id="${e.id}" d="${e.d}"/>`)
    .join('');
  registry = new Map();
  tokens = [];
  return { body: out, defs };
}

/** Un `d` por letra (para animar letra por letra). */
export function glyphsD(font, text, { x = 0, y = 0, size = 16, tracking = 0, anchor = 'start' } = {}) {
  const { items, width } = layout(font, text, size, tracking);
  const ox = originX(x, width, anchor);
  const letters = items.map(({ glyph, x: gx }, i) => ({
    ch: text[i],
    d: glyph.getPath(ox + gx, y, size).toPathData(size >= 40 ? 2 : 1),
    x: ox + gx,
  }));
  return { letters, width, x: ox };
}

/** Recorta con "…" para que quepa en maxW. */
export function fit(font, text, size, maxW, tracking = 0) {
  if (measure(font, text, size, tracking) <= maxW) return text;
  let s = text;
  while (s.length > 1 && measure(font, `${s}…`, size, tracking) > maxW) s = s.slice(0, -1);
  return `${s.trimEnd()}…`;
}

/** Parte en líneas que caben en maxW; la última se recorta con "…" si sobra texto. */
export function wrap(font, text, size, maxW, maxLines = 2, tracking = 0) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w;
    if (measure(font, t, size, tracking) <= maxW || !cur) cur = t;
    else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = fit(font, `${kept[maxLines - 1]} ${lines.slice(maxLines).join(' ')}`, size, maxW, tracking);
    return kept;
  }
  return lines;
}
