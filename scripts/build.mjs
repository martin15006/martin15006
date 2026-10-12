// Regenera assets/*.svg y README.md a partir de data/*.json + la API pública de GitHub.
//   node scripts/build.mjs            -> con internet (y caché de respaldo)
//   node scripts/build.mjs --offline  -> solo con la caché
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { loadGithub } from './lib/github.mjs';
import { haceCuanto, esc } from './lib/kit.mjs';
import { banner } from './svg/banner.mjs';
import { notice } from './svg/notice.mjs';
import { heading } from './svg/heading.mjs';
import { ficha } from './svg/ficha.mjs';
import { mision } from './svg/mision.mjs';
import { gate } from './svg/gate.mjs';
import { actividad } from './svg/actividad.mjs';
import { arsenal } from './svg/arsenal.mjs';
import { equipo } from './svg/equipo.mjs';
import { footer } from './svg/footer.mjs';
import { buildSala } from './sala.mjs';

const root = new URL('../', import.meta.url);
const read = (rel) => JSON.parse(readFileSync(new URL(rel, root), 'utf8'));
const write = (rel, text) => writeFileSync(new URL(rel, root), text);

const offline = process.argv.includes('--offline');
const now = process.env.NOW ? new Date(process.env.NOW) : new Date();
const date = now.toISOString().slice(0, 10);
const daysAgo = (iso) => (now - new Date(iso)) / 86400000;

const profile = read('data/profile.json');
const gatesCfg = read('data/gates.json');
const skills = read('data/skills.json');
const gh = await loadGithub(profile.login, { offline });

const assets = new URL('assets/', root);
mkdirSync(assets, { recursive: true });
for (const f of readdirSync(assets)) if (f.endsWith('.svg')) rmSync(new URL(f, assets));

// ---------- datos ----------
const own = gh.repos.filter((r) => !r.fork);
const visible = own.filter((r) => !profile.hide.includes(r.name));
const byName = new Map(own.map((r) => [r.name, r]));
const url = (name) => `https://github.com/${profile.login}/${name}`;

const featured = gatesCfg.featured
  .map((g) => ({ ...g, repoData: byName.get(g.repo) }))
  .filter((g) => {
    if (!g.repoData) console.warn(`! "${g.repo}" ya no existe como repo público: lo salto.`);
    return Boolean(g.repoData);
  });
const openCount = featured.filter((g) => g.state === 'abierta').length;
const featuredNames = new Set(featured.map((g) => g.repo));

// ---------- nivel, rango, experiencia ----------
// XP = repos visibles*60 + estrellas*150 + repos tocados en 30 días*50 + seguidores*40 + puertas abiertas*100
// Nivel = 1 + floor(sqrt(XP/6)).  Rango: E<5, D<10, C<15, B<25, A<40, S.
const stars = visible.reduce((a, r) => a + r.stars, 0);
const recent30 = visible.filter((r) => daysAgo(r.pushedAt) <= 30).length;
const xp = visible.length * 60 + stars * 150 + recent30 * 50 + gh.user.followers * 40 + openCount * 100;
const levelCalc = 1 + Math.floor(Math.sqrt(xp / 6));
const level = profile.levelOverride ?? levelCalc;
const rankFor = (l) => (l < 5 ? 'E' : l < 10 ? 'D' : l < 15 ? 'C' : l < 25 ? 'B' : l < 40 ? 'A' : 'S');
const rank = profile.rankOverride ?? rankFor(level);
const xpFloor = 6 * (level - 1) ** 2;
const xpCeil = 6 * level ** 2;

// ---------- misiones ----------
const n24 = own.filter((r) => daysAgo(r.pushedAt) <= 1).length;
const n7 = own.filter((r) => daysAgo(r.pushedAt) <= 7).length;
const quests = [
  { kind: 'DIARIA', title: 'Mover una sombra: un push hoy', done: n24 >= 1, progress: [Math.min(n24, 1), 1] },
  { kind: 'SEMANAL', title: 'Despejar 3 puertas esta semana', done: n7 >= 3, progress: [Math.min(n7, 3), 3] },
  { kind: 'PRINCIPAL', title: profile.mainQuest ?? 'Construir sistemas que funcionen de verdad', done: false, progress: null },
];

