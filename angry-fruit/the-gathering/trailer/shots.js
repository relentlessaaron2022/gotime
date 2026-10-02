// ANGRY FRUIT: THE GATHERING — shot timeline. Times in seconds; matches audio.js cue sheet.

// dialogue timing (timeline seconds) — shared with audio + captions
const LINES = [
  { who: 'STRAWBERRY', text: "They're coming.", t: 5.05, d: .9, whisper: true },
  { who: 'STRAWBERRY', text: 'For generations, fruits blamed vegetables.', t: 8.3, d: 3.45 },
  { who: 'STRAWBERRY', text: 'Vegetables blamed fruits.', t: 12.3, d: 1.95 },
  { who: 'STRAWBERRY', text: 'Turns out…', t: 14.75, d: .9 },
  { who: 'STRAWBERRY', text: 'we were arguing with the wrong damn food group.', t: 15.65, d: 3.58 },
  { who: 'LEMON', text: 'You seriously brought him?', t: 30.35, d: 1.5 },
  { who: 'POTATO', text: 'I brought myself!', t: 32.6, d: 1.2 },
  { who: 'LEMON', text: 'That was my concern.', t: 34.55, d: 1.1 },
  { who: 'PUMPKIN', text: "War ain't included in the lease!", t: 40.1, d: 2.0 },
  { who: 'STRAWBERRY', text: "Tomorrow they won't ask whether you're fruit…", t: 42.3, d: 2.5 },
  { who: 'STRAWBERRY', text: '…or vegetable.', t: 44.9, d: 1.05 },
  { who: 'STRAWBERRY', text: "They'll just ask…", t: 46.05, d: 1.25 },
  { who: 'STRAWBERRY', text: '…how you want to be cooked.', t: 48.35, d: 1.65 },
  { who: 'STRAWBERRY', text: 'So stay angry.', t: 55.0, d: 1.1 },
  { who: 'GERALD', text: "Technically, we don't.", t: 58.05, d: 1.25 },
  { who: 'GRAPE', text: 'SHUT UP, GERALD.', t: 59.3, d: .75 },
];
function speaking(T, who) {
  for (const l of LINES) if (l.who === who && T >= l.t && T <= l.t + l.d) return .35 + .65 * Math.abs(Math.sin((T - l.t) * 19)) * (.6 + .4 * Math.sin((T - l.t) * 7.3));
  return 0;
}
function captionAt(T) {
  for (const l of LINES) if (T >= l.t - .05 && T <= l.t + l.d + .25) return [l.text, inv(l.t - .05, l.t + .08, T) * (1 - inv(l.t + l.d + .1, l.t + l.d + .25, T))];
  return [null, 0];
}

// ---------------- shot list ----------------
const SHOTS = [];
function shot(t0, t1, draw, opt = {}) { SHOTS.push({ t0, t1, draw, ...opt }); }

// S01 — black, breathing
shot(0, 2, (ctx) => { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }, { noGrade: true });

// S02 — one eye opens
function soil(ctx, t) {
  ctx.fillStyle = '#0b0705'; ctx.fillRect(0, 0, W, H);
  const r = mulberry32(61); for (let i = 0; i < 900; i++) { ctx.fillStyle = `rgba(${60 + r() * 40 | 0},${40 + r() * 20 | 0},${30},${.4 + r() * .5})`; ctx.beginPath(); ctx.arc(r() * W, r() * H, .8 + r() * 3, 0, 7); ctx.fill(); }
}
shot(2, 5, (ctx, u, lt, T) => {
  soil(ctx, T);
  const thud = [2.6, 4.0].some(x => T > x && T < x + .25) ? 1 : 0;
  const [sx, sy] = shake(T, thud * 5, 30);
  ctx.save(); camera(ctx, { zoom: lerp(6.2, 6.6, u), cx: -38, cy: -206, rot: -1.38, sx, sy });
  const open = E.out(inv(.35, .75, u));
  strawberry(ctx, 0, 0, 1, { open: lerp(.02, .8, open), look: [.2, 0], squint: .25, ash: 1, halfShadow: .8 });
  ctx.restore();
  // moon blade across the eye
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(-.18);
  const g = ctx.createLinearGradient(0, -H, 0, H); g.addColorStop(0, 'rgba(0,0,0,.97)'); g.addColorStop(.43, 'rgba(0,0,0,.94)'); g.addColorStop(.49, 'rgba(10,20,50,.05)'); g.addColorStop(.53, 'rgba(10,20,50,.15)'); g.addColorStop(.6, 'rgba(0,0,0,.95)'); g.addColorStop(1, 'rgba(0,0,0,.98)');
  ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 2, H * 2); ctx.restore();
  grade(ctx, '#3a5a8c', 'soft-light', .6);
  particles(ctx, T, { seed: 9, n: 50, kind: 'ash', vx: 12, vy: 10, size: [2, 6] });
  // soil grains jumping on thuds
  if (thud) { const r = mulberry32(T * 100 | 0); for (let i = 0; i < 40; i++) { ctx.fillStyle = 'rgba(120,90,60,.8)'; ctx.fillRect(r() * W, H * .55 + r() * H * .4 - 12, 3, 3); } }
}, { fadeIn: .5 });

