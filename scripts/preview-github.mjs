// Vista previa fiel: manda el README a la API pública de Markdown de GitHub (el mismo
// renderizador y sanitizador del sitio) y lo envuelve con el CSS oficial claro y oscuro.
//   node scripts/preview-github.mjs   -> preview/github-dark.html y preview/github-light.html
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const md = readFileSync(new URL('README.md', root), 'utf8');
const login = JSON.parse(readFileSync(new URL('data/profile.json', root), 'utf8')).login;

const res = await fetch('https://api.github.com/markdown', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'User-Agent': 'perfil-del-monarca', Accept: 'application/vnd.github+json' },
  body: JSON.stringify({ text: md, mode: 'gfm', context: `${login}/${login}` }),
});
if (!res.ok) throw new Error(`Markdown API ${res.status}: ${await res.text()}`);
let html = await res.text();

// Las imágenes relativas apuntan al repo en GitHub; en local las leemos de ../assets
html = html.replace(/src="(?:[^"]*\/)?assets\/([^"?]+\.svg)[^"]*"/g, 'src="../assets/$1"');

mkdirSync(new URL('preview/', root), { recursive: true });
for (const mode of ['dark', 'light']) {
  const css = readFileSync(new URL(`node_modules/github-markdown-css/github-markdown-${mode}.css`, root), 'utf8');
  const bg = mode === 'dark' ? '#0d1117' : '#ffffff';
  const page = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Vista previa GitHub (${mode})</title>
<style>${css}
body{margin:0;background:${bg}}
.wrap{max-width:980px;margin:0 auto;padding:32px 24px}
.markdown-body{box-sizing:border-box;padding:24px 32px;border:1px solid ${mode === 'dark' ? '#30363d' : '#d0d7de'};border-radius:6px}
</style>
<div class="wrap"><article class="markdown-body">${html}</article></div>`;
  writeFileSync(new URL(`preview/github-${mode}.html`, root), page);
}
console.log('listo:', fileURLToPath(new URL('preview/github-dark.html', root)));
