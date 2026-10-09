// Renders bag-to-bed.html to a 30s 1080p30 MP4.
// Usage: node render-video.js <abs path to bag-to-bed.html> <out.mp4> [Colorway] [Queen|King]
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const { spawn } = require('child_process');
(async () => {
  const [file, out, color = 'Teal', size = 'Queen'] = process.argv.slice(2);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto(`file://${file}?capture&color=${encodeURIComponent(color)}&size=${size}&cycle=1`);
  await p.evaluate(() => document.fonts.ready);
  const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', '30', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = 0; f < 900; f++) {
    await p.evaluate(t => window.__seek(t), f / 30);
    ff.stdin.write(await p.screenshot({ type: 'jpeg', quality: 95 }));
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close();
})();
