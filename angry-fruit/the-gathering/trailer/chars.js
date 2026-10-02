// ANGRY FRUIT — the cast. Local space: origin at feet, up is -y. Strawberry ≈ 320 units tall.

// ---------- shared anatomy ----------
// eye: o = {open 0..1, look [x,y], iris, size, lid (skin color), squint, white}
function eye(ctx, x, y, o = {}) {
  const { r = 20, open = 1, look = [0, 0], iris = '#e09a2a', lid = '#a01028', squint = 0, tilt = 0, glint = 1 } = o;
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
  const ry = r * .82;
  // socket shadow
  glow(ctx, 0, 2, r * 1.9, 'rgba(0,0,0,.55)', 1, 'source-over');
  ctx.beginPath(); ctx.ellipse(0, 0, r, ry, 0, 0, 7); ctx.save(); ctx.clip();
  ctx.fillStyle = '#f2ece2'; ctx.fillRect(-r, -ry, r * 2, ry * 2);
  const ix = look[0] * r * .35, iy = look[1] * r * .3;
  const g = ctx.createRadialGradient(ix - r * .15, iy - r * .15, 1, ix, iy, r * .62);
  g.addColorStop(0, '#ffe0a0'); g.addColorStop(.45, iris); g.addColorStop(1, '#2a1404');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ix, iy, r * .6, 0, 7); ctx.fill();
  ctx.fillStyle = '#080404'; ctx.beginPath(); ctx.arc(ix, iy, r * .27, 0, 7); ctx.fill();
  // upper eyeball shadow
  ctx.fillStyle = 'rgba(40,10,10,.35)'; ctx.fillRect(-r, -ry, r * 2, ry * .55);
  // lids
  const top = lerp(ry * 1.05, -ry * 1.05, open) - squint * ry * .35;
  ctx.fillStyle = lid;
  ctx.beginPath(); ctx.moveTo(-r - 2, -ry - 2); ctx.lineTo(r + 2, -ry - 2); ctx.lineTo(r + 2, top + ry * .2);
  ctx.quadraticCurveTo(0, top - ry * .25, -r - 2, top + ry * .2); ctx.fill();
  const bot = ry - squint * ry * .45;
  ctx.beginPath(); ctx.moveTo(-r - 2, ry + 2); ctx.lineTo(r + 2, ry + 2); ctx.lineTo(r + 2, bot); ctx.quadraticCurveTo(0, bot + ry * .2, -r - 2, bot); ctx.fill();
  ctx.restore();
  // lid line
  ctx.strokeStyle = 'rgba(20,0,0,.6)'; ctx.lineWidth = r * .14;
  ctx.beginPath(); ctx.moveTo(-r, lerp(ry, -ry, open) * .9 - squint * ry * .3); ctx.quadraticCurveTo(0, lerp(ry, -ry, open) * 1.25 - squint * ry * .3, r, lerp(ry, -ry, open) * .9 - squint * ry * .3); ctx.stroke();
  if (open > .25 && glint) {
    ctx.fillStyle = `rgba(255,255,255,${.9 * glint})`;
    ctx.beginPath(); ctx.arc(look[0] * r * .35 - r * .2, look[1] * r * .3 - r * .22, r * .13, 0, 7); ctx.fill();
  }
  ctx.restore();
}
function brow(ctx, x, y, w, ang, color, thick = 9) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(-w / 2, thick * .2); ctx.quadraticCurveTo(0, -thick * 1.1, w / 2, -thick * .1);
  ctx.quadraticCurveTo(0, thick * .55, -w / 2, thick * .2); ctx.fill();
  ctx.restore();
}
// mouth: kind 'flat' | 'frown' | 'grin' | 'open' | 'smile' | 'shout'; talk 0..1
function mouth(ctx, x, y, w, kind, color, talk = 0) {
  ctx.save(); ctx.translate(x, y);
  ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.lineWidth = Math.max(3, w * .09);
  if (kind === 'grin' || kind === 'smile') {
    ctx.fillStyle = '#2a0808';
    ctx.beginPath(); ctx.moveTo(-w / 2, -w * .05); ctx.quadraticCurveTo(0, w * (kind === 'grin' ? .55 : .3), w / 2, -w * .05);
    ctx.quadraticCurveTo(0, w * .08, -w / 2, -w * .05); ctx.fill();
    if (kind === 'grin') { ctx.fillStyle = '#f5efe0'; ctx.beginPath(); ctx.moveTo(-w * .45, -w * .02); ctx.quadraticCurveTo(0, w * .2, w * .45, -w * .02); ctx.quadraticCurveTo(0, w * .08, -w * .45, -w * .02); ctx.fill(); }
  } else if (kind === 'shout' || talk > .05) {
    const o = kind === 'shout' ? .55 : talk * .35;
    ctx.fillStyle = '#1a0505';
    ctx.beginPath(); ctx.ellipse(0, w * o * .3, w * (kind === 'shout' ? .42 : .3), w * o * .6 + 2, 0, 0, 7); ctx.fill();
    if (kind === 'shout') { ctx.fillStyle = '#efe6d6'; ctx.fillRect(-w * .3, -w * .02, w * .6, w * .08); }
  } else {
    const c = kind === 'frown' ? -w * .12 : kind === 'flat' ? 0 : w * .1;
    ctx.beginPath(); ctx.moveTo(-w / 2, w * .04); ctx.quadraticCurveTo(0, c, w / 2, w * .04); ctx.stroke();
  }
  ctx.restore();
}
// two-bone limb from a to b with bend
function limb(ctx, a, b, bend, w1, c1, w2 = w1, c2 = c1) {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
  const ex = mx + (-dy / L) * bend, ey = my + (dx / L) * bend;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = c1; ctx.lineWidth = w1; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(ex, ey); ctx.stroke();
  ctx.strokeStyle = c2; ctx.lineWidth = w2; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(b[0], b[1]); ctx.stroke();
  return [ex, ey];
}
function hand(ctx, x, y, r, color, o = {}) {
  const { fist = false, fingertips = null, ang = 0 } = o;
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(0, 0, r, r * .9, 0, 0, 7); ctx.fill();
  if (!fist) for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.ellipse(-r * .55 + i * r * .55, r * .95, r * .24, r * .45, 0, 0, 7); ctx.fill();
    if (fingertips) { ctx.fillStyle = fingertips; ctx.beginPath(); ctx.ellipse(-r * .55 + i * r * .55, r * 1.3, r * .2, r * .18, 0, 0, 7); ctx.fill(); ctx.fillStyle = color; }
  }
  else { ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 2; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-r * .5 + i * r * .5, r * .2); ctx.lineTo(-r * .5 + i * r * .5, r * .8); ctx.stroke(); } }
  ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.beginPath(); ctx.ellipse(-r * .3, -r * .3, r * .4, r * .25, -.5, 0, 7); ctx.fill();
  ctx.restore();
}
function boot(ctx, x, y, w, color) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(x + w * .12, y - w * .22, w * .62, w * .32, 0, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(x - w * .5, y - w * .06, w * 1.25, w * .12);
}
function shade(ctx, path, light = [-.4, -.6], k = .55) {
  // overlay soft form shading inside a path; light direction in unit space
  ctx.save(); ctx.clip(path);
  const b = path._b; // [x,y,w,h]
  const g = ctx.createLinearGradient(b[0] + b[2] * (.5 + light[0] * .5), b[1] + b[3] * (.5 + light[1] * .5), b[0] + b[2] * (.5 - light[0] * .5), b[1] + b[3] * (.5 - light[1] * .5));
  g.addColorStop(0, 'rgba(255,255,255,.18)'); g.addColorStop(.5, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${k})`);
  ctx.fillStyle = g; ctx.fillRect(b[0] - 10, b[1] - 10, b[2] + 20, b[3] + 20);
  ctx.restore();
}
function P(b) { const p = new Path2D(); p._b = b; return p; }

// rim light: redraw a path offset, clipped, in light color
function rim(ctx, path, color, dx, dy, a = 1, width = 10) {
  ctx.save(); ctx.clip(path); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a;
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.filter = 'blur(4px)';
  ctx.translate(dx, dy); ctx.stroke(path); ctx.restore();
}

// ======================= STRAWBERRY =======================
const _berry = (() => {
  const p = P([-112, -300, 224, 250]);
  p.moveTo(0, -292); p.bezierCurveTo(70, -302, 114, -262, 109, -205);
  p.bezierCurveTo(104, -140, 52, -74, 0, -50); p.bezierCurveTo(-52, -74, -104, -140, -109, -205);
  p.bezierCurveTo(-114, -262, -70, -302, 0, -292); p.closePath(); return p;
})();
const _berrySeeds = (() => {
  const s = [], c = mkCanvas(10, 10).getContext('2d');
  for (let row = 0, y = -282; y < -58; y += 17, row++)
    for (let x = -112 + (row % 2) * 11; x < 112; x += 22) {
      if (!c.isPointInPath(_berry, x, y)) continue;
      if (Math.hypot(x - 38, y - 206) < 30 || Math.hypot(x + 38, y - 206) < 30) continue; // eyes
      if (Math.abs(x) < 34 && Math.abs(y + 150) < 16) continue; // mouth
      s.push([x + Math.sin(row * 3.1 + x) * 2, y + Math.cos(x * .7) * 2]);
    }
  return s;
})();
const SCAR = [38, -238];
function strawberry(ctx, x, y, s, o = {}) {
  const { open = 1, look = [0, 0], talk = 0, mouthKind = 'flat', squint = .15, halfShadow = .55, ash = 0,
    pose = 'stand', armL = null, armR = null, lean = 0, bandolier = true, key = [-.5, -.7], rimC = null, browAng = .16 } = o;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(lean);
  const skin = '#b3122e';
  // legs
  limb(ctx, [-30, -60], [-36, -6], -6, 30, '#2b2a2c');
  limb(ctx, [30, -60], [36, -6], 6, 30, '#2b2a2c');
  boot(ctx, -40, 0, 46, '#4a2f1d'); boot(ctx, 36, 0, 46, '#4a2f1d');
  // back arm (viewer right)
  const aR = armR || [[96, -165], [118, -80]];
  limb(ctx, aR[0], aR[1], 14, 30, '#4d4c30', 24, '#4d4c30');
  hand(ctx, aR[1][0], aR[1][1] + 6, 15, '#141414', { fingertips: '#4f7a2a' });
  // berry
  const g = ctx.createRadialGradient(-40, -235, 10, -10, -190, 190);
  g.addColorStop(0, '#f2445c'); g.addColorStop(.35, '#c81a36'); g.addColorStop(.8, skin); g.addColorStop(1, '#4e0412');
  ctx.fillStyle = g; ctx.fill(_berry);
  // seeds
  ctx.save(); ctx.clip(_berry);
  for (const [sx, sy] of _berrySeeds) {
    ctx.fillStyle = 'rgba(70,0,12,.55)'; ctx.beginPath(); ctx.ellipse(sx, sy + 1, 4.6, 6, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#e8c04a'; ctx.beginPath(); ctx.ellipse(sx, sy, 2.6, 4, sx * .004, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,250,210,.8)'; ctx.fillRect(sx - 1, sy - 2.5, 1.3, 1.3);
  }
  // scar: missing seed above LEFT eye (viewer right)
  ctx.fillStyle = 'rgba(70,0,12,.7)'; ctx.beginPath(); ctx.ellipse(SCAR[0], SCAR[1], 5.5, 7, 0, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(255,190,190,.55)'; ctx.beginPath(); ctx.ellipse(SCAR[0], SCAR[1] + 1, 3.2, 4.6, 0, 0, 7); ctx.fill();
  // gloss
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = 'rgba(255,200,210,.22)'; ctx.beginPath(); ctx.ellipse(-55, -248, 30, 14, -.6, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(-62, -252, 9, 4, -.6, 0, 7); ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  // ash streaks
  if (ash > 0) {
    ctx.globalAlpha = ash; ctx.strokeStyle = 'rgba(60,55,55,.55)'; ctx.lineCap = 'round';
    [[-80, -260, -20, -175, 14], [10, -280, 70, -190, 9], [-30, -150, 40, -110, 12], [60, -250, 90, -170, 7]].forEach(([a, b, c, d, w]) => { ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(a, b); ctx.quadraticCurveTo((a + c) / 2 + 10, (b + d) / 2, c, d); ctx.stroke(); });
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  // face
  const lidC = '#9c0f27';
  eye(ctx, -38, -206, { r: 21, open, look, iris: '#d9921f', lid: lidC, squint });
  eye(ctx, 38, -206, { r: 21, open: open * (1 - squint * .4), look, iris: '#d9921f', lid: lidC, squint: squint + .1 });
  brow(ctx, -38, -236, 50, browAng, '#6e0718', 10); brow(ctx, 38, -236, 50, -browAng, '#6e0718', 10);
  mouth(ctx, 0, -150, 40, mouthKind, '#5a0412', talk);
  // jacket
  const jk = new Path2D();
  jk.moveTo(-104, -180); jk.quadraticCurveTo(-100, -110, -84, -44); jk.lineTo(84, -44); jk.quadraticCurveTo(100, -110, 104, -180);
  jk.quadraticCurveTo(60, -170, 26, -128); jk.lineTo(0, -100); jk.lineTo(-26, -128); jk.quadraticCurveTo(-60, -170, -104, -180); jk.closePath();
  const jg = ctx.createLinearGradient(-100, -180, 100, -40); jg.addColorStop(0, '#6b6a44'); jg.addColorStop(.6, '#5b5a3a'); jg.addColorStop(1, '#33321f');
  ctx.fillStyle = jg; ctx.fill(jk);
  ctx.save(); ctx.clip(jk);
  ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -100); ctx.lineTo(0, -44); ctx.stroke();
  // pockets + patches
  ctx.fillStyle = '#4b4a2e'; ctx.fillRect(-74, -92, 44, 30); ctx.fillRect(30, -92, 44, 30);
  ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(220,210,160,.5)'; ctx.lineWidth = 1.5;
  ctx.fillStyle = '#7a2a1c'; ctx.beginPath(); ctx.arc(-60, -140, 11, 0, 7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#2c3b52'; ctx.fillRect(48, -148, 22, 16); ctx.strokeRect(48, -148, 22, 16);
  ctx.setLineDash([]);
  ctx.restore();
  // collar
  ctx.fillStyle = '#6f6e47';
  ctx.beginPath(); ctx.moveTo(-104, -180); ctx.quadraticCurveTo(-60, -176, -26, -128); ctx.lineTo(-44, -150); ctx.quadraticCurveTo(-70, -175, -104, -180); ctx.fill();
  ctx.beginPath(); ctx.moveTo(104, -180); ctx.quadraticCurveTo(60, -176, 26, -128); ctx.lineTo(44, -150); ctx.quadraticCurveTo(70, -175, 104, -180); ctx.fill();
  // mic on LEFT collar (viewer right)
  ctx.fillStyle = '#c9cbd0'; ctx.beginPath(); ctx.roundRect(46, -166, 10, 20, 5); ctx.fill();
  ctx.fillStyle = '#555'; ctx.fillRect(47, -158, 8, 2);
  if (bandolier) {
    ctx.save(); ctx.strokeStyle = '#8a7a52'; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(-86, -172); ctx.lineTo(70, -50); ctx.stroke();
    const cols = ['#d33', '#e8c33a', '#3a7bd5', '#ddd'];
    for (let i = 0; i < 8; i++) { const px = -74 + i * 18, py = -162 + i * 14; ctx.fillStyle = cols[i % 4]; ctx.beginPath(); ctx.arc(px, py, 3.4, 0, 7); ctx.fill(); }
    ctx.fillStyle = '#5a3c22'; ctx.beginPath(); ctx.arc(30, -82, 12, 0, 7); ctx.fill();
    ctx.fillStyle = '#c4121e'; ctx.beginPath(); ctx.arc(30, -82, 9, 0, 7); ctx.fill();
    ctx.strokeStyle = '#c4121e'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(38, -78); ctx.quadraticCurveTo(60, -60, 50, -30); ctx.stroke();
    ctx.restore();
  }
  // calyx crown
  const leaves = 8;
  for (let i = 0; i < leaves; i++) {
    const a = -Math.PI / 2 + (i - (leaves - 1) / 2) * .36, L = 46 + (i % 2) * 14;
    ctx.save(); ctx.translate(0, -290); ctx.rotate(a + Math.PI / 2);
    const lg = ctx.createLinearGradient(0, 0, 0, -L); lg.addColorStop(0, '#24521a'); lg.addColorStop(1, '#5aa83a');
    ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(-11, 0); ctx.quadraticCurveTo(-8, -L * .6, 0, -L); ctx.quadraticCurveTo(8, -L * .6, 11, 0); ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = '#2f5e1f'; ctx.beginPath(); ctx.ellipse(0, -292, 22, 8, 0, 0, 7); ctx.fill();
  // front arm (viewer left)
  const aL = armL || [[-96, -165], [-120, -80]];
  limb(ctx, aL[0], aL[1], -14, 30, '#5b5a3a', 24, '#5b5a3a');
  hand(ctx, aL[1][0], aL[1][1] + 6, 15, '#141414', { fingertips: '#4f7a2a' });
  // lighting: key + half shadow on viewer right
  if (halfShadow > 0) {
    ctx.save(); ctx.clip(_berry);
    const hs = ctx.createLinearGradient(-20, 0, 70, 0); hs.addColorStop(0, 'rgba(0,0,0,0)'); hs.addColorStop(1, `rgba(0,0,0,${halfShadow})`);
    ctx.fillStyle = hs; ctx.fillRect(-200, -360, 400, 380); ctx.restore();
  }
  if (rimC) rim(ctx, _berry, rimC, -6, 4, .9, 12);
  ctx.restore();
}

// ======================= WATERMELON =======================
function watermelon(ctx, x, y, s, o = {}) {
  const { open = .55, glove = 1, gloveOff = 0, talk = 0, look = [0, 0], young = false, browAng = 0 } = o;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  limb(ctx, [-40, -70], [-44, -6], -4, 36, '#111'); limb(ctx, [40, -70], [44, -6], 4, 36, '#111');
  boot(ctx, -48, 0, 54, '#0c0c0c'); boot(ctx, 42, 0, 54, '#0c0c0c');
  const body = P([-150, -520, 300, 460]); body.ellipse(0, -290, 150, 230, 0, 0, 7);
  const g = ctx.createRadialGradient(-50, -380, 20, 0, -290, 260); g.addColorStop(0, '#3f7a45'); g.addColorStop(.6, '#1f4d2b'); g.addColorStop(1, '#0a1f10');
  ctx.fillStyle = g; ctx.fill(body);
  ctx.save(); ctx.clip(body);
  for (let i = -6; i <= 6; i++) { // vertical stripes
    ctx.strokeStyle = 'rgba(170,215,120,.35)'; ctx.lineWidth = 9;
    ctx.beginPath(); for (let k = 0; k <= 30; k++) { const yy = -520 + k * 16; const xx = i * 24 * (1 - Math.pow((yy + 290) / 240, 2) * .35) + Math.sin(k * .9 + i) * 3; k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke();
  }
  if (!young) { glow(ctx, -120, -400, 70, 'rgba(200,205,210,.35)', 1, 'source-over'); glow(ctx, 120, -400, 70, 'rgba(200,205,210,.35)', 1, 'source-over'); }
  ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.ellipse(-60, -440, 40, 18, -.5, 0, 7); ctx.fill();
  // suit
  const sp = new Path2D(); sp.moveTo(-150, -300); sp.lineTo(150, -300); sp.lineTo(150, -40); sp.lineTo(-150, -40); sp.closePath();
  ctx.fillStyle = '#121214'; ctx.fill(sp);
  ctx.fillStyle = '#f1efe9'; ctx.beginPath(); ctx.moveTo(-34, -300); ctx.lineTo(34, -300); ctx.lineTo(0, -200); ctx.fill();
  ctx.fillStyle = '#050505'; ctx.beginPath(); ctx.moveTo(-8, -298); ctx.lineTo(8, -298); ctx.lineTo(12, -210); ctx.lineTo(0, -196); ctx.lineTo(-12, -210); ctx.fill();
  ctx.fillStyle = '#c8cbd0'; ctx.fillRect(-14, -255, 28, 4);
  ctx.fillStyle = '#1e1e22'; ctx.beginPath(); ctx.moveTo(-60, -300); ctx.lineTo(-34, -300); ctx.lineTo(0, -195); ctx.lineTo(-20, -120); ctx.fill();
  ctx.beginPath(); ctx.moveTo(60, -300); ctx.lineTo(34, -300); ctx.lineTo(0, -195); ctx.lineTo(20, -120); ctx.fill();
  ctx.strokeStyle = '#b9bcc2'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-50, -170); ctx.quadraticCurveTo(-20, -140, 10, -165); ctx.stroke();
  ctx.restore();
  // measuring tape
  ctx.fillStyle = '#e6c84a';
  ctx.beginPath(); ctx.moveTo(-70, -310); ctx.lineTo(-52, -310); ctx.lineTo(-62, -150); ctx.lineTo(-80, -152); ctx.fill();
  ctx.beginPath(); ctx.moveTo(70, -310); ctx.lineTo(52, -310); ctx.lineTo(66, -170); ctx.lineTo(84, -172); ctx.fill();
  ctx.fillStyle = '#222'; for (let i = 0; i < 9; i++) { ctx.fillRect(-72 + i * .9, -300 + i * 17, 6, 1.5); ctx.fillRect(56 + i * 1.4, -300 + i * 15, 6, 1.5); }
  // face
  eye(ctx, -45, -380, { r: 22, open, look, iris: '#6b4a2a', lid: '#1c4527' });
  eye(ctx, 45, -380, { r: 22, open, look, iris: '#6b4a2a', lid: '#1c4527' });
  brow(ctx, -45, -412, 48, browAng, '#0d2a14', 9); brow(ctx, 45, -412, 48, -browAng, '#0d2a14', 9);
  mouth(ctx, 0, -330, 46, 'flat', '#0a1f10', talk);
  // arms + gloves
  limb(ctx, [-140, -270], [-60, -120], -30, 34, '#121214', 30, '#121214');
  limb(ctx, [140, -270], [70, -130], 30, 34, '#121214', 30, '#121214');
  hand(ctx, 70, -125, 18, glove ? '#050505' : '#3c7a3a', { ang: -.3 });
  const gx = lerp(-60, -60 - 140, gloveOff), gy = lerp(-120, -60, gloveOff);
  if (gloveOff > 0) { hand(ctx, -60, -118, 18, '#3c7a3a', { ang: .3 }); }
  hand(ctx, gx, gy, 18, '#050505', { ang: .3 + gloveOff * 1.2 });
  ctx.restore();
}

// ======================= AVOCADO =======================
const _avoTex = (() => { const r = mulberry32(55), a = []; for (let i = 0; i < 420; i++) a.push([(r() - .5) * 260, -420 + r() * 400, 1 + r() * 2.6, r()]); return a; })();
function avocado(ctx, x, y, s, o = {}) {
  const { open = .8, look = [0, 0], tie = 0, talk = 0, briefcase = 0, caseLid = 0, browAng = .2 } = o;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  limb(ctx, [-30, -60], [-34, -6], -4, 30, '#2c2c30'); limb(ctx, [30, -60], [34, -6], 4, 30, '#2c2c30');
  boot(ctx, -38, 0, 44, '#120d0a'); boot(ctx, 34, 0, 44, '#120d0a');
  const body = P([-130, -400, 260, 360]);
  body.moveTo(0, -392); body.bezierCurveTo(60, -392, 78, -320, 92, -250); body.bezierCurveTo(130, -150, 120, -50, 0, -46);
  body.bezierCurveTo(-120, -50, -130, -150, -92, -250); body.bezierCurveTo(-78, -320, -60, -392, 0, -392);
  const g = ctx.createRadialGradient(-30, -300, 10, 0, -220, 220); g.addColorStop(0, '#4c5a30'); g.addColorStop(.6, '#2e3b1f'); g.addColorStop(1, '#0f140a');
  ctx.fillStyle = g; ctx.fill(body);
  ctx.save(); ctx.clip(body);
  for (const [tx, ty, r, v] of _avoTex) { ctx.fillStyle = v > .5 ? 'rgba(120,140,80,.25)' : 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.arc(tx, ty, r, 0, 7); ctx.fill(); }
  // suit
  const st = new Path2D(); st.rect(-140, -230, 280, 190);
  ctx.fillStyle = '#3a3b40'; ctx.fill(st);
  ctx.strokeStyle = 'rgba(200,200,210,.12)'; ctx.lineWidth = 1.2; for (let i = -140; i < 140; i += 9) { ctx.beginPath(); ctx.moveTo(i, -230); ctx.lineTo(i, -40); ctx.stroke(); }
  ctx.fillStyle = '#ece8e0'; ctx.beginPath(); ctx.moveTo(-28, -232); ctx.lineTo(28, -232); ctx.lineTo(0, -150); ctx.fill();
  ctx.save(); ctx.translate(0, -230); ctx.rotate(tie * .25);
  ctx.fillStyle = '#6e1424'; ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(9, 0); ctx.lineTo(13, 90); ctx.lineTo(0, 108); ctx.lineTo(-13, 90); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(-3, 6, 3, 80); ctx.restore();
  ctx.fillStyle = '#2a2b30'; ctx.beginPath(); ctx.moveTo(-60, -232); ctx.lineTo(-28, -232); ctx.lineTo(0, -150); ctx.lineTo(-18, -80); ctx.fill();
  ctx.beginPath(); ctx.moveTo(60, -232); ctx.lineTo(28, -232); ctx.lineTo(0, -150); ctx.lineTo(18, -80); ctx.fill();
  ctx.restore();
  // face + gold rimless glasses
  eye(ctx, -32, -310, { r: 17, open, look, iris: '#4a3a1a', lid: '#26311a', squint: .35 });
  eye(ctx, 32, -310, { r: 17, open, look, iris: '#4a3a1a', lid: '#26311a', squint: .35 });
  brow(ctx, -32, -336, 40, browAng, '#10160a', 8); brow(ctx, 32, -336, 40, -browAng, '#10160a', 8);
  ctx.strokeStyle = 'rgba(232,190,90,.9)'; ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.ellipse(-32, -308, 26, 18, 0, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.ellipse(32, -308, 26, 18, 0, 0, 7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-6, -312); ctx.lineTo(6, -312); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.beginPath(); ctx.ellipse(-40, -316, 10, 4, -.4, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(24, -316, 10, 4, -.4, 0, 7); ctx.fill();
  mouth(ctx, 0, -262, 30, 'flat', '#0c1006', talk);
  // arms
  const hy = -150 - tie * 60;
  limb(ctx, [-110, -210], tie ? [-14, -210 + tie * 0] : [-120, -110], -20, 26, '#3a3b40');
  limb(ctx, [110, -210], tie ? [14, -215] : [120, -110], 20, 26, '#3a3b40');
  if (tie) { hand(ctx, -14, -212, 13, '#2e3b1f', { fist: true }); hand(ctx, 14, -218, 13, '#2e3b1f', { fist: true }); ctx.fillStyle = '#e7c35a'; ctx.fillRect(-26, -205, 6, 6); ctx.fillRect(20, -210, 6, 6); }
  else { hand(ctx, -120, -104, 13, '#2e3b1f'); hand(ctx, 120, -104, 13, '#2e3b1f'); }
  if (briefcase) {
    ctx.save(); ctx.translate(150, -40);
    const cg = ctx.createLinearGradient(-70, -90, 70, 0); cg.addColorStop(0, '#d9dde2'); cg.addColorStop(.5, '#8d939b'); cg.addColorStop(1, '#5c6168');
    ctx.fillStyle = cg; ctx.beginPath(); ctx.roundRect(-75, -70, 150, 74, 8); ctx.fill();
    ctx.save(); ctx.translate(-75, -70); ctx.rotate(-caseLid * 1.0); ctx.fillStyle = cg; ctx.beginPath(); ctx.roundRect(0, -14, 150, 18, 6); ctx.fill(); ctx.restore();
    ctx.fillStyle = '#2b2b2b'; ctx.fillRect(-46, -66, 14, 8); ctx.fillRect(32, -66, 14, 8);
    ctx.restore();
  }
  ctx.restore();
}

// ======================= CORN =======================
function corn(ctx, x, y, s, o = {}) {
  const { open = .55, look = [0, 0], squint = .5, launcher = 1, cyl = 0, cylOpen = 0, talk = 0, young = false, browAng = .12, armOut = 0 } = o;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  limb(ctx, [-24, -70], [-28, -6], -4, 26, '#3b3426'); limb(ctx, [24, -70], [28, -6], 4, 26, '#3b3426');
  boot(ctx, -32, 0, 44, '#3a2416'); boot(ctx, 30, 0, 44, '#3a2416');
  // husk back
  ctx.fillStyle = '#3f6b25';
  ctx.beginPath(); ctx.moveTo(-70, -520); ctx.quadraticCurveTo(-140, -260, -110, -50); ctx.lineTo(-40, -60); ctx.quadraticCurveTo(-60, -300, -40, -520); ctx.fill();
  ctx.beginPath(); ctx.moveTo(70, -520); ctx.quadraticCurveTo(140, -260, 110, -50); ctx.lineTo(40, -60); ctx.quadraticCurveTo(60, -300, 40, -520); ctx.fill();
  // cob
  const cob = P([-80, -560, 160, 500]); cob.moveTo(0, -560); cob.bezierCurveTo(70, -560, 82, -420, 78, -250); cob.bezierCurveTo(74, -110, 50, -62, 0, -60); cob.bezierCurveTo(-50, -62, -74, -110, -78, -250); cob.bezierCurveTo(-82, -420, -70, -560, 0, -560);
  ctx.fillStyle = '#c9971f'; ctx.fill(cob);
  ctx.save(); ctx.clip(cob);
  for (let r = 0; r < 34; r++) for (let c = -6; c <= 6; c++) {
    const yy = -555 + r * 15, xx = c * 13 + (r % 2) * 6.5, sh = Math.cos((xx / 80) * 1.2);
    if (Math.abs(xx) < 60 && yy > -470 && yy < -330) continue; // face zone
    const kg = `rgb(${200 + sh * 50 | 0},${150 + sh * 45 | 0},${30 + sh * 20 | 0})`;
    ctx.fillStyle = kg; ctx.beginPath(); ctx.roundRect(xx - 6, yy - 6.5, 12, 13, 4); ctx.fill();
    ctx.fillStyle = 'rgba(255,250,210,.45)'; ctx.fillRect(xx - 3, yy - 4, 3, 3);
  }
  ctx.fillStyle = '#e8b631'; ctx.beginPath(); ctx.ellipse(0, -400, 66, 80, 0, 0, 7); ctx.fill();
  ctx.restore();
  shade(ctx, cob, [-.6, -.3], .6);
  // face
  eye(ctx, -26, -420, { r: 16, open, look, iris: '#5d8a3a', lid: '#c79020', squint });
  eye(ctx, 26, -420, { r: 16, open, look, iris: '#5d8a3a', lid: '#c79020', squint });
  brow(ctx, -26, -443, 36, browAng, '#7a5410', 7); brow(ctx, 26, -443, 36, -browAng, '#7a5410', 7);
  mouth(ctx, 0, -372, 28, 'flat', '#6b4608', talk);
  // silk hair
  ctx.strokeStyle = 'rgba(240,220,150,.85)'; ctx.lineWidth = 2.5;
  for (let i = 0; i < 26; i++) { const sx = -62 + i * 5; ctx.beginPath(); ctx.moveTo(sx * .6, -540); ctx.quadraticCurveTo(sx * 1.2, -500, sx * 1.15 + Math.sin(i) * 6, -470 + (i % 5) * 6); ctx.stroke(); }
  // husk front flaps (open duster)
  const hg = ctx.createLinearGradient(-120, 0, -40, 0); hg.addColorStop(0, '#2c4f18'); hg.addColorStop(1, '#5e9a36');
  ctx.fillStyle = hg; ctx.beginPath(); ctx.moveTo(-58, -470); ctx.quadraticCurveTo(-120, -260, -96, -40); ctx.lineTo(-70, -42); ctx.quadraticCurveTo(-74, -260, -40, -440); ctx.fill();
  ctx.fillStyle = hg; ctx.beginPath(); ctx.moveTo(58, -470); ctx.quadraticCurveTo(120, -260, 96, -40); ctx.lineTo(70, -42); ctx.quadraticCurveTo(74, -260, 40, -440); ctx.fill();
  ctx.strokeStyle = 'rgba(20,40,10,.5)'; ctx.lineWidth = 1.5; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-60 - i * 6, -440 + i * 10); ctx.quadraticCurveTo(-100, -250, -84 - i * 2, -50); ctx.stroke(); }
  // belt + badge
  ctx.fillStyle = '#3b2616'; ctx.fillRect(-80, -150, 160, 16);
  ctx.fillStyle = '#d6a940'; ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2, r = i % 2 ? 6 : 13; ctx.lineTo(30 + Math.cos(a) * r, -142 + Math.sin(a) * r); } ctx.fill();
  // hat
  ctx.fillStyle = '#3d2817'; ctx.beginPath(); ctx.ellipse(0, -555, 110, 20, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#4a311d'; ctx.beginPath(); ctx.roundRect(-58, -625, 116, 72, [14, 14, 2, 2]); ctx.fill();
  ctx.fillStyle = '#21140a'; ctx.fillRect(-58, -572, 116, 12);
  ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.beginPath(); ctx.ellipse(-60, -560, 40, 6, 0, 0, 7); ctx.fill();
  // arm + launcher
  limb(ctx, [70, -300], [100 + armOut * 40, -200 - armOut * 60], 20, 22, '#4b7f2c');
  limb(ctx, [-70, -300], [-90, -190], -20, 22, '#4b7f2c');
  hand(ctx, -90, -184, 13, '#4b7f2c');
  if (launcher) {
    ctx.save(); ctx.translate(108 + armOut * 40, -196 - armOut * 60); ctx.rotate(-.15 - armOut * .2);
    ctx.fillStyle = '#16171a'; ctx.beginPath(); ctx.roundRect(-10, -14, 120, 26, 6); ctx.fill();
    ctx.fillStyle = '#2a2117'; ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-34, 50); ctx.lineTo(-12, 54); ctx.lineTo(8, 10); ctx.fill();
    ctx.save(); ctx.translate(26, 0 + cylOpen * 28); ctx.rotate(cyl);
    ctx.fillStyle = '#2b2d33'; ctx.beginPath(); ctx.arc(0, 0, 22, 0, 7); ctx.fill();
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ctx.fillStyle = '#0a0a0a'; ctx.beginPath(); ctx.arc(Math.cos(a) * 12, Math.sin(a) * 12, 5.5, 0, 7); ctx.fill(); ctx.fillStyle = '#e0b030'; ctx.beginPath(); ctx.arc(Math.cos(a) * 12, Math.sin(a) * 12, 3.4, 0, 7); ctx.fill(); }
    ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.arc(-6, -8, 6, 0, 7); ctx.fill();
    ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fillRect(50, -12, 58, 4);
    ctx.restore();
    hand(ctx, 100 + armOut * 40, -190 - armOut * 60, 13, '#4b7f2c', { fist: true });
  }
  ctx.restore();
}

// ======================= BROCCOLI =======================
const _broc = (() => { const r = mulberry32(77), a = []; for (let i = 0; i < 160; i++) { const ang = r() * Math.PI, rr = r(); a.push([Math.cos(ang) * 170 * Math.sqrt(rr) * 1.0, -520 + r() * 120, 22 + r() * 22, r()]); } return a.sort((p, q) => p[1] - q[1]); })();
function broccoli(ctx, x, y, s, o = {}) {
  const { open = .5, look = [0, 0], fists = 0, crack = 0, talk = 0, slam = 0, shoulder = 0, browAng = .3 } = o;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  limb(ctx, [-50, -80], [-56, -6], -4, 44, '#1b1b1d'); limb(ctx, [50, -80], [56, -6], 4, 44, '#1b1b1d');
  boot(ctx, -62, 0, 62, '#0d0d0d'); boot(ctx, 52, 0, 62, '#0d0d0d');
  const stalk = P([-150, -440, 300, 380]); stalk.moveTo(-120, -420); stalk.quadraticCurveTo(-150, -200, -110, -60); stalk.lineTo(110, -60); stalk.quadraticCurveTo(150, -200, 120, -420); stalk.closePath();
  const g = ctx.createLinearGradient(-150, 0, 150, 0); g.addColorStop(0, '#4f7a2a'); g.addColorStop(.4, '#8ab85a'); g.addColorStop(1, '#3b5e1e');
  ctx.fillStyle = g; ctx.fill(stalk);
  ctx.save(); ctx.clip(stalk); ctx.strokeStyle = 'rgba(220,240,180,.25)'; ctx.lineWidth = 3; for (let i = -6; i <= 6; i++) { ctx.beginPath(); ctx.moveTo(i * 20, -420); ctx.quadraticCurveTo(i * 24, -250, i * 18, -60); ctx.stroke(); }
  ctx.fillStyle = '#111113'; ctx.fillRect(-160, -300, 320, 240); // black tee
  ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fillRect(-160, -300, 320, 8);
  ctx.restore();
  // florets: flat-top crown
  ctx.save(); const cr = new Path2D(); cr.rect(-200, -560 + 30, 400, 160); ctx.clip(cr);
  for (const [fx, fy, r, v] of _broc) {
    const fg = ctx.createRadialGradient(fx - r * .3, fy - r * .3, 2, fx, fy, r);
    fg.addColorStop(0, v > .5 ? '#4f8a33' : '#3d7428'); fg.addColorStop(1, '#173a10');
    ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(fx, fy, r, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(160,210,120,.25)'; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(fx - r * .3 + k * 3, fy - r * .4 + (k % 2) * 4, 2.2, 0, 7); ctx.fill(); }
  }
  ctx.restore();
  ctx.fillStyle = '#21471a'; ctx.fillRect(-170, -532, 340, 6);
  // earpiece
  ctx.strokeStyle = 'rgba(220,230,240,.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-130, -420); ctx.quadraticCurveTo(-150, -360, -120, -300); ctx.stroke();
  // face (low, no neck)
  eye(ctx, -40, -380, { r: 15, open, look, iris: '#2a3a1a', lid: '#6c9a42', squint: .4 });
  eye(ctx, 40, -380, { r: 15, open, look, iris: '#2a3a1a', lid: '#6c9a42', squint: .4 });
  brow(ctx, -40, -402, 44, browAng, '#2b4a16', 11); brow(ctx, 40, -402, 44, -browAng, '#2b4a16', 11);
  mouth(ctx, 0, -335, 40, slam ? 'shout' : 'frown', '#2b4a16', talk);
  // arms
  const fy = -230 - fists * 40;
  limb(ctx, [-140, -280], fists ? [-26, fy] : [-180, -120], -30, 48, '#111113', 40, '#6e9b3a');
  limb(ctx, [140, -280], fists ? [26, fy] : [180, -120], 30, 48, '#111113', 40, '#6e9b3a');
  const hx = fists ? 22 : 180, hy = fists ? fy : -110;
  for (const sx of [-1, 1]) {
    ctx.save(); ctx.translate(sx * hx, hy + (crack ? Math.sin(crack * 20) * 2 : 0));
    ctx.fillStyle = '#6e9b3a'; ctx.beginPath(); ctx.ellipse(0, 0, 34, 30, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#f0ede6'; ctx.fillRect(-30, -12, 60, 13); ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.lineWidth = 1; ctx.strokeRect(-30, -12, 60, 13);
    ctx.restore();
  }
  ctx.restore();
}

// ======================= CHILI =======================
function chili(ctx, x, y, s, o = {}) {
  const { coat = 0, open = .95, look = [0, 0], talk = 0, swing = 0 } = o;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  limb(ctx, [-24, -60], [-30, -6], -4, 24, '#2b2420'); limb(ctx, [24, -60], [30, -6], 4, 24, '#2b2420');
  boot(ctx, -34, 0, 40, '#5a2a12'); boot(ctx, 30, 0, 40, '#5a2a12');
  const body = P([-80, -380, 160, 340]);
  body.moveTo(-30, -360); body.bezierCurveTo(50, -380, 82, -300, 72, -200); body.bezierCurveTo(64, -110, 30, -60, -10, -46);
  body.bezierCurveTo(-30, -60, -64, -110, -70, -210); body.bezierCurveTo(-74, -290, -66, -350, -30, -360);
  const g = ctx.createRadialGradient(-30, -290, 6, 0, -220, 200); g.addColorStop(0, '#ff5a46'); g.addColorStop(.5, '#d7261e'); g.addColorStop(1, '#5c0705');
  ctx.fillStyle = g; ctx.fill(body);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.beginPath(); ctx.ellipse(-40, -300, 8, 34, .2, 0, 7); ctx.fill(); ctx.restore();
  // stem combover curling to his RIGHT (viewer left)
  ctx.strokeStyle = '#3e7a22'; ctx.lineWidth = 12; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-20, -362); ctx.quadraticCurveTo(10, -410, -40, -405); ctx.quadraticCurveTo(-80, -395, -70, -365); ctx.stroke();
  ctx.fillStyle = '#2f5e1a'; ctx.beginPath(); ctx.ellipse(-22, -362, 26, 10, 0, 0, 7); ctx.fill();
  // face
  eye(ctx, -28, -290, { r: 16, open, look, iris: '#3a2410', lid: '#b81b14' });
  eye(ctx, 20, -290, { r: 16, open, look, iris: '#3a2410', lid: '#b81b14' });
  brow(ctx, -28, -318, 40, -.25, '#5c0705', 9); brow(ctx, 20, -318, 40, .25, '#5c0705', 9);
  mouth(ctx, -4, -244, 66, 'grin', '#5c0705');
  // coat (mustard + teal plaid); flaps open with coat 0..1
  const flap = (side) => {
    const p = new Path2D(); const ox = side * coat * 70;
    p.moveTo(side * 4, -200); p.lineTo(side * 84 + ox, -215); p.lineTo(side * 92 + ox * 1.2, -40); p.lineTo(side * 4 + ox * .8, -40); p.closePath(); return p;
  };
  if (coat > .05) { // lining + gadgets
    ctx.fillStyle = '#1d1a24'; ctx.beginPath(); ctx.moveTo(-90 - coat * 70, -215); ctx.lineTo(90 + coat * 70, -215); ctx.lineTo(100 + coat * 80, -40); ctx.lineTo(-100 - coat * 80, -40); ctx.fill();
    ctx.fillStyle = '#efe5c9'; ctx.fillRect(-26, -210, 52, 170);
    ctx.fillStyle = '#d4af37'; ctx.lineWidth = 3; ctx.strokeStyle = '#d4af37'; ctx.beginPath(); ctx.arc(0, -205, 26, 0.2, Math.PI - .2); ctx.stroke();
    const ix = side => side * (60 + coat * 60);
    // gadgets: keys, flare, lighter, air horn, mini tube man
    for (let i = 0; i < 4; i++) { const kx = ix(-1) + (i - 1.5) * 14, ky = -190 + Math.sin(swing * 8 + i) * 6 * (i === 3 ? 2 : 1); ctx.strokeStyle = '#aaa'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(kx, -200); ctx.lineTo(kx, ky + 16); ctx.stroke(); ctx.fillStyle = i % 2 ? '#222' : '#3355aa'; ctx.beginPath(); ctx.roundRect(kx - 6, ky + 16, 12, 18, 4); ctx.fill(); }
    ctx.fillStyle = '#d0201a'; ctx.fillRect(ix(-1) - 10, -140, 14, 70); ctx.fillStyle = '#eee'; ctx.fillRect(ix(-1) - 10, -140, 14, 8);
    ctx.fillStyle = '#333'; ctx.fillRect(ix(-1) + 12, -150, 8, 90); ctx.fillStyle = '#c33'; ctx.fillRect(ix(-1) + 10, -70, 12, 20);
    ctx.fillStyle = '#e0e0e0'; ctx.beginPath(); ctx.moveTo(ix(1) - 14, -190); ctx.lineTo(ix(1) + 22, -205); ctx.lineTo(ix(1) + 22, -165); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#d02020'; ctx.fillRect(ix(1) - 26, -196, 14, 26);
    ctx.fillStyle = '#ff7a1a'; ctx.beginPath(); ctx.roundRect(ix(1) - 14, -140, 28, 80, 8); ctx.fill(); ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(ix(1) - 5, -128, 3, 0, 7); ctx.arc(ix(1) + 5, -128, 3, 0, 7); ctx.fill();
  }
  for (const side of [-1, 1]) {
    const p = flap(side);
    ctx.save(); ctx.fillStyle = '#c9a43a'; ctx.fill(p); ctx.clip(p);
    ctx.globalAlpha = .55; ctx.strokeStyle = '#1f6f72'; ctx.lineWidth = 7; for (let i = -300; i < 300; i += 26) { ctx.beginPath(); ctx.moveTo(i, -260); ctx.lineTo(i, 0); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-300, -220 + i * .6); ctx.lineTo(300, -220 + i * .6); ctx.stroke(); }
    ctx.globalAlpha = .35; ctx.strokeStyle = '#7a2e12'; ctx.lineWidth = 2; for (let i = -300; i < 300; i += 26) { ctx.beginPath(); ctx.moveTo(i + 13, -260); ctx.lineTo(i + 13, 0); ctx.stroke(); }
    ctx.restore();
  }
  // arms pull coat open
  const hx = 84 + coat * 70;
  limb(ctx, [-70, -200], [-hx, -150], -18, 22, '#c9a43a'); limb(ctx, [70, -200], [hx, -150], 18, 22, '#c9a43a');
  hand(ctx, -hx, -146, 12, '#c0201a', { fist: true }); hand(ctx, hx, -146, 12, '#c0201a', { fist: true });
  ctx.restore();
}

// ======================= LEMON =======================
const _lemonDimples = (() => { const r = mulberry32(91), a = []; for (let i = 0; i < 300; i++) a.push([(r() - .5) * 240, -360 + r() * 300, .8 + r() * 1.6]); return a; })();
function lemon(ctx, x, y, s, o = {}) {
  const { open = .75, look = [0, 0], talk = 0, over = 0, browAng = -.1, notepad = 1 } = o;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  limb(ctx, [-26, -60], [-28, -6], -4, 24, '#4c4740'); limb(ctx, [26, -60], [28, -6], 4, 24, '#4c4740');
  boot(ctx, -32, 0, 38, '#6a4a32'); boot(ctx, 28, 0, 38, '#6a4a32');
  const body = P([-125, -340, 250, 290]);
  body.moveTo(0, -335); body.bezierCurveTo(16, -330, 30, -322, 60, -310); body.bezierCurveTo(130, -280, 140, -130, 70, -70);
  body.bezierCurveTo(40, -48, 14, -50, 0, -42); body.bezierCurveTo(-14, -50, -40, -48, -70, -70);
  body.bezierCurveTo(-140, -130, -130, -280, -60, -310); body.bezierCurveTo(-30, -322, -16, -330, 0, -335);
  const g = ctx.createRadialGradient(-40, -250, 10, 0, -200, 180); g.addColorStop(0, '#f6e79a'); g.addColorStop(.6, '#e6cf5e'); g.addColorStop(1, '#8c7a24');
  ctx.fillStyle = g; ctx.fill(body);
  ctx.save(); ctx.clip(body); for (const [dx, dy, r] of _lemonDimples) { ctx.fillStyle = 'rgba(120,100,20,.22)'; ctx.beginPath(); ctx.arc(dx, dy, r, 0, 7); ctx.fill(); }
  // cardigan
  ctx.fillStyle = '#e9e1cf'; ctx.fillRect(-150, -170, 300, 140);
  ctx.strokeStyle = 'rgba(150,140,115,.45)'; ctx.lineWidth = 3; for (let i = -140; i < 150; i += 22) { ctx.beginPath(); for (let k = 0; k < 12; k++) ctx.lineTo(i + (k % 2) * 6, -170 + k * 13); ctx.stroke(); }
  ctx.fillStyle = '#d9cfb8'; ctx.beginPath(); ctx.moveTo(-10, -170); ctx.lineTo(10, -170); ctx.lineTo(4, -30); ctx.lineTo(-4, -30); ctx.fill();
  ctx.restore();
  // scarf
  ctx.fillStyle = '#8fa486'; ctx.beginPath(); ctx.ellipse(0, -172, 92, 20, 0, 0, 7); ctx.fill(); ctx.fillRect(40, -172, 26, 90);
  ctx.strokeStyle = 'rgba(40,60,40,.3)'; ctx.lineWidth = 2; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(40, -160 + i * 14); ctx.lineTo(66, -156 + i * 14); ctx.stroke(); }
  // leaf at side
  ctx.fillStyle = '#4e8a32'; ctx.beginPath(); ctx.moveTo(70, -300); ctx.quadraticCurveTo(120, -340, 140, -300); ctx.quadraticCurveTo(110, -280, 70, -300); ctx.fill();
  // face
  const ey = -250 + 0;
  eye(ctx, -34, ey, { r: 17, open, look, iris: '#5a7a3a', lid: '#dcc456', squint: .1 });
  eye(ctx, 34, ey, { r: 17, open, look, iris: '#5a7a3a', lid: '#dcc456', squint: .1 });
  brow(ctx, -34, ey - 30 - over * 6, 36, browAng, '#7a6420', 6); brow(ctx, 34, ey - 30 - over * 6, 36, -browAng, '#7a6420', 6);
  mouth(ctx, 0, -198, 26, 'flat', '#6b5618', talk);
  // cat-eye tortoiseshell glasses slid down by 'over'
  const gy = ey + 10 + over * 18;
  ctx.save(); ctx.lineWidth = 6; ctx.strokeStyle = '#5a3018';
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * 8, gy); ctx.quadraticCurveTo(sx * 30, gy + 22, sx * 56, gy + 2); ctx.quadraticCurveTo(sx * 66, gy - 18, sx * 60, gy - 20); ctx.quadraticCurveTo(sx * 30, gy - 8, sx * 8, gy); ctx.stroke(); }
  ctx.fillStyle = '#2a1408'; for (let i = 0; i < 10; i++) { ctx.beginPath(); ctx.arc(-56 + i * 12, gy - 4 + (i % 3) * 3, 1.8, 0, 7); ctx.fill(); }
  ctx.strokeStyle = 'rgba(200,170,120,.8)'; ctx.lineWidth = 1.5; ctx.setLineDash([2, 4]);
  ctx.beginPath(); ctx.moveTo(-60, gy - 10); ctx.quadraticCurveTo(-90, gy + 80, -50, gy + 110); ctx.stroke(); ctx.beginPath(); ctx.moveTo(60, gy - 10); ctx.quadraticCurveTo(90, gy + 80, 50, gy + 110); ctx.stroke();
  ctx.restore();
  // arms + notepad
  limb(ctx, [-110, -150], [-40, -100], -20, 26, '#e9e1cf'); limb(ctx, [110, -150], [30, -96], 20, 26, '#e9e1cf');
  if (notepad) { ctx.fillStyle = '#5a3a22'; ctx.save(); ctx.translate(-10, -95); ctx.rotate(-.12); ctx.fillRect(-45, -30, 90, 62); ctx.fillStyle = '#f2ecdf'; ctx.fillRect(-40, -26, 80, 54); ctx.strokeStyle = '#a8b4c8'; ctx.lineWidth = 1; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-36, -18 + i * 10); ctx.lineTo(36, -18 + i * 10); ctx.stroke(); } ctx.restore(); }
  hand(ctx, -40, -96, 12, '#e6cf5e'); hand(ctx, 30, -92, 12, '#e6cf5e');
  ctx.restore();
}

// ======================= POTATO =======================
const _potato = (() => {
  const p = P([-120, -300, 240, 260]); const r = mulberry32(12);
  const pts = []; for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; const rr = 1 + (r() - .5) * .14; pts.push([Math.cos(a) * 112 * rr, -175 + Math.sin(a) * 128 * rr]); }
  p.moveTo((pts[0][0] + pts[17][0]) / 2, (pts[0][1] + pts[17][1]) / 2);
  for (let i = 0; i < 18; i++) { const a = pts[i], b = pts[(i + 1) % 18]; p.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); }
  p.closePath(); return p;
})();
function potato(ctx, x, y, s, o = {}) {
  const { open = 1, look = [0, 0], talk = 0, grin = 1, twitch = 0, fist = 0, dots = 0, roar = 0 } = o;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  limb(ctx, [-30, -50], [-34, -6], -4, 22, '#6b5235'); limb(ctx, [30, -50], [34, -6], 4, 22, '#6b5235');
  boot(ctx, -38, 0, 40, '#3a2a1c'); boot(ctx, 34, 0, 40, '#3a2a1c');
  const g = ctx.createRadialGradient(-40, -230, 10, 0, -170, 170); g.addColorStop(0, '#b08a5c'); g.addColorStop(.6, '#8a6a45'); g.addColorStop(1, '#3e2c18');
  ctx.fillStyle = g; ctx.fill(_potato);
  ctx.save(); ctx.clip(_potato); const r = mulberry32(4);
  for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(60,40,20,${.2 + r() * .3})`; ctx.beginPath(); ctx.ellipse(-110 + r() * 220, -300 + r() * 250, 2 + r() * 4, 1.5 + r() * 3, r() * 3, 0, 7); ctx.fill(); }
  ctx.restore();
  // face
  eye(ctx, -34, -205, { r: 19, open, look, iris: '#4a7ab0', lid: '#8a6a45' });
  eye(ctx, 34, -205, { r: 19, open, look, iris: '#4a7ab0', lid: '#8a6a45' });
  brow(ctx, -34, -234, 36, -.18, '#4a3420', 7); brow(ctx, 34, -234, 36, .18, '#4a3420', 7);
  if (roar) mouth(ctx, 0, -150, 64, 'shout', '#3a2410');
  else { ctx.save(); ctx.translate(0, -152); ctx.rotate(twitch * .12); mouth(ctx, 0, 0, 74 * grin, talk > .1 ? 'open' : 'grin', '#3a2410', talk); ctx.restore(); }
  // headset mic
  ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-100, -200); ctx.quadraticCurveTo(-90, -150, -48, -150); ctx.stroke(); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(-46, -150, 6, 0, 7); ctx.fill();
  // baking-sheet breastplate tied with twine
  ctx.save(); ctx.translate(0, -105);
  const bg = ctx.createLinearGradient(-90, -50, 90, 50); bg.addColorStop(0, '#d6d9de'); bg.addColorStop(.45, '#9da3ab'); bg.addColorStop(.55, '#e8eaee'); bg.addColorStop(1, '#7c838c');
  ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(-92, -46, 184, 92, 8); ctx.fill();
  ctx.strokeStyle = '#6b727a'; ctx.lineWidth = 4; ctx.strokeRect(-86, -40, 172, 80);
  ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 1; [[-60, -20, -10, 10], [20, -30, 60, 0], [-30, 20, 30, 28]].forEach(([a, b, c, d]) => { ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c, d); ctx.stroke(); });
  ctx.restore();
  ctx.strokeStyle = '#c9b48a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-92, -140); ctx.lineTo(-104, -170); ctx.moveTo(92, -140); ctx.lineTo(104, -170); ctx.stroke();
  // gold sash
  ctx.fillStyle = '#d9b448'; ctx.beginPath(); ctx.moveTo(-100, -170); ctx.lineTo(-80, -178); ctx.lineTo(96, -66); ctx.lineTo(80, -56); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.moveTo(-96, -172); ctx.lineTo(-90, -175); ctx.lineTo(90, -62); ctx.lineTo(86, -60); ctx.fill();
  // colander helmet
  ctx.save(); ctx.translate(0, -282);
  const cg = ctx.createLinearGradient(-110, -70, 110, 20); cg.addColorStop(0, '#eef0f3'); cg.addColorStop(.5, '#a7adb5'); cg.addColorStop(1, '#5d636b');
  ctx.fillStyle = cg; ctx.beginPath(); ctx.ellipse(0, 6, 112, 70, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#8d939b'; ctx.fillRect(-120, 0, 240, 12);
  ctx.fillStyle = '#2a2a2a'; for (let rr = 0; rr < 4; rr++) for (let k = -6; k <= 6; k++) { const a = Math.PI + (k + 6.5) / 13 * Math.PI, rx = (100 - rr * 22), ry = (60 - rr * 14); if (rr * 13 + k < 50) { ctx.beginPath(); ctx.arc(Math.cos(a) * rx * .9, -4 + Math.sin(a) * ry * .9, 3.2, 0, 7); ctx.fill(); } }
  ctx.fillStyle = '#888'; ctx.beginPath(); ctx.ellipse(-60, -40, 14, 8, -.5, 0, 7); ctx.fill(); // dent
  ctx.restore();
  ctx.strokeStyle = '#3a2a1c'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-108, -276); ctx.quadraticCurveTo(-90, -130, 0, -125); ctx.quadraticCurveTo(90, -130, 108, -276); ctx.stroke();
  // light dots through colander
  if (dots > 0) { const rd = mulberry32(8); ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 40; i++) glow(ctx, -110 + rd() * 220, -280 + rd() * 220, 6, 'rgba(255,220,170,1)', dots * .5); ctx.restore(); }
  // arms: mitts BLUE on viewer-left (his right), RED on viewer-right (his left)
  const fy = -180 - fist * 40;
  limb(ctx, [-96, -150], fist ? [-150, fy] : [-130, -80], -20, 22, '#8a6a45');
  limb(ctx, [96, -150], [130, -80], 20, 22, '#8a6a45');
  const mitt = (mx, my, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.roundRect(mx - 24, my - 24, 48, 52, 18); ctx.fill(); ctx.beginPath(); ctx.ellipse(mx + 24, my, 12, 16, .4, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 1.5; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(mx - 20, my - 14 + i * 12); ctx.lineTo(mx + 20, my - 8 + i * 12); ctx.stroke(); } };
  mitt(fist ? -150 : -130, fist ? fy : -76, '#2f55b8');
  mitt(130, -76, '#c42a24');
  ctx.restore();
}

