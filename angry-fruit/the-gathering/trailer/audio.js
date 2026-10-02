// ANGRY FRUIT: THE GATHERING — offline mix. Voices + score from vidIQ, every SFX synthesized here.
async function buildMix(DUR = 60.2) {
  const SR = 48000, ac = new OfflineAudioContext(2, Math.ceil(DUR * SR), SR);
  const load = async f => ac.decodeAudioData(await (await fetch(f)).arrayBuffer());
  const [score, sb, lem, pot, pum, ger, gr2] = await Promise.all(['audio/score.48k.wav', 'audio/strawberry.48k.wav', 'audio/lemon.48k.wav', 'audio/potato.48k.wav', 'audio/pumpkin.48k.wav', 'audio/gerald.48k.wav', 'audio/grape2.48k.wav'].map(load));

  // ---- bus structure ----
  const master = ac.createGain(); master.gain.value = .9;
  const comp = ac.createDynamicsCompressor(); comp.threshold.value = -14; comp.knee.value = 6; comp.ratio.value = 6; comp.attack.value = .004; comp.release.value = .25;
  master.connect(comp); comp.connect(ac.destination);
  const mkIR = (sec, decay, seed = 1) => { const b = ac.createBuffer(2, SR * sec, SR), r = mulberry32(seed); for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] = (r() * 2 - 1) * Math.pow(1 - i / d.length, decay); } return b; };
  const bigVerb = ac.createConvolver(); bigVerb.buffer = mkIR(4, 3.2, 3); const bigRet = ac.createGain(); bigRet.gain.value = .5; bigVerb.connect(bigRet); bigRet.connect(master);
  const roomVerb = ac.createConvolver(); roomVerb.buffer = mkIR(1.1, 4, 5); const roomRet = ac.createGain(); roomRet.gain.value = .35; roomVerb.connect(roomRet); roomRet.connect(master);
  const sfx = ac.createGain(); sfx.gain.value = 1; sfx.connect(master);
  const send = (node, verb, amt) => { const g = ac.createGain(); g.gain.value = amt; node.connect(g); g.connect(verb); };

  const noise = (() => { const b = ac.createBuffer(1, SR * 3, SR), d = b.getChannelData(0), r = mulberry32(77); for (let i = 0; i < d.length; i++) d[i] = r() * 2 - 1; return b; })();
  function nsrc(t, dur) { const s = ac.createBufferSource(); s.buffer = noise; s.loop = true; s.start(t, Math.random() * 2); s.stop(t + dur + .05); return s; }
  function env(g, t, a, peak, d, curve = 'exp') { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); if (curve === 'exp') g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); else g.gain.linearRampToValueAtTime(0.0001, t + a + d); }
  function filt(type, f, q = .7) { const n = ac.createBiquadFilter(); n.type = type; n.frequency.value = f; n.Q.value = q; return n; }
  function chain(...nodes) { for (let i = 0; i < nodes.length - 1; i++) nodes[i].connect(nodes[i + 1]); return nodes[nodes.length - 1]; }
  const shaper = (k = 8) => { const w = ac.createWaveShaper(), n = 1024, c = new Float32Array(n); for (let i = 0; i < n; i++) { const x = i / n * 2 - 1; c[i] = Math.tanh(k * x) / Math.tanh(k); } w.curve = c; return w; };

  // ---- SFX vocabulary ----
  function thud(t, amp = .8, lp = 220, verb = .3) {
    const o = ac.createOscillator(); o.frequency.setValueAtTime(72, t); o.frequency.exponentialRampToValueAtTime(30, t + .4);
    const g = ac.createGain(); env(g, t, .005, amp, .7); chain(o, g, sfx); send(g, bigVerb, verb); o.start(t); o.stop(t + .9);
    const n = nsrc(t, .3), ng = ac.createGain(); env(ng, t, .002, amp * .6, .22); chain(n, filt('lowpass', lp), ng, sfx); send(ng, bigVerb, verb);
  }
  function boom(t, amp = 1, len = 2.5, verb = .8) {
    const o = ac.createOscillator(); o.frequency.setValueAtTime(58, t); o.frequency.exponentialRampToValueAtTime(22, t + len * .7);
    const g = ac.createGain(); env(g, t, .004, amp, len); chain(o, shaper(3), g, sfx); send(g, bigVerb, verb); o.start(t); o.stop(t + len + .2);
    const n = nsrc(t, len), ng = ac.createGain(); env(ng, t, .002, amp * .9, len * .6); const f = filt('lowpass', 1800); f.frequency.setValueAtTime(3000, t); f.frequency.exponentialRampToValueAtTime(120, t + len * .6); chain(n, f, ng, sfx); send(ng, bigVerb, verb);
    const c = ac.createOscillator(); c.type = 'square'; c.frequency.value = 110; const cg = ac.createGain(); env(cg, t, .001, amp * .25, .06); chain(c, filt('lowpass', 900), cg, sfx); c.start(t); c.stop(t + .1);
  }
  function hiss(t, dur, f, q, amp, type = 'bandpass', a = .01, verb = 0, dest = sfx) { const n = nsrc(t, dur), g = ac.createGain(); env(g, t, a, amp, dur - a); const fl = filt(type, f, q); chain(n, fl, g, dest); if (verb) send(g, verb === 1 ? roomVerb : bigVerb, .4); return fl; }
  function tone(t, dur, f, amp, type = 'sine', a = .005, verb = 0) { const o = ac.createOscillator(); o.type = type; o.frequency.value = f; const g = ac.createGain(); env(g, t, a, amp, dur); chain(o, g, sfx); if (verb) send(g, verb === 1 ? roomVerb : bigVerb, .5); o.start(t); o.stop(t + a + dur + .05); return o; }
  function click(t, amp = .4, f = 2500) { hiss(t, .03, f, 2, amp, 'bandpass', .001, 1); }
  function breath(t, inhale, amp = .06) { const d = inhale ? .9 : 1.1; const fl = hiss(t, d, inhale ? 1400 : 900, .8, amp, 'bandpass', d * .45); fl.frequency.linearRampToValueAtTime(inhale ? 1800 : 700, t + d); }
  function taiko(t, amp = .8, verb = .35) { const o = ac.createOscillator(); o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(48, t + .18); const g = ac.createGain(); env(g, t, .002, amp, .5); chain(o, g, sfx); send(g, bigVerb, verb); o.start(t); o.stop(t + .6); hiss(t, .12, 900, .8, amp * .5, 'lowpass', .001); }
  function drone(t0, t1, f, amp, lp = 300, type = 'sawtooth') {
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(amp, t0 + 1.5); g.gain.setValueAtTime(amp, t1 - .05); g.gain.linearRampToValueAtTime(0.0001, t1);
    const f1 = filt('lowpass', lp); chain(f1, g, sfx); send(g, bigVerb, .3);
    [f, f * 1.006, f * 2.003].forEach(fr => { const o = ac.createOscillator(); o.type = type; o.frequency.value = fr; o.connect(f1); o.start(t0); o.stop(t1 + .1); });
  }
  function crowd(t0, t1, amp) {
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(amp, t0 + .12); g.gain.setValueAtTime(amp, t1 - .01); g.gain.linearRampToValueAtTime(0.0001, t1);
    chain(g, sfx); send(g, bigVerb, .5);
    const n = nsrc(t0, t1 - t0); chain(n, filt('bandpass', 900, .6), g);
    const r = mulberry32(31); for (let i = 0; i < 26; i++) { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 140 + r() * 320; o.frequency.linearRampToValueAtTime(o.frequency.value * (1.05 + r() * .1), t1); const vg = ac.createGain(); vg.gain.value = .045; chain(o, filt('bandpass', 700 + r() * 900, 3), vg, g); o.start(t0 + r() * .05); o.stop(t1 + .05); }
    for (let i = 0; i < 6; i++) { const o = ac.createOscillator(); o.type = 'triangle'; o.frequency.value = 900 + r() * 500; const vg = ac.createGain(); vg.gain.value = .03; chain(o, vg, g); o.start(t0); o.stop(t1); } // tiny blueberry yells
  }

  // ---- ACT ONE: silence, breath, march ----
  breath(.15, true, .05); breath(1.1, false, .05); breath(2.3, true, .045); breath(3.3, false, .04); breath(4.25, true, .05);
  hiss(0, 19.2, 300, .5, .012, 'lowpass', 1.5); // low wind
  [1.2, 2.6, 4.0, 5.95].forEach((t, i) => thud(t, .25 + i * .18, 160 + i * 60, .5));
  // crickets until the thud at 11.6
  for (let t = 8.1; t < 11.6; t += .27) { for (let k = 0; k < 3; k++) tone(t + k * .035, .02, 4400 + (t * 100 % 300), .012); }
  hiss(8.0, 3.7, 600, .5, .02, 'lowpass', .5); // distant market murmur
  for (let t = 11.6; t < 19.0; t += .75) thud(t, .55 + Math.min(.35, (t - 11.6) * .05), 260, .45);
  for (let t = 12.0; t < 14.5; t += .75) { hiss(t + .05, .25, 3000, 3, .02, 'bandpass', .01); } // chain jingle
  tone(13.4, 2.2, 98, .05, 'sawtooth', .6, 2); // distant horn-call
  drone(6.4, 19.25, 41.2, .05, 260);
  // flashback flash-cuts + muffled brawl
  [14.5, 15.15, 15.8, 16.5].forEach(t => { hiss(t, .18, 2000, .7, .12, 'bandpass', .002); });
  hiss(14.5, .65, 700, .7, .07, 'lowpass', .05); hiss(15.15, .3, 500, .7, .08, 'lowpass', .01);
  thud(16.95, .5, 600, .3); // broccoli door slam
  // the hoof
  hiss(18.6, .65, 400, .7, .05, 'lowpass', .6); // air pressure swell
  boom(19.25, 1.0, 2.8, .9);

  // ---- ACT THREE: the cellar ----
  hiss(19.6, 16.2, 5000, .3, .006, 'highpass', .5); // radio static
  [19.7, 20.15, 20.6, 21.05].forEach(t => thud(t, .12, 900, .2)); // boots on stairs
  hiss(21.15, .25, 2500, .6, .2, 'highpass', .003, 1); hiss(21.35, .5, 1800, .5, .08, 'bandpass', .02, 1); // map slap + unroll
  hiss(22.6, .9, 2600, 6, .05, 'bandpass', .2, 1); // leather glove
  click(24.1, .5, 3000); click(24.28, .5, 2800); // briefcase clack-clack
  for (let i = 0; i < 12; i++) click(25.55 + i * .045, .25, 4200); // cylinder ratchet
  click(26.2, .7, 1800); thud(26.2, .15, 1200, .1); // snap shut
  [27.1, 27.14, 27.2, 27.23, 27.29].forEach(t => click(t, .6, 3400)); thud(27.15, .2, 400, .2); // knuckles
  const wf = hiss(28.25, .35, 400, .9, .18, 'bandpass', .05, 1); wf.frequency.exponentialRampToValueAtTime(3200, 28.6); // coat whoosh
  for (let i = 0; i < 9; i++) tone(28.4 + i * .05, .12, 3200 + (i * 731 % 2400), .03); // keys
  tone(32.95, .35, 2900, .03, 'sine', .02); // headset feedback
  for (let i = 0; i < 4; i++) click(33.3 + i * .18, .12, 1400); // colander rattle
  // ---- ACT FOUR: war ----
  boom(36.0, .9, 1.2, .5); // the drop
  const eng = ac.createOscillator(); eng.type = 'sawtooth'; eng.frequency.setValueAtTime(70, 36.0); eng.frequency.linearRampToValueAtTime(120, 36.7); const eg = ac.createGain(); env(eg, 36.0, .05, .1, .65, 'lin'); chain(eng, filt('lowpass', 700), eg, sfx); eng.start(36); eng.stop(36.8);
  const sq = tone(36.1, .55, 1150, .02, 'sine', .05); sq.frequency.linearRampToValueAtTime(1350, 36.6);
  boom(36.15, .5, 1.0, .4);
  hiss(36.7, .15, 3000, .8, .2, 'highpass', .002); // awning snap
  for (let i = 0; i < 7; i++) { const s = tone(37.35 + i * .015, .5, 900 + i * 90, .015, 'sawtooth', .02); s.frequency.linearRampToValueAtTime(1300 + i * 60, 37.95); } // grapes screaming
  boom(38.0, .55, .7, .3); for (let i = 0; i < 8; i++) click(38.02 + i * .03, .5, 900 + i * 200); // gate splinters
  [1200, 2950, 4150, 6100].forEach((f, i) => tone(38.66, 1.6, f, .05 / (i + 1), 'sine', .002, 2)); // the anvil (high noon)
  const wh = hiss(38.66, .7, 1200, 8, .03, 'bandpass', .1); wh.frequency.linearRampToValueAtTime(1800, 39.3);
  boom(39.4, .6, 1.0, .4); boom(39.75, .5, .8, .4);
  click(40.15, .8, 600); thud(40.15, .25, 900, .2); for (let i = 0; i < 6; i++) tone(40.2 + i * .04, .15, 2600 + i * 400, .02); // lock + keys
  for (let t = 40.05; t < 42.2; t += .349) thud(t, .16, 700, .15); // tenants pounding
  // war drums (reinforce the score)
  for (let t = 36.0; t < 42.0; t += .25) { const beat = Math.round((t - 36) / .25); if ([0, 3, 4, 6, 8, 11, 12, 14].includes(beat % 16)) taiko(t, beat % 8 === 0 ? .55 : .3); }
  // ---- the speech: near silence ----
  drone(42.2, 47.35, 36.7, .06, 500);
  for (let i = 0; i < 40; i++) { const t = 42.2 + i * .12 + Math.sin(i * 7) * .05; if (t < 47.3) click(t, .05 + (i % 3) * .02, 2000 + (i * 397 % 1500)); } // torch crackle
  for (let t = 44.85; t < 47.3; t += .55) thud(t, .45, 300, .4); // march
  for (let i = 0; i < 6; i++) click(44.9 + i * .18, .12, 5200); // chains
  const bel = ac.createOscillator(); bel.type = 'sawtooth'; bel.frequency.setValueAtTime(58, 46.0); bel.frequency.linearRampToValueAtTime(50, 47.2); const bg = ac.createGain(); env(bg, 46.0, .3, .12, 1.0, 'lin'); chain(bel, filt('bandpass', 320, 2), bg, sfx); send(bg, bigVerb, .6); bel.start(46); bel.stop(47.4);
  // 47.35–48.3: dead silence. then the line. then:
  taiko(49.95, .9, .6);
  // ---- ACT FIVE: the gate + anthem ----
  const cr = hiss(50.1, 1.6, 320, 14, .09, 'bandpass', .2, 2); cr.frequency.linearRampToValueAtTime(760, 51.6);
  const gr = ac.createOscillator(); gr.type = 'sawtooth'; gr.frequency.value = 38; const gg = ac.createGain(); env(gg, 50.1, .3, .06, 1.4, 'lin'); chain(gr, filt('lowpass', 200), gg, sfx); gr.start(50.1); gr.stop(51.9);
  for (let i = 0; i < 6; i++) click(50.2 + i * .2, .25, 900); // chains
  hiss(50.1, 6.2, 900, .4, .03, 'lowpass', 1.0); // wind and banners
  for (let t = 50.05; t < 56.3; t += .25) { const beat = Math.round((t - 50.05) / .25); if ([0, 2, 4, 6, 7, 8, 10, 12, 13, 14, 15].includes(beat % 16)) taiko(t, beat % 4 === 0 ? .6 : .32); }
  for (let i = 0; i < 6; i++) click(53.05 + i * .05, .15, 3000 + i * 300); // weapons rattle
  tone(53.95, .5, 2400, .05, 'sine', .001, 2); tone(53.95, .5, 3700, .03, 'sine', .001, 2); // frying pan ting
  for (let t = 54.3; t < 55.0; t += .32) thud(t, .1, 500, .1); // footsteps
  crowd(56.08, 56.4, .45);
  // ---- title ----
  boom(56.4, 1.0, 3.2, 1.0);
  [56.8, 56.94, 57.08, 57.22].forEach(t => thud(t, .22, 300, .4));
  boom(57.38, .5, 1.6, .7);

  // ---- SCORE: cut to picture ----
  function scoreSeg(src0, t0, t1, gain, ducks = [], fadeIn = .02) {
    const s = ac.createBufferSource(); s.buffer = score; const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(gain, t0 + fadeIn);
    for (const [a, b, k] of ducks) { g.gain.setValueAtTime(gain, Math.max(t0 + fadeIn, a - .15)); g.gain.linearRampToValueAtTime(gain * k, a); g.gain.setValueAtTime(gain * k, b); g.gain.linearRampToValueAtTime(gain, b + .3); }
    g.gain.setValueAtTime(gain, t1 - .03); g.gain.linearRampToValueAtTime(0.0001, t1);
    chain(s, g, master); s.start(t0, src0); s.stop(t1 + .05);
  }
  const duckL = (from, to, k) => LINES.filter(l => l.t >= from && l.t < to).map(l => [l.t, l.t + l.d, k]);
  scoreSeg(0.0, 6.4, 19.25, .42, duckL(6, 19.3, .45), 2.0);
  scoreSeg(12.6, 19.6, 35.8, .5, [...duckL(19.6, 35.8, .5), [33.85, 34.45, .12]], .6);
  scoreSeg(43.0, 36.0, 42.2, .78, duckL(36, 42.2, .5));
  scoreSeg(47.5, 50.05, 56.4, .85, duckL(50, 56.4, .55));

  // ---- VOICES ----
  // segments inside the Strawberry file (seconds), in LINES order
  const SB = [[0.0, .92], [2.1, 5.62], [6.0, 7.98], [8.78, 9.66], [10.28, 13.86], [14.75, 17.28], [17.88, 18.93], [19.62, 20.9], [21.64, 23.31], [24.27, 25.55]];
  const vox = ac.createGain(); vox.gain.value = 1.15; const vhp = filt('highpass', 90); const pres = filt('peaking', 3200, 1); pres.gain.value = 3;
  chain(vhp, pres, vox, master);
  function voice(buf, t, a, b, o = {}) {
    const { rate = 1, verb = 'room', amt = .25, gain = 1, lp = 0 } = o;
    const s = ac.createBufferSource(); s.buffer = buf; s.playbackRate.value = rate;
    const g = ac.createGain(); g.gain.value = gain; let n = chain(s, g);
    if (lp) n = chain(n, filt('lowpass', lp));
    n.connect(vhp); send(n, verb === 'big' ? bigVerb : roomVerb, amt);
    s.start(t, a, (b - a)); }
  let si = 0;
  for (const l of LINES) {
    if (l.who === 'STRAWBERRY') { const [a, b] = SB[si++]; voice(sb, l.t, a, b, l.whisper ? { gain: .8, lp: 4200, amt: .1 } : { verb: l.t > 42 && l.t < 50 ? 'big' : 'room', amt: l.t > 42 ? .22 : .18 }); }
  }
  voice(lem, 30.35, 0, 1.5, { amt: .2 }); voice(lem, 34.55, 2.12, 3.25, { amt: .2 });
  voice(pot, 32.6, 0, 1.23, { gain: 1.05, amt: .25 });
  voice(pum, 40.1, 0, 2.04, { amt: .15, gain: 1.05 });
  voice(ger, 58.05, 0, 1.9, { rate: 1.5, amt: 0, gain: 1.1 });
  voice(gr2, 59.3, 0, 1.23, { rate: 1.6, amt: 0, gain: 1.0 });

  const out = await ac.startRendering();
  return encodeWav(out);
}
function encodeWav(buf) {
  const n = buf.length, ch = buf.numberOfChannels, sr = buf.sampleRate, bytes = 44 + n * ch * 2, ab = new ArrayBuffer(bytes), v = new DataView(ab);
  const ws = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  ws(0, 'RIFF'); v.setUint32(4, bytes - 8, true); ws(8, 'WAVE'); ws(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, ch, true); v.setUint32(24, sr, true); v.setUint32(28, sr * ch * 2, true); v.setUint16(32, ch * 2, true); v.setUint16(34, 16, true); ws(36, 'data'); v.setUint32(40, n * ch * 2, true);
  const L = buf.getChannelData(0), R = buf.getChannelData(1); let o = 44, peak = 0;
  for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  const k = peak > .98 ? .98 / peak : 1;
  for (let i = 0; i < n; i++) { v.setInt16(o, Math.max(-1, Math.min(1, L[i] * k)) * 32767, true); v.setInt16(o + 2, Math.max(-1, Math.min(1, R[i] * k)) * 32767, true); o += 4; }
  let s = ''; const u8 = new Uint8Array(ab); for (let i = 0; i < u8.length; i += 32768) s += String.fromCharCode.apply(null, u8.subarray(i, i + 32768));
  return btoa(s);
}
