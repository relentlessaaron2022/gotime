# The Gathering × Video Express (via Muse)

The end-to-end workflow for the 60-second trailer. **Muse** drives Video Express and generates the images, clips and voices. The repo covers everything around it: the prompts, the continuity rules, tracking which shots are done, and the final cuts.

```
PRODUCTION_PLAN.md ─┐                            (the rulebook: locked character looks + lock sheet)
shots.json ─────────┴─► vx.py build ─► MUSE_HANDOFF.md   (the brief you give Muse)
                                    ├► muse_jobs.json    (the same jobs, machine-readable)
                                    └► STATUS.md         (what's delivered, what's next)

Muse ─► refs/  keyframes/  clips/  audio/ ─► vx.py cut ─► out/ANGRY_FRUIT_VX_16x9.mp4
                                                       └► out/ANGRY_FRUIT_VX_9x16.mp4
```

## What gets made

- **Every clip is 10 seconds**, generated from an approved start image.
- **Every shot comes in both 16:9 and 9:16.** Vertical is composed as vertical, with its own start image, not cropped from horizontal.
- **Every clip has three beats:** 0–3s setup, 3–7s the key moment, 7–10s aftermath and hold. The trailer takes each shot's slot from its `in` point (3s by default). Each 10-second clip also works on its own as a social post.
- **14 distinct voices**, one locked voice per character, each different in pitch, pace and texture. The descriptions live in `shots.json` under `voices`. On-camera lines carry a short voice note inside the video prompt. Every line, on camera or not, is also a separate voice job, so a voice that drifts in Video Express can be swapped in the edit.

That's 121 jobs in total: 17 character references, 42 start images, 42 clips and 20 voice lines.

## The files

| File | What it is |
|---|---|
| `shots.json` | The shooting script: 21 shots, 60 seconds, voice casting, 10-second beats, and vertical framing for the wide shots. **Edit this to change anything.** |
| `MUSE_HANDOFF.md` | Generated. The full brief for Muse: the rules, file naming, voice casting, and every job with its exact prompt and checks. Jobs already delivered are marked ✅. |
| `muse_jobs.json` | Generated. The same jobs as data, for when Muse can read structured input. |
| `STATUS.md` | Generated. The 16:9 and 9:16 status of every shot. |
| `vx.py` | The tool. |

## The loop

1. **`python3 vx.py build`** checks the script, then rewrites the handoff and status. It refuses to build if:
   - the cut isn't exactly 60 seconds
   - a shot's beats don't run to 10 seconds
   - a shot's trailer window runs past the end of its clip
   - the continuity lock sheet is broken
   - the Pork or Beef Tribes aren't silhouettes
   - a shot has more than one on-camera line
   - a speaker has no voice assigned
   - an on-camera line is missing from its video prompt
   - a shot has too many words for its slot
2. **Give Muse `MUSE_HANDOFF.md`**, plus `muse_jobs.json` if it takes files.
3. **File what comes back.** Orientation is read from each file's dimensions automatically.
   ```bash
   python3 vx.py file strawberry_final.png strawberry   # -> refs/strawberry.png
   python3 vx.py file s05_vertical.png S05              # portrait -> keyframes/S05_v.png
   python3 vx.py file s05_wide.mp4 S05                  # landscape -> clips/S05_h.mp4
   python3 vx.py file s08_line.wav S08_STRAWBERRY       # -> audio/S08_STRAWBERRY.wav
   ```
   You can also have Muse return files already named to the handoff's scheme and drop them straight into the folders. A file in a folder counts as approved.
4. **`python3 vx.py build` again.** The handoff now marks those jobs ✅, so the next round with Muse covers only what's left.
5. **`python3 vx.py cut`** writes both trailers. Use `--only h` or `--only v` for just one, and `--audio mix.wav` to lay a finished mix over the picture.

The cut runs at any stage. For each shot it uses the best thing available, in this order:
1. that aspect's clip
2. that aspect's start image, with a slow push-in
3. the other aspect's clip, recomposed by crop (set `"v_focus"` on a shot to aim the vertical crop, from 0 for left to 1 for right)
4. the other aspect's start image, recomposed by crop
5. a labeled placeholder card

16:9 gets the 2.39 letterbox on scope shots, and 9:16 stays full frame. The title is set in Cinzel in both.

`clips/` and `out/` are gitignored, since video is large. References, start images and voice files are committed, so the looks and voices stay locked.
