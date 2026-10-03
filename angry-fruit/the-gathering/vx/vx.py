#!/usr/bin/env python3
"""Angry Fruit x Video Express (driven by Muse): one script for the whole round trip.

  python3 vx.py build              check shots.json against the bible, then write
                                   MUSE_HANDOFF.md, muse_jobs.json and STATUS.md
  python3 vx.py status             what each shot has, in both aspects, and what it needs next
  python3 vx.py file <path> <slot> put a finished file where it belongs
                                   slot = a shot (S05; orientation is read from the file,
                                   or force it with S05_h / S05_v) or a character (strawberry)
  python3 vx.py cut [--only h|v] [--audio mix.wav]
                                   assemble the 60s trailer in 16:9 and 9:16 from whatever exists

Every Video Express clip is generated at 10 seconds in both 16:9 and 9:16. The trailer
takes each shot's slot length starting at its "in" point (3s by default, where the beat lands).

Folders (a file in a folder means it's approved):
  refs/       one image per character: strawberry.png, grapes.png ...
  keyframes/  start image per shot and aspect: S05_h.png, S05_v.png
  clips/      Video Express clip per shot and aspect: S05_h.mp4, S05_v.mp4
  audio/      voice lines from the voice jobs: S08_STRAWBERRY.wav ...
"""
import json, os, re, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
PLAN = os.path.join(HERE, "..", "PRODUCTION_PLAN.md")
FONT = os.path.join(HERE, "..", "trailer", "fonts", "Cinzel-900.woff2")
SANS = os.path.join(HERE, "..", "trailer", "fonts", "Oswald-500.woff2")
DIRS = {d: os.path.join(HERE, d) for d in ("refs", "keyframes", "clips", "audio", "out")}
IMG, VID = (".png", ".jpg", ".jpeg", ".webp"), (".mp4", ".mov", ".webm")
FPS = 24
NO_REF = {"CROWD"}  # cast tags that are atmosphere, not a locked character

# Continuity lock sheet (PRODUCTION_PLAN.md section 6), as words that must never appear in
# a shot's own prompt text when that character is in the shot. Anchors are trusted and not scanned.
DRIFT = {
    "STRAWBERRY": r"smil|grin|headset|full-fingered",
    "WATERMELON": r"horizontal stripe|red flesh|sliced",
    "AVOCADO": r"glossy|halved|pit showing|takes off (his )?glasses",
    "CORN": r"cowboy|sunglasses|coat\b(?! of)|curled brim",
    "BROCCOLI": r"security shirt|fluffy|logo|lettering",
    "CHILI": r"green chili|suit\b|sunglasses",
    "LEMON": r"cape|emblem|heroic pose|bright yellow",
    "CARROT": r"orange jumpsuit|streetwear|normal glasses",
    "PORK TRIBE": r"portrait|eyes? narrow|narrows|readable (face|eyes)|key light|grin",
    "BEEF TRIBE": r"portrait|eyes? narrow|narrows|readable (face|eyes)|key light|grin",
}
HERD = {"PORK TRIBE", "BEEF TRIBE"}
NAME = {c: c.split()[0].lower() for c in DRIFT}
MUST = {"PORK TRIBE": r"silhouette", "BEEF TRIBE": r"silhouette"}
MAX_WPS = 3.2  # spoken words per second of trailer slot before lines start to rush


def slug(name): return re.sub(r"[^a-z0-9]+", "-", name.lower().replace("'", "")).strip("-")
def load(): return json.load(open(os.path.join(HERE, "shots.json")))
def secs(s): return s["t1"] - s["t0"]


def anchors():
    """Locked descriptions, read straight from the plan so the plan stays the only rulebook."""
    found = {m.group(1): m.group(2).strip()
             for m in re.finditer(r"^> \*\*\[([A-Z' ]+)\]\*\* (.+)$", open(PLAN).read(), re.M)}
    found["GERALD"] = found["GRAPES"]
    return found


def lock_sheet():
    """Rows of the continuity lock sheet, keyed by lowercase character name."""
    text = open(PLAN).read().split("## 6.", 1)[1].split("\n## ", 1)[0]
    rows = {}
    for line in text.splitlines():
        cols = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cols) == 3 and cols[0] not in ("Character", "---") and not cols[0].startswith("-"):
            rows[cols[0].lower()] = (re.sub(r"\*\*", "", cols[1]), re.sub(r"\*\*", "", cols[2]))
    return rows


