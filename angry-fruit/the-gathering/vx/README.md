# The Gathering × Video Express

The end-to-end workflow for the 60-second cut. You generate the video in Video Express. The repo covers everything around it: the prompts, the continuity check, tracking which shots are done, and the final assembly.

```
PRODUCTION_PLAN.md ─┐                                   (the rulebook: locked character descriptions)
shots.json ─────────┴─► vx.py build ─► PROMPTS.md        (paste-ready Prompt A + Prompt B per shot)
                                    └► STATUS.md         (what each shot has, what it needs)

refs/        approved character images ──┐
keyframes/   approved start image per shot ─► Video Express ─► clips/ ─► vx.py cut ─► out/ANGRY_FRUIT_VX_CUT.mp4
```

## The files

| File | What it is |
|---|---|
| `shots.json` | The shooting script: 21 shots, exactly 60 seconds. It's the Video Express package merged with the production plan's rules. **Edit this file to change a shot.** |
| `PROMPTS.md` | Generated. For every shot: which reference images to attach, Prompt A for the start image, Prompt B for Video Express, and any voiceover to record separately. A reference-sheet prompt for every character is at the bottom. |
| `STATUS.md` | Generated. The board: every shot, what it has and what it needs next. |
| `vx.py` | The tool. |

`vx.py build` reads each character's locked description straight from `../PRODUCTION_PLAN.md`. Change a character there, rebuild, and every prompt updates. Nothing is paraphrased.

## The loop

**1. Build.** `python3 vx.py build`

Before writing anything, it checks the script and refuses to build if:
- the shots don't add up to exactly 60 seconds with no gaps
- a shot breaks the continuity lock sheet (Strawberry smiling, Corn in a cowboy hat, a readable face on the Pork or Beef army)
- a Pork or Beef shot doesn't call for silhouettes
- a shot has more than one on-camera line, or more words than 3.2 per second
- a character in a shot has no locked description in the plan

**2. File what you already have.** Name each file by its slot and drop it in, or use `file`:

```bash
python3 vx.py file ~/Downloads/strawberry_final.png strawberry    # -> refs/strawberry.png
python3 vx.py file ~/Downloads/cellar_v3.png S05                  # -> keyframes/S05.png
python3 vx.py file ~/Downloads/vx_export_0412.mp4 S05             # -> clips/S05.mp4
```

Putting a file in a folder **is** the approval, so only file what passes the lock sheet (plan section 6). Images can be `.png`, `.jpg` or `.webp`. Clips can be `.mp4`, `.mov` or `.webm`. Character slots: `strawberry watermelon avocado corn broccoli chili lemon potato carrot carrots-truck grapes pork-tribe beef-tribe celery pineapples onions blueberries`.

**3. See what's next.** `python3 vx.py status`

**4. Video Express.** Work one shot at a time from `PROMPTS.md`:
1. Upload `keyframes/Sxx` as the start frame.
2. Paste that shot's **Prompt B**. It describes motion, performance and camera only, and ends with the "keep everyone exactly as they are" line. Don't add character descriptions here; the image already carries them.
3. Generate at the shot's length, or a little longer. `cut` trims from the front.
4. Check it against the lock sheet, then file it as `S05`.

**5. Cut.** `python3 vx.py cut`, or `python3 vx.py cut --audio mix.wav` to lay a finished score and voice mix over the picture.

You can run this at any stage. Each shot uses the best thing it has: the clip, or else a slow push on the keyframe, or else a labeled slate. So the first cut is an animatic, and it fills in as clips arrive. Scope shots get the 2.39 letterbox, the title is set in Cinzel, and the output is 1920×1080 at 24 fps.

## Rules this script already follows

- **Strawberry is half-lit until S21.** The build adds that note to every image prompt before then, and S21 lights him fully for the first time.
- **The Pork and Beef army are silhouettes only**, in S04, S18 and S20.
- **Seven grapes, and Gerald is the green one.** He gets the last line.
- **Voiceover lines aren't in Prompt B.** They're listed under each card ("Record separately") and go in the audio mix.
- **No type is generated.** The title is burned in by `cut`.

`clips/` and `out/` are gitignored, since video is large. Reference images and keyframes are committed so the looks stay locked.
