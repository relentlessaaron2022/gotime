// node render.js <workers> [startSec] [endSec]
const { chromium } = require('/opt/node22/lib/node_modules/playwright/index.js');
const { spawn } = require('child_process'); const fs = require('fs');
const URL = 'http://127.0.0.1:8765/trailer.html', FPS = 24;
(async () => {
  const N = +process.argv[2] || 4, S = +(process.argv[3] || 0), Eend = +(process.argv[4] || 60);
  const total = Math.round((Eend - S) * FPS), per = Math.ceil(total / N);
  const b = await chromium.launch();
  // audio first
  if (!process.env.NOAUDIO) {
    const p = await b.newPage(); await p.goto(URL);
    const b64 = await p.evaluate(() => buildMix(60.2)); fs.writeFileSync('out/mix.wav', Buffer.from(b64, 'base64')); console.log('audio done'); await p.close();
  }
  const t0 = Date.now();
  await Promise.all([...Array(N)].map(async (_, w) => {
    const f0 = w * per, f1 = Math.min(total, f0 + per); if (f0 >= f1) return;
    const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
    p.on('pageerror', e => console.log('ERR', w, e.message));
    await p.goto(URL); await p.evaluate(() => document.fonts.ready); await p.evaluate(() => Promise.all([...document.fonts].map(f => f.load())));
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '' + FPS, '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', `out/seg${w}.mp4`]);
    for (let f = f0; f < f1; f++) {
      const T = S + f / FPS;
      const data = await p.evaluate(T => { renderAt(T); return document.getElementById('c').toDataURL('image/jpeg', .93).split(',')[1]; }, T);
      if (!ff.stdin.write(Buffer.from(data, 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
      if (f % 48 === 0) console.log(`w${w} ${f - f0}/${f1 - f0} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }));
  await b.close();
  fs.writeFileSync('out/list.txt', [...Array(N)].map((_, w) => `file 'seg${w}.mp4'`).join('\n'));
  console.log('frames done', ((Date.now() - t0) / 1000).toFixed(0), 's');
})();
