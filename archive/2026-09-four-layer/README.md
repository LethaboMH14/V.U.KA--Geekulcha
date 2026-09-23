# Archive — the four-layer design (to 23 Sep 2026)

On 23 September 2026, VUKA narrowed from four layers (VIGIL, UMOJA, KHAYA, ANCHOR) to **VIGIL + ANCHOR** (ADR-0034). Everything here belongs to the earlier design. It is **parked, not deleted**: KHAYA (the home appliance) and UMOJA (the street entity graph, risk layer and patrol) may return as a later product.

**Nothing in this folder describes the current product**, and nothing here may be quoted to a judge as current. `scripts/check-docs.mjs` skips this folder, so links inside it are not maintained.

| Path | What it was |
|---|---|
| `docs/00-SPEC.md`, `docs/01-ARCHITECTURE.md`, `docs/08-BUSINESS.md`, `docs/PLAN.md`, `docs/HANDOVER.md`, `docs/KICKOFF.md`, `docs/TEAM.md`, `docs/TECH-STACK.md`, `docs/USER-JOURNEY.md`, `docs/PLAIN-WORDS.md` | The four-layer specification, architecture, business case, plan and narrative |
| `docs/PSIRA-POSITION.md`, `docs/POPIA-POSITION.md`, `docs/POPIA-S57-DECISION-RECORD.md`, `docs/GATED-ACCESS-CODE-REVIEW.md`, `docs/DISCARD-BY-DEFAULT-EMBEDDINGS.md` | Legal positions for cameras, faces and monitoring (ADR-0031/0032 parked) |
| `docs/OPERATOR-DUTY.md`, `docs/OPERATOR-TRAINING-CHECKLIST.md`, `docs/CONTRACT-APPROVAL-RECORD.md`, `docs/PORT-DIVERGENCES.md`, `docs/SDLC*.md`, `docs/AI-AUTONOMY.md` | The operator human gate, the v1 contract approvals, the port register, the earlier SDLC |
| `docs/audit/`, `docs/reviews/`, `docs/wireframes/` | The September audit pack, earlier PR reviews and the 12 four-layer wireframes |
| `docs/CHECKLIST-four-layer.md`, `docs/OPEN-GAPS-four-layer.md`, `docs/EVIDENCE-four-layer.md` | The earlier checklist phases, gap rows and evidence (including the 318 ms relay figure, n = 10) |
| `team/<name>-history.md` | Each person's four-layer declarations, reviews and sequenced work (the running logs stay in `team/`) |
| `appliance/`, `brain/`, `data/`, `ml/`, `server/` | KHAYA edge code, UMOJA fusion and entity resolution, data and ML scaffolds, and the UMOJA human-gate module with its test |
| `submission/`, `scripts/build-deck.cjs`, `scripts/build-docs-pdf.mjs` | The August submission deck and its generators |
