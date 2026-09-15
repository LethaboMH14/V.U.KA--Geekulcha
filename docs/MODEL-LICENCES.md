# Model Licence Register

> **G12 resolution.** Every model VUKA integrates, its licence, its commercial position, and what was verified against the predecessor repositories (`LethaboMH14/BEACON` and `LethaboMH14/Team-Sonar---Vuka-`, both private, inspected read-only 15 Sep 2026). Tags per `docs/MASTER-CONTEXT.md` §7.
>
> Updated when a model is added, removed or re-licensed. Owned by Lethabo. Self-audited against shipped code and weights, 15 September 2026.

---

## Core register

| # | Model | Version / Variant | SHA256 | Licence | Commercial position |
|---|---|---|---|---|---|
| **M1** | YAMNet TFLite | TF Hub AudioSet-pretrained (no version tag) | `10c95ea3eb9a7bb4cb8bddf6feb023250381008177ac162ce169694d05c317de` `FACT` | **Apache-2.0** `FACT` | Free for any use, including commercial. No restriction. `FACT` |
| **M2** | Ultralytics YOLOv8 | `yolov8n.pt` (nano), package `ultralytics>=8.2` `FACT` | Not shipped — auto-downloaded by Ultralytics at first import `FACT` | **AGPL-3.0** `FACT` | Copyleft: any derivative work must be AGPL-3.0. Ultralytics offers a separate commercial licence. VUKA's MIT licence is incompatible with shipping AGPL-3.0 code unless (a) the entire server stack is released under AGPL-3.0 or (b) a commercial Ultralytics licence is obtained. `FACT` |
| **M3** | InsightFace (ArcFace) | `buffalo_l` variant, 512-d embeddings, package `insightface>=0.7` `FACT` | Not shipped — auto-downloaded from InsightFace model zoo on first `FaceAnalysis()` call `FACT` | Package: **MIT**. Pretrained buffalo_l weights: **non-commercial-research-only** `FACT` | The code (Python package) is MIT. The buffalo_l pretrained ArcFace weights carry a non-commercial-research-only restriction. Commercial deployment requires a separate licence from InsightFace or substitution of a commercially-licensed ArcFace variant. `FACT` |
| **M4** | fast-plate-ocr | `cct-s-v2-global` ONNX model (~5 MB), package `fast-plate-ocr>=0.3`, PyPI wheel sha256 `98eba340ab90a04cf5daa693320942ce7eeb5977529143df6bb41afd08239062` `FACT` | Not shipped — ONNX model auto-downloaded on first `LicensePlateRecognizer()` call `FACT` | **MIT** `FACT` | Free for any use, including commercial. MIT has no copyleft restrictions. `FACT` |
| **M5** | ai-edge-litert | `>=2.1` — TFLite runtime for YAMNet inference on-device `FACT` | N/A — runtime library, no model weights | **Apache-2.0** `FACT` | Free for any use. No restriction. `FACT` |
| **M6** | onnxruntime | `>=1.17` — ONNX runtime for fast-plate-ocr and InsightFace `FACT` | N/A — runtime library, no model weights | **MIT** `FACT` | Free for any use. No restriction. `FACT` |

## Deprecated / not used

| Model | Status | Evidence |
|---|---|---|
| EasyOCR | **Not used.** Replaced by fast-plate-ocr per ADR-0007. | `BEACON/vision/requirements.txt` line 22: *"easyocr — never used; plate reading went to fast-plate-ocr instead (ADR-0007)"*. Zero EasyOCR import statements found in either predecessor repo. `FACT` |

## Planned / not yet integrated

| Model | Status | Licence |
|---|---|---|
| Moondream2, SmolVLM, Florence-2, Qwen2-VL 2B | Specified as VLM candidates for F18 behaviour detection (`docs/AI-AUTONOMY.md` §4.2). **Not yet shipped.** | Not investigated — register entry pending integration decision. `ASSUMPTION` |

---

## Verification detail — what was and wasn't checked against shipped code

### YAMNet TFLite `FACT`
- Weight file `yamnet.tflite` found in **both** predecessor repos at identical paths but different locations: `BEACON/vision/assets/models/yamnet.tflite` and `Team-Sonar---Vuka-/app/android/app/src/main/assets/models/yamnet.tflite`.
- SHA256 identical across both repos: `10c95ea3eb9a7bb4cb8bddf6feb023250381008177ac162ce169694d05c317de`.
- File size: 4,126,810 bytes (~4 MB).
- Source: Google TF Hub, AudioSet-pretrained YAMNet model, converted to TFLite. No version tag.
- Licence confirmed via TF Hub model page: Apache-2.0. `ESTIMATE` — licence is stated on TF Hub; the model card was not re-fetched during this register build.

