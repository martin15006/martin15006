(() => {
  'use strict';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = (rate, dt) => 1 - Math.exp(-rate * dt);
  const $ = (s, r = document) => r.querySelector(s);

  // ---------------------------------------------------------------- puntero
  const ptr = { x: 0, y: 0, seen: false, moved: 0 };
  const setPtr = (e) => {
    ptr.x = e.clientX;
    ptr.y = e.clientY;
    ptr.seen = true;
    ptr.moved = performance.now();
  };
  addEventListener('pointermove', setPtr, { passive: true });
  document.documentElement.addEventListener('mouseleave', () => { ptr.seen = false; });

  // ---------------------------------------------------------------- ojo
  const sigil = $('#sigil');
  const lid = $('#lid');
  const gaze = $('#gaze');
  const pupil = $('#pupil');
  const eye = { gx: 0, gy: 0, tx: 0, ty: 0, lid: 1, sx: 1, inside: false, blinkAt: 2600, blinkUntil: 0, wanderAt: 1800 };

  function eyeStep(dt, now) {
    if (!sigil) return;
    const r = sigil.getBoundingClientRect();
    if (!r.width) return;
    const u = r.width / 260; // unidades del SVG -> px
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const active = ptr.seen && now - ptr.moved < 4000;

    let tx = 0;
    let ty = 0;
    let near = 0;
    let inside = false;

    if (active) {
      const dx = ptr.x - cx;
      const dy = ptr.y - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const reach = clamp(dist / (150 * u), 0, 1);
      tx = (dx / dist) * 12 * reach;
      ty = (dy / dist) * 6.5 * reach;
      near = 1 - clamp(dist / (260 * u), 0, 1);
      const ex = dx / (50 * u);
      const ey = dy / (27 * u);
      inside = ex * ex + ey * ey < 1;
    } else if (!reduce) {
      // Sin mouse a la vista: mira de un lado a otro y parpadea solo.
      if (now > eye.wanderAt) {
        eye.tx = (Math.random() * 2 - 1) * 10;
        eye.ty = (Math.random() * 2 - 1) * 4.5;
        eye.wanderAt = now + 1500 + Math.random() * 2200;
      }
      tx = eye.tx;
      ty = eye.ty;
      if (now > eye.blinkAt) {
        eye.blinkUntil = now + 150;
        eye.blinkAt = now + 3500 + Math.random() * 3500;
      }
    }

    // Asimétrico: el párpado cae rápido y vuelve a abrirse más despacio.
    const closing = inside || now < eye.blinkUntil;
    const lidTarget = closing ? 0.06 : 1;
    eye.lid += (lidTarget - eye.lid) * ease(closing ? 32 : 7, dt);
    eye.gx += (tx - eye.gx) * ease(11, dt);
    eye.gy += (ty - eye.gy) * ease(11, dt);
    eye.sx += (1 - 0.4 * near - eye.sx) * ease(8, dt);

    gaze.setAttribute('transform', `translate(${eye.gx.toFixed(2)} ${eye.gy.toFixed(2)})`);
    lid.setAttribute('transform', `scale(1 ${eye.lid.toFixed(3)})`);
    pupil.setAttribute('transform', `scale(${eye.sx.toFixed(3)} 1)`);
    sigil.style.setProperty('--open', eye.lid.toFixed(3));

    if (eye.inside && !inside && !reduce) {
      sigil.classList.remove('flashing');
      void sigil.getBoundingClientRect();
      sigil.classList.add('flashing');
    }
    eye.inside = inside;
  }

  // ---------------------------------------------------------------- partículas, estela, ondas
  const cv = $('#fx');
  const g = cv.getContext('2d');
  let W = 0;
  let H = 0;
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth;
    H = innerHeight;
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    cv.style.width = `${W}px`;
    cv.style.height = `${H}px`;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  addEventListener('resize', resize);
  resize();

  const spawn = (init) => ({
    x: Math.random() * W,
    y: init ? Math.random() * H : H + 12,
    vx: 0,
    vy: 0,
    bvx: (Math.random() - 0.5) * 9,
    bvy: -(9 + Math.random() * 26),
    r: 0.7 + Math.random() * 1.7,
    a: 0.25 + Math.random() * 0.6,
    c: Math.random() < 0.3 ? '#c4b5fd' : '#8b5cf6',
    ph: Math.random() * 6.28,
    tx: 0, ty: 0, cx: 0, cy: 0, until: 0,
  });
  const COUNT = reduce ? 26 : W < 700 ? 46 : 110;
  const parts = Array.from({ length: COUNT }, () => {
    const p = spawn(true);
    p.vx = p.bvx;
    p.vy = p.bvy;
    return p;
  });

  const trail = [];
  const shocks = [];
  const flares = [];
  let lastFlare = 0;

  function burst(x, y, now) {
    if (reduce) return;
    shocks.push({ x, y, t0: now });
    const near = parts
      .map((p) => ({ p, d: Math.hypot(p.x - x, p.y - y) }))
      .filter((o) => o.d < 520)
      .sort((a, b) => a.d - b.d)
      .slice(0, 64);
    near.forEach(({ p }, i) => {
      const a = (i / near.length) * Math.PI * 2;
      const rad = 62 + (i % 3) * 14;
      p.tx = x + Math.cos(a) * rad;
      p.ty = y + Math.sin(a) * rad;
      p.cx = x;
      p.cy = y;
      p.until = now + 1400;
    });
  }
  addEventListener('pointerdown', (e) => { setPtr(e); burst(e.clientX, e.clientY, performance.now()); }, { passive: true });

  function fxStep(dt, now) {
    g.clearRect(0, 0, W, H);
    g.globalCompositeOperation = 'lighter';

    const R = 130;
    for (const p of parts) {
      if (p.until > now) {
        // formando el anillo del ejército
        p.vx += ((p.tx - p.x) * 38 - p.vx * 9) * dt;
        p.vy += ((p.ty - p.y) * 38 - p.vy * 9) * dt;
      } else {
        if (p.until) {
          // soltar: sale disparada hacia afuera
          const a = Math.atan2(p.y - p.cy, p.x - p.cx);
          const s = 110 + Math.random() * 130;
          p.vx = Math.cos(a) * s;
          p.vy = Math.sin(a) * s;
          p.until = 0;
        }
        const k = ease(0.9, dt);
        const sway = Math.sin(now / 1700 + p.ph) * 6;
        p.vx += (p.bvx + sway - p.vx) * k;
        p.vy += (p.bvy - p.vy) * k;
        if (ptr.seen && !reduce) {
          const dx = p.x - ptr.x;
          const dy = p.y - ptr.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < R * R) {
            const d = Math.sqrt(d2) || 1;
            const f = (1 - d / R) ** 2 * 900;
            p.vx += (dx / d) * f * dt;
            p.vy += (dy / d) * f * dt;
          }
        }
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.y < -12) { p.y = H + 12; p.x = Math.random() * W; }
      if (p.x < -12) p.x = W + 12;
      if (p.x > W + 12) p.x = -12;

      g.globalAlpha = p.a * (p.until > now ? 1 : 0.85);
      g.fillStyle = p.c;
      g.beginPath();
      g.arc(p.x, p.y, p.r, 0, 6.2832);
      g.fill();
    }

    if (!reduce) {
      // estela del cursor
      if (ptr.seen) {
        const last = trail[trail.length - 1];
        if (!last || Math.hypot(ptr.x - last.x, ptr.y - last.y) > 3) trail.push({ x: ptr.x, y: ptr.y, t: now });
      }
      while (trail.length && now - trail[0].t > 650) trail.shift();
      g.lineCap = 'round';
      for (let i = 1; i < trail.length; i++) {
        const a = trail[i - 1];
        const b = trail[i];
        const life = 1 - (now - b.t) / 650;
        g.globalAlpha = life * 0.55;
        g.strokeStyle = '#a78bfa';
        g.lineWidth = 1 + life * 5;
        g.beginPath();
        g.moveTo(a.x, a.y);
        g.lineTo(b.x, b.y);
        g.stroke();
        g.globalAlpha = life * 0.9;
        g.strokeStyle = '#ede9fe';
        g.lineWidth = 0.6 + life * 1.4;
        g.beginPath();
        g.moveTo(a.x, a.y);
        g.lineTo(b.x, b.y);
        g.stroke();
      }

      // destello donde te detenés
      const still = now - ptr.moved;
      if (ptr.seen && still > 380 && still < 3000 && now - lastFlare > 800) {
        flares.push({ x: ptr.x, y: ptr.y, t0: now });
        lastFlare = now;
      }
      for (let i = flares.length - 1; i >= 0; i--) {
        const f = flares[i];
        const t = (now - f.t0) / 650;
        if (t >= 1) { flares.splice(i, 1); continue; }
        const e = 1 - (1 - t) ** 3;
        g.globalAlpha = (1 - t) * 0.7;
        g.strokeStyle = '#c4b5fd';
        g.lineWidth = 1.5;
        g.beginPath();
        g.arc(f.x, f.y, 5 + e * 26, 0, 6.2832);
        g.stroke();
      }

      // onda ARISE
      for (let i = shocks.length - 1; i >= 0; i--) {
        const s = shocks[i];
        const t = (now - s.t0) / 900;
        if (t >= 1) { shocks.splice(i, 1); continue; }
        const e = 1 - (1 - t) ** 3;
        g.globalAlpha = (1 - t) * 0.65;
        g.strokeStyle = '#8b5cf6';
        g.lineWidth = 2.5 * (1 - t) + 0.5;
        g.beginPath();
        g.arc(s.x, s.y, e * 430, 0, 6.2832);
        g.stroke();
        g.globalAlpha = (1 - t) * 0.4;
        g.strokeStyle = '#ede9fe';
        g.lineWidth = 1;
        g.beginPath();
        g.arc(s.x, s.y, e * 300, 0, 6.2832);
        g.stroke();
      }
    }
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
  }

  let prev = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - prev) / 1000);
    prev = now;
    eyeStep(dt, now);
    fxStep(dt, now);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // ---------------------------------------------------------------- tarjetas que se inclinan
  if (fine && !reduce) {
    document.querySelectorAll('.slot').forEach((slot) => {
      const card = slot.firstElementChild;
      slot.addEventListener('pointermove', (e) => {
        const r = slot.getBoundingClientRect();
        const px = clamp((e.clientX - r.left) / r.width, 0, 1);
        const py = clamp((e.clientY - r.top) / r.height, 0, 1);
        card.style.setProperty('--rx', `${((0.5 - py) * 10).toFixed(2)}deg`);
        card.style.setProperty('--ry', `${((px - 0.5) * 12).toFixed(2)}deg`);
        card.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
        card.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
        card.classList.add('on');
      });
      slot.addEventListener('pointerleave', () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
        card.classList.remove('on');
      });
    });
  }

  // ---------------------------------------------------------------- visión del Monarca
  const vision = $('#vision');
  if (vision) {
    const stack = $('.stack', vision);
    const move = (e) => {
      const r = stack.getBoundingClientRect();
      vision.style.setProperty('--sx', `${(e.clientX - r.left).toFixed(0)}px`);
      vision.style.setProperty('--sy', `${(e.clientY - r.top).toFixed(0)}px`);
      vision.classList.add('looking');
    };
    stack.addEventListener('pointermove', move);
    stack.addEventListener('pointerenter', move);
    stack.addEventListener('pointerleave', () => vision.classList.remove('looking'));
  }

  // ---------------------------------------------------------------- aparecer al hacer scroll
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      }
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add('in'));
  }
})();
