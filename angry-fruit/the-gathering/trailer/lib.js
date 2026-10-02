// ANGRY FRUIT — render core: math, light, atmosphere, post.
const W = 1920, H = 1080, FPS = 24;

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const inv = (a, b, x) => clamp((x - a) / (b - a));
const E = {
  io: t => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  out: t => 1 - Math.pow(1 - t, 3),
  in: t => t * t * t,
  outQ: t => 1 - (1 - t) * (1 - t),
  back: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
};
// smooth 1D value noise, deterministic
function vnoise(x, seed = 0) {
  const i = Math.floor(x), f = x - i;
  const h = n => { const s = Math.sin((n + seed * 131.7) * 127.1) * 43758.5453; return s - Math.floor(s); };
  const u = f * f * (3 - 2 * f);
  return lerp(h(i), h(i + 1), u) * 2 - 1;
}
function shake(t, amp, freq = 18, seed = 1) {
  return [vnoise(t * freq, seed) * amp, vnoise(t * freq, seed + 7) * amp];
}

function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

// ---------- light ----------
function glow(ctx, x, y, r, color, a = 1, op = 'lighter') {
  ctx.save();
  ctx.globalCompositeOperation = op;
  ctx.globalAlpha = a;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
}
function rgba(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
}
function vgrad(ctx, y0, y1, stops) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  stops.forEach(([p, c]) => g.addColorStop(p, c));
  return g;
}

// ---------- smoke ----------
const _puffCache = {};
function puff(color) {
  if (_puffCache[color]) return _puffCache[color];
  const c = mkCanvas(256, 256), x = c.getContext('2d');
  const rnd = mulberry32(color.length * 97 + color.charCodeAt(1));
  for (let i = 0; i < 14; i++) {
    const px = 128 + (rnd() - .5) * 90, py = 128 + (rnd() - .5) * 90, r = 40 + rnd() * 60;
    const g = x.createRadialGradient(px, py, 0, px, py, r);
    g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.globalAlpha = .35; x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  }
  _puffCache[color] = c; return c;
}
// drifting smoke field
function smoke(ctx, t, o) {
  const { seed = 1, n = 30, x = 0, y = 0, w = W, h = H, color = 'rgb(40,36,34)', alpha = .6,
    size = [250, 600], vx = 20, vy = -8, op = 'source-over' } = o;
  const rnd = mulberry32(seed), p = puff(color);
  ctx.save(); ctx.globalCompositeOperation = op;
  for (let i = 0; i < n; i++) {
    const s = lerp(size[0], size[1], rnd()), sp = .5 + rnd();
    let px = x + ((rnd() * (w + s) + t * vx * sp) % (w + s)) - s / 2;
    let py = y + ((rnd() * (h + s) + t * vy * sp) % (h + s) + h + s) % (h + s) - s / 2;
    const rot = rnd() * 6.28 + t * .05 * (rnd() - .5);
    ctx.globalAlpha = alpha * (.4 + rnd() * .6);
    ctx.save(); ctx.translate(px, py); ctx.rotate(rot);
    ctx.drawImage(p, -s / 2, -s / 2, s, s); ctx.restore();
  }
  ctx.restore();
}

