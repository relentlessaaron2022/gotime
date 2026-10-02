// node frames.js ref            -> ref/<id>.png keyframes from the coded trailer
// node frames.js overlay        -> overlay/<id>/%04d.png transparent letterbox+caption layers
const { chromium } = require('/opt/node22/lib/node_modules/playwright/index.js'); const fs = require('fs');
(async () => {
  const mode = process.argv[2], cfg = JSON.parse(fs.readFileSync(__dirname + '/shots.json'));
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('http://127.0.0.1:8765/trailer.html'); await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => Promise.all([...document.fonts].map(f => f.load())));
  for (const s of cfg.shots) {
    if (mode === 'ref') {
      fs.mkdirSync(__dirname + '/ref', { recursive: true });
      const d = await p.evaluate(T => { window.CLEAN = true; renderAt(T); window.CLEAN = false; return document.getElementById('c').toDataURL('image/png').split(',')[1]; }, s.key);
      fs.writeFileSync(`${__dirname}/ref/${s.id}.png`, Buffer.from(d, 'base64'));
    } else {
      const dir = `${__dirname}/overlay/${s.id}`; fs.mkdirSync(dir, { recursive: true });
      await p.evaluate(() => { window.OVERLAY_ONLY = true; });
      const n = Math.round((s.t1 - s.t0) * 24);
      for (let i = 0; i < n; i++) {
        const d = await p.evaluate(T => { renderAt(T); return document.getElementById('c').toDataURL('image/png').split(',')[1]; }, s.t0 + i / 24);
        fs.writeFileSync(`${dir}/${String(i).padStart(4, '0')}.png`, Buffer.from(d, 'base64'));
      }
      await p.evaluate(() => { window.OVERLAY_ONLY = false; });
    }
    console.log(mode, s.id);
  }
  await b.close();
})();
