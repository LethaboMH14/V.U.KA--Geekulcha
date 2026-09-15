# Model cards

> **G13 resolution.** One card per model VUKA integrates. Template: `docs/SDLC.md` §17.4. Provenance, sha256 and licence cross-reference `docs/MODEL-LICENCES.md` (G12). Tags per `docs/MASTER-CONTEXT.md` §7.
>
> **The honest headline: no model was trained by this team, and no model's demographic performance has been measured.** Every model below is a pretrained integration. *"Not measured" is the required answer* for the row that matters, and it is stated, not avoided. This is gap **G5** and gap **G9** (`docs/OPEN-GAPS.md`), published rather than hidden.
>
> Every model here sits at the **perception** layer. None makes a determination about a person. The determination layer — the fusion engine — contains **no machine learning** (see the last card).

---

## Summary

| Model | Variant | Source | Calibrated | In a determination about a person? |
|---|---|---|---|---|
| YAMNet | TF Hub AudioSet | pretrained | no | No — perception only |
| Ultralytics YOLOv8 | `yolov8n.pt` | pretrained | no | No — perception only |
| InsightFace | `buffalo_l` (ArcFace, 512-d) | pretrained | no | No — a match is a lead, never a verdict |
| fast-plate-ocr | `cct-s-v2-global` | pretrained | no | No — a read is a lead, never a verdict |
| *(fusion engine — not ML)* | `brain/fusion.py` | written by us | no (PROVISIONAL) | It proposes `watch_candidate`; a human decides |

---

## Model — YAMNet (acoustic classification)

**sha256:** `10c95ea3eb9a7bb4cb8bddf6feb023250381008177ac162ce169694d05c317de` `FACT` (verified identical in both predecessor repos, 15 Sep 2026)
**Size:** 4,126,810 bytes (~4 MB) `FACT`
**Quantisation:** stated INT8 per ADR-0009; **not verified in this checkout** `ASSUMPTION`
**Source:** **pretrained** (Google TF Hub, AudioSet), not trained by us `FACT`
**Input shape:** audio waveform, 16 kHz mono (YAMNet standard) `ESTIMATE` — read from the interpreter, not metadata, at port time
**Intended use:** classify acoustic events (gunshot, glass-break, scream, raised voices) as an uncertain input to the fusion engine. Stage 2 of the audio cascade.
**Out of scope:** identifying a person; detecting crime; any determination. It emits a label and a score, and nothing more.
**Known limitations / demographic performance:** **Not measured.** `FACT` — the honest and required answer. The model's acoustic performance across South African accents, languages, ambient noise and dwelling types is untested by this team.
**Calibrated:** **No.** The label scores are not calibrated probabilities; they are fed to the fusion engine as one factor among several.
**Where it sits in the decision path:** **perception only.** It can contribute to `watch_candidate`; it can never set `flagged`.

---

## Model — Ultralytics YOLOv8 (object detection)

**Version:** `ultralytics>=8.2`, model `yolov8n.pt` (nano) `FACT`
**sha256:** **not determinable** — the weight file is not shipped in either repo; Ultralytics downloads it on first use, with no lockfile pinning the release `FACT`
**Size:** ~6 MB (nano variant) `ESTIMATE`
**Source:** **pretrained** (Ultralytics, COCO), not trained by us `FACT`
**Input shape:** RGB image (frames sampled by `vision/preprocess.py`, CLAHE low-light enhanced) `FACT`
**Intended use:** detect persons, animals, vehicles and weapons as uncertain inputs to the fusion engine.
**Out of scope:** identifying a person; a weapon detection is a lead for a human, never a verdict.
**Known limitations / demographic performance:** **Not measured.** Darker skin tones, night IR, and South African scene composition are untested by this team. NIST FRVT and published YOLO fairness work document detection-rate differentials; our own pipeline is untested against them. `FACT`
**Calibrated:** **No.**
**Licence note:** AGPL-3.0 — a high-risk licence for this product; see `docs/MODEL-LICENCES.md` M2.
**Where it sits in the decision path:** **perception only.** Never sets `flagged`.

