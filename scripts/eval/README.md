# Detection measurement harness (spec §16 M1, M2)

Measures the phone's detector with the phone's own logic: the registered YAMNet
model, the phone's windowing, and the `app/src/brain/detect` engine compiled
from source (not reimplemented). Results go into `docs/EVIDENCE.md` with the
method and n.

## Run

```bash
# 1. The model, verified against the register (never committed)
node app/scripts/fetch-model.mjs

# 2. The engine, compiled for Node (never committed)
cd app && npx tsc src/brain/detect/index.ts --outDir build-eval --module commonjs --target es2020 --moduleResolution node --skipLibCheck && cd ..

# 3. Windows for every clip (audio folder is yours; ESC-50 from github.com/karolpiczak/ESC-50)
python scripts/eval/yamnet_windows.py --model app/android/app/src/main/assets/models/yamnet.tflite \
  --labels app/android/app/src/main/assets/models/yamnet_labels.txt \
  --clips scripts/eval/esc50-cliplist.txt --audio <esc50>/audio --out windows.jsonl

# 4. Score: choose on folds 1–3, report on folds 4–5
node scripts/eval/run-engine.mjs windows.jsonl --folds 1,2,3
node scripts/eval/run-engine.mjs windows.jsonl --folds 4,5
```

## Rules

- Clip lists are committed; audio never is (dataset licences, and D7).
- Tune on folds 1–3 only. A rule designed after looking at folds 4–5 is not
  validated by them and needs fresh audio (FSD50K eval, or team recordings for M2).
- ESC-50 has no gunshot, scream, shout or yell clips: those recalls stay
  "not measured" until a licensed set is added.
- The per-hour figures are a stress proxy (dense isolated events), not M2's
  field false-alarm rate.