// S03 — "They're coming."
shot(5, 6.4, (ctx, u, lt, T) => {
  soil(ctx, T);
  const thud = T > 5.95 && T < 6.2 ? 1 : 0, [sx, sy] = shake(T, thud * 7, 30);
  ctx.save(); camera(ctx, { zoom: 5.4, cx: 4, cy: -158, rot: -1.38, sx, sy });
  strawberry(ctx, 0, 0, 1, { open: .8, squint: .25, ash: 1, halfShadow: .8, talk: speaking(T, 'STRAWBERRY') * .6 });
  ctx.restore();
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(-.18);
  const g = ctx.createLinearGradient(0, -H, 0, H); g.addColorStop(0, 'rgba(0,0,0,.97)'); g.addColorStop(.44, 'rgba(0,0,0,.9)'); g.addColorStop(.5, 'rgba(10,20,50,.05)'); g.addColorStop(.57, 'rgba(0,0,0,.94)'); g.addColorStop(1, 'rgba(0,0,0,.98)');
  ctx.fillStyle = g; ctx.fillRect(-W, -H, W * 2, H * 2); ctx.restore();
  grade(ctx, '#3a5a8c', 'soft-light', .6);
  particles(ctx, T, { seed: 9, n: 50, kind: 'ash', vx: 12, vy: 10, size: [2, 6] });
});
// title card 1
shot(6.4, 8.0, (ctx, u, lt) => {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const a = inv(0, .35, lt) * (1 - inv(1.35, 1.6, lt));
  cardText(ctx, 'WHEN THE FARM STOPS FEEDING YOU', a, { size: 58, spacing: 16, y: H / 2 });
  cardText(ctx, '. . .', a * inv(.45, .75, lt), { size: 40, spacing: 10, y: H / 2 + 62 });
}, { noGrade: true });

// S04 — orchard cities
shot(8.0, 12.0, (ctx, u, lt, T) => {
  const tremor = T > 11.6 ? 1 : 0, [sx, sy] = shake(T, tremor * 6, 26);
  ctx.save(); ctx.translate(sx, sy); orchardNight(ctx, T, E.io(u) * .9); ctx.restore();
  grade(ctx, '#1a2a50', 'soft-light', .35);
}, { fadeIn: 0 });

// S05 — shapes in the smoke
shot(12.0, 14.5, (ctx, u, lt, T) => {
  const beat = (T - 12) / .75, hit = (beat % 1) < .12 ? 1 : 0, [sx, sy] = shake(T, hit * 5, 30);
  ctx.save(); ctx.translate(sx, sy); camera(ctx, { zoom: lerp(1.0, 1.06, u) }); herdPlain(ctx, T, { march: beat }); ctx.restore();
});

// S06 — the old beef (sepia flashback block)
function warmAlley(ctx) {
  ctx.fillStyle = vgrad(ctx, 0, H, [[0, '#d8b080'], [.5, '#a07040'], [.6, '#5a3a20'], [1, '#2a1a0a']]); ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#7a4a2a' : '#6a3a20'; ctx.fillRect(i * 340, 200, 300, 400); ctx.fillStyle = i % 2 ? '#c84a2a' : '#3a7a3a'; ctx.beginPath(); ctx.moveTo(i * 340 - 10, 200); ctx.lineTo(i * 340 + 310, 200); ctx.lineTo(i * 340 + 290, 280); ctx.lineTo(i * 340 + 10, 280); ctx.fill(); }
  ctx.fillStyle = '#4a3020'; ctx.fillRect(0, 760, W, 320);
}
function crate(ctx, x, y, s, rot) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.fillStyle = '#9a6a3a'; ctx.fillRect(-60, -50, 120, 100); ctx.strokeStyle = '#5a3a1a'; ctx.lineWidth = 6; ctx.strokeRect(-60, -50, 120, 100); ctx.beginPath(); ctx.moveTo(-60, -50); ctx.lineTo(60, 50); ctx.stroke(); ctx.restore(); }
shot(14.5, 17.2, (ctx, u, lt, T) => {
  const [b, x] = buffer('flash');
  const sub = lt < .65 ? 0 : lt < 1.3 ? 1 : lt < 2.0 ? 2 : 3, st = lt - [0, .65, 1.3, 2.0][sub];
  if (sub === 0) {
    warmAlley(x);
    x.save(); camera(x, { zoom: 1.1, sx: Math.sin(T * 40) * 6 });
    crowdie(x, 700 + st * 60, 980, 1.6, 0, { roar: 1 }); crowdie(x, 1150 - st * 40, 990, 1.7, 8, { roar: 1 }); crowdie(x, 300, 1000, 1.3, 3, { roar: 1 }); crowdie(x, 1600, 1000, 1.3, 1, { roar: 1 });
    crate(x, 900 + st * 400, 500 - st * 300, 1.2, st * 6); crate(x, 400 - st * 300, 600 - st * 200, .9, -st * 5);
    x.restore();
  } else if (sub === 1) {
    warmAlley(x);
    tomato(x, 860, 1020, 1.6, { duck: E.out(inv(0, .3, st)) });
    crate(x, 900, 980, 2.6, 0);
    x.save(); x.translate(lerp(-200, 2200, st / .65), 300 + Math.sin(st * 5) * 40); x.rotate(st * 9); x.fillStyle = '#7aa04a'; x.beginPath(); x.arc(0, 0, 90, 0, 7); x.fill(); x.strokeStyle = '#4a7a2a'; x.lineWidth = 6; for (let k = 0; k < 4; k++) { x.beginPath(); x.arc(0, 0, 30 + k * 16, k, k + 2); x.stroke(); } x.restore();
  } else if (sub === 2) {
    warmAlley(x); x.fillStyle = '#6a4a2a'; x.fillRect(560, 700, 800, 60);
    corn(x, 760, 1180, 1.25, { young: true, open: .6, squint: .7, browAng: .4, armOut: .4 + Math.sin(st * 30) * .1, talk: .8 });
    watermelon(x, 1180, 1200, 1.0, { young: true, open: .7, browAng: .35, talk: .6 });
  } else {
    warmAlley(x); x.fillStyle = '#2a1a10'; x.fillRect(620, 120, 680, 900);
    broccoli(x, 960, 1150, 1.3, { slam: 1 });
    const close = E.in(inv(0, .45, st)); x.save(); x.translate(620, 0); x.scale(lerp(.05, 1.0, close), 1); x.fillStyle = '#3a3a40'; x.fillRect(0, 120, 680, 900); x.fillStyle = '#55555c'; x.fillRect(40, 160, 600, 820); x.restore();
  }
  // projector look
  const weave = [Math.sin(T * 50) * 3, Math.cos(T * 37) * 4];
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  drawBuf(ctx, b, 'sepia(.85) contrast(1.2) brightness(.85) saturate(1.3)', 1, weave[0], weave[1]);
  const r = mulberry32(T * 24 | 0); ctx.strokeStyle = 'rgba(255,240,210,.25)'; ctx.lineWidth = 1.5; for (let i = 0; i < 3; i++) { const lx = r() * W; ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx + r() * 10, H); ctx.stroke(); }
  grain(ctx, (T * 24 | 0) + 3, .25);
  if ([.0, .65, 1.3, 2.0].some(c => lt >= c && lt < c + 1 / 12)) { ctx.fillStyle = 'rgba(255,245,225,.85)'; ctx.fillRect(0, 0, W, H); }
}, { noGrade: true });

