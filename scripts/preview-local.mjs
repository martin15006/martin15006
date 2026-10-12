// Vista previa local rápida: todos los SVG de assets/ apilados sobre fondo oscuro y claro de GitHub.
//   node scripts/preview-local.mjs   -> escribe preview/index.html
import { readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const files = readdirSync(new URL('assets/', root)).filter((f) => f.endsWith('.svg'));
const order = ['banner', 'notice', 'ficha', 'mision', 'h-', 'gate-', 'actividad', 'arsenal', 'equipo', 'footer'];
const rank = (f) => {
  const i = order.findIndex((p) => f.startsWith(p));
  return (i < 0 ? 99 : i) * 1000 + files.indexOf(f);
};
files.sort((a, b) => rank(a) - rank(b));

const col = (bg, fg, label) => `
<section style="background:${bg};color:${fg};padding:16px 20px;">
  <h2 style="font:600 12px system-ui;margin:0 0 12px;opacity:.6">${label}</h2>
  <div style="max-width:880px;margin:0 auto;display:flex;flex-direction:column;gap:0">
    ${files.map((f) => `<img src="../assets/${f}" alt="${f}" style="width:100%;display:block;margin-bottom:6px">`).join('\n')}
  </div>
</section>`;

const html = `<!doctype html><meta charset="utf-8"><title>Vista previa</title>
<body style="margin:0;font-family:system-ui">
${col('#0d1117', '#e6edf3', 'Fondo oscuro de GitHub')}
${col('#ffffff', '#1f2328', 'Fondo claro de GitHub')}
</body>`;

mkdirSync(new URL('preview/', root), { recursive: true });
writeFileSync(new URL('preview/index.html', root), html);
console.log('preview:', fileURLToPath(new URL('preview/index.html', root)));
