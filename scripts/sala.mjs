// La Sala del Monarca: la versión viva de la portada. Una sola página autocontenida
// (CSS, JS y fuentes incrustados; cero pedidos externos) pensada para GitHub Pages desde /docs.
// Aquí sí hay JavaScript, así que el ojo puede seguir el mouse, cosa que un SVG dentro de
// un README no puede hacer.
import { readFileSync } from 'node:fs';
import { RANKS, esc } from './lib/kit.mjs';
import { sigilParts } from './lib/sigil.mjs';

const here = (rel) => new URL(rel, import.meta.url);
const b64 = (file) => readFileSync(here(`../fonts/${file}`)).toString('base64');

function fontFaces() {
  const face = (family, weight, file) =>
    `@font-face{font-family:'${family}';font-weight:${weight};font-style:normal;font-display:swap;src:url(data:font/woff;base64,${b64(file)}) format('woff')}`;
  return [
    face('Oxanium', 700, 'oxanium-latin-700-normal.woff'),
    face('Oxanium', 600, 'oxanium-latin-600-normal.woff'),
    face('JetBrains Mono', 400, 'jetbrains-mono-latin-400-normal.woff'),
    face('JetBrains Mono', 500, 'jetbrains-mono-latin-500-normal.woff'),
  ].join('\n');
}

function sigilSvg() {
  const { ticks, poly, eye, diamonds, corners } = sigilParts(0, 0);
  return `<svg id="sigil" viewBox="-130 -130 260 260" role="img" aria-label="Sigilo del Monarca: un ojo que sigue el cursor y se cierra si lo tocás">
  <defs>
    <radialGradient id="iris" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ddd6fe"/><stop offset=".4" stop-color="#a78bfa"/><stop offset=".8" stop-color="#7c3aed"/><stop offset="1" stop-color="#5b21b6"/></radialGradient>
    <radialGradient id="eg" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#8b5cf6" stop-opacity=".55"/><stop offset="1" stop-color="#8b5cf6" stop-opacity="0"/></radialGradient>
    <clipPath id="eyeclip"><path d="${eye.almond}"/></clipPath>
  </defs>
  <ellipse class="eglow" cx="0" cy="0" rx="92" ry="64" fill="url(#eg)"/>
  <g opacity=".92">
    <g class="o a"><path d="${ticks}" stroke="#a78bfa" stroke-opacity=".5" stroke-width="1.2" fill="none"/></g>
    <g class="o b"><circle r="96" fill="none" stroke="#7c3aed" stroke-opacity=".6" stroke-dasharray="2 9"/></g>
    <g class="o c"><circle r="84" fill="none" stroke="#8b5cf6" stroke-opacity=".65" stroke-dasharray="46 14 6 14"/></g>
    <g class="o b"><polygon points="${poly(6, 74, 0)}" fill="none" stroke="#a78bfa" stroke-opacity=".4"/></g>
    <circle r="64" fill="none" stroke="#a78bfa" stroke-opacity=".4"/>
    <path d="${diamonds}" fill="#c4b5fd" opacity=".85"/>
  </g>
  <circle class="flash" r="60"/>
  <path d="${eye.brow}" fill="none" stroke="#a78bfa" stroke-opacity=".5" stroke-linecap="round"/>
  <g id="lid">
    <path d="${eye.almond}" fill="#0a0414" stroke="#c4b5fd" stroke-width="1.6" stroke-linejoin="round"/>
    <g clip-path="url(#eyeclip)">
      <g id="gaze">
        <circle r="19.5" fill="url(#iris)"/>
        <path d="${eye.fibers}" stroke="#f1ecff" stroke-opacity=".35" stroke-width=".8" fill="none"/>
        <circle r="19.5" fill="none" stroke="#f1ecff" stroke-opacity=".75" stroke-width="1"/>
        <ellipse id="pupil" rx="4.4" ry="12.5" fill="#05020a"/>
        <circle cx="7" cy="-7" r="2.2" fill="#fff" opacity=".9"/>
      </g>
    </g>
  </g>
  <path d="${corners}" fill="#c4b5fd"/>
</svg>`;
}

const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='12' fill='%2307040d'/%3E%3Cpath d='M6 32C18 14 46 14 58 32C46 50 18 50 6 32Z' fill='%230a0414' stroke='%23c4b5fd' stroke-width='3'/%3E%3Ccircle cx='32' cy='32' r='10' fill='%238b5cf6'/%3E%3Cellipse cx='32' cy='32' rx='2.6' ry='7' fill='%2305020a'/%3E%3C/svg%3E";