// S07 — the fence and the hoof
shot(17.2, 19.25, (ctx, u, lt, T) => {
  const impact = 19.25, k = inv(17.5, impact, T), hy = lerp(-300, 1000, E.in(k));
  const after = T > impact - .04, [sx, sy] = shake(T, after ? 30 : (k > .6 ? 3 : 0), 30);
  ctx.save(); ctx.translate(sx, sy);
  emberSky(ctx, 760, .9); smoke(ctx, T, { seed: 71, n: 18, y: 300, h: 500, color: 'rgb(50,28,20)', alpha: .5, size: [300, 600], vx: 20 });
  ctx.fillStyle = '#060404'; ctx.fillRect(0, 800, W, 300);
  // picket fence, moonlit
  for (let i = 0; i < 9; i++) { const fx = 80 + i * 150; ctx.fillStyle = '#c8ccd8'; ctx.beginPath(); ctx.moveTo(fx, 940); ctx.lineTo(fx, 600); ctx.lineTo(fx + 30, 560); ctx.lineTo(fx + 60, 600); ctx.lineTo(fx + 60, 940); ctx.fill(); ctx.fillStyle = 'rgba(40,50,80,.5)'; ctx.fillRect(fx + 36, 600, 24, 340); }
  ctx.fillStyle = '#b8bcc8'; ctx.fillRect(40, 660, 1340, 26); ctx.fillRect(40, 840, 1340, 26);
  ctx.fillStyle = '#8a6a4a'; ctx.fillRect(560, 420, 260, 110); ctx.fillStyle = '#e8dcc0'; ctx.fillRect(572, 432, 236, 86); ctx.fillStyle = 'rgba(60,90,40,.7)'; ctx.beginPath(); ctx.arc(690, 475, 26, 0, 7); ctx.fill();
  ctx.fillStyle = `rgba(0,0,0,${.7 * k})`; ctx.beginPath(); ctx.ellipse(1560, 1000, 200 + 200 * k, 30 + 20 * k, 0, 0, 7); ctx.fill();
  hoof(ctx, 1560, Math.min(hy, 1010), .95);
  if (after) { particles(ctx, T, { seed: 12, n: 120, kind: 'spark', x: 1200, y: 700, w: 700, h: 360, vx: 300, vy: -400, size: [2, 4] }); smoke(ctx, T, { seed: 73, n: 14, x: 1100, y: 700, w: 900, h: 300, color: 'rgb(70,50,40)', alpha: .8, size: [200, 400], vx: 60, vy: -60 }); }
  ctx.restore();
  grade(ctx, '#3a5a8c', 'soft-light', .25);
});