def checks_for(s, sheet):
    out = []
    for c in s["cast"]:
        if c in NO_REF: continue
        key = next((k for k in sheet if NAME.get(c, c.split()[0].lower()) in k), None)
        if key: out.append(f"{c.title()}: must match: {sheet[key][0].rstrip('.')}. Reject: {sheet[key][1].rstrip('.')}.")
    return out


def expand(text, anc): return re.sub(r"\{([A-Z' ]+)\}", lambda m: anc[m.group(1)], text)


def light_note(s, hero_t0):
    if "STRAWBERRY" not in s["cast"]: return ""
    if s["t0"] < hero_t0: return " Strawberry is half-lit: the left side of his face falls into shadow."
    return " Strawberry is fully lit for the first time."


def image_prompt(s, data, anc, hero_t0, a):
    comp = (s.get("vertical") or data["vertical_default"]) if a == "v" else "Horizontal 16:9 widescreen composition."
    return f"{expand(s['image'], anc)}{light_note(s, hero_t0)} {comp} {data['style']}"


def speakers(s): return [d for d in s["dialogue"] if d["mode"] in ("camera", "walla")]


def video_prompt(s, data, a):
    asp = data["aspects"][a]
    voices = "".join(f" Voice for {d['who'].title()}: {data['voices'][d['who']]['short']}." for d in speakers(s))
    return (f"{data['clip_seconds']}-second shot, {asp['ratio']} {'vertical' if a == 'v' else 'horizontal'}. "
            f"Animate from the provided start image. {s['video']}{voices} {data['keep']}")


def lint(data, anc):
    errs, t, clip = [], 0, data["clip_seconds"]
    for s in data["shots"]:
        sid, raw = s["id"], (s["image"] + " " + s["video"] + " " + s.get("vertical", "")).lower()
        if s["t0"] != t: errs.append(f"{sid}: starts at {s['t0']}s, expected {t}s (gap or overlap)")
        t = s["t1"]
        if s["in"] + secs(s) > clip: errs.append(f"{sid}: in {s['in']}s + {secs(s)}s runs past the {clip}s clip")
        if not re.search(rf"[–-]{clip}s:", s["video"]): errs.append(f"{sid}: the beats must run to {clip}s")
        for tok in re.findall(r"\{([A-Z' ]+)\}", s["image"]):
            if tok not in anc: errs.append(f"{sid}: no locked anchor called [{tok}] in the plan")
        for c in s["cast"]:
            if c not in anc and c not in NO_REF: errs.append(f"{sid}: cast member {c} has no anchor in the plan")
            if c in DRIFT:  # the Herd is checked shot-wide; everyone else in sentences that name them
                scope = raw if c in HERD else " ".join(x for x in re.split(r"(?<=[.!?])\s+", raw) if NAME[c] in x)
                if m := re.search(DRIFT[c], scope):
                    errs.append(f"{sid}: '{m.group(0)}' breaks the lock sheet for {c}")
            if c in MUST and not re.search(MUST[c], raw):
                errs.append(f"{sid}: {c} must be described as a silhouette")
        cam = [d for d in s["dialogue"] if d["mode"] == "camera"]
        if len(cam) > 1: errs.append(f"{sid}: {len(cam)} on-camera lines; keep one and move the rest to voiceover")
        for d in s["dialogue"]:
            if d["who"] not in data["voices"]: errs.append(f"{sid}: {d['who']} has no voice in shots.json")
            if d["mode"] == "camera" and d["line"] not in s["video"]:
                errs.append(f"{sid}: on-camera line \"{d['line']}\" is not in the video prompt")
        words = sum(len(d["line"].split()) for d in s["dialogue"])
        if words / secs(s) > MAX_WPS: errs.append(f"{sid}: {words} words in a {secs(s)}s slot is too fast to play")
    if t != data["runtime"]: errs.append(f"cut runs {t}s, target is {data['runtime']}s")
    return errs


def find(folder, stem, exts):
    for e in exts:
        p = os.path.join(DIRS[folder], stem + e)
        if os.path.exists(p): return p


def refs_for(s): return [slug(c) for c in s["cast"] if c not in NO_REF]
def characters(data):
    seen = []
    for s in data["shots"]:
        seen += [c for c in s["cast"] if c not in NO_REF and c not in seen]
    return seen


