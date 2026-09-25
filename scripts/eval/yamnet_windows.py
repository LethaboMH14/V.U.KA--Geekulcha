#!/usr/bin/env python3
"""YAMNet windows for the detection harness (spec §16 M1/M2).

Reads a clip list (CSV text: filename, category, label, fold), runs the registered YAMNet
model on each clip with the SAME windowing the phone uses (15 600-sample
windows, hop 7 800, 16 kHz mono, a fixed cadence with no gate), and writes one
JSON line per clip with integer windows ready for the engine, including the
gun-like classes' excluded-neighbour score.

It never writes audio anywhere. The audio folder is the caller's; clip lists
are committed, audio is not (dataset licences).

Usage:
  python scripts/eval/yamnet_windows.py --model yamnet.tflite --labels yamnet_labels.txt \
      --clips scripts/eval/esc50-cliplist.txt --audio <folder> --out windows.jsonl
"""
import argparse
import csv
import hashlib
import json
import math
import sys

import numpy as np
from ai_edge_litert.interpreter import Interpreter
from scipy.io import wavfile
from scipy.signal import resample_poly

MODEL_SHA256 = "10c95ea3eb9a7bb4cb8bddf6feb023250381008177ac162ce169694d05c317de"
TARGET_LABELS = ["Shout", "Yell", "Screaming", "Gunshot, gunfire", "Machine gun", "Fusillade", "Glass", "Shatter", "Breaking"]
RATE, WINDOW, HOP = 16000, 15600, 7800
GUN_NEIGHBOURS = ["Explosion", "Artillery fire", "Cap gun", "Fireworks", "Firecracker"]


def to_bp(score: float) -> int:
    return max(0, min(10000, int(math.floor(float(score) * 10000.0 + 0.5))))


def load_16k_mono(path: str) -> np.ndarray:
    sr, x = wavfile.read(path)
    if x.dtype == np.int16:
        x = x.astype(np.float64) / 32768.0
    elif x.dtype == np.int32:
        x = x.astype(np.float64) / 2147483648.0
    else:
        x = x.astype(np.float64)
    if x.ndim > 1:
        x = x.mean(axis=1)
    if sr != RATE:
        g = math.gcd(RATE, sr)
        x = resample_poly(x, RATE // g, sr // g)
    return np.clip(x, -1.0, 1.0).astype(np.float32)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", required=True)
    ap.add_argument("--labels", required=True)
    ap.add_argument("--clips", required=True)
    ap.add_argument("--audio", required=True)
    ap.add_argument("--out", required=True)
    a = ap.parse_args()

    blob = open(a.model, "rb").read()
    if hashlib.sha256(blob).hexdigest() != MODEL_SHA256:
        print("REFUSED: model hash does not match the register", file=sys.stderr)
        return 2
    labels = [l for l in open(a.labels, encoding="utf-8").read().splitlines() if l]
    targets = [labels.index(t) for t in TARGET_LABELS]
    neighbours = [labels.index(t) for t in GUN_NEIGHBOURS]

    it = Interpreter(model_content=blob)
    it.allocate_tensors()
    inp, out = it.get_input_details()[0], it.get_output_details()[0]
    assert int(np.prod(inp["shape"])) == WINDOW, inp["shape"]

    rows = list(csv.DictReader(open(a.clips, newline="", encoding="utf-8")))
    with open(a.out, "w", encoding="utf-8") as fo:
        for r in rows:
            x = load_16k_mono(f"{a.audio}/{r['filename']}")
            windows, seq, start = [], 0, 0
            while start + WINDOW <= len(x):
                seq += 1
                it.set_tensor(inp["index"], x[start: start + WINDOW])
                it.invoke()
                s = it.get_tensor(out["index"]).reshape(-1)
                top = int(np.argmax(s))
                windows.append({
                    "seq": seq,
                    # Time from the sample count, an integer (the hop is 487.5 ms).
                    "endMs": (start + WINDOW) // 16,
                    "targetBp": [to_bp(s[i]) for i in targets],
                    "topIndex": top,
                    "topBp": to_bp(s[top]),
                    "gunNeighbourBp": max(to_bp(s[i]) for i in neighbours),
                })
                start += HOP
            fo.write(json.dumps({"clip": r["filename"], "category": r["category"], "label": r["label"], "fold": r.get("fold", ""),
                                 "seconds": round(len(x) / RATE, 3), "windows": windows}, sort_keys=True) + "\n")
    print(f"wrote {len(rows)} clips to {a.out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
