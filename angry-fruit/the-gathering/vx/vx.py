#!/usr/bin/env python3
"""Angry Fruit x Video Express: one script for the whole round trip.

  python3 vx.py build              check shots.json against the bible, write PROMPTS.md and STATUS.md
  python3 vx.py status             what each shot has, and what it needs next
  python3 vx.py file <path> <slot> put a finished image or clip where it belongs
                                   slot = a shot (S05) or a character (strawberry, carrots-truck, pork-tribe)
  python3 vx.py cut [--audio mix.wav]
                                   assemble the 60s cut from whatever exists: clip > keyframe > slate

Folders (dropping a file in a folder means it's approved):
  refs/       one image per character, named by slug: strawberry.png, gerald.png ...
  keyframes/  the start image for each shot: S05.png
  clips/      the Video Express clip for each shot: S05.mp4
"""
import json, os, re, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
PLAN = os.path.join(HERE, "..", "PRODUCTION_PLAN.md")
FONT = os.path.join(HERE, "..", "trailer", "fonts", "Cinzel-900.woff2")
SANS = os.path.join(HERE, "..", "trailer", "fonts", "Oswald-500.woff2")
DIRS = {d: os.path.join(HERE, d) for d in ("refs", "keyframes", "clips", "out")}
IMG, VID = (".png", ".jpg", ".jpeg", ".webp"), (".mp4", ".mov", ".webm")
W, H, FPS = 1920, 1080, 24
SCOPE_BAR = round((H - W / 2.39) / 2)  # 2.39:1 letterbox inside 16:9
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
MAX_WPS = 3.2  # spoken words per second before a generator starts rushing lips


def slug(name): return re.sub(r"[^a-z0-9]+", "-", name.lower().replace("'", "")).strip("-")


def anchors():
    """Locked descriptions, read straight from the plan so the plan stays the only rulebook."""
    found = {}
    for m in re.finditer(r"^> \*\*\[([A-Z' ]+)\]\*\* (.+)$", open(PLAN).read(), re.M):
        found[m.group(1)] = m.group(2).strip()
    found["GERALD"] = found["GRAPES"]
    return found


def load(): return json.load(open(os.path.join(HERE, "shots.json")))


def expand(text, anc):
    return re.sub(r"\{([A-Z' ]+)\}", lambda m: anc[m.group(1)], text)


def light_note(s, hero_t0):
    if "STRAWBERRY" not in s["cast"]: return ""
    if s["t0"] < hero_t0: return " Strawberry is half-lit: the left side of his face falls into shadow."
    return " Strawberry is fully lit for the first time."


def image_prompt(s, data, anc, hero_t0):
    return f"{expand(s['image'], anc)}{light_note(s, hero_t0)} {data['style']}"


def video_prompt(s, data):
    secs = s["t1"] - s["t0"]
    return f"{s['video']} {data['keep']} {secs:g} seconds."


def lint(data, anc):
    errs, t = [], 0
    for s in data["shots"]:
        sid, raw = s["id"], (s["image"] + " " + s["video"]).lower()
        if s["t0"] != t: errs.append(f"{sid}: starts at {s['t0']}s, expected {t}s (gap or overlap)")
        t = s["t1"]
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
        words = sum(len(d["line"].split()) for d in s["dialogue"])
        if words / (s["t1"] - s["t0"]) > MAX_WPS:
            errs.append(f"{sid}: {words} words in {s['t1'] - s['t0']}s is too fast to play")
    if t != data["runtime"]: errs.append(f"cut runs {t}s, target is {data['runtime']}s")
    return errs


def find(folder, stem, exts):
    for e in exts:
        p = os.path.join(DIRS[folder], stem + e)
        if os.path.exists(p): return p


def refs_for(s):
    return [slug(c) for c in s["cast"] if c not in NO_REF]


def shot_state(s):
    missing = [r for r in refs_for(s) if not find("refs", r, IMG)]
    clip, key = find("clips", s["id"], VID), find("keyframes", s["id"], IMG)
    if clip: return "clip", "done", missing
    if key: return "keyframe", "animate in Video Express", missing
    if missing: return "-", "approve refs: " + ", ".join(missing), missing
    return "-", "make the start image", missing


