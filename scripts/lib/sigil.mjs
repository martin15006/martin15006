// Geometría del sigilo del Monarca (anillos + ojo). La comparten la portada del README
// (SVG animado por CSS) y la Sala (SVG controlado por JavaScript con el mouse).

export function sigilParts(cx, cy) {
  const f = (v) => v.toFixed(1);

  const ticks = Array.from({ length: 24 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 24;
    const r1 = 106;
    const r2 = i % 6 === 0 ? 120 : 112;
    return `M${f(cx + r1 * Math.cos(a))} ${f(cy + r1 * Math.sin(a))}L${f(cx + r2 * Math.cos(a))} ${f(cy + r2 * Math.sin(a))}`;
  }).join('');

  // Polígonos simétricos: el centro de su caja es su centro real, así giran sobre sí mismos.
  const poly = (n, r, rot) =>
    Array.from({ length: n }, (_, i) => {
      const a = rot + (Math.PI * 2 * i) / n;
      return `${f(cx + r * Math.cos(a))},${f(cy + r * Math.sin(a))}`;
    }).join(' ');

  // Ojo: almendra, iris con fibras, pupila vertical.
  const aw = 52;
  const ah = 34;
  const eye = {
    aw,
    ah,
    almond: `M${cx - aw} ${cy}C${cx - aw / 2} ${cy - ah} ${cx + aw / 2} ${cy - ah} ${cx + aw} ${cy}C${cx + aw / 2} ${cy + ah} ${cx - aw / 2} ${cy + ah} ${cx - aw} ${cy}Z`,
    brow: `M${cx - 46} ${cy - 31}Q${cx} ${cy - 58} ${cx + 46} ${cy - 31}M${cx - 46} ${cy + 31}Q${cx} ${cy + 58} ${cx + 46} ${cy + 31}`,
    fibers: Array.from({ length: 18 }, (_, i) => {
      const a = (Math.PI * 2 * i) / 18;
      return `M${f(cx + 8 * Math.cos(a))} ${f(cy + 8 * Math.sin(a))}L${f(cx + 18.5 * Math.cos(a))} ${f(cy + 18.5 * Math.sin(a))}`;
    }).join(''),
  };

  // Rombos: cuatro cardinales sobre el anillo de radio 64 y dos en las puntas del ojo.
  const diamonds = `M${cx} ${cy - 69}l5 5-5 5-5-5zM${cx + 64} ${cy - 5}l5 5-5 5-5-5zM${cx} ${cy + 59}l5 5-5 5-5-5zM${cx - 64} ${cy - 5}l5 5-5 5-5-5z`;
  const corners = `M${cx - 57} ${cy}l5-5 5 5-5 5zM${cx + 47} ${cy}l5-5 5 5-5 5z`;

  return { ticks, poly, eye, diamonds, corners };
}