// ---------- particles ----------
function particles(ctx, t, o) {
  const { seed = 3, n = 80, kind = 'ash', x = 0, y = 0, w = W, h = H, vx = 10, vy = 30, size = [1, 3], alpha = 1 } = o;
  const rnd = mulberry32(seed);
  ctx.save();
  if (kind === 'ember' || kind === 'firefly' || kind === 'spark') ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const sp = .5 + rnd(), s = lerp(size[0], size[1], rnd()), ph = rnd() * 100;
    let px = x + (((rnd() * w + t * vx * sp + Math.sin(t * 1.3 + ph) * 18) % w) + w) % w;
    let py = y + (((rnd() * h + t * vy * sp) % h) + h) % h;
    let a = alpha;
    if (kind === 'ash') { ctx.fillStyle = `rgba(190,185,180,${.55 * a})`; ctx.fillRect(px, py, s * 1.6, s); }
    else if (kind === 'dust') { ctx.globalAlpha = a * (.25 + .5 * (.5 + .5 * Math.sin(t * 2 + ph))); ctx.fillStyle = '#ffe2b0'; ctx.beginPath(); ctx.arc(px, py, s, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
    else if (kind === 'ember' || kind === 'spark') {
      const fl = .5 + .5 * Math.sin(t * 9 + ph);
      glow(ctx, px, py, s * 5, `rgba(255,${120 + fl * 60 | 0},40,1)`, a * (.5 + .5 * fl));
      ctx.fillStyle = `rgba(255,220,150,${a})`; ctx.fillRect(px, py, s, s);
    }
    else if (kind === 'firefly') {
      const fl = Math.max(0, Math.sin(t * 2.2 + ph));
      glow(ctx, px, py, s * 7, 'rgba(220,255,140,1)', a * fl * .8);
    }
    else if (kind === 'pollen') { ctx.globalAlpha = a * .7; glow(ctx, px, py, s * 3, 'rgba(255,214,140,1)', a * .6); ctx.globalAlpha = 1; }
  }
  ctx.restore();
}

// ---------- post ----------
const _grain = [];
function initGrain() {
  for (let k = 0; k < 6; k++) {
    const c = mkCanvas(480, 270), x = c.getContext('2d'), d = x.createImageData(480, 270);
    const rnd = mulberry32(900 + k);
    for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (rnd() - .5) * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    x.putImageData(d, 0, 0); _grain.push(c);
  }
}
function grain(ctx, frame, amt = .09) {
  ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = amt;
  ctx.imageSmoothingEnabled = false;
  const g = _grain[frame % _grain.length];
  ctx.drawImage(g, 0, 0, W, H);
  ctx.restore();
}
let _vig;
function vignette(ctx, amt = .7) {
  if (!_vig) {
    _vig = mkCanvas(W, H); const x = _vig.getContext('2d');
    const g = x.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * 1.05);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,1)');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
  }
  ctx.save(); ctx.globalAlpha = amt; ctx.drawImage(_vig, 0, 0); ctx.restore();
}
const BAR = Math.round((H - W / 2.39) / 2); // 2.39:1 letterbox
function letterbox(ctx, k = 1) {
  const b = BAR * k; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, b); ctx.fillRect(0, H - b, W, b);
}
function grade(ctx, color, op, a) {
  ctx.save(); ctx.globalCompositeOperation = op; ctx.globalAlpha = a; ctx.fillStyle = color; ctx.fillRect(0, 0, W, H); ctx.restore();
}
function caption(ctx, text, a, k = 1) {
  if (a <= 0 || !text) return;
  ctx.save(); ctx.globalAlpha = a;
  ctx.font = '500 46px Oswald'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.letterSpacing = '1px';
  const y = H - BAR * k - 70;
  ctx.shadowColor = 'rgba(0,0,0,.95)'; ctx.shadowBlur = 18;
  ctx.fillStyle = '#f4efe6'; ctx.fillText(text, W / 2, y);
  ctx.shadowBlur = 4; ctx.fillText(text, W / 2, y);
  ctx.restore();
}
function cardText(ctx, text, a, o = {}) {
  const { size = 64, font = 'Oswald', weight = 500, spacing = 14, y = H / 2, color = '#efe8dc' } = o;
  ctx.save(); ctx.globalAlpha = a; ctx.font = `${weight} ${size}px ${font}`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.letterSpacing = spacing + 'px';
  ctx.fillStyle = color; ctx.fillText(text, W / 2 + spacing / 2, y);
  ctx.restore();
}

// camera: push/pan/rotate around a focus point
function camera(ctx, o) {
  const { zoom = 1, cx = W / 2, cy = H / 2, rot = 0, sx = 0, sy = 0 } = o;
  ctx.translate(W / 2 + sx, H / 2 + sy); ctx.rotate(rot); ctx.scale(zoom, zoom); ctx.translate(-cx, -cy);
}

// draw a scene into an offscreen buffer (for blur / sepia / DOF)
const _buffers = {};
function buffer(name) {
  if (!_buffers[name]) _buffers[name] = mkCanvas(W, H);
  const c = _buffers[name], x = c.getContext('2d');
  x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.filter = 'none';
  x.clearRect(0, 0, W, H);
  return [c, x];
}
function drawBuf(ctx, c, filter = 'none', a = 1, dx = 0, dy = 0) {
  ctx.save(); ctx.filter = filter; ctx.globalAlpha = a; ctx.drawImage(c, dx, dy); ctx.restore();
}