// ======================= CARROT =======================
function carrot(ctx, x, y, s, o = {}) {
  const { look = [0, 0] } = o;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const body = P([-70, -470, 140, 430]); body.moveTo(-62, -440); body.quadraticCurveTo(0, -470, 62, -440); body.quadraticCurveTo(60, -200, 6, -40); body.lineTo(-6, -40); body.quadraticCurveTo(-60, -200, -62, -440);
  const g = ctx.createLinearGradient(-60, 0, 60, 0); g.addColorStop(0, '#a84a10'); g.addColorStop(.4, '#f08a2c'); g.addColorStop(1, '#8a3a08');
  ctx.fillStyle = g; ctx.fill(body);
  ctx.save(); ctx.clip(body); ctx.strokeStyle = 'rgba(90,30,0,.4)'; ctx.lineWidth = 2; for (let i = 0; i < 18; i++) { ctx.beginPath(); ctx.moveTo(-60, -430 + i * 22); ctx.quadraticCurveTo(0, -425 + i * 22, 60, -432 + i * 22); ctx.stroke(); }
  ctx.fillStyle = '#26324e'; ctx.fillRect(-80, -260, 160, 230); ctx.restore();
  ctx.strokeStyle = '#4f9a32'; ctx.lineWidth = 5; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(0, -450); ctx.quadraticCurveTo(-20 + i * 5, -520, -60 - i * 8, -480 + i * 4); ctx.stroke(); }
  // aviators
  for (const sx of [-1, 1]) { const ag = ctx.createLinearGradient(0, -380, 0, -340); ag.addColorStop(0, '#d8e4f0'); ag.addColorStop(.5, '#5a6c80'); ag.addColorStop(1, '#ff9a4a'); ctx.fillStyle = ag; ctx.beginPath(); ctx.ellipse(sx * 24, -362, 22, 17, 0, 0, 7); ctx.fill(); ctx.strokeStyle = '#c0a050'; ctx.lineWidth = 2; ctx.stroke(); }
  mouth(ctx, 0, -315, 26, 'flat', '#5a2004');
  ctx.strokeStyle = '#999'; ctx.lineWidth = 6; ctx.setLineDash([10, 4]); ctx.beginPath(); ctx.moveTo(-60, -260); ctx.lineTo(50, -120); ctx.stroke(); ctx.setLineDash([]);
  ctx.restore();
}
function truck(ctx, x, y, s, o = {}) {
  const { wheelRot = 0 } = o;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#5c2416'; ctx.beginPath(); ctx.roundRect(-420, -260, 300, 200, 24); ctx.fill(); // cab
  ctx.fillStyle = '#7a301c'; ctx.beginPath(); ctx.moveTo(-480, -150); ctx.lineTo(-420, -230); ctx.lineTo(-420, -60); ctx.lineTo(-490, -60); ctx.fill();
  ctx.fillStyle = '#1a2230'; ctx.fillRect(-400, -240, 120, 90);
  ctx.fillStyle = '#4c3020'; ctx.fillRect(-120, -150, 440, 90); // bed
  ctx.strokeStyle = '#2a1a10'; ctx.lineWidth = 4; for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(-110 + i * 55, -230); ctx.lineTo(-110 + i * 55, -150); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-120, -230); ctx.lineTo(320, -230); ctx.stroke();
  ctx.fillStyle = 'rgba(60,40,20,.8)'; ctx.fillRect(-490, -80, 820, 30);
  for (const wx of [-380, 220]) { ctx.save(); ctx.translate(wx, -40); ctx.rotate(wheelRot); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(0, 0, 62, 0, 7); ctx.fill(); ctx.fillStyle = '#555'; ctx.beginPath(); ctx.arc(0, 0, 26, 0, 7); ctx.fill(); ctx.fillStyle = '#222'; for (let i = 0; i < 5; i++) { ctx.rotate(1.256); ctx.fillRect(-4, 8, 8, 14); } ctx.restore(); }
  glow(ctx, -488, -120, 90, 'rgba(255,230,170,1)', .6);
  ctx.restore();
}

