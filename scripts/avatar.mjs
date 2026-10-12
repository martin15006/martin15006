// Avatar del perfil: el ojo del Monarca sobre un sigilo, pensado para el recorte circular de GitHub.
//   node scripts/avatar.mjs   -> tema/avatar-monarca.svg (el PNG sale de una captura, ver tema/LEEME.md)
import { writeFileSync, mkdirSync } from 'node:fs';
import { sigilParts } from './lib/sigil.mjs';
import { rng } from './lib/kit.mjs';

const S = 800;
const { ticks, poly, eye, diamonds, corners } = sigilParts(0, 0);

const rand = rng(23);
const embers = Array.from({ length: 34 }, (_, i) => {
  const a = rand() * Math.PI * 2;
  const r = 150 + rand() * 235;
  const x = 400 + Math.cos(a) * r;
  const y = 400 + Math.sin(a) * r;
  const size = 1.2 + rand() * 2.6;
  const o = 0.25 + rand() * 0.6;
  return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${size.toFixed(1)}" fill="${i % 3 === 0 ? '#c4b5fd' : '#8b5cf6'}" opacity="${o.toFixed(2)}"/>`;
}).join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}" role="img" aria-label="Ojo del Monarca">
<defs>
  <radialGradient id="bg" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#2a1160"/><stop offset=".55" stop-color="#120a26"/><stop offset="1" stop-color="#07040d"/></radialGradient>
  <radialGradient id="iris" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ddd6fe"/><stop offset=".4" stop-color="#a78bfa"/><stop offset=".8" stop-color="#7c3aed"/><stop offset="1" stop-color="#5b21b6"/></radialGradient>
  <radialGradient id="eg" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#8b5cf6" stop-opacity=".65"/><stop offset="1" stop-color="#8b5cf6" stop-opacity="0"/></radialGradient>
  <clipPath id="eyeclip"><path d="${eye.almond}"/></clipPath>
</defs>
<rect width="${S}" height="${S}" fill="url(#bg)"/>
${embers}
<g transform="translate(400 400) scale(2.35)">
  <ellipse rx="96" ry="66" fill="url(#eg)"/>
  <g opacity=".95">
    <path d="${ticks}" stroke="#a78bfa" stroke-opacity=".6" stroke-width="1.2" fill="none"/>
    <circle r="96" fill="none" stroke="#7c3aed" stroke-opacity=".7" stroke-dasharray="2 9"/>
    <circle r="84" fill="none" stroke="#8b5cf6" stroke-opacity=".75" stroke-dasharray="46 14 6 14"/>
    <polygon points="${poly(6, 74, 0)}" fill="none" stroke="#a78bfa" stroke-opacity=".5"/>
    <circle r="64" fill="none" stroke="#a78bfa" stroke-opacity=".5"/>
    <path d="${diamonds}" fill="#c4b5fd"/>
  </g>
  <path d="${eye.brow}" fill="none" stroke="#a78bfa" stroke-opacity=".6" stroke-linecap="round"/>
  <path d="${eye.almond}" fill="#0a0414" stroke="#c4b5fd" stroke-width="1.8" stroke-linejoin="round"/>
  <g clip-path="url(#eyeclip)">
    <circle r="19.5" fill="url(#iris)"/>
    <path d="${eye.fibers}" stroke="#f1ecff" stroke-opacity=".4" stroke-width=".8" fill="none"/>
    <circle r="19.5" fill="none" stroke="#f1ecff" stroke-opacity=".8" stroke-width="1"/>
    <ellipse rx="4.4" ry="12.5" fill="#05020a"/>
    <circle cx="7" cy="-7" r="2.2" fill="#fff" opacity=".92"/>
  </g>
  <path d="${corners}" fill="#c4b5fd"/>
</g>
</svg>
`;

mkdirSync(new URL('../tema/', import.meta.url), { recursive: true });
writeFileSync(new URL('../tema/avatar-monarca.svg', import.meta.url), svg);
console.log('avatar: tema/avatar-monarca.svg');