def write_prompts(data, anc):
    hero_t0 = next(s["t0"] for s in data["shots"] if s["id"] == "S21")
    out = ["# Video Express prompt cards", "",
           "Generated by `vx.py build` from `shots.json` and the locked anchors in `../PRODUCTION_PLAN.md`. "
           "Edit those, not this file.", "",
           "For each shot: make or pick the start image with **Prompt A**, attaching the listed reference images. "
           "Upload the approved image to Video Express as the first frame and paste **Prompt B**. "
           "Record voiceover lines separately; they are not in Prompt B.", ""]
    for s in data["shots"]:
        secs = s["t1"] - s["t0"]
        out += [f"## {s['id']} · {s['name']} · {s['t0']:g}–{s['t1']:g}s ({secs:g}s, "
                f"{'2.39 letterbox' if s['frame'] == 'scope' else 'full 16:9'})", ""]
        r = refs_for(s)
        out += [f"**Attach:** {', '.join(f'`refs/{x}`' for x in r) if r else 'no character references'}", "",
                "**Prompt A (start image)**", "", "```", image_prompt(s, data, anc, hero_t0), "```", "",
                "**Prompt B (Video Express)**", "", "```", video_prompt(s, data), "```", ""]
        vo = [d for d in s["dialogue"] if d["mode"] != "camera"]
        if vo: out += ["**Record separately:** " + " / ".join(f"{d['who'].title()} ({d['mode']}): \"{d['line']}\"" for d in vo), ""]
        if s.get("title"): out += [f"**In the edit:** `{data['title_card']['title']}` / `{data['title_card']['tagline']}` is burned in by `vx.py cut`.", ""]
    out += ["## Character reference sheets", "",
            "One approved image per character goes in `refs/`. If you already have one, file it; otherwise use this prompt.", ""]
    seen = []
    for s in data["shots"]:
        for c in s["cast"]:
            if c not in NO_REF and c not in seen: seen.append(c)
    for c in seen:
        out += [f"### `refs/{slug(c)}`", "", "```",
                f"Character reference sheet, neutral grey studio background, full body front view plus three-quarter view, "
                f"even soft lighting. {anc[c]} {data['style']}", "```", ""]
    open(os.path.join(HERE, "PROMPTS.md"), "w").write("\n".join(out))


def status_rows(data):
    return [(s, *shot_state(s)) for s in data["shots"]]


def write_status(data):
    rows = status_rows(data)
    done = sum(1 for r in rows if r[1] == "clip")
    lines = ["# Shot status", "", f"Generated by `vx.py build`. **{done} of {len(rows)} shots have a clip.**", "",
             "| Shot | Time | Have | Next |", "|---|---|---|---|"]
    lines += [f"| {s['id']} {s['name']} | {s['t0']:g}–{s['t1']:g}s | {have} | {nxt} |" for s, have, nxt, _ in rows]
    open(os.path.join(HERE, "STATUS.md"), "w").write("\n".join(lines) + "\n")


def cmd_build():
    data, anc = load(), anchors()
    errs = lint(data, anc)
    for e in errs: print("  x", e)
    if errs: sys.exit(f"{len(errs)} problem(s). Fix shots.json and build again.")
    write_prompts(data, anc); write_status(data)
    print(f"ok: {len(data['shots'])} shots, {data['runtime']}s. Wrote PROMPTS.md and STATUS.md")


def cmd_status():
    for s, have, nxt, _ in status_rows(load()):
        print(f"  {s['id']:<4} {s['t0']:>4g}-{s['t1']:<4g} {have:<9} {nxt}")


def cmd_file(src, slot):
    ext = os.path.splitext(src)[1].lower()
    if re.fullmatch(r"[Ss]\d\d", slot):
        folder = "clips" if ext in VID else "keyframes"
        stem = slot.upper()
        if stem not in {s["id"] for s in load()["shots"]}: sys.exit(f"{stem} is not a shot in shots.json")
    else:
        folder, stem = "refs", slug(slot)
        names = {slug(c) for s in load()["shots"] for c in s["cast"] if c not in NO_REF}
        if stem not in names: sys.exit(f"{stem} is not a character in this cut. Known: {', '.join(sorted(names))}")
    if ext not in IMG + VID: sys.exit(f"unsupported file type {ext}")
    for e in IMG + VID:  # one file per slot
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


def segment(s, data, tmp):
    secs, sid = s["t1"] - s["t0"], s["id"]
    clip, key = find("clips", sid, VID), find("keyframes", sid, IMG)
    fit = f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1,fps={FPS}"
    post = []
    if s["frame"] == "scope":
        post.append(f"drawbox=x=0:y=0:w={W}:h={SCOPE_BAR}:color=black:t=fill,drawbox=x=0:y={H - SCOPE_BAR}:w={W}:h={SCOPE_BAR}:color=black:t=fill")
    if s.get("title"):
        tc = data["title_card"]
        post.append(f"drawtext=fontfile='{FONT}':text='{esc(tc['title'])}':fontsize=150:fontcolor=0xEDE6D6:x=(w-tw)/2:y=(h-th)/2-40,"
                    f"drawtext=fontfile='{SANS}':text='{esc(tc['tagline'])}':fontsize=44:fontcolor=0xEDE6D6:x=(w-tw)/2:y=(h/2)+90")
    if clip:
        src, vf = ["-i", clip], fit
        audio = ["-map", "0:a:0"] if has_audio(clip) else None
    elif key:
        frames = int(secs * FPS)
        src = ["-loop", "1", "-i", key]
        vf = (f"scale={W * 2}:{H * 2}:force_original_aspect_ratio=increase,crop={W * 2}:{H * 2},"
              f"zoompan=z='1+0.04*on/{frames}':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s={W}x{H}:fps={FPS},setsar=1")
        audio = None
    else:
        src = ["-f", "lavfi", "-i", f"color=c=0x0E0C0B:s={W}x{H}:r={FPS}"]
        vf = "null" if s.get("title") else (f"drawtext=fontfile='{SANS}':text='{sid}  {esc(s['name'].upper())}':fontsize=64:fontcolor=0x8A8070:x=(w-tw)/2:y=(h-th)/2,"
              f"drawtext=fontfile='{SANS}':text='NOT GENERATED YET':fontsize=32:fontcolor=0x5A5248:x=(w-tw)/2:y=(h/2)+60")
        audio = None
    vf = ",".join([vf, *post])
    out = os.path.join(tmp, f"{sid}.mp4")
    sil = ["-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo"]
    maps = ["-map", "0:v:0", *(audio or ["-map", "1:a:0"])]
    ff(*src, *([] if audio else sil), "-t", f"{secs}", "-vf", vf, *maps,
       "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-r", str(FPS),
       "-c:a", "aac", "-ar", "48000", "-ac", "2", "-b:a", "192k", "-af", f"apad,atrim=0:{secs}", out)
    return out, ("clip" if clip else "keyframe" if key else "slate")


def cmd_cut(args):
    data = load()
    audio = args[args.index("--audio") + 1] if "--audio" in args else None
    tmp = os.path.join(DIRS["out"], "seg"); os.makedirs(tmp, exist_ok=True)
    pieces, kinds = [], {}
    for s in data["shots"]:
        p, k = segment(s, data, tmp); pieces.append(p); kinds[k] = kinds.get(k, 0) + 1
        print(f"  {s['id']:<4} {k}")
    lst = os.path.join(tmp, "list.txt"); open(lst, "w").write("".join(f"file '{p}'\n" for p in pieces))
    final = os.path.join(DIRS["out"], "ANGRY_FRUIT_VX_CUT.mp4")
    if audio:
        ff("-f", "concat", "-safe", "0", "-i", lst, "-i", audio, "-map", "0:v", "-map", "1:a", "-c:v", "copy",
           "-c:a", "aac", "-b:a", "256k", "-t", str(data["runtime"]), "-movflags", "+faststart", final)
    else:
        ff("-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", "-movflags", "+faststart", final)
    print("wrote", os.path.relpath(final, HERE), "|", ", ".join(f"{v} {k}" for k, v in kinds.items()))


if __name__ == "__main__":
    for d in DIRS.values(): os.makedirs(d, exist_ok=True)
    a = sys.argv[1:]
    if not a or a[0] in ("-h", "--help"): print(__doc__)
    elif a[0] == "build": cmd_build()
    elif a[0] == "status": cmd_status()
    elif a[0] == "file" and len(a) == 3: cmd_file(a[1], a[2])
    elif a[0] == "cut": cmd_cut(a[1:])
    else: sys.exit(__doc__)
