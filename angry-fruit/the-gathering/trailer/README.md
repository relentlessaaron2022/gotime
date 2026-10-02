# The Gathering: Trailer Engine

The 60-second teaser, built entirely in code. Every frame is drawn on an HTML canvas, and every sound effect is synthesized with the Web Audio API.

| File | What it does |
|---|---|
| `lib.js` | Render core: lighting, smoke, particles, film grain, vignette, 2.39:1 letterbox, captions, camera |
| `chars.js` | The cast, built to the locked character anchors in `../PRODUCTION_PLAN.md`, plus the Pork and Beef silhouettes |
| `env.js` | Locations: Orchard Districts, Far Ranges, Root Cellar, Old Market Square, Great Orchard Gate |
| `shots.js` | The 25-shot timeline, dialogue timings, captions, frame renderer |
| `audio.js` | Offline mix: synthesized SFX, plus the score and voices cut to picture |
| `render.js` | Parallel headless render to H.264 through ffmpeg |

## Rendering it

The voice and score files go in `audio/`. They were generated with vidIQ (voices: Callum, Matilda, Liam, Adam, Eric and Harry; score: one 57-second original track) and aren't committed.

```bash
python3 -m http.server 8765 --bind 127.0.0.1 &
node render.js 4 0 60          # writes out/seg*.mp4 + out/mix.wav
ffmpeg -f concat -i out/list.txt -i out/mix.wav -c:v copy -c:a aac -b:a 256k -shortest ANGRY_FRUIT_THE_GATHERING.mp4
```

To replace any shot with generated footage (Higgsfield, vidIQ, etc.), cut it in at the same timecode. The sound mix doesn't change.