// ===== ACT THREE: THE ROOT CELLAR =====
function cellarLight(ctx, bx, by, a = .7) {
  const g = ctx.createRadialGradient(bx, by, 80, bx, by, 1300); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
// S08 — the map
shot(19.6, 22.4, (ctx, u, lt, T) => {
  const sw = Math.sin(T * 2.2) * .25 * (1 - u * .5);
  ctx.save(); camera(ctx, { zoom: lerp(1.0, 1.08, E.io(u)), cy: H / 2 + 110 });
  const [bx, by] = cellar(ctx, T, { swing: sw });
  // silhouettes of the others around the far side
  ctx.save(); ctx.filter = 'brightness(.28) contrast(1.2)';
  watermelon(ctx, 960, 760, .62); avocado(ctx, 560, 770, .6); corn(ctx, 1360, 770, .56, { launcher: 0 }); broccoli(ctx, 1640, 790, .55); lemon(ctx, 300, 790, .6, { notepad: 0 });
  ctx.restore();
  // strawberry approaches
  const wk = E.out(inv(0, .55, u)), sx = lerp(1080, 960, wk), ss = lerp(.7, 1.2, wk);
  const throwK = inv(.45, .7, u);
  strawberry(ctx, sx, lerp(760, 1060, wk), ss, { open: .7, squint: .3, ash: .5, halfShadow: .55, armL: [[-96, -165], [lerp(-130, -40, throwK), lerp(-80, -200, throwK)]] });
  cellarTable(ctx, 1010, { map: E.out(inv(.55, .85, u)) });
  ctx.restore();
  cellarLight(ctx, bx, by, .75);
  particles(ctx, T, { seed: 21, n: 70, kind: 'dust', vx: 6, vy: 4, size: [1, 2.5] });
}, { fadeIn: .25 });
// S09 — the undertaker and the lawyer (lateral dolly R→L)
shot(22.4, 25.2, (ctx, u, lt, T) => {
  const cx = lerp(1500, 560, E.io(u));
  ctx.save(); camera(ctx, { zoom: 1.5, cx, cy: 830 });
  const [bx, by] = cellar(ctx, T, { swing: Math.sin(T * 2.2) * .15 });
  watermelon(ctx, 1450, 1180, 1.05, { gloveOff: E.io(inv(.05, .45, u)), open: lerp(.55, .1, inv(.3, .36, u)) + lerp(0, .45, inv(.36, .42, u)) });
  avocado(ctx, 620, 1130, 1.1, { briefcase: 1, caseLid: 1 - E.out(inv(.62, .78, u)), look: [.1, -.1], browAng: .25 });
  ctx.restore();
  cellarLight(ctx, W / 2, 0, .7);
  particles(ctx, T, { seed: 22, n: 60, kind: 'dust', vx: 20, vy: 4, size: [1, 2.5] });
});
// S10 — the bondsman and the bouncer
shot(25.2, 28.0, (ctx, u, lt, T) => {
  const cx = lerp(1400, 520, E.io(u));
  ctx.save(); camera(ctx, { zoom: 1.45, cx, cy: 790 });
  cellar(ctx, T, { swing: Math.sin(T * 2.2) * .12 });
  const cylO = inv(.05, .15, u) * (1 - inv(.36, .42, u));
  corn(ctx, 1350, 1180, 1.0, { cyl: E.out(inv(.12, .36, u)) * 9, cylOpen: cylO, squint: .65, look: [.6, .3], armOut: .5 });
  const crack = inv(.62, .9, u);
  if (T > 27.1 && T < 27.3) { particles(ctx, T, { seed: 23, n: 50, kind: 'dust', x: 0, y: 0, w: W, h: 400, vx: 0, vy: 200, size: [2, 4] }); }
  broccoli(ctx, 520, 1160, 1.0, { fists: 1, crack, open: .4 });
  ctx.restore();
  cellarLight(ctx, W / 2, 0, .7);
  particles(ctx, T, { seed: 24, n: 60, kind: 'dust', vx: 20, vy: 10, size: [1, 2.5] });
});
// S11 — the dealer's coat
shot(28.0, 30.0, (ctx, u, lt, T) => {
  const z = 1.25 + E.out(inv(.15, .3, u)) * .12;
  ctx.save(); camera(ctx, { zoom: z, cy: 770 });
  cellar(ctx, T, { swing: Math.sin(T * 2.2) * .1 });
  chili(ctx, 960, 1120, 1.55, { coat: E.back(inv(.15, .35, u)), swing: T });
  ctx.restore();
  cellarLight(ctx, W / 2, 0, .6);
  if (u > .3 && u < .36) glow(ctx, 960, 620, 200, 'rgba(255,220,120,1)', .5);
});
// S12 — "You seriously brought him?"
shot(30.0, 32.2, (ctx, u, lt, T) => {
  ctx.save(); camera(ctx, { zoom: 1.6, cx: 1020, cy: 770 });
  cellar(ctx, T, { swing: .05 });
  lemon(ctx, 1080, 1130, 1.5, { over: E.io(inv(.1, .35, u)), talk: speaking(T, 'LEMON'), look: u > .75 ? [-.7, 0] : [0, 0], browAng: -.2 });
  ctx.restore();
  glow(ctx, 1500, 700, 600, 'rgba(255,170,80,1)', .18);
  // blurred strawberry shoulder in foreground
  const [b, x] = buffer('fg'); strawberry(x, 420, 1700, 3.2, { halfShadow: .7 }); drawBuf(ctx, b, 'blur(14px) brightness(.45)');
  cellarLight(ctx, 1100, 300, .55);
});
// S13 — "I brought myself."
shot(32.2, 35.8, (ctx, u, lt, T) => {
  const wp = E.out(inv(0, .1, u)), cx = lerp(1700, 960, wp);
  ctx.save(); camera(ctx, { zoom: 1.5, cx, cy: 760, rot: lerp(.05, 0, wp) });
  const [bx, by] = cellar(ctx, T, { swing: .05 });
  ctx.fillStyle = '#1a0f08'; ctx.fillRect(1240, 0, 70, H);
  const tw = T > 35.0 && T < 35.25 ? Math.sin((T - 35) * 60) : 0;
  potato(ctx, 960, 1080, 1.55, { fist: 1, talk: speaking(T, 'POTATO'), grin: T > 34.9 ? 1.0 : 1, twitch: tw, dots: 1, look: [0, -.2] });
  ctx.restore();
  cellarLight(ctx, 960, 200, .5);
  if (lt < .12) { ctx.save(); ctx.filter = 'blur(20px)'; ctx.globalAlpha = .4; ctx.drawImage(ctx.canvas, 60, 0); ctx.restore(); }
});
shot(35.8, 36.0, (ctx) => { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }, { noGrade: true });

// ===== ACT FOUR: WAR MONTAGE =====
function explosion(ctx, x, y, k, s = 1) {
  if (k <= 0 || k >= 1) return;
  const r = 200 + 900 * E.out(k) * s;
  glow(ctx, x, y, r * 1.4, 'rgba(255,120,30,1)', .9 * (1 - k));
  glow(ctx, x, y, r * .7, 'rgba(255,230,150,1)', 1 - k);
  smoke(ctx, k * 10, { seed: 91, n: 16, x: x - r, y: y - r, w: r * 2, h: r * 1.6, color: 'rgb(50,30,20)', alpha: .7 * k, size: [r * .4, r * .9], vx: 30, vy: -30 });
}
function burningStreet(ctx, t) {
  ctx.fillStyle = vgrad(ctx, 0, H, [[0, '#120604'], [.5, '#4a1808'], [.6, '#200a04'], [1, '#080302']]); ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 8; i++) { ctx.fillStyle = '#140806'; ctx.fillRect(i * 260 - 40, 220 + (i % 3) * 30, 230, 480); glow(ctx, i * 260 + 80, 640, 200, 'rgba(255,110,30,1)', .3 + .2 * Math.sin(t * 9 + i)); }
  ctx.fillStyle = '#0c0504'; ctx.fillRect(0, 700, W, 380);
}
shot(36.0, 38.0, (ctx, u, lt, T) => {
  const sub = lt < .7 ? 0 : lt < 1.35 ? 1 : 2, st = lt - [0, .7, 1.35][sub];
  if (sub === 0) {
    const [sx, sy] = shake(T, 12, 24);
    ctx.save(); ctx.translate(sx, sy); burningStreet(ctx, T); explosion(ctx, 600, 500, st / .7 + .15, 1.2);
    ctx.save(); ctx.translate(lerp(1500, 900, st / .7), 940); ctx.rotate(-.06); truck(ctx, 0, 0, 1.25, { wheelRot: T * 30 }); carrot(ctx, -300, -140, .45); ctx.restore();
    smoke(ctx, T, { seed: 93, n: 10, x: 900, y: 750, w: 1000, h: 300, color: 'rgb(80,60,50)', alpha: .5, size: [200, 400], vx: 400, vy: -20 });
    particles(ctx, T, { seed: 94, n: 90, kind: 'spark', vx: -300, vy: -100, size: [1.5, 3] });
    ctx.restore();
  } else if (sub === 1) {
    burningStreet(ctx, T);
    const sw = lerp(-.7, .7, E.io(st / .65));
    ctx.save(); ctx.translate(960, -100); ctx.rotate(sw); ctx.fillStyle = '#d8c8a0'; ctx.fillRect(-20, 0, 40, 600); ctx.fillStyle = '#c42a24'; for (let i = 0; i < 6; i++) ctx.fillRect(-20, i * 100, 40, 50); banana(ctx, 30, 1200, 1.0, { flap: 1 }); ctx.restore();
    particles(ctx, T, { seed: 95, n: 80, kind: 'ember', vx: 40, vy: -60 });
  } else {
    ctx.fillStyle = vgrad(ctx, 0, H, [[0, '#1a0a08'], [.6, '#3a1a10'], [1, '#100806']]); ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#2a1a12'; ctx.beginPath(); ctx.moveTo(0, 400); ctx.lineTo(W, 1080); ctx.lineTo(0, 1080); ctx.fill();
    for (let i = 0; i < 7; i++) { const k = st / .65, gx = lerp(200, 1300, k) + (i % 3) * 170 + Math.sin(i * 2) * 30, gy = lerp(500, 900, k) + Math.floor(i / 3) * 150; grape(ctx, gx, gy - 240, 2.2, { acc: GRAPE_ACC[i], spin: T * 12 + i, scream: 1 }); }
  }
  if ([0, .7, 1.35].some(c => lt >= c && lt < c + 1 / 24)) { ctx.fillStyle = 'rgba(255,240,220,.7)'; ctx.fillRect(0, 0, W, H); }
});
shot(38.0, 40.0, (ctx, u, lt, T) => {
  const sub = lt < .65 ? 0 : lt < 1.35 ? 1 : 2, st = lt - [0, .65, 1.35][sub];
  if (sub === 0) {
    const [sx, sy] = shake(T, 16, 24);
    ctx.save(); ctx.translate(sx, sy); burningStreet(ctx, T);
    broccoli(ctx, 960, 1120 + (1 - E.out(st / .65)) * 100, lerp(1.0, 1.35, st / .65), { slam: 1, open: .6 });
    for (let i = 0; i < 14; i++) { const r = mulberry32(i + 40), k = E.out(st / .65); ctx.save(); ctx.translate(960 + (r() - .5) * 2600 * k, 540 + (r() - .5) * 1400 * k); ctx.rotate(r() * 6 + k * 4); ctx.fillStyle = '#6a4a2a'; ctx.fillRect(-90, -16, 180 * (.4 + r()), 32); ctx.restore(); }
    ctx.restore();
  } else if (sub === 1) {
    ctx.fillStyle = vgrad(ctx, 0, H, [[0, '#9ac8f0'], [.55, '#f4e2b0'], [.56, '#c8a070'], [1, '#8a6a40']]); ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 5; i++) { ctx.fillStyle = '#7a5434'; ctx.fillRect(i * 140, 280 + i * 40, 130, 340); ctx.fillRect(W - 130 - i * 140, 280 + i * 40, 130, 340); }
    corn(ctx, 960, 760, .55, { squint: .8, look: [0, 0] });
    smoke(ctx, T, { seed: 97, n: 8, y: 600, h: 400, color: 'rgb(220,190,140)', alpha: .25, size: [200, 400], vx: 120, vy: 0 });
  } else {
    burningStreet(ctx, T); const [b, x] = buffer('bok'); burningStreet(x, T); explosion(x, 1300, 400, (st / .65) * .8 + .1, 1); explosion(x, 400, 300, (st / .65) * .7 + .25, .7);
    drawBuf(ctx, b, 'blur(16px)');
    avocado(ctx, 760, 1010, 1.4, { tie: 1, open: .6 });
  }
  if ([0, .65, 1.35].some(c => lt >= c && lt < c + 1 / 24)) { ctx.fillStyle = 'rgba(255,240,220,.7)'; ctx.fillRect(0, 0, W, H); }
});
// S16 — the landlord
shot(40.0, 42.2, (ctx, u, lt, T) => {
  const pound = Math.sin(T * 18) > .7 ? 1 : 0, [sx, sy] = shake(T, pound * 4, 30);
  ctx.save(); ctx.translate(sx, sy);
  ctx.fillStyle = '#3a1a12'; ctx.fillRect(0, 0, W, H);
  for (let r = 0; r < 30; r++) for (let c = 0; c < 22; c++) { ctx.fillStyle = (r + c) % 3 ? '#5a2a1a' : '#4a2216'; ctx.fillRect(c * 92 + (r % 2) * 46, r * 38, 88, 34); }
  ctx.fillStyle = '#2a1a10'; ctx.fillRect(1180, 80, 520, 1000); ctx.fillStyle = '#ffd9a0'; ctx.fillRect(1240, 140, 400, 520);
  ctx.save(); ctx.filter = 'blur(12px)'; for (let i = 0; i < 3; i++) { const hx = 1330 + i * 120, hy = 360 + Math.sin(T * 18 + i) * 20; ctx.fillStyle = 'rgba(40,20,10,.8)'; ctx.beginPath(); ctx.arc(hx, hy, 80, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(hx + 40, hy - 120 + Math.max(0, Math.sin(T * 18 + i)) * 40, 30, 0, 7); ctx.fill(); } ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fillRect(1240, 140, 400, 520);
  pumpkin(ctx, 860, 1040, 1.25, { keyTurn: Math.min(1, lt * 2), talk: speaking(T, 'PUMPKIN'), shout: speaking(T, 'PUMPKIN') > 0 ? 1 : 0, look: [.4, 0] });
  ctx.restore();
  glow(ctx, 700, 0, 900, 'rgba(255,150,40,1)', .25);
  grade(ctx, '#ff8a2a', 'soft-light', .25);
  particles(ctx, T, { seed: 98, n: 60, kind: 'ash', vx: 10, vy: 30 });
});
// S17 — "Tomorrow…"
shot(42.2, 44.85, (ctx, u, lt, T) => {
  ctx.save(); camera(ctx, { zoom: lerp(1.0, 1.08, u), cy: 560 });
  marketSquare(ctx, T);
  strawberry(ctx, 960, 960, 1.35, { open: .75, squint: .3, halfShadow: .6, talk: speaking(T, 'STRAWBERRY'), rimC: 'rgba(255,150,60,1)' });
  ctx.fillStyle = '#5a3a22'; ctx.fillRect(820, 960, 280, 120); ctx.strokeStyle = '#3a2412'; ctx.lineWidth = 6; ctx.strokeRect(820, 960, 280, 120);
  ctx.restore();
  grade(ctx, '#2a3a7a', 'soft-light', .3);
});
// S18 — Pork
shot(44.85, 45.95, (ctx, u, lt, T) => {
  ctx.save(); camera(ctx, { zoom: lerp(1.15, 1.0, u) });
  emberSky(ctx, 760); glow(ctx, W * .6, 700, 900, 'rgba(255,90,20,1)', .4);
  smoke(ctx, T, { seed: 101, n: 20, y: 200, h: 700, color: 'rgb(60,30,20)', alpha: .55, size: [300, 700], vx: 30 });
  for (let i = 0; i < 6; i++) boar(ctx, 200 + i * 320, 840 + (i % 2) * 30, .55, { t: T, brazier: i % 2, step: T * .9 + i * .3 });
  boar(ctx, lerp(-200, 40, u), 1380, 1.9, { t: T, brazier: 0, step: T * .9 });
  ctx.restore();
  particles(ctx, T, { seed: 102, n: 80, kind: 'ember', vx: 40, vy: -60 });
});
// S19 — Beef
shot(45.95, 47.35, (ctx, u, lt, T) => {
  const hk = E.io(inv(.2, .8, u)), [sx, sy] = shake(T, hk > .9 ? 4 : 1, 20);
  ctx.save(); ctx.translate(sx, sy);
  emberSky(ctx, 760, 1.1); glow(ctx, W / 2, 760, 1000, 'rgba(255,90,20,1)', .45);
  smoke(ctx, T, { seed: 103, n: 16, y: 300, h: 500, color: 'rgb(60,30,20)', alpha: .5, size: [300, 700], vx: 60, vy: -6 });
  ctx.fillStyle = '#040202'; ctx.beginPath(); ctx.moveTo(0, 900); ctx.quadraticCurveTo(W / 2, 760, W, 880); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
  glow(ctx, W / 2, 470, 1100, 'rgba(255,120,40,1)', .55);
  [[330, .78, 1], [1000, .9, 0], [1640, .74, 1]].forEach(([bx, bs, f]) => bull(ctx, bx, 930, bs, { t: T, horn: hk, flip: !!f }));
  ctx.restore();
  particles(ctx, T, { seed: 104, n: 70, kind: 'ember', vx: 80, vy: -40 });
});
// S20 — "…how you want to be cooked."
shot(47.35, 50.05, (ctx, u, lt, T) => {
  ctx.save(); camera(ctx, { zoom: lerp(2.3, 2.55, inv(.35, 1, u)), cx: 960, cy: 640 });
  marketSquare(ctx, T, { crowd: 0 });
  strawberry(ctx, 960, 960, 1.35, { open: .78, squint: .25, halfShadow: lerp(.6, .3, u), talk: speaking(T, 'STRAWBERRY'), rimC: 'rgba(255,150,60,1)' });
  ctx.restore();
  grade(ctx, '#2a3a7a', 'soft-light', .3);
});

// ===== ACT FIVE: THE GATHERING =====
shot(50.05, 52.3, (ctx, u, lt, T) => {
  const open = E.io(inv(.05, .75, u));
  ctx.save(); camera(ctx, { zoom: lerp(1.25, 1.0, E.out(u)), cy: lerp(620, 540, u) });
  dawnSky(ctx, T);
  army(ctx, T, { y0: 660, rows: 6, lit: 1 });
  godRays(ctx, W / 2, 560, .22 * open, T);
  // wall + gate doors swing inward (toward camera)
  ctx.fillStyle = '#2a1e14'; ctx.fillRect(0, 0, 560, H); ctx.fillRect(W - 560, 0, 560, H); ctx.fillRect(0, 0, W, 120);
  ctx.fillStyle = '#1e140c'; for (let i = 0; i < 12; i++) { ctx.fillRect(0, i * 90, 560, 6); ctx.fillRect(W - 560, i * 90, 560, 6); }
  for (const side of [-1, 1]) {
    const w = 400 * Math.cos(open * 1.35), ex = 960 + side * 400 * (1 - Math.cos(open * 1.35)) * 0 + side * 0;
    ctx.save(); ctx.translate(960 + side * 400, 120);
    ctx.fillStyle = '#4a321e'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-side * w, -open * 60); ctx.lineTo(-side * w, H + open * 60); ctx.lineTo(0, H); ctx.fill();
    ctx.strokeStyle = '#2a1a0e'; ctx.lineWidth = 8; for (let k = 1; k < 6; k++) { ctx.beginPath(); ctx.moveTo(-side * w * k / 6, -open * 60 * k / 6); ctx.lineTo(-side * w * k / 6, H); ctx.stroke(); }
    ctx.fillStyle = '#5a5a60'; ctx.fillRect(-side * w, 200, side * w, 20); ctx.fillRect(-side * w, 620, side * w, 20);
    ctx.restore();
  }
  ctx.restore();
  particles(ctx, T, { seed: 111, n: 120, kind: 'pollen', vx: 10, vy: -6, size: [1, 3] });
  grade(ctx, '#ffb060', 'soft-light', .2);
}, { open: true });
shot(52.3, 54.2, (ctx, u, lt, T) => {
  const cx = lerp(2400, 200, E.io(u));
  ctx.save(); camera(ctx, { zoom: 1.0, cx, cy: 540 });
  dawnSky(ctx, T); ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.restore();
  ctx.fillStyle = vgrad(ctx, 0, H, [[0, '#ffcf8a'], [.6, '#c88a4a'], [1, '#4a3018']]); ctx.fillRect(-400, 0, 3600, H);
  godRays(ctx, 1400, 300, .18, T);
  for (let i = 0; i < 8; i++) celery(ctx, 600 + i * 340, 1150, .9);
  for (let i = 0; i < 10; i++) blueberry(ctx, 2600 + i * 70, 1080, 1.4 + (i % 2) * .2);
  for (let i = 0; i < 4; i++) pineapple(ctx, 1500 + i * 300, 1150, .95);
  for (let i = 0; i < 3; i++) onion(ctx, 800 + i * 260, 1100, 1.4, T + i);
  pear(ctx, 300, 1100, 1.7, E.out(inv(.75, .95, u)));
  ctx.restore();
  particles(ctx, T, { seed: 112, n: 100, kind: 'pollen', vx: 30, vy: -6 });
  grade(ctx, '#ffb060', 'soft-light', .2);
}, { open: true });
shot(54.2, 56.4, (ctx, u, lt, T) => {
  const roar = T > 56.1 ? 1 : 0, [sx, sy] = shake(T, roar * 18, 28);
  const z = lerp(1.0, 2.1, E.io(inv(0, .8, u)));
  ctx.save(); ctx.translate(sx, sy); camera(ctx, { zoom: z, cx: 960, cy: lerp(620, 720, u) });
  dawnSky(ctx, T);
  army(ctx, T, { y0: 600, rows: 4, roar, spread: .8 });
  godRays(ctx, 960, 560, .2, T);
  // heroes flanking the aisle
  ctx.save(); ctx.filter = 'brightness(.85)';
  watermelon(ctx, 470, 1060, .62); corn(ctx, 640, 1060, .55); avocado(ctx, 780, 1060, .62);
  broccoli(ctx, 1460, 1060, .58, { slam: roar }); chili(ctx, 1300, 1060, .66); lemon(ctx, 1160, 1060, .66, { notepad: 0 });
  potato(ctx, 1640, 1070, .66, { roar, fist: 1 });
  ctx.restore();
  const wk = E.out(inv(0, .7, u));
  strawberry(ctx, 960, lerp(1000, 1060, wk), lerp(.65, .85, wk), { open: .8, squint: .2, halfShadow: 0, talk: speaking(T, 'STRAWBERRY'), mouthKind: roar ? 'shout' : 'flat' });
  ctx.restore();
  glow(ctx, 960, 600, 700, 'rgba(255,210,140,1)', .15);
  particles(ctx, T, { seed: 113, n: 100, kind: 'pollen', vx: 10, vy: -8 });
  grade(ctx, '#ffb060', 'soft-light', .22);
}, { open: true });