function gateHtml(g) {
  const sealed = g.sealed;
  const R = RANKS[sealed ? '?' : g.rank] ?? RANKS.E;
  const stateLabel = { abierta: 'Abierta', despejada: 'Despejada', sellada: 'Sellada' }[sealed ? 'sellada' : g.state];
  const cls = `gate st-${sealed ? 'sellada' : g.state}`;
  const style = `--rk-fill:${R.fill};--rk-edge:${R.edge};--rk-ink:${R.ink}`;
  const chips = (g.shadows ?? []).map((s) => `<i>${esc(s)}</i>`).join('');
  const meta = sealed
    ? `<span>Acceso restringido</span>`
    : `<span>${g.lang ? `${esc(g.lang)} · ` : ''}última extracción <b>${esc(g.pushed)}</b>${g.stars ? ` · ★ ${g.stars}` : ''}</span><span class="go">Entrar →</span>`;
  const inner = `<span class="glare" aria-hidden="true"></span>
    <span class="rank" aria-hidden="true"><b>${sealed ? '?' : esc(g.rank)}</b></span>
    <span class="body">
      <span class="head"><strong class="name">${esc(g.name)}</strong><span class="pill">${stateLabel}</span></span>
      <span class="blurb">${esc(g.blurb)}</span>
      ${chips ? `<span class="chips" aria-label="Sombras extraídas">${chips}</span>` : ''}
    </span>
    <span class="meta">${meta}</span>`;
  const card = sealed
    ? `<div class="${cls}" style="${style}">${inner}</div>`
    : `<a class="${cls}" style="${style}" href="${esc(g.url)}" target="_blank" rel="noopener noreferrer">${inner}</a>`;
  // El slot no gira: recibe el mouse, así el borde de la tarjeta inclinada no lo "suelta".
  return `<div class="slot reveal">${card}</div>`;
}

function noteHtml(n) {
  return `<article class="note"><h3>${esc(n.title)}${n.rank ? `<em>${esc(n.rank)}</em>` : ''}</h3><p>${esc(n.text)}</p></article>`;
}

export function buildSala({ profile, gates, notes, stats, date, profileUrl }) {
  const css = readFileSync(here('./sala/sala.css'), 'utf8');
  const js = readFileSync(here('./sala/sala.js'), 'utf8');
  const arise = [...'ARISE'].map((c, i) => `<span style="--i:${i}">${c}</span>`).join('');
  const name = esc(profile.displayName);
  const alias = esc(profile.alias);

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Sala del Monarca · ${esc(profile.login)}</title>
<meta name="description" content="${name}, ${alias}. Registro de puertas, sombras extraídas y un ojo que te mira.">
<meta name="theme-color" content="#07040d">
<link rel="icon" href="${FAVICON}">
<style>
${fontFaces()}
${css}
</style>
</head>
<body>
<canvas id="fx" aria-hidden="true"></canvas>

<header class="top">
  <a href="${esc(profileUrl)}">← ${esc(profile.login)}</a>
  <span class="sys">[ Sistema // Sala del Monarca ]</span>
</header>

<main>
  <section class="hero" aria-label="Portada">
    <div>
      <p class="tag">Sistema // Monarca</p>
      <h1 class="arise" aria-label="ARISE">${arise}</h1>
      <p class="sub">${name} · ${alias}</p>
      <div class="bar"></div>
      <p class="hud">
        <span>[ Puertas abiertas ${stats.open} ]</span>
        <span>[ Sombras ${stats.shadows} ]</span>
        <span>[ Nivel ${stats.level} · Rango ${stats.rank} ]</span>
        <span>[ Sincronizado ${esc(date)} ]</span>
      </p>
      <p class="hint"><i></i><span>Acercá el mouse al ojo. Si lo cruzás, se cierra.</span></p>
    </div>
    <div class="hero-eye">${sigilSvg()}</div>
  </section>

  <section class="sec" id="puertas">
    <h2>Registro de puertas</h2>
    <p class="lead">Cada puerta es un proyecto; de cada una salió una sombra. Pasá el mouse por encima y mirá cómo reaccionan.</p>
    <div class="gates">
      ${gates.map(gateHtml).join('\n      ')}
    </div>
  </section>

  <section class="sec vision" id="vision">
    <h2>Visión del Monarca</h2>
    <p class="lead">Hay cosas que no se ven a simple vista. Movete por el recuadro: el Monarca ve lo que otros no.</p>
    <div class="stack">
      <div class="notes dim" aria-hidden="true">${notes.map(noteHtml).join('')}</div>
      <div class="notes lit">${notes.map(noteHtml).join('')}</div>
      <div class="lens" aria-hidden="true"></div>
    </div>
  </section>
</main>

<footer>
  <div class="line"></div>
  <p class="tagline">${esc(profile.tagline)}</p>
  <p class="status">[ Fin de la transmisión ] · Sincronizado ${esc(date)}</p>
  <a class="back" href="${esc(profileUrl)}">Volver al perfil</a>
</footer>

<script>
${js}
</script>
</body>
</html>
`;
}
