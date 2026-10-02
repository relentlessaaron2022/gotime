#!/usr/bin/env python3
"""KIE.ai client for the Angry Fruit hero shots: reference frame -> Nano Banana 2 keyframe -> Veo 3.1 clip.
Reads KIE_API_KEY from the environment. Usage: python3 kie.py [shot_id ...]   (default: all shots)"""
import json, os, subprocess, sys, time, urllib.request

API = "https://api.kie.ai"
UPLOAD = "https://kieai.redpandaai.co/api/file-stream-upload"
KEY = os.environ.get("KIE_API_KEY")
VEO_MODEL = os.environ.get("KIE_VEO_MODEL", "veo-3-1")
HERE = os.path.dirname(os.path.abspath(__file__))

def call(method, path, body=None):
    req = urllib.request.Request(API + path, method=method, data=json.dumps(body).encode() if body else None,
                                 headers={"Authorization": f"Bearer {KEY}", "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=120) as r:
        out = json.load(r)
    if out.get("code") not in (200, None):
        raise RuntimeError(f"{path}: {out}")
    return out.get("data", out)

def upload(path):
    out = subprocess.run(["curl", "-sS", "-X", "POST", UPLOAD, "-H", f"Authorization: Bearer {KEY}",
                          "-F", f"file=@{path}", "-F", "uploadPath=angry-fruit", "-F", f"fileName={os.path.basename(path)}"],
                         capture_output=True, text=True, check=True).stdout
    data = json.loads(out)
    if not data.get("success", True) and data.get("code") != 200:
        raise RuntimeError(f"upload failed: {out}")
    return data["data"].get("downloadUrl") or data["data"]["fileUrl"]

def task(model, inp):
    tid = call("POST", "/api/v1/jobs/createTask", {"model": model, "input": inp})["taskId"]
    print(f"  {model} task {tid}", flush=True)
    while True:
        time.sleep(8)
        d = call("GET", f"/api/v1/jobs/recordInfo?taskId={tid}")
        if d["state"] == "success":
            return json.loads(d["resultJson"])["resultUrls"][0]
        if d["state"] == "fail":
            raise RuntimeError(f"{model} failed: {d.get('failCode')} {d.get('failMsg')}")

def fetch(url, path):
    subprocess.run(["curl", "-sS", "-L", "-o", path, url], check=True)

def main():
    if not KEY:
        sys.exit("KIE_API_KEY is not set. Add it in the environment settings and start a new session.")
    cfg = json.load(open(os.path.join(HERE, "shots.json")))
    want = set(sys.argv[1:])
    os.makedirs(os.path.join(HERE, "out"), exist_ok=True)
    for s in cfg["shots"]:
        if want and s["id"] not in want:
            continue
        vid = os.path.join(HERE, "out", f"{s['id']}.mp4")
        if os.path.exists(vid):
            print(f"{s['id']}: already done"); continue
        print(f"{s['id']}:", flush=True)
        ref = upload(os.path.join(HERE, "ref", f"{s['id']}.png"))
        key_png = os.path.join(HERE, "out", f"{s['id']}_key.png")
        if not os.path.exists(key_png):
            url = task("nano-banana-2", {"prompt": s["image"].replace("{style}", cfg["style"]), "image_input": [ref],
                                         "aspect_ratio": "16:9", "resolution": "2K", "output_format": "png"})
            fetch(url, key_png)
        key_url = upload(key_png)
        url = task(VEO_MODEL, {"prompt": s["video"], "image_urls": [key_url], "generation_type": "FIRST_AND_LAST_FRAMES_2_VIDEO",
                               "aspect_ratio": "16:9", "resolution": "1080p", "duration": 8 if s["t1"] - s["t0"] > 4 else 4})
        fetch(url, vid)
        print(f"  saved {vid}")

if __name__ == "__main__":
    main()