// ---------- actividad ----------
const recent = [...visible].sort((a, b) => b.pushedAt.localeCompare(a.pushedAt)).slice(0, 7);
const langOverride = new Map(gatesCfg.featured.filter((g) => g.lang).map((g) => [g.repo, g.lang]));
const rows = recent.map((r) => ({
  repo: r.name,
  language: langOverride.get(r.name) ?? r.language,
  pushed: haceCuanto(r.pushedAt, now),
  days: daysAgo(r.pushedAt),
}));

// ---------- SVG ----------
const out = (name, svg) => write(`assets/${name}.svg`, svg);
const displayName = profile.displayName;

out('banner', banner({ name: displayName, alias: profile.alias, date, open: openCount, shadows: gh.user.publicRepos }));
out(
  'notice',
  notice({
    messages: [
      'Jugador detectado. Cargando el registro de puertas…',
      `${openCount} puertas abiertas. ${gh.user.publicRepos} sombras en el ejército.`,
    ],
  }),
);
out(
  'ficha',
  ficha({
    name: displayName,
    handle: profile.login,
    titles: profile.titles,
    level,
    rank,
    xp,
    xpFloor,
    xpCeil,
    attributes: profile.attributes,
  }),
);
out('mision', mision({ quests }));

const gatesTotal = featured.length + (gatesCfg.sealed?.count ? 1 : 0);
out('h-puertas', heading({ title: 'Registro de puertas', note: `${gatesTotal} registradas`, index: 0 }));
out('h-extracciones', heading({ title: 'Últimas extracciones', note: 'lo más reciente', index: 1 }));
out('h-arsenal', heading({ title: 'Arsenal', note: 'habilidades por rango', index: 2 }));
out('h-equipo', heading({ title: 'Equipo', note: `${skills.gear.length} objetos`, index: 3 }));

featured.forEach((g, i) => {
  out(
    `gate-${g.repo}`,
    gate({
      repo: g.repo,
      rank: g.rank,
      state: g.state,
      blurb: g.blurb,
      shadows: g.shadows,
      language: g.lang ?? g.repoData.language,
      pushed: haceCuanto(g.repoData.pushedAt, now),
      stars: g.repoData.stars,
      index: i,
    }),
  );
});
if (gatesCfg.sealed?.count) {
  const c = gatesCfg.sealed.count;
  out(
    'gate-sellada',
    gate({
      repo: c > 1 ? `Puertas selladas ×${c}` : 'Puerta sellada',
      rank: '?',
      state: 'sellada',
      sealed: true,
      blurb: gatesCfg.sealed.blurb,
      index: featured.length,
    }),
  );
}

out('actividad', actividad({ rows }));
out('arsenal', arsenal({ categories: skills.categories }));
out('equipo', equipo({ items: skills.gear }));
out('footer', footer({ tagline: profile.tagline, date }));

// ---------- Sala del Monarca (docs/index.html, para GitHub Pages) ----------
const profileUrl = `https://github.com/${profile.login}`;
const salaGates = featured.map((g) => ({
  name: g.repo,
  rank: g.rank,
  state: g.state,
  blurb: g.blurb,
  shadows: g.shadows,
  lang: g.lang ?? g.repoData.language,
  pushed: haceCuanto(g.repoData.pushedAt, now),
  stars: g.repoData.stars,
  url: url(g.repo),
}));
if (gatesCfg.sealed?.count) {
  const c = gatesCfg.sealed.count;
  salaGates.push({
    sealed: true,
    name: c > 1 ? `Puertas selladas ×${c}` : 'Puerta sellada',
    blurb: gatesCfg.sealed.blurb,
    shadows: [],
  });
}
const salaNotes = [
  ...featured.filter((g) => g.secret).map((g) => ({ title: g.repo, rank: g.rank, text: g.secret })),
  ...(profile.extraNotes ?? []),
];
mkdirSync(new URL('docs/', root), { recursive: true });
write(
  'docs/index.html',
  buildSala({
    profile,
    gates: salaGates,
    notes: salaNotes,
    stats: { open: openCount, shadows: gh.user.publicRepos, level, rank },
    date,
    profileUrl,
  }),
);
write('docs/.nojekyll', '');