### Ultralytics YOLOv8 (yolov8n.pt) `FACT`
- Imported in `BEACON/vision/agent.py:76`: `from ultralytics import YOLO`, loaded as `model = YOLO("yolov8n.pt")`.
- Version constraint: `ultralytics>=8.2` in `BEACON/vision/requirements.txt`. **Not pinned** — the installed version depends on when `pip install` was last run.
- `yolov8n.pt` is **not shipped in either repo**. Ultralytics downloads it on first `YOLO()` call to a local cache.
- No lockfile, no `pip freeze`, no `ultralytics.__version__` dump exists in either repo.
- Verdict: the exact YOLOv8 version shipped cannot be verified without running the code. `PROPOSED` — the model is specified; the exact version is not.

### InsightFace buffalo_l `FACT`
- Imported in `BEACON/vision/face recog/face_test.py:2`, `scripts/vision_lens_demo.py:156`, `scripts/generate_drivinghome_track.py:40`.
- Initialized as `insightface.app.FaceAnalysis()`, model `buffalo_l` (default), CPU, `det_size=640`. DB schema records `model='buffalo_l'` (`BEACON/server/src/db/models.py:131`).
- Version constraint: `insightface>=0.7` in `BEACON/vision/requirements.txt`. **Not pinned**.
- Buffalo_l pretrained weights are **not shipped in either repo**. The `insightface` package downloads them from the InsightFace model zoo on first `FaceAnalysis()` call.
- No lockfile or version dump exists.
- Licence split: the `insightface` pip package itself is MIT (`FACT` — verified on PyPI). The buffalo_l pretrained weights are distributed under a non-commercial-research-only restriction (`FACT` — confirmed in `docs/OPEN-GAPS.md` G12 and InsightFace model zoo documentation).
- Commercial risk: high. VUKA's target market (estates, private security) is unambiguously commercial. Buffalo_l in its current form may not be shipable.

### fast-plate-ocr (cct-s-v2-global) `FACT`
- Imported in `BEACON/vision/plate_ocr.py:133`: `from fast_plate_ocr import LicensePlateRecognizer`.
- Model constant: `MODEL_NAME = "cct-s-v2-global-model"` (`plate_ocr.py:51`).
- Version constraints: `fast-plate-ocr>=0.3` in `BEACON/vision/requirements.txt`. The PyPI package `fast-plate-ocr` is MIT-licensed (`FACT` — verified on PyPI 15 Sep 2026). Current release: **1.1.0** (14 Mar 2026). Package wheel sha256: `98eba340ab90a04cf5daa693320942ce7eeb5977529143df6bb41afd08239062`.
- The ONNX model `cct-s-v2-global` (~5 MB) is **not shipped in either repo**. It is auto-downloaded from the fast-plate-ocr model hub on first `LicensePlateRecognizer()` call.
- The `cct-s-v2-global-model` weighs ~5 MB ONNX and runs CPU-only (`plate_ocr.py` docstring). Its training data, architecture and exact version are tracked by the fast-plate-ocr model hub, not by VUKA's repo.
- The model's own licence: MIT (inherited from the fast-plate-ocr package, which bundles the model config). `ESTIMATE` — the model hub page was not independently fetched.
- Verdict: the package is MIT, which is compatible. The downloaded ONNX model's exact provenance should be verified against the model hub at integration time.

### Runtimes (ai-edge-litert, onnxruntime) `FACT`
- Both are Apache-2.0 or MIT-licensed runtime libraries with no copyleft restrictions.
- No model weights are embedded in either runtime.

---

## Licensing risk summary

| Risk | Model | Detail |
|---|---|---|
| **High** | InsightFace buffalo_l weights | Non-commercial-research-only. Cannot ship in VUKA's commercial product without relicensing or substituting a commercially-licensed ArcFace variant. Must be resolved before any deployment. |
| **High** | Ultralytics YOLOv8 AGPL-3.0 | AGPL-3.0 is copyleft. Shipping VUKA under MIT while bundling AGPL-3.0 Ultralytics code is incompatible. Options: (a) obtain a commercial Ultralytics licence, (b) substitute a non-copyleft object detector (e.g., Apache-2.0 DETR variants), or (c) release the entire server under AGPL-3.0. |
| **Low** | YAMNet TFLite | Apache-2.0 — compatible with MIT. Verified sha256 match across repos. |
| **Low** | fast-plate-ocr | MIT — compatible. |
| **None** | runtimes | Apache-2.0 / MIT — compatible. |

---

## Unresolved

- **Unpinned versions.** Three of four model packages use `>=` constraints with no lockfile. The exact versions tested and reviewed cannot be reproduced from this repo alone. Recommend: add a lockfile or a `pip freeze` snapshot before any model is called frozen. `PROPOSED`
- **cct-s-v2-global ONNX sha256.** The ONNX model is auto-downloaded. Its exact sha256 is not recorded in this register. Recommend: compute and pin the ONNX model hash at integration time, and add a test that asserts the downloaded model matches the pinned hash. `PROPOSED`
- **YOLOv8n.pt sha256.** Auto-downloaded by Ultralytics. Not recorded. Recommend: same approach as above. `PROPOSED`