#!/usr/bin/env python3
"""Cut generated hero shots into the trailer at their timecodes, with captions + letterbox on top.
Usage: python3 splice.py   (uses kie/out/<id>.mp4 for every shot that exists; others keep the coded footage)"""
import json, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
BASE = os.path.join(ROOT, "out", "ANGRY_FRUIT_THE_GATHERING.mp4"); MIX = os.path.join(ROOT, "out", "mix.wav")
OUT = os.path.join(ROOT, "out", "ANGRY_FRUIT_THE_GATHERING_KIE.mp4"); TMP = os.path.join(HERE, "tmp"); os.makedirs(TMP, exist_ok=True)
ENC = ["-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p", "-r", "24", "-an"]
ff = lambda *a: subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *a], check=True)
shots = sorted((s for s in json.load(open(os.path.join(HERE, "shots.json")))["shots"]
                if os.path.exists(os.path.join(HERE, "out", f"{s['id']}.mp4"))), key=lambda s: s["t0"])
pieces, t = [], 0.0
def base_piece(a, b):
    p = os.path.join(TMP, f"base_{a:06.2f}.mp4"); ff("-ss", f"{a}", "-to", f"{b}", "-i", BASE, *ENC, p); pieces.append(p)
for s in shots:
    if s["t0"] > t: base_piece(t, s["t0"])
    p = os.path.join(TMP, f"{s['id']}.mp4")
    ff("-i", os.path.join(HERE, "out", f"{s['id']}.mp4"), "-framerate", "24", "-i", os.path.join(HERE, "overlay", s["id"], "%04d.png"),
       "-filter_complex", "[0:v]fps=24,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,eq=contrast=1.04:saturation=0.95[v];"
       "[v][1:v]overlay=0:0:shortest=1,noise=alls=7:allf=t[o]", "-map", "[o]", "-t", f"{s['t1'] - s['t0']}", *ENC, p)
    pieces.append(p); t = s["t1"]
if t < 60: base_piece(t, 60)
lst = os.path.join(TMP, "list.txt"); open(lst, "w").write("".join(f"file '{p}'\n" for p in pieces))
ff("-f", "concat", "-safe", "0", "-i", lst, "-i", MIX, "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p",
   "-c:a", "aac", "-b:a", "256k", "-t", "60", "-movflags", "+faststart", OUT)
print("wrote", OUT, "with", len(shots), "generated shots")
