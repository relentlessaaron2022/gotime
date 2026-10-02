#!/usr/bin/env bash
# One command: generate the six hero shots on KIE and splice them into the trailer.
# Needs KIE_API_KEY in the environment, plus the coded trailer in ../out (render.js).
set -euo pipefail
cd "$(dirname "$0")"
[ -n "${KIE_API_KEY:-}" ] || { echo "KIE_API_KEY is not set."; exit 1; }
curl -s -o /dev/null http://127.0.0.1:8765/trailer.html || (cd .. && python3 -m http.server 8765 --bind 127.0.0.1 >/dev/null 2>&1 &) ; sleep 1
[ -d ref ] || node frames.js ref
[ -d overlay ] || node frames.js overlay
python3 kie.py "$@"
python3 splice.py