def aspect_state(s, a):
    if find("clips", f"{s['id']}_{a}", VID): return "clip", None
    if find("keyframes", f"{s['id']}_{a}", IMG): return "image", f"animate {a.upper()}"
    missing = [r for r in refs_for(s) if not find("refs", r, IMG)]
    return "-", (f"refs: {', '.join(missing)}" if missing else f"start image {a.upper()}")


def status_rows(data):
    rows = []
    for s in data["shots"]:
        (h, nh), (v, nv) = aspect_state(s, "h"), aspect_state(s, "v")
        todo = list(dict.fromkeys(x for x in (nh, nv) if x))
        rows.append((s, h, v, "; ".join(todo) or "done"))
    return rows


def jobs(data, anc):
    hero_t0 = next(s["t0"] for s in data["shots"] if s["id"] == "S21")
    sheet, out = lock_sheet(), []
    for c in characters(data):
        sl = slug(c)
        out.append({"job": f"REF_{sl}", "type": "image", "aspect": "any", "inputs": [],
                    "prompt": f"Character reference sheet, neutral grey studio background, full body front view plus "
                              f"three-quarter view, even soft lighting. {anc[c]} {data['style']}",
                    "output": f"refs/{sl}.png", "done": bool(find("refs", sl, IMG))})
    for a in data["aspects"]:
        for s in data["shots"]:
            sid, asp = s["id"], data["aspects"][a]
            out.append({"job": f"{sid}_{a}_image", "type": "image", "shot": sid, "aspect": asp["ratio"],
                        "size": asp["size"], "inputs": [f"refs/{r}.png" for r in refs_for(s)],
                        "prompt": image_prompt(s, data, anc, hero_t0, a), "output": f"keyframes/{sid}_{a}.png",
                        "done": bool(find("keyframes", f"{sid}_{a}", IMG))})
            out.append({"job": f"{sid}_{a}_video", "type": "video", "shot": sid, "aspect": asp["ratio"],
                        "size": asp["size"], "seconds": data["clip_seconds"], "inputs": [f"keyframes/{sid}_{a}.png"],
                        "prompt": video_prompt(s, data, a), "output": f"clips/{sid}_{a}.mp4",
                        "trailer_window": [s["in"], s["in"] + secs(s)],
                        "spoken": [{"who": d["who"], "line": d["line"]} for d in speakers(s)],
                        "checks": checks_for(s, sheet), "done": bool(find("clips", f"{sid}_{a}", VID))})
    for s in data["shots"]:
        for d in s["dialogue"]:
            name = f"{s['id']}_{d['who']}"
            out.append({"job": f"VOICE_{name}", "type": "voice", "shot": s["id"], "who": d["who"], "mode": d["mode"],
                        "voice": data["voices"][d["who"]]["full"], "line": d["line"],
                        "output": f"audio/{name}.wav", "done": bool(find("audio", name, (".wav", ".mp3", ".m4a")))})
    return out


def write_handoff(data, anc):
    js = jobs(data, anc)
    json.dump({"project": data["title"], "clip_seconds": data["clip_seconds"], "jobs": js},
              open(os.path.join(HERE, "muse_jobs.json"), "w"), indent=1, ensure_ascii=False)
    todo = lambda t: [j for j in js if j["type"] == t and not j["done"]]
    L = [f"# Muse handoff: {data['title']}", "",
         "_Generated by `vx.py build` from `shots.json` and `../PRODUCTION_PLAN.md`. Don't edit by hand; "
         "the same jobs are in `muse_jobs.json` for machine use._", "",
         "## What this is", "",
         "Angry Fruit is a premium animated limited series. It is played completely straight: the danger is real, "
         "nobody winks at the camera, and the comedy comes from the characters. You're producing the footage for a "
         "60-second trailer, cut in both 16:9 and 9:16. Every shot is generated as its own **10-second clip** in "
         "**both** aspect ratios, so each clip also works on its own as a social post.", "",
         "## Non-negotiables", "",
         f"1. **Every video is {data['clip_seconds']} seconds**, generated from its approved start image. "
         "Horizontal is 16:9 (1920×1080). Vertical is 9:16 (1080×1920), composed for vertical, not cropped from horizontal.",
         "2. **Don't redesign anyone.** The start image carries the look. Video prompts describe motion, performance and "
         "camera only. If a face, color, costume or prop changes during the clip, reject it.",
         "3. **The Pork and Beef Tribes are silhouettes only.** No readable faces, eyes or mouths, no frontal light, no "
         "dialogue, nothing comic.",
         "4. **Strawberry never smiles.** He's half-lit (left side in shadow) until S21, the first time he's fully lit.",
         "5. **No text in any frame.** No titles, captions, subtitles or watermarks. Titles are added in the edit.",
         "6. **Each character keeps one voice** (see Voice casting). The same character must sound the same in every clip.",
         "7. **Up to 3 attempts per job.** If none pass the checks, return the best one, marked `FLAGGED` with the reason.", "",
         "## How the clips are timed", "",
         "Each video prompt is written in three beats: **0–3s** setup, **3–7s** the key moment (the line or the action), "
         "**7–10s** aftermath and hold. The trailer uses the window listed on each job, normally 3s onward. "
         "The key moment must land inside that window.", "",
         "## Delivery", "",
         "Return files with exactly these names. The repo picks them up automatically.", "",
         "| What | Name |", "|---|---|",
         "| Character reference | `refs/strawberry.png` |", "| Start image | `keyframes/S05_h.png`, `keyframes/S05_v.png` |",
         "| Video clip | `clips/S05_h.mp4`, `clips/S05_v.mp4` |", "| Voice line | `audio/S08_STRAWBERRY.wav` |", "",
         "Order of work: missing references first, then horizontal start images and clips in shot order, "
         "then vertical, then voice lines.", "",
         f"**Still to do:** {len(todo('image'))} images, {len(todo('video'))} clips, {len(todo('voice'))} voice lines. "
         "Jobs already done are marked ✅. Skip them.", "",
         "## Voice casting", "",
         "Design or pick one voice per character from these descriptions, lock it, and reuse it for every line. "
         "Make each one clearly different from the others in pitch, pace and texture. Use original voices only: no "
         "imitations of real actors or public figures.", "",
         "If Video Express speaks the on-camera lines itself, check each one against the locked voice. "
         "Where it doesn't match, deliver the voice-job file and we'll swap and lip-sync it in the edit.", "",
         "| Character | Voice |", "|---|---|"]
    L += [f"| {k.title()} | {v['full']} |" for k, v in data["voices"].items()]
    L += [""]
    refs = [j for j in js if j["type"] == "image" and j["job"].startswith("REF_")]
    L += ["## Character references", "", "One image per character. Every start image in the cast list attaches these.", ""]
    for j in refs:
        L += [f"### {'✅ ' if j['done'] else ''}`{j['output']}`", "", "```", j["prompt"], "```", ""]
    by_id = {j["job"]: j for j in js}
    for a, asp in data["aspects"].items():
        L += [f"## Shots: {asp['label']}", ""]
        for s in data["shots"]:
            im, vd = by_id[f"{s['id']}_{a}_image"], by_id[f"{s['id']}_{a}_video"]
            w0, w1 = vd["trailer_window"]
            L += [f"### {'✅ ' if vd['done'] else ''}{s['id']}_{a} · {s['name']}", "",
                  f"Trailer window: **{w0:g}–{w1:g}s** of the 10-second clip.", ""]
            if im["done"]:
                L += [f"**Start image:** ✅ `{im['output']}`", ""]
            else:
                att = ", ".join(f"`{x}`" for x in im["inputs"]) or "none"
                L += [f"**Start image → `{im['output']}`** (attach: {att})", "", "```", im["prompt"], "```", ""]
            L += [f"**Video → `{vd['output']}`** ({data['clip_seconds']}s, {asp['ratio']}, start from `{im['output']}`)", "",
                  "```", vd["prompt"], "```", ""]
            if vd["checks"]: L += ["Check before returning:", ""] + [f"- {c}" for c in vd["checks"]] + [""]
    L += ["## Voice lines", "",
          "Record every line in the character's locked voice, as a separate clean file (dry, no music, no reverb). "
          "`camera` lines are also spoken in the clip; `vo` lines are only heard off-screen; `walla` is overlapping crowd.", "",
          "| Job | Character | Mode | Line | File |", "|---|---|---|---|---|"]
    L += [f"| {'✅' if j['done'] else ''} {j['shot']} | {j['who'].title()} | {j['mode']} | \"{j['line']}\" | `{j['output']}` |"
          for j in js if j["type"] == "voice"]
    open(os.path.join(HERE, "MUSE_HANDOFF.md"), "w").write("\n".join(L) + "\n")
    return js


def write_status(data):
    rows = status_rows(data)
    n = len(rows) * 2
    done = sum((h == "clip") + (v == "clip") for _, h, v, _ in rows)
    lines = ["# Shot status", "", f"Generated by `vx.py build`. **{done} of {n} clips delivered** (16:9 + 9:16).", "",
             "| Shot | Trailer | 16:9 | 9:16 | Next |", "|---|---|---|---|---|"]
    lines += [f"| {s['id']} {s['name']} | {s['t0']:g}–{s['t1']:g}s | {h} | {v} | {nxt} |" for s, h, v, nxt in rows]
    open(os.path.join(HERE, "STATUS.md"), "w").write("\n".join(lines) + "\n")


def cmd_build():
    data, anc = load(), anchors()
    errs = lint(data, anc)
    for e in errs: print("  x", e)
    if errs: sys.exit(f"{len(errs)} problem(s). Fix shots.json and build again.")
    js = write_handoff(data, anc); write_status(data)
    left = sum(not j["done"] for j in js)
    print(f"ok: {len(data['shots'])} shots, {data['runtime']}s, {len(js)} Muse jobs ({left} to do). "
          "Wrote MUSE_HANDOFF.md, muse_jobs.json, STATUS.md")


def cmd_status():
    print("  shot  trailer   16:9   9:16   next")
    for s, h, v, nxt in status_rows(load()):
        print(f"  {s['id']:<4} {s['t0']:>4g}-{s['t1']:<4g} {h:<6} {v:<6} {nxt}")


def dims(p):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
                        "-of", "csv=p=0", p], capture_output=True, text=True)
    w, h = (int(x) for x in r.stdout.strip().split(",")[:2])
    return w, h


def cmd_file(src, slot):
    data, ext = load(), os.path.splitext(src)[1].lower()
    if ext not in IMG + VID + (".wav", ".mp3", ".m4a"): sys.exit(f"unsupported file type {ext}")
    if m := re.fullmatch(r"([Ss]\d\d)(?:_([hHvV]))?", slot):
        sid = m.group(1).upper()
        if sid not in {s["id"] for s in data["shots"]}: sys.exit(f"{sid} is not a shot in shots.json")
        if m.group(2): a = m.group(2).lower()
        else:
            w, h = dims(src); a = "v" if h > w else "h"
        folder, stem = ("clips" if ext in VID else "keyframes"), f"{sid}_{a}"
    elif m := re.fullmatch(r"([Ss]\d\d)_([A-Za-z']+)", slot):
        folder, stem = "audio", f"{m.group(1).upper()}_{m.group(2).upper()}"
    else:
        folder, stem = "refs", slug(slot)
        names = {slug(c) for c in characters(data)}
        if stem not in names: sys.exit(f"{stem} is not a character in this cut. Known: {', '.join(sorted(names))}")
    for e in IMG + VID + (".wav", ".mp3", ".m4a"):  # one file per slot
        old = os.path.join(DIRS[folder], stem + e)
        if os.path.exists(old): os.remove(old)
    dst = os.path.join(DIRS[folder], stem + ext)
    shutil.copy(src, dst); print("filed", os.path.relpath(dst, HERE))


def ff(*a): subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *a], check=True)


def has_audio(p):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a", "-show_entries", "stream=index", "-of", "csv=p=0", p],
                       capture_output=True, text=True)
    return bool(r.stdout.strip())


def esc(t): return t.replace("\\", "\\\\").replace(":", "\\:").replace("'", "’")


def segment(s, data, tmp, a):
    """One trailer slot. Best source first: this aspect's clip, then image; the other aspect's
    clip or image recomposed by crop; then a labeled slate."""
    dur, sid = secs(s), s["id"]
    W, H = data["aspects"][a]["size"]
    other = "v" if a == "h" else "h"
    fx = s.get("v_focus", 0.5) if a == "v" else 0.5
    cands = [("clips", a, VID, "clip"), ("keyframes", a, IMG, "image"),
             ("clips", other, VID, "clip, cropped"), ("keyframes", other, IMG, "image, cropped")]
    src_path, kind = next(((p, k) for f, x, e, k in cands if (p := find(f, f"{sid}_{x}", e))), (None, "slate"))
    post = []
    if s["frame"] == "scope" and a == "h":
        bar = round((H - W / 2.39) / 2)
        post.append(f"drawbox=x=0:y=0:w={W}:h={bar}:color=black:t=fill,drawbox=x=0:y={H - bar}:w={W}:h={bar}:color=black:t=fill")
    if s.get("title"):
        tc, big, small = data["title_card"], round(W * (0.078 if W > H else 0.12)), max(30, round(W * (0.023 if W > H else 0.036)))
        post.append(f"drawtext=fontfile='{FONT}':text='{esc(tc['title'])}':fontsize={big}:fontcolor=0xEDE6D6:x=(w-tw)/2:y=(h-th)/2-{big // 3},"
                    f"drawtext=fontfile='{SANS}':text='{esc(tc['tagline'])}':fontsize={small}:fontcolor=0xEDE6D6:x=(w-tw)/2:y=(h/2)+{big // 2}")
    audio = None
    if kind.startswith("clip"):
        src = ["-ss", f"{s['in']}", "-i", src_path]
        vf = (f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}:(iw-ow)*{fx}:(ih-oh)/2,"
              f"setsar=1,fps={FPS},tpad=stop_mode=clone:stop_duration={dur}")
        if has_audio(src_path): audio = ["-map", "0:a:0"]
    elif kind.startswith("image"):
        frames = int(dur * FPS)
        src = ["-loop", "1", "-i", src_path]
        vf = (f"scale={W * 2}:{H * 2}:force_original_aspect_ratio=increase,crop={W * 2}:{H * 2}:(iw-ow)*{fx}:(ih-oh)/2,"
              f"zoompan=z='1+0.04*on/{frames}':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s={W}x{H}:fps={FPS},setsar=1")
    else:
        src = ["-f", "lavfi", "-i", f"color=c=0x0E0C0B:s={W}x{H}:r={FPS}"]
        fs = round(W / 30)
        vf = "null" if s.get("title") else (
            f"drawtext=fontfile='{SANS}':text='{sid}  {esc(s['name'].upper())}':fontsize={fs}:fontcolor=0x8A8070:x=(w-tw)/2:y=(h-th)/2,"
            f"drawtext=fontfile='{SANS}':text='NOT GENERATED YET':fontsize={fs // 2}:fontcolor=0x5A5248:x=(w-tw)/2:y=(h/2)+{fs}")
    vf = ",".join([vf, *post])
    out = os.path.join(tmp, f"{sid}_{a}.mp4")
    sil = ["-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo"]
    maps = ["-map", "0:v:0", *(audio or ["-map", "1:a:0"])]
    ff(*src, *([] if audio else sil), "-t", f"{dur}", "-vf", vf, *maps,
       "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-r", str(FPS),
       "-c:a", "aac", "-ar", "48000", "-ac", "2", "-b:a", "192k", "-af", f"apad,atrim=0:{dur}", out)
    return out, kind


def cmd_cut(args):
    data = load()
    audio = args[args.index("--audio") + 1] if "--audio" in args else None
    only = args[args.index("--only") + 1] if "--only" in args else None
    tmp = os.path.join(DIRS["out"], "seg"); os.makedirs(tmp, exist_ok=True)
    for a, asp in data["aspects"].items():
        if only and a != only: continue
        pieces, kinds = [], {}
        for s in data["shots"]:
            p, k = segment(s, data, tmp, a); pieces.append(p); kinds[k] = kinds.get(k, 0) + 1
        lst = os.path.join(tmp, f"list_{a}.txt"); open(lst, "w").write("".join(f"file '{p}'\n" for p in pieces))
        final = os.path.join(DIRS["out"], f"ANGRY_FRUIT_VX_{asp['ratio'].replace(':', 'x')}.mp4")
        if audio:
            ff("-f", "concat", "-safe", "0", "-i", lst, "-i", audio, "-map", "0:v", "-map", "1:a", "-c:v", "copy",
               "-c:a", "aac", "-b:a", "256k", "-t", str(data["runtime"]), "-movflags", "+faststart", final)
        else:
            ff("-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", "-movflags", "+faststart", final)
        print(f"wrote {os.path.relpath(final, HERE)} | " + ", ".join(f"{v} {k}" for k, v in kinds.items()))


if __name__ == "__main__":
    for d in DIRS.values(): os.makedirs(d, exist_ok=True)
    a = sys.argv[1:]
    if not a or a[0] in ("-h", "--help"): print(__doc__)
    elif a[0] == "build": cmd_build()
    elif a[0] == "status": cmd_status()
    elif a[0] == "file" and len(a) == 3: cmd_file(a[1], a[2])
    elif a[0] == "cut": cmd_cut(a[1:])
    else: sys.exit(__doc__)