// ---------- README ----------
const img = (name, alt) => `<img src="assets/${name}.svg" alt="${esc(alt)}" width="100%">`;
const link = (href, inner) => `<a href="${href}">${inner}</a>`;

const gateCards = featured
  .map((g) => {
    const alt = `Puerta ${g.repo}, rango ${g.rank}, ${g.state}. ${g.blurb}`;
    return `<p>${link(url(g.repo), img(`gate-${g.repo}`, alt))}</p>`;
  })
  .join('\n');
const sealedCard = gatesCfg.sealed?.count
  ? `\n<p>${img('gate-sellada', `Puerta sellada. ${gatesCfg.sealed.blurb}`)}</p>`
  : '';

const minor = visible
  .filter((r) => !featuredNames.has(r.name))
  .sort((a, b) => b.pushedAt.localeCompare(a.pushedAt));
minor.forEach((r) => {
  if (!gatesCfg.minor[r.name] && !r.description) console.warn(`! "${r.name}" no tiene texto en data/gates.json → minor.`);
});
const minorRows = minor
  .map((r) => {
    const text = gatesCfg.minor[r.name] ?? r.description ?? '—';
    return `| [\`${r.name}\`](${url(r.name)}) | ${text} | ${r.language ?? '—'} | ${haceCuanto(r.pushedAt, now)} |`;
  })
  .join('\n');

const portals = (profile.portals ?? []).map((p) => `<a href="${p.url}">${esc(p.label)}</a>`).join(' · ');

const readme = `<div align="center">

${profile.salaUrl ? link(profile.salaUrl, img('banner', `ARISE — ${displayName}, ${profile.alias}. Clic para entrar a la Sala del Monarca, la versión interactiva.`)) : img('banner', `ARISE — ${displayName}, ${profile.alias}`)}

${img('notice', '[SISTEMA] Jugador detectado. Cargando el registro de puertas…')}

</div>

${img('ficha', `Ficha del jugador: ${displayName}, nivel ${level}, rango ${rank}`)}

${img('mision', 'Misiones del Sistema: diaria, semanal y principal')}

## ${img('h-puertas', 'Registro de puertas')}

${gateCards}${sealedCard}

<details>
<summary><b>Puertas menores</b> (${minor.length}) — ejercicios, primeras versiones y experimentos</summary>
<br>

| Puerta | Qué es | Lenguaje | Última vez |
|---|---|---|---|
${minorRows}

</details>

## ${img('h-extracciones', 'Últimas extracciones')}

${img('actividad', 'Los siete repos con actividad más reciente')}

## ${img('h-arsenal', 'Arsenal')}

${img('arsenal', 'Habilidades por dominio con su rango de E a S')}

## ${img('h-equipo', 'Equipo')}

${img('equipo', 'Herramientas que uso, con su rareza')}

${img('footer', `${profile.tagline} Fin de la transmisión.`)}

${portals ? `<p align="center"><sub>Portales: ${portals}</sub></p>\n` : ''}<p align="center"><sub>Todo este perfil se genera con <code>node scripts/build.mjs</code> a partir de mis repos reales. Nada de widgets de terceros.</sub></p>
`;

write('README.md', readme);
console.log(
  `ok · nivel ${level} (${rank}) · ${xp} XP · ${featured.length} puertas + ${gatesCfg.sealed?.count ? 1 : 0} sellada · ${minor.length} menores · ${date}`,
);
