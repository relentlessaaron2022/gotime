// ANGRY FRUIT — environments.

// ---------- ORCHARD CITY AT NIGHT ----------
const _orchard = (() => {
  const r = mulberry32(2024), towers = [];
  for (let layer = 0; layer < 4; layer++) {
    const n = [14, 11, 8, 6][layer];
    for (let i = 0; i < n; i++) towers.push({ layer, x: (i + r() * .8) / n * 2600 - 340, w: [40, 70, 110, 170][layer] * (.7 + r() * .6), h: [160, 260, 380, 560][layer] * (.7 + r() * .5), can: .8 + r() * .6, seed: r() * 1000 | 0 });
  }
  return towers;
})();
function orchardTower(ctx, x, base, tw, layer, t) {
  const { w, h, can, seed } = tw; const r = mulberry32(seed);
  const dark = [.75, .6, .45, .3][layer];
  // trunk
  const g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
  g.addColorStop(0, `rgba(${40 * (1 - dark) + 10 | 0},${28 * (1 - dark) + 8 | 0},${30 * (1 - dark) + 16 | 0},1)`); g.addColorStop(.3, '#3a2a28'); g.addColorStop(1, '#0e0a0c');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(x - w * .6, base); ctx.quadraticCurveTo(x - w * .45, base - h * .5, x - w * .3, base - h); ctx.lineTo(x + w * .3, base - h); ctx.quadraticCurveTo(x + w * .45, base - h * .5, x + w * .6, base); ctx.fill();
  // windows
  const rows = Math.floor(h / 24), cols = Math.max(1, Math.floor(w / 20));
  for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
    if (r() > .42) continue;
    const wx = x - w * .32 + (j + .5) * (w * .64 / cols), wy = base - 18 - i * 24;
    const fl = .75 + .25 * Math.sin(t * 2 + i * 3 + j);
    ctx.fillStyle = `rgba(255,${170 + r() * 50 | 0},90,${(.55 + r() * .45) * fl})`;
    ctx.fillRect(wx - 3, wy - 5, 6, 8);
    if (layer > 1 && r() > .6) glow(ctx, wx, wy, 22, 'rgba(255,170,80,1)', .25 * fl);
  }
  // canopy
  const cy = base - h, cr = w * .95 * can;
  for (let k = 0; k < 9; k++) {
    const bx = x + (r() - .5) * cr * 1.5, by = cy - r() * cr * .6, br = cr * (.32 + r() * .32);
    const cg = ctx.createRadialGradient(bx - br * .3, by - br * .4, br * .1, bx, by, br);
    cg.addColorStop(0, `rgba(${50 - layer * 8},${96 - layer * 12},${70 - layer * 8},1)`); cg.addColorStop(.5, `rgba(${18},${42 - layer * 4},${26},1)`); cg.addColorStop(1, 'rgba(6,12,14,1)');
    ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(bx, by, br, 0, 7); ctx.fill();
  }
  // fruit lanterns in the canopy
  for (let k = 0; k < 5; k++) { const fx = x + (r() - .5) * cr * 1.4, fy = cy - r() * cr * .5; glow(ctx, fx, fy, 16 + layer * 6, k % 2 ? 'rgba(255,90,70,1)' : 'rgba(255,190,90,1)', .5); }
}
function orchardNight(ctx, t, p) {
  // p: travel 0..1
  const hz = 430;
  ctx.fillStyle = vgrad(ctx, 0, H, [[0, '#04060d'], [.35, '#0b1630'], [.55, '#1d2e52'], [.62, '#0c1222'], [1, '#05070c']]); ctx.fillRect(0, 0, W, H);
  const rs = mulberry32(7); for (let i = 0; i < 260; i++) { const a = rs(); ctx.fillStyle = `rgba(220,230,255,${.2 + .6 * a * (.6 + .4 * Math.sin(t * 3 + i))})`; ctx.fillRect(rs() * W, rs() * hz * .9, a * 2, a * 2); }
  glow(ctx, 1460, 180, 380, 'rgba(150,180,255,1)', .22); glow(ctx, 1460, 180, 90, 'rgba(230,240,255,1)', .9);
  ctx.fillStyle = '#f2f4ff'; ctx.beginPath(); ctx.arc(1460, 180, 52, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(160,170,200,.35)'; ctx.beginPath(); ctx.arc(1446, 170, 12, 0, 7); ctx.arc(1474, 196, 8, 0, 7); ctx.fill();
  // ranges at horizon
  ctx.fillStyle = '#0a0e1a'; ctx.beginPath(); ctx.moveTo(0, hz); for (let x = 0; x <= W; x += 40) ctx.lineTo(x, hz - 40 - Math.abs(Math.sin(x * .004) * 70) - Math.abs(Math.sin(x * .013)) * 25); ctx.lineTo(W, hz + 10); ctx.lineTo(0, hz + 10); ctx.fill();
  // layers with forward travel (scale about vanishing point)
  const vx = W / 2, vy = hz;
  for (let layer = 0; layer < 4; layer++) {
    const sc = 1 + p * [0.12, .25, .45, .8][layer], base = [520, 640, 820, 1120][layer];
    ctx.save(); ctx.translate(vx, vy); ctx.scale(sc, sc); ctx.translate(-vx, -vy);
    // ground band
    ctx.fillStyle = ['#0b1220', '#0a1018', '#080c12', '#05070b'][layer]; ctx.fillRect(-600, base - 6, W + 1200, 900);
    // canals: silver ribbons
    if (layer < 3) {
      const cg = ctx.createLinearGradient(0, base, 0, base + 40); cg.addColorStop(0, 'rgba(170,200,255,.65)'); cg.addColorStop(1, 'rgba(60,90,150,.1)');
      ctx.strokeStyle = cg; ctx.lineWidth = 6 + layer * 6;
      ctx.beginPath(); for (let x = -600; x < W + 600; x += 30) ctx.lineTo(x, base + 30 + layer * 20 + Math.sin(x * .004 + layer) * 18); ctx.stroke();
      for (let b = 0; b < 4; b++) { const bx = ((b * 520 + t * 30 * (layer + 1)) % (W + 600)) - 300; glow(ctx, bx, base + 30 + layer * 20 + Math.sin(bx * .004 + layer) * 18, 18 + layer * 8, 'rgba(255,200,120,1)', .8); }
    }
    for (const tw of _orchard) if (tw.layer === layer) orchardTower(ctx, tw.x, base, tw, layer, t);
    // lantern strings between towers
    ctx.strokeStyle = 'rgba(40,30,30,.8)'; ctx.lineWidth = 1 + layer;
    const tl = _orchard.filter(q => q.layer === layer);
    for (let i = 0; i < tl.length - 1; i++) {
      const a = tl[i], b = tl[i + 1], ya = base - a.h * .55, yb = base - b.h * .55, mx = (a.x + b.x) / 2, my = Math.max(ya, yb) + 50;
      ctx.beginPath(); ctx.moveTo(a.x, ya); ctx.quadraticCurveTo(mx, my, b.x, yb); ctx.stroke();
      for (let k = 1; k < 8; k++) { const u = k / 8, lx = (1 - u) * (1 - u) * a.x + 2 * u * (1 - u) * mx + u * u * b.x, ly = (1 - u) * (1 - u) * ya + 2 * u * (1 - u) * my + u * u * yb; glow(ctx, lx, ly, 8 + layer * 4, k % 3 ? 'rgba(255,180,90,1)' : 'rgba(255,90,80,1)', .9); }
    }
    ctx.restore();
  }
  // mist above canals
  smoke(ctx, t, { seed: 31, n: 16, y: 480, h: 500, color: 'rgb(120,140,190)', alpha: .12, size: [400, 800], vx: 12, vy: 0 });
  particles(ctx, t, { seed: 5, n: 70, kind: 'firefly', y: 500, h: 580, vx: 8, vy: -4, size: [1.5, 3] });
}

// ---------- SCORCHED PLAIN WITH THE HERD ----------
function emberSky(ctx, hz = 640, k = 1) {
  ctx.fillStyle = vgrad(ctx, 0, H, [[0, '#050302'], [.35, '#1a0a06'], [hz / H - .05, `rgb(${120 * k | 0},${36 * k | 0},${10 * k | 0})`], [hz / H, `rgb(${255 * k | 0},${110 * k | 0},${30 * k | 0})`], [hz / H + .01, '#0a0605'], [1, '#020101']]);
  ctx.fillRect(0, 0, W, H);
}
function herdPlain(ctx, t, o = {}) {
  const { hz = 700, march = 0, near = false, pigsOnly = false } = o;
  emberSky(ctx, hz);
  glow(ctx, W * .5, hz, 900, 'rgba(255,90,20,1)', .35);
  // fires on horizon
  for (let i = 0; i < 9; i++) { const fx = 80 + i * 230, f = .6 + .4 * Math.sin(t * 7 + i * 2); glow(ctx, fx, hz - 6, 160, 'rgba(255,120,30,1)', .35 * f); }
  smoke(ctx, t, { seed: 41, n: 26, y: hz - 520, h: 600, color: 'rgb(60,32,22)', alpha: .55, size: [300, 700], vx: 18, vy: -4 });
  const bob = Math.abs(Math.sin(march * Math.PI)) * 8;
  glow(ctx, W * .5, hz - 260, 1100, 'rgba(255,110,40,1)', .3);
  if (!pigsOnly) [[260, .62, 0], [860, .48, 1], [1340, .72, 0], [1760, .5, 1]].forEach(([bx, bs, f]) => bull(ctx, bx, hz + 6 - bob, bs, { t, horn: 0, rimA: 1, flip: !!f, step: march * .5 }));
  [[80, .42], [380, .5], [640, .4], [1000, .52], [1180, .38], [1500, .48], [1840, .44]].forEach(([px, ps], i) => boar(ctx, px, hz + 44 - bob * 1.3 + (i % 2) * 12, ps, { t, rimA: 1, brazier: i % 3 === 1, flip: i % 3 === 0, step: march * .5 + i * .3 }));
  ctx.fillStyle = '#030202'; ctx.fillRect(0, hz + 40, W, H - hz);
  smoke(ctx, t, { seed: 42, n: 18, y: hz - 300, h: 420, color: 'rgb(40,22,16)', alpha: .5, size: [300, 600], vx: 26, vy: -6 });
  particles(ctx, t, { seed: 6, n: 90, kind: 'ember', vx: 30, vy: -40, size: [1, 2.5] });
  particles(ctx, t, { seed: 7, n: 120, kind: 'ash', vx: 20, vy: 40, size: [1, 3] });
}

// ---------- ROOT CELLAR ----------
const _clips = (() => { const r = mulberry32(88), a = []; for (let i = 0; i < 34; i++) a.push([r() * 1500 + 200, 120 + r() * 420, 60 + r() * 70, 50 + r() * 70, (r() - .5) * .2, r()]); return a; })();
function cellar(ctx, t, o = {}) {
  const { swing = 0, light = 1 } = o;
  ctx.fillStyle = vgrad(ctx, 0, H, [[0, '#120b07'], [.5, '#2a1a10'], [1, '#0a0604']]); ctx.fillRect(0, 0, W, H);
  // earth texture
  const r = mulberry32(3); for (let i = 0; i < 500; i++) { ctx.fillStyle = `rgba(${r() > .5 ? '80,55,35' : '10,6,4'},${.15 + r() * .2})`; ctx.beginPath(); ctx.ellipse(r() * W, r() * H, 3 + r() * 14, 2 + r() * 8, r() * 3, 0, 7); ctx.fill(); }
  // conspiracy wall
  for (const [x, y, w, h, a, v] of _clips) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = v > .7 ? '#d8cfb4' : v > .4 ? '#e6dcc0' : '#bfb59a'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.fillStyle = 'rgba(40,30,20,.5)'; for (let k = 0; k < 5; k++) ctx.fillRect(-w / 2 + 6, -h / 2 + 8 + k * 9, w * (.5 + (k % 3) * .15), 3); if (v > .75) { ctx.fillStyle = '#3a3a3a'; ctx.fillRect(-w / 2 + 6, -h / 2 + 6, w * .4, h * .4); } ctx.restore(); }
  ctx.strokeStyle = '#b8141c'; ctx.lineWidth = 2.2;
  for (let i = 0; i < _clips.length - 3; i += 2) { const a = _clips[i], b = _clips[(i * 7 + 3) % _clips.length]; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.fillStyle = '#e02020'; ctx.beginPath(); ctx.arc(a[0], a[1], 4, 0, 7); ctx.fill(); }
  // roots
  ctx.strokeStyle = '#1a0f08'; ctx.lineCap = 'round';
  [[0, 40, 400, 120, 700, 0, 34], [W, 80, 1500, 200, 1200, 0, 40], [200, 0, 260, 300, 120, 640, 26], [W - 120, 0, 1700, 400, 1820, 700, 30]].forEach(([a, b, c, d, e, f, w]) => { ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(a, b); ctx.quadraticCurveTo(c, d, e, f); ctx.stroke(); ctx.lineWidth = w * .3; ctx.strokeStyle = 'rgba(90,60,40,.4)'; ctx.stroke(); ctx.strokeStyle = '#1a0f08'; });
  // transmitter
  ctx.fillStyle = '#1e1a16'; ctx.fillRect(1500, 560, 300, 180); ctx.fillStyle = '#2c2620'; ctx.fillRect(1510, 570, 280, 160);
  for (let i = 0; i < 4; i++) { const dx = 1550 + i * 66; glow(ctx, dx, 620, 40, 'rgba(255,170,60,1)', .5 + .2 * Math.sin(t * 3 + i)); ctx.fillStyle = '#e8b050'; ctx.beginPath(); ctx.arc(dx, 620, 18, Math.PI, 0); ctx.fill(); ctx.strokeStyle = '#300'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(dx, 620); ctx.lineTo(dx + Math.cos(-2 + Math.sin(t * 2 + i)) * 16, 620 + Math.sin(-2 + Math.sin(t * 2 + i)) * 16); ctx.stroke(); }
  // bulb
  const bx = 960 + Math.sin(swing) * 60, by = 150;
  ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(960, -10); ctx.lineTo(bx, by - 20); ctx.stroke();
  glow(ctx, bx, by, 900, 'rgba(255,170,90,1)', .32 * light);
  glow(ctx, bx, by, 120, 'rgba(255,220,160,1)', .9 * light);
  ctx.fillStyle = '#fff1d0'; ctx.beginPath(); ctx.ellipse(bx, by, 16, 22, 0, 0, 7); ctx.fill();
  return [bx, by];
}
function cellarTable(ctx, y, o = {}) {
  const { map = 1 } = o;
  ctx.fillStyle = '#2a1a0e'; ctx.beginPath(); ctx.ellipse(W / 2, y, 760, 140, 0, 0, 7); ctx.fill();
  const tg = ctx.createRadialGradient(W / 2, y - 30, 40, W / 2, y, 760); tg.addColorStop(0, '#7a5434'); tg.addColorStop(1, '#3a2414');
  ctx.fillStyle = tg; ctx.beginPath(); ctx.ellipse(W / 2, y - 16, 740, 124, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(40,20,8,.5)'; ctx.lineWidth = 2; for (let i = 1; i < 9; i++) { ctx.beginPath(); ctx.ellipse(W / 2, y - 16, 80 * i, 13.4 * i, 0, 0, 7); ctx.stroke(); }
  if (map > 0) {
    const mw = 1000 * map;
    ctx.save(); ctx.translate(W / 2 - 500, y - 70);
    const mg = ctx.createLinearGradient(0, 0, 0, 110); mg.addColorStop(0, '#e9dcb8'); mg.addColorStop(1, '#c4b088');
    ctx.fillStyle = mg; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(mw, 6); ctx.lineTo(mw + 20, 110); ctx.lineTo(-20, 104); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.rect(-20, 0, mw + 40, 120); ctx.clip();
    ctx.strokeStyle = 'rgba(60,40,20,.6)'; ctx.lineWidth = 2; for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.arc(160 + i * 70, 50 + Math.sin(i) * 20, 14, 0, 7); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(60,90,160,.7)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(60, 80); ctx.bezierCurveTo(300, 30, 500, 100, 980, 40); ctx.stroke();
    ctx.strokeStyle = '#b8141c'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(960, 20); ctx.quadraticCurveTo(700, 100, 380, 60); ctx.stroke();
    ctx.fillStyle = '#b8141c'; ctx.beginPath(); ctx.moveTo(380, 40); ctx.lineTo(330, 62); ctx.lineTo(384, 86); ctx.fill();
    ctx.restore(); ctx.restore();
    if (map < 1) { ctx.fillStyle = '#b8a07a'; ctx.beginPath(); ctx.ellipse(W / 2 - 500 + mw, y - 14, 18, 56, 0, 0, 7); ctx.fill(); }
  }
}

// ---------- MARKET SQUARE (dusk) ----------
function marketSquare(ctx, t, o = {}) {
  const { crowd = 1, torch = 1, blur = 0 } = o;
  ctx.fillStyle = vgrad(ctx, 0, H, [[0, '#0a1430'], [.45, '#24305a'], [.62, '#3a3050'], [.63, '#140e10'], [1, '#080606']]); ctx.fillRect(0, 0, W, H);
  const rs = mulberry32(17); for (let i = 0; i < 90; i++) ctx.fillRect(rs() * W, rs() * 400, 1.5, 1.5);
  // buildings
  ctx.fillStyle = '#100c10'; for (let i = 0; i < 12; i++) { const bx = i * 170 - 20, bh = 220 + (i * 53 % 140); ctx.fillRect(bx, 680 - bh, 150, bh); ctx.fillStyle = 'rgba(255,170,80,.35)'; for (let k = 0; k < 4; k++) ctx.fillRect(bx + 20 + (k % 2) * 70, 700 - bh + 40 + Math.floor(k / 2) * 60, 26, 30); ctx.fillStyle = '#100c10'; }
  // banners side by side (fruit red / veg green)
  for (let i = 0; i < 8; i++) { const bx = 150 + i * 230; ctx.fillStyle = i % 2 ? '#2f6a2a' : '#8a1a22'; ctx.beginPath(); ctx.moveTo(bx, 360); ctx.lineTo(bx + 70, 360); ctx.lineTo(bx + 70, 520 + Math.sin(t * 2 + i) * 6); ctx.lineTo(bx + 35, 490 + Math.sin(t * 2 + i) * 6); ctx.lineTo(bx, 520 + Math.sin(t * 2 + i) * 6); ctx.fill(); ctx.fillStyle = 'rgba(255,220,150,.5)'; ctx.beginPath(); ctx.arc(bx + 35, 420, 14, 0, 7); ctx.fill(); }
  // torches
  for (let i = 0; i < 6; i++) { const tx = 120 + i * 340, f = .7 + .3 * Math.sin(t * 11 + i * 3); ctx.fillStyle = '#1a1210'; ctx.fillRect(tx - 5, 520, 10, 200); glow(ctx, tx, 510, 260, 'rgba(255,130,40,1)', .45 * f * torch); glow(ctx, tx, 510, 40, 'rgba(255,230,160,1)', .9 * f * torch); }
  // crowd heads (rows)
  if (crowd) {
    for (let row = 0; row < 4; row++) {
      const y = 760 + row * 90, s = .35 + row * .12;
      for (let i = 0; i < 16 - row * 2; i++) crowdie(ctx, ((i + (row % 2) * .5) / (16 - row * 2)) * (W + 200) - 100, y + 140, s, i * 3 + row, { lit: .5 + row * .1 });
    }
  }
  smoke(ctx, t, { seed: 51, n: 10, y: 300, h: 500, color: 'rgb(60,50,60)', alpha: .25, size: [300, 600], vx: 10, vy: -6 });
}

// ---------- GREAT GATE AT DAWN ----------
function dawnSky(ctx, t) {
  ctx.fillStyle = vgrad(ctx, 0, H, [[0, '#2a3a5a'], [.3, '#c87a4a'], [.5, '#ffcf7a'], [.56, '#fff2c0'], [.6, '#6a4a2a'], [1, '#1a120a']]); ctx.fillRect(0, 0, W, H);
  glow(ctx, W / 2, 600, 900, 'rgba(255,200,120,1)', .5); glow(ctx, W / 2, 600, 200, 'rgba(255,250,220,1)', .9);
}
function godRays(ctx, x, y, a = .25, t = 0) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 14; i++) {
    const ang = -Math.PI / 2 + (i - 6.5) * .16 + Math.sin(t * .3 + i) * .02, len = 1500, w = .05 + (i % 3) * .02;
    const g = ctx.createLinearGradient(x, y, x + Math.cos(ang + Math.PI) * len, y + Math.sin(ang + Math.PI) * len);
    g.addColorStop(0, `rgba(255,220,150,${a})`); g.addColorStop(1, 'rgba(255,220,150,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(ang + Math.PI - w) * len, y + Math.sin(ang + Math.PI - w) * len); ctx.lineTo(x + Math.cos(ang + Math.PI + w) * len, y + Math.sin(ang + Math.PI + w) * len); ctx.fill();
  }
  ctx.restore();
}
function army(ctx, t, o = {}) {
  const { y0 = 640, rows = 7, roar = 0, lit = 1, spread = 1 } = o;
  for (let row = 0; row < rows; row++) {
    const y = y0 + row * 60 * spread, s = .18 + row * .07, n = 30 - row * 3;
    for (let i = 0; i < n; i++) {
      const x = ((i + (row % 2) * .5) / n) * (W + 400) - 200, k = i * 5 + row * 3;
      const type = k % 11;
      if (type === 0) { celery(ctx, x, y, s * .55); continue; }
      if (type === 4) { pineapple(ctx, x, y, s * .7); continue; }
      if (type === 7) { blueberry(ctx, x, y, s * .9); blueberry(ctx, x + 30 * s, y, s * .8); continue; }
      crowdie(ctx, x, y + Math.sin(t * 8 + k) * roar * 6, s, k, { weapon: 1, roar, t, lit });
    }
  }
}
