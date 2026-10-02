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

## Upgrading the key shots with KIE.ai

`kie/` swaps six key shots (the eye, the orchard, the Herd march, the horns, the gate, "So stay angry") for generated footage:

1. Export each shot's frame from the coded trailer, with no captions or widescreen bars (`frames.js ref`).
2. **Nano Banana 2** re-renders it as a premium 3D-animated still, keeping the composition and character designs.
3. **Veo 3.1** animates that still, using the shot prompt from `shots.json`.
4. `splice.py` cuts each clip in at its exact timecode, puts the widescreen bars and captions back on top, and keeps the original sound mix.

```bash
export KIE_API_KEY=...        # set it in the environment settings, never in the repo
./kie/run.sh                  # all six shots, or name some: ./kie/run.sh S21_gate S23_angry
# -> out/ANGRY_FRUIT_THE_GATHERING_KIE.mp4
```

Set `KIE_VEO_MODEL` to choose a different Veo variant from KIE's catalog. The run can be restarted: finished shots are skipped.