// S24 — title
shot(56.4, 58.05, (ctx, u, lt, T) => {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const hit = inv(0, .06, lt), [sx, sy] = shake(T, (1 - inv(0, .5, lt)) * 14, 30);
  ctx.save(); ctx.translate(sx, sy);
  titleMark(ctx, lt, 1);
  const words = ['FRUIT.', 'VEGETABLES.', 'BEEF.', 'PORK.'];
  ctx.font = '500 40px Oswald'; ctx.letterSpacing = '10px';
  let show = words.filter((w, i) => lt > .4 + i * .14);
  if (lt < .98) cardText(ctx, show.join('  '), 1, { size: 40, spacing: 10, y: 690, color: '#cfc6b8' });
  ctx.restore();
}, { noGrade: true, open: true });
function titleMark(ctx, lt, a) {
  ctx.save(); ctx.globalAlpha = a;
  ctx.font = '900 190px Cinzel'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.letterSpacing = '18px';
  const y = 470;
  ctx.shadowColor = 'rgba(255,90,30,.55)'; ctx.shadowBlur = 40 * (1 - inv(0, 1.2, lt)) + 8;
  const g = ctx.createLinearGradient(0, y - 100, 0, y + 100); g.addColorStop(0, '#f6efe2'); g.addColorStop(1, '#bdb2a0');
  ctx.fillStyle = g; ctx.fillText('ANGRY FRUIT', W / 2 + 9, y);
  ctx.shadowBlur = 0;
  // cracks
  ctx.globalCompositeOperation = 'destination-out'; ctx.strokeStyle = '#000'; ctx.lineWidth = 3;
  const r = mulberry32(5); for (let i = 0; i < 16; i++) { let x = 300 + r() * 1320, yy = y - 90 + r() * 180; ctx.beginPath(); ctx.moveTo(x, yy); for (let k = 0; k < 4; k++) { x += (r() - .5) * 60; yy += (r() - .3) * 40; ctx.lineTo(x, yy); } ctx.stroke(); }
  ctx.restore();
  particles(ctx, lt, { seed: 7, n: 40, kind: 'ember', x: 300, y: 300, w: 1320, h: 300, vx: 20, vy: -60, size: [1, 2], alpha: (1 - inv(.5, 1.6, lt)) });
}
// S25 — Gerald (tagline holds, then darkness)
shot(58.05, 60.0, (ctx, u, lt, T) => {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  titleMark(ctx, 2 + lt, 1 - inv(.2, .9, lt));
  cardText(ctx, 'EVERYBODY HAS BEEF.', (1 - inv(.7, 1.2, lt)), { size: 64, spacing: 18, y: 690, color: '#efe6d6', weight: 700 });
}, { noGrade: true, open: true });
// EVERYBODY HAS BEEF reveal at the end of S24
SHOTS[SHOTS.length - 2].post = (ctx, lt) => { if (lt > .98) cardText(ctx, 'EVERYBODY HAS BEEF.', inv(.98, 1.1, lt), { size: 64, spacing: 18, y: 690, color: '#efe6d6', weight: 700 }); };