---

## Model — InsightFace `buffalo_l` (face embedding)

**Version:** `insightface>=0.7`, variant `buffalo_l`, **512-d** L2-normalised embeddings `FACT` (per ADR-0006)
**sha256:** **not determinable** — the weights are not shipped; `insightface.app.FaceAnalysis()` downloads them on first use `FACT`
**Size:** not stated in the predecessor repo `ASSUMPTION`
**Source:** **pretrained** (ArcFace family, MS1M / Glint360K lineage), not trained by us `FACT`
**Input shape:** face crop at `det_size=640` `FACT`
**Intended use:** produce an embedding to ask *"is this the same face we have seen before?"* — **re-identification, never identification.** A match is a lead for a human.
**Out of scope:** identifying a named person; any determination of guilt, intent or identity.
**Known limitations / demographic performance:** **Not measured.** `FACT` — this is the single most important row in this file. The system's stated answer to the NIST FRVT demographic false-positive differentials (documented at up to ~two orders of magnitude) is itself **untested on this pipeline** (gap **G9**). NIST FRVT does not test our pipeline; we have run no evaluation.
**Calibrated:** **No.** The cosine thresholds (`0.55` / `0.65`) are **targets, not calibrated operating points** — per the honesty ledger, they may never be quoted as results.
**Licence note:** the `insightface` package is MIT; the `buffalo_l` **weights are non-commercial-research-only**. High-risk for a commercial product; see `docs/MODEL-LICENCES.md` M3.
**Where it sits in the decision path:** **a match is a lead, never a verdict.**

---

## Model — fast-plate-ocr `cct-s-v2-global` (plate text)

**Version:** `fast-plate-ocr>=0.3`, model `cct-s-v2-global` (~5 MB ONNX, CPU) `FACT`
**sha256:** **not determinable** — the ONNX model auto-downloads on first `LicensePlateRecognizer()` call `FACT`
**Source:** **pretrained**, not trained by us `FACT`
**Input shape:** plate crop, minimum 40×12 px `FACT`
**Intended use:** read plate text, then **gate it** on per-character confidence — a read below the floor is refused, producing no identity.
**Out of scope:** identifying a person; a plate read is a lead for a human, never a verdict.
**Known limitations / demographic performance:** **Not measured — and the one measurement we do have is a suppression result, not an accuracy result.** The predecessor's honest limit (`BEACON/vision/plate_ocr.py`): `MIN_CHAR_PROB = 0.50` is validated as a **junk suppressor** (4 of 4 junk reads rejected) and **not** as a true-positive filter — the validation sample contained **no correctly-read plates**. **No read rate, precision or accuracy figure may be quoted from this model.** `FACT`
**Calibrated:** **No.**
**Licence note:** MIT (package and model) — the cleanest licence of the four; see `docs/MODEL-LICENCES.md` M4.
**Where it sits in the decision path:** **a read is a lead, never a verdict.**

---

## Not a model — the fusion engine (`brain/fusion.py`)

The layer that turns perception into a `watch_candidate` is **not a neural network and contains no machine learning.** It is a calibrated log-odds model with hand-set weights (`docs/OPEN-GAPS.md` G1, self-labelled `PROVISIONAL — NOT fit on real data`). It is documented as code, not as a model card, because there is no trained artifact, no training data, and no learned parameters — only a documented cost matrix and a summation. This is the load-bearing part of the answer to the organisers' AI-overuse concern, and it is why the fusion appears here as a negative card.

*Drafted 15 Sep 2026. Owned by Lethabo (architecture). Model facts cross-reference `docs/MODEL-LICENCES.md`; the demographic-performance rows are the honesty ledger's required answer (`docs/MASTER-CONTEXT.md` §6).*