// ======================= BANANA =======================
function banana(ctx, x, y, s, o = {}) {
  const { flap = 0 } = o;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const body = P([-120, -520, 240, 480]); body.moveTo(-10, -510); body.bezierCurveTo(80, -480, 110, -260, 50, -60); body.lineTo(-10, -50); body.bezierCurveTo(40, -250, 20, -440, -40, -500); body.closePath();
  const g = ctx.createLinearGradient(-20, 0, 100, 0); g.addColorStop(0, '#c9a020'); g.addColorStop(.5, '#f4d03f'); g.addColorStop(1, '#a88010');
  ctx.fillStyle = g; ctx.fill(body);
  ctx.save(); ctx.clip(body); const r = mulberry32(31); for (let i = 0; i < 40; i++) { ctx.fillStyle = 'rgba(100,60,10,.55)'; ctx.beginPath(); ctx.arc(-20 + r() * 120, -500 + r() * 440, 1.5 + r() * 3, 0, 7); ctx.fill(); }
  ctx.restore();
  // trench coat flying
  ctx.fillStyle = '#b89a6a'; ctx.beginPath(); ctx.moveTo(0, -320); ctx.lineTo(80, -320); ctx.lineTo(90 + flap * 120, -60 + flap * 40); ctx.lineTo(-40 - flap * 160, -40 - flap * 60); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#8a6a3a'; ctx.fillRect(10, -200, 80, 14);
  // fedora
  ctx.fillStyle = '#4a3220'; ctx.beginPath(); ctx.ellipse(10, -505, 70, 14, -.2, 0, 7); ctx.fill(); ctx.beginPath(); ctx.roundRect(-20, -560, 64, 50, 12); ctx.fill(); ctx.fillStyle = '#1a120a'; ctx.fillRect(-20, -522, 64, 9);
  eye(ctx, 26, -440, { r: 13, open: .5, iris: '#5a3a1a', lid: '#d4b030' }); eye(ctx, 60, -436, { r: 13, open: .5, iris: '#5a3a1a', lid: '#d4b030' });
  mouth(ctx, 44, -395, 22, 'frown', '#6a4a10');
  ctx.fillStyle = '#111'; ctx.fillRect(40, -280, 40, 28); ctx.fillStyle = '#666'; ctx.beginPath(); ctx.arc(60, -266, 9, 0, 7); ctx.fill();
  ctx.restore();
}

// ======================= GRAPES =======================
const GRAPE_ACC = ['bowtie', 'beanie', 'lanyard', 'reading', 'whistle', 'armband', 'gerald'];
function grape(ctx, x, y, s, o = {}) {
  const { acc = 'bowtie', mouthKind = 'flat', talk = 0, spin = 0, open = 1, scream = 0 } = o;
  const gerald = acc === 'gerald';
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(spin);
  const g = ctx.createRadialGradient(-14, -14, 3, 0, 0, 44);
  if (gerald) { g.addColorStop(0, '#e2efa0'); g.addColorStop(.6, '#b5c96a'); g.addColorStop(1, '#5a6a28'); }
  else { g.addColorStop(0, '#8a5a96'); g.addColorStop(.6, '#4b1e4f'); g.addColorStop(1, '#1c0820'); }
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 40, 44, 0, 0, 7); ctx.fill();
  ctx.fillStyle = gerald ? 'rgba(255,255,230,.25)' : 'rgba(200,190,220,.22)'; ctx.beginPath(); ctx.ellipse(-12, -20, 16, 9, -.5, 0, 7); ctx.fill();
  eye(ctx, -12, -6, { r: 8, open, iris: gerald ? '#5a4a2a' : '#c9a040', lid: gerald ? '#a8bc5e' : '#3c1640', glint: 1 });
  eye(ctx, 12, -6, { r: 8, open, iris: gerald ? '#5a4a2a' : '#c9a040', lid: gerald ? '#a8bc5e' : '#3c1640' });
  mouth(ctx, 0, 14, 16, scream ? 'shout' : mouthKind, '#1a0618', talk);
  if (acc === 'bowtie') { ctx.fillStyle = '#c21a1a'; ctx.beginPath(); ctx.moveTo(0, 34); ctx.lineTo(-12, 26); ctx.lineTo(-12, 42); ctx.closePath(); ctx.moveTo(0, 34); ctx.lineTo(12, 26); ctx.lineTo(12, 42); ctx.fill(); }
  if (acc === 'beanie') { ctx.fillStyle = '#d06a20'; ctx.beginPath(); ctx.ellipse(0, -36, 34, 18, 0, Math.PI, 0); ctx.fill(); ctx.fillRect(-34, -38, 68, 8); }
  if (acc === 'lanyard') { ctx.strokeStyle = '#2a6ad0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-18, 20); ctx.lineTo(0, 40); ctx.lineTo(18, 20); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.fillRect(-6, 38, 12, 10); }
  if (acc === 'reading') { ctx.strokeStyle = '#ccc'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(-12, -2, 9, 0, Math.PI); ctx.arc(12, -2, 9, 0, Math.PI); ctx.stroke(); }
  if (acc === 'whistle') { ctx.fillStyle = '#ccc'; ctx.fillRect(10, 26, 14, 7); }
  if (acc === 'armband') { ctx.fillStyle = '#e0c020'; ctx.fillRect(26, 0, 14, 10); }
  if (gerald) {
    ctx.fillStyle = '#c4a878'; ctx.beginPath(); ctx.moveTo(-42, 8); ctx.quadraticCurveTo(0, 30, 42, 8); ctx.lineTo(46, 46); ctx.lineTo(-46, 46); ctx.fill();
    ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(-12, -6, 9, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(12, -6, 9, 0, 7); ctx.stroke();
  }
  ctx.restore();
}

// ======================= PUMPKIN =======================
function pumpkin(ctx, x, y, s, o = {}) {
  const { look = [0, 0], talk = 0, shout = 0, keyTurn = 0, head = 0 } = o;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  limb(ctx, [-50, -60], [-54, -6], -4, 34, '#3a3028'); limb(ctx, [50, -60], [54, -6], 4, 34, '#3a3028');
  boot(ctx, -58, 0, 52, '#2a1a10'); boot(ctx, 50, 0, 52, '#2a1a10');
  const lobes = [[-110, 90], [-60, 120], [0, 135], [60, 120], [110, 90]];
  for (const [lx, lw] of lobes) { const g = ctx.createRadialGradient(lx - 20, -300, 10, lx, -250, 220); g.addColorStop(0, '#f39a4a'); g.addColorStop(.6, '#d9661e'); g.addColorStop(1, '#6a2a06'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(lx, -230, lw, 180, 0, 0, 7); ctx.fill(); }
  ctx.strokeStyle = 'rgba(90,30,0,.5)'; ctx.lineWidth = 4; for (const lx of [-85, -30, 30, 85]) { ctx.beginPath(); ctx.moveTo(lx, -400); ctx.quadraticCurveTo(lx * 1.25, -230, lx, -55); ctx.stroke(); }
  ctx.strokeStyle = '#4a5a22'; ctx.lineWidth = 22; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, -400); ctx.quadraticCurveTo(10, -440, -20, -460); ctx.stroke();
  // sweater vest
  ctx.save(); const clipb = new Path2D(); clipb.ellipse(0, -230, 220, 180, 0, 0, 7); ctx.clip(clipb);
  ctx.fillStyle = '#e8e2d6'; ctx.fillRect(-230, -190, 460, 140);
  ctx.fillStyle = '#6a4a30'; ctx.beginPath(); ctx.moveTo(-230, -190); ctx.lineTo(-40, -190); ctx.lineTo(0, -120); ctx.lineTo(40, -190); ctx.lineTo(230, -190); ctx.lineTo(230, -40); ctx.lineTo(-230, -40); ctx.fill();
  ctx.strokeStyle = 'rgba(40,20,10,.35)'; ctx.lineWidth = 2; for (let i = -220; i < 230; i += 14) { ctx.beginPath(); ctx.moveTo(i, -180); ctx.lineTo(i, -40); ctx.stroke(); }
  ctx.restore();
  eye(ctx, -50, -290, { r: 18, open: .55, look, iris: '#3a2a10', lid: '#c8581a', squint: .5 });
  eye(ctx, 50, -290, { r: 18, open: .55, look, iris: '#3a2a10', lid: '#c8581a', squint: .5 });
  brow(ctx, -50, -318, 46, .3, '#6a2a06', 11); brow(ctx, 50, -318, 46, -.3, '#6a2a06', 11);
  // jowls
  ctx.fillStyle = 'rgba(120,40,0,.35)'; ctx.beginPath(); ctx.ellipse(-50, -215, 40, 24, .3, 0, 7); ctx.ellipse(50, -215, 40, 24, -.3, 0, 7); ctx.fill();
  mouth(ctx, 0, -225, 54, shout ? 'shout' : 'frown', '#4a1a04', talk);
  // key ring
  ctx.strokeStyle = '#6a6e74'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(150, -90, 50, 0, 7); ctx.stroke();
  for (let i = 0; i < 9; i++) { const a = i * .7 + keyTurn; ctx.fillStyle = '#8e9298'; ctx.save(); ctx.translate(150 + Math.cos(a) * 50, -90 + Math.sin(a) * 50); ctx.rotate(a + 1.57); ctx.fillRect(-4, 0, 8, 34); ctx.restore(); }
  limb(ctx, [180, -200], [260, -230 + keyTurn * 4], 20, 30, '#6a4a30');
  hand(ctx, 262, -230, 18, '#d9661e', { fist: true });
  ctx.fillStyle = '#3a2416'; ctx.fillRect(-250, -200, 60, 90); // ledger
  limb(ctx, [-180, -200], [-220, -120], -10, 30, '#6a4a30');
  ctx.restore();
}

// ======================= CROWD UNITS =======================
function blueberry(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const g = ctx.createRadialGradient(-10, -50, 2, 0, -40, 40); g.addColorStop(0, '#7a8ac8'); g.addColorStop(.6, '#3a4a8a'); g.addColorStop(1, '#141a3a');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -40, 36, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(200,210,240,.3)'; ctx.beginPath(); ctx.arc(-10, -52, 14, 0, 7); ctx.fill();
  ctx.fillStyle = '#1a1a30'; ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5, r = i % 2 ? 4 : 10; ctx.lineTo(Math.cos(a) * r, -76 + Math.sin(a) * r * .5); } ctx.fill();
  ctx.fillStyle = '#c21a1a'; ctx.fillRect(-36, -58, 72, 10);
  eye(ctx, -11, -40, { r: 6, open: .7, iris: '#222', lid: '#3a4a8a' }); eye(ctx, 11, -40, { r: 6, open: .7, iris: '#222', lid: '#3a4a8a' });
  ctx.strokeStyle = '#5a3a1a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(30, -30); ctx.lineTo(44, -60); ctx.moveTo(44, -60); ctx.lineTo(38, -72); ctx.moveTo(44, -60); ctx.lineTo(52, -70); ctx.stroke();
  ctx.restore();
}
function celery(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const g = ctx.createLinearGradient(-40, 0, 40, 0); g.addColorStop(0, '#7aa04a'); g.addColorStop(.5, '#c4dc90'); g.addColorStop(1, '#6a903a');
  ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(-40, -720, 80, 690, 30); ctx.fill();
  ctx.strokeStyle = 'rgba(80,120,40,.5)'; ctx.lineWidth = 3; for (let i = -30; i <= 30; i += 12) { ctx.beginPath(); ctx.moveTo(i, -700); ctx.lineTo(i, -40); ctx.stroke(); }
  ctx.fillStyle = '#5a9a32'; for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.ellipse(-30 + i * 10, -740 - (i % 3) * 20, 22, 30, i - 3, 0, 7); ctx.fill(); }
  eye(ctx, -14, -600, { r: 10, open: .5, iris: '#2a3a1a', lid: '#a8c878', squint: .4 }); eye(ctx, 14, -600, { r: 10, open: .5, iris: '#2a3a1a', lid: '#a8c878', squint: .4 });
  ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(60, -40); ctx.lineTo(60, -900); ctx.stroke();
  ctx.fillStyle = '#9aa0a8'; ctx.beginPath(); ctx.moveTo(52, -900); ctx.lineTo(60, -960); ctx.lineTo(68, -900); ctx.fill();
  ctx.restore();
}
function pineapple(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const body = new Path2D(); body.ellipse(0, -230, 110, 190, 0, 0, 7);
  const g = ctx.createRadialGradient(-30, -280, 10, 0, -230, 220); g.addColorStop(0, '#e8b04a'); g.addColorStop(.6, '#b07a22'); g.addColorStop(1, '#4a2a08');
  ctx.fillStyle = g; ctx.fill(body);
  ctx.save(); ctx.clip(body); ctx.strokeStyle = 'rgba(70,40,5,.7)'; ctx.lineWidth = 3;
  for (let i = -12; i < 12; i++) { ctx.beginPath(); ctx.moveTo(i * 30, -440); ctx.lineTo(i * 30 + 300, -20); ctx.stroke(); ctx.beginPath(); ctx.moveTo(i * 30, -440); ctx.lineTo(i * 30 - 300, -20); ctx.stroke(); }
  ctx.restore();
  ctx.fillStyle = '#3a7a3a'; for (let i = 0; i < 9; i++) { ctx.save(); ctx.translate(0, -410); ctx.rotate((i - 4) * .22); ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(0, -120 - (i % 2) * 30); ctx.lineTo(10, 0); ctx.fill(); ctx.restore(); }
  eye(ctx, -32, -290, { r: 14, open: .55, iris: '#3a2a10', lid: '#b07a22', squint: .3 }); eye(ctx, 32, -290, { r: 14, open: .55, iris: '#3a2a10', lid: '#b07a22', squint: .3 });
  ctx.fillStyle = '#5a3a1a'; ctx.beginPath(); ctx.arc(110, -180, 70, 0, 7); ctx.fill(); ctx.strokeStyle = '#8a8a8a'; ctx.lineWidth = 6; ctx.stroke(); ctx.fillStyle = '#9a9a9a'; ctx.beginPath(); ctx.arc(110, -180, 12, 0, 7); ctx.fill();
  ctx.restore();
}
function onion(ctx, x, y, s, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const g = ctx.createRadialGradient(-20, -140, 5, 0, -110, 120); g.addColorStop(0, '#f0d090'); g.addColorStop(.6, '#c89040'); g.addColorStop(1, '#5a3a10');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -230); ctx.quadraticCurveTo(20, -200, 80, -160); ctx.quadraticCurveTo(140, -90, 60, -40); ctx.lineTo(-60, -40); ctx.quadraticCurveTo(-140, -90, -80, -160); ctx.quadraticCurveTo(-20, -200, 0, -230); ctx.fill();
  ctx.strokeStyle = 'rgba(120,70,20,.4)'; ctx.lineWidth = 2; for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(0, -225); ctx.quadraticCurveTo(i * 40, -130, i * 22, -42); ctx.stroke(); }
  eye(ctx, -28, -130, { r: 14, open: .8, iris: '#3a5a8a', lid: '#c89040' }); eye(ctx, 28, -130, { r: 14, open: .8, iris: '#3a5a8a', lid: '#c89040' });
  ctx.fillStyle = 'rgba(170,220,255,.8)'; for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) { const ty = -112 + ((t * 120 + k * 25) % 70); ctx.beginPath(); ctx.ellipse(sx * 30, ty, 4, 7, 0, 0, 7); ctx.fill(); }
  ctx.strokeStyle = 'rgba(170,220,255,.5)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-30, -115); ctx.lineTo(-32, -60); ctx.moveTo(30, -115); ctx.lineTo(32, -60); ctx.stroke();
  mouth(ctx, 0, -82, 30, 'flat', '#5a3a10');
  ctx.fillStyle = '#4a3020'; ctx.fillRect(40, -110, 100, 14); ctx.strokeStyle = '#555'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(120, -140); ctx.quadraticCurveTo(100, -103, 120, -66); ctx.stroke();
  ctx.restore();
}
function pear(ctx, x, y, s, lift = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  limb(ctx, [-24, -50], [-26, -6], -4, 20, '#5a4a6a'); limb(ctx, [24, -50], [26, -6], 4, 20, '#5a4a6a');
  boot(ctx, -30, 0, 36, '#2a1a10'); boot(ctx, 26, 0, 36, '#2a1a10');
  const g = ctx.createRadialGradient(-20, -200, 5, 0, -150, 160); g.addColorStop(0, '#c49a5a'); g.addColorStop(.6, '#8a6a3a'); g.addColorStop(1, '#3a2a10');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -320); ctx.quadraticCurveTo(40, -310, 46, -240); ctx.quadraticCurveTo(120, -150, 80, -60); ctx.lineTo(-80, -60); ctx.quadraticCurveTo(-120, -150, -46, -240); ctx.quadraticCurveTo(-40, -310, 0, -320); ctx.fill();
  ctx.strokeStyle = '#4a3a1a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, -318); ctx.lineTo(8, -350); ctx.stroke();
  ctx.fillStyle = '#9a86b8'; ctx.beginPath(); ctx.moveTo(-104, -160); ctx.lineTo(104, -160); ctx.lineTo(90, -55); ctx.lineTo(-90, -55); ctx.fill();
  eye(ctx, -22, -235, { r: 12, open: .45, iris: '#4a3a2a', lid: '#8a6a3a', squint: .6 }); eye(ctx, 22, -235, { r: 12, open: .45, iris: '#4a3a2a', lid: '#8a6a3a', squint: .6 });
  ctx.strokeStyle = 'rgba(40,20,0,.5)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-40, -245); ctx.lineTo(-36, -240); ctx.moveTo(40, -245); ctx.lineTo(36, -240); ctx.stroke();
  mouth(ctx, 0, -200, 22, 'frown', '#3a2a10');
  // frying pan on shoulder
  const a = lerp(.8, -.9, lift);
  ctx.save(); ctx.translate(80, -150); ctx.rotate(a);
  ctx.fillStyle = '#2a1a10'; ctx.fillRect(-8, -10, 16, 90);
  ctx.fillStyle = '#18181a'; ctx.beginPath(); ctx.ellipse(0, -60, 62, 54, 0, 0, 7); ctx.fill(); ctx.strokeStyle = '#3a3a3e'; ctx.lineWidth = 6; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.ellipse(-16, -76, 22, 10, -.4, 0, 7); ctx.fill();
  ctx.restore();
  hand(ctx, 80, -150, 13, '#8a6a3a', { fist: true });
  ctx.restore();
}
function tomato(ctx, x, y, s, o = {}) {
  const { duck = 0 } = o;
  ctx.save(); ctx.translate(x, y + duck * 60); ctx.scale(s, s);
  const g = ctx.createRadialGradient(-30, -180, 10, 0, -140, 150); g.addColorStop(0, '#ff6a4a'); g.addColorStop(.6, '#d8301a'); g.addColorStop(1, '#5a0a04');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, -140, 120, 100, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#5a5a5e'; ctx.beginPath(); ctx.ellipse(0, -232, 70, 22, 0, Math.PI, 0); ctx.fill(); ctx.fillRect(-74, -236, 148, 8);
  eye(ctx, -30, -165, { r: 18, open: 1, iris: '#3a2a10', lid: '#d8301a', look: [.5, -.3] }); eye(ctx, 30, -165, { r: 18, open: 1, iris: '#3a2a10', lid: '#d8301a', look: [.5, -.3] });
  mouth(ctx, 0, -115, 30, 'shout', '#4a0804');
  ctx.restore();
}
// generic crowd fruit/veg (silhouette-friendly)
const CROWD_TYPES = [['#c8282a', 'apple'], ['#6a2a6a', 'plum'], ['#e07a1a', 'orange'], ['#5a9a3a', 'cabbage'], ['#d8301a', 'tomato'], ['#e8c040', 'lemonish'], ['#7a3a8a', 'eggplant'], ['#c0a060', 'potatoish'], ['#3a7a3a', 'cucumber']];
function crowdie(ctx, x, y, s, k, o = {}) {
  const { lit = 1, weapon = 0, roar = 0, t = 0 } = o;
  const [c] = CROWD_TYPES[k % CROWD_TYPES.length];
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const tall = k % 9 === 8 || k % 9 === 6;
  const ry = tall ? 140 : 100, rx = tall ? 60 : 92;
  const g = ctx.createRadialGradient(-rx * .3, -ry * 1.4, 4, 0, -ry, ry * 1.4);
  g.addColorStop(0, `rgba(255,255,255,${.25 * lit})`); g.addColorStop(.25, c); g.addColorStop(1, '#100808');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, -ry - 20, rx, ry, 0, 0, 7); ctx.fill();
  if (lit > .2) { eye(ctx, -rx * .32, -ry * 1.25, { r: 10, open: .7, iris: '#222', lid: c, glint: lit }); eye(ctx, rx * .32, -ry * 1.25, { r: 10, open: .7, iris: '#222', lid: c, glint: lit }); }
  if (roar) mouth(ctx, 0, -ry * .9, 30, 'shout', '#200');
  if (weapon) { const up = roar ? -1.2 : 0; ctx.save(); ctx.translate(rx * .8, -ry); ctx.rotate(up + Math.sin(t * 6 + k) * .05 * roar); ctx.strokeStyle = '#4a3020'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, 30); ctx.lineTo(0, -160); ctx.stroke(); ctx.fillStyle = '#9aa0a8'; ctx.beginPath(); ctx.moveTo(-10, -160); ctx.lineTo(0, -200); ctx.lineTo(10, -160); ctx.fill(); ctx.restore(); }
  ctx.restore();
}

// ======================= THE HERD (silhouettes only) =======================
function _rimFill(ctx, p, rimC, rimA, dx = -9, dy = -11, blur = 7) {
  ctx.save(); ctx.translate(dx, dy); ctx.fillStyle = rimC; ctx.globalAlpha = rimA; ctx.filter = `blur(${blur}px)`; ctx.fill(p); ctx.fill(p); ctx.restore();
}
function _legs(p, xs, top, w, step = 0) {
  xs.forEach((x, i) => { const sw = Math.sin(step * Math.PI * 2 + i * 1.7) * 14; p.moveTo(x - w / 2, top); p.lineTo(x + w / 2, top); p.lineTo(x + w * .42 + sw, -18); p.lineTo(x + w * .62 + sw, 0); p.lineTo(x - w * .55 + sw, 0); p.lineTo(x - w * .45 + sw, -18); p.closePath(); });
}
function boar(ctx, x, y, s, o = {}) {
  const { rimC = '#ff5a1f', rimA = 1, brazier = 1, t = 0, flip = false, step = 0 } = o;
  ctx.save(); ctx.translate(x, y); ctx.scale(flip ? -s : s, s);
  const p = new Path2D();
  p.moveTo(-240, -140); p.quadraticCurveTo(-290, -260, -230, -340); p.quadraticCurveTo(-140, -440, 20, -455); // rear to hump
  p.quadraticCurveTo(120, -470, 180, -400); p.quadraticCurveTo(250, -330, 320, -250); // neck to face
  p.quadraticCurveTo(350, -215, 352, -190); p.lineTo(300, -170); p.quadraticCurveTo(230, -150, 170, -150); p.lineTo(-180, -140); p.closePath();
  p.moveTo(130, -420); p.lineTo(150, -500); p.lineTo(200, -410); p.closePath(); // ear
  for (let i = 0; i < 10; i++) { const bx = -200 + i * 36; p.moveTo(bx, -420 + Math.abs(bx) * .02 - (i < 6 ? 20 : 0)); p.lineTo(bx + 14, -470 + Math.abs(bx + 60) * .12); p.lineTo(bx + 28, -420); }
  _legs(p, [-190, -120, 90, 160], -160, 50, step);
  _rimFill(ctx, p, rimC, rimA);
  ctx.fillStyle = '#0a0706'; ctx.fill(p);
  ctx.save(); ctx.clip(p); ctx.strokeStyle = rgba('#8a5030', .16 * rimA); ctx.lineWidth = 2;
  for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) ctx.strokeRect(-200 + c * 40 + (r % 2) * 20, -400 + r * 46, 34, 42);
  ctx.restore();
  // twine + hooks
  ctx.strokeStyle = rgba('#c08a5a', .35 * rimA); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-60, -440); ctx.lineTo(-90, -150); ctx.moveTo(40, -450); ctx.lineTo(10, -150); ctx.stroke();
  ctx.strokeStyle = rgba('#ffaa66', .6 * rimA); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-140, -150); ctx.lineTo(-140, -100); ctx.arc(-126, -100, 14, Math.PI, Math.PI * .1, true); ctx.stroke();
  // tusk
  const tg = ctx.createLinearGradient(290, -170, 330, -300); tg.addColorStop(0, '#5a4028'); tg.addColorStop(1, `rgba(255,214,160,${rimA})`);
  ctx.fillStyle = tg; ctx.beginPath(); ctx.moveTo(296, -176); ctx.quadraticCurveTo(350, -200, 334, -310); ctx.quadraticCurveTo(326, -228, 282, -196); ctx.fill();
  glow(ctx, 334, -300, 30, 'rgba(255,160,90,1)', .5 * rimA);
  smoke(ctx, t, { seed: 4, n: 3, x: 330, y: -230, w: 120, h: 80, color: 'rgb(150,120,110)', alpha: .25, size: [60, 120], vx: 40, vy: -20 });
  if (brazier) {
    ctx.strokeStyle = '#0a0706'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(-20, -300); ctx.lineTo(-40, -820); ctx.stroke();
    ctx.fillStyle = '#0a0706'; ctx.beginPath(); ctx.moveTo(-95, -830); ctx.lineTo(15, -830); ctx.lineTo(-10, -780); ctx.lineTo(-70, -780); ctx.fill();
    const fl = .6 + .4 * Math.sin(t * 13 + x);
    glow(ctx, -40, -850, 130, 'rgba(255,140,40,1)', .7 * fl); glow(ctx, -40, -850, 44, 'rgba(255,230,160,1)', .8 * fl);
  }
  ctx.restore();
}
function bull(ctx, x, y, s, o = {}) {
  const { rimC = '#ff5a1f', rimA = 1, horn = 0, t = 0, flip = false, sigil = 1, step = 0 } = o;
  ctx.save(); ctx.translate(x, y); ctx.scale(flip ? -s : s, s);
  const body = new Path2D();
  body.moveTo(-330, -230); body.quadraticCurveTo(-370, -380, -300, -460); body.quadraticCurveTo(-150, -540, 0, -600); // back up to hump
  body.quadraticCurveTo(110, -660, 200, -560); body.quadraticCurveTo(230, -470, 230, -360); body.quadraticCurveTo(190, -250, 120, -230); body.lineTo(-300, -220); body.closePath();
  _legs(body, [-280, -190, 60, 150], -240, 66, step);
  // head (rotates down as horns lower)
  const head = new Path2D();
  head.moveTo(-30, -60); head.quadraticCurveTo(60, -110, 140, -70); head.quadraticCurveTo(210, -10, 200, 90); head.quadraticCurveTo(180, 130, 130, 120); head.quadraticCurveTo(40, 80, -20, 60); head.closePath();
  const hornNear = new Path2D(); hornNear.moveTo(70, -80); hornNear.quadraticCurveTo(230, -100, 300, -260); hornNear.quadraticCurveTo(312, -290, 296, -246); hornNear.quadraticCurveTo(240, -70, 90, -50); hornNear.closePath();
  const hornFar = new Path2D(); hornFar.moveTo(30, -90); hornFar.quadraticCurveTo(110, -170, 120, -330); hornFar.quadraticCurveTo(124, -360, 110, -320); hornFar.quadraticCurveTo(90, -160, 20, -70); hornFar.closePath();
  const hp = () => { ctx.translate(200, -480); ctx.rotate(.15 + horn * .75); };
  _rimFill(ctx, body, rimC, rimA, -10, -12, 8);
  ctx.save(); hp(); _rimFill(ctx, head, rimC, rimA, -8, -10, 6); _rimFill(ctx, hornFar, rimC, rimA * .8, -6, -8, 4); _rimFill(ctx, hornNear, rimC, rimA, -6, -8, 4); ctx.restore();
  ctx.fillStyle = '#080605'; ctx.fill(body);
  ctx.save(); hp(); ctx.fillStyle = '#0d0907'; ctx.fill(hornFar); ctx.fillStyle = '#080605'; ctx.fill(head); ctx.fillStyle = '#0c0907'; ctx.fill(hornNear);
  ctx.fillStyle = `rgba(210,210,220,${.75 * rimA})`; ctx.beginPath(); ctx.ellipse(298, -262, 9, 18, .5, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(118, -322, 7, 14, .1, 0, 7); ctx.fill();
  glow(ctx, 298, -262, 40, 'rgba(255,180,120,1)', .5 * rimA);
  smoke(ctx, t, { seed: 9, n: 3, x: 160, y: 60, w: 160, h: 80, color: 'rgb(150,120,110)', alpha: .22, size: [70, 130], vx: 50, vy: -20 });
  ctx.restore();
  // plates + rivets
  ctx.save(); ctx.clip(body); ctx.strokeStyle = `rgba(160,160,170,${.22 * rimA})`; ctx.lineWidth = 3;
  for (let r = 0; r < 4; r++) { ctx.beginPath(); ctx.arc(-40, -260, 220 + r * 60, -2.5, -1.0); ctx.stroke(); }
  for (let i = 0; i < 12; i++) { ctx.fillStyle = `rgba(210,210,220,${.3 * rimA})`; ctx.beginPath(); ctx.arc(-260 + i * 36, -470 + Math.sin(i * .6) * 40, 3, 0, 7); ctx.fill(); }
  ctx.restore();
  if (sigil) { const fl = .7 + .3 * Math.sin(t * 5 + x); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(255,110,40,${.85 * fl * sigil})`; ctx.lineWidth = 6; ctx.shadowColor = '#ff5a1f'; ctx.shadowBlur = 24; ctx.beginPath(); ctx.arc(-160, -370, 38, 0, 7); ctx.moveTo(-196, -370); ctx.lineTo(-124, -370); ctx.moveTo(-160, -406); ctx.lineTo(-160, -334); ctx.moveTo(-186, -396); ctx.lineTo(-134, -344); ctx.stroke(); ctx.restore(); }
  ctx.restore();
}
function hoof(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const lg = ctx.createLinearGradient(-120, 0, 120, 0); lg.addColorStop(0, '#050404'); lg.addColorStop(.7, '#1a1210'); lg.addColorStop(1, '#5a2a12');
  ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(-110, -1400); ctx.lineTo(110, -1400); ctx.quadraticCurveTo(130, -500, 150, -150); ctx.lineTo(-150, -150); ctx.quadraticCurveTo(-130, -500, -110, -1400); ctx.fill();
  ctx.fillStyle = '#2a2a2e'; for (let i = 0; i < 3; i++) { ctx.fillRect(-140, -700 + i * 200, 280, 40); ctx.fillStyle = 'rgba(200,200,210,.4)'; for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.arc(-110 + k * 44, -680 + i * 200, 5, 0, 7); ctx.fill(); } ctx.fillStyle = '#2a2a2e'; }
  ctx.fillStyle = '#0c0a0a'; ctx.beginPath(); ctx.moveTo(-170, -160); ctx.lineTo(170, -160); ctx.lineTo(190, 0); ctx.lineTo(-190, 0); ctx.fill();
  ctx.fillStyle = '#4a4a50'; ctx.fillRect(-195, -24, 390, 24); ctx.fillStyle = 'rgba(255,170,90,.6)'; ctx.fillRect(-195, -24, 390, 4);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,110,40,.85)'; ctx.lineWidth = 8; ctx.shadowColor = '#ff5a1f'; ctx.shadowBlur = 30;
  ctx.beginPath(); ctx.arc(0, -950, 60, 0, 7); ctx.moveTo(-60, -950); ctx.lineTo(60, -950); ctx.moveTo(0, -1010); ctx.lineTo(0, -890); ctx.stroke(); ctx.restore();
  ctx.restore();
}