// ---------------- frame renderer ----------------
function renderFrame(ctx, T, frame) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  let s = SHOTS.find(q => T >= q.t0 && T < q.t1) || SHOTS[SHOTS.length - 1];
  if (T < 19.6 && T >= 19.25) s = { t0: 19.25, t1: 19.6, draw: c => { c.fillStyle = '#000'; c.fillRect(0, 0, W, H); }, noGrade: true };
  const lt = T - s.t0, u = clamp(lt / (s.t1 - s.t0));
  ctx.save(); s.draw(ctx, u, lt, T, frame); ctx.restore();
  if (s.post) s.post(ctx, lt);
  if (!s.noGrade) { vignette(ctx, .75); grain(ctx, frame, .08); }
  else grain(ctx, frame, .05);
  if (s.fadeIn && lt < s.fadeIn) { ctx.fillStyle = `rgba(0,0,0,${1 - lt / s.fadeIn})`; ctx.fillRect(0, 0, W, H); }
  // letterbox: 2.39 through the teaser, opens to 16:9 on the gates
  const lb = T < 50.05 ? 1 : 1 - E.io(inv(50.05, 51.0, T));
  letterbox(ctx, lb);
  const [cap, ca] = captionAt(T);
  caption(ctx, cap, ca, lb);
}
