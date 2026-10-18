## 2026-09-25 | Codex acting at Sibusiso's request | P3.A3 item 1 | BLOCKED

### 1. Research and references

FACT: read the handover, slice-3/export packets, governing spec sections and ADR-0041/0042/0044, and inspected the journey registry and OpenAPI at base `2acefbc46ab9bd11bed175b51147e12b3a5f5295` (PR #85). Criteria T/S: choosing an unsupported escalation deadline could delay assistance or cause an unintended alarm.

Real data / references: repository code and specification below; no production data. Competitor reference: not applicable to this internal protocol gap.

### 2. Changed and built status

FACT: created isolated worktree `work/VUKA-slice3-escalation`, branch `feat/sibusiso-slice3-escalation`, from the live PR #85 SHA. Only this log is added. No product implementation, schema/ADR edit, credential access, Azure operation, commit or push. PR #51/#85 working files and branches remain untouched.

### 3. Evidence: commands and actual output

Commands run in the new worktree:

```text
git -c safe.directory='*' rev-parse HEAD
2acefbc46ab9bd11bed175b51147e12b3a5f5295

rg -n -A 5 'CREATE TABLE IF NOT EXISTS journey_subjects' server/db.py
70:CREATE TABLE IF NOT EXISTS journey_subjects (
71-    journey_id TEXT PRIMARY KEY,
72-    subject_id TEXT NOT NULL,
73-    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
74-);
75-CREATE TABLE IF NOT EXISTS request_nonces (

rg -n -A 13 '^  /v1/journeys:' contracts/openapi.yaml
307:  /v1/journeys:
308-    post:
309-      tags: [VIGIL]
310-      operationId: startJourney
311-      x-vuka-implemented: false
312-      summary: Start a journey by explicit user action
313-      description: Device-signed request; arming requires the app in the foreground and granted microphone and notification permissions.
314-      security: [{ VukaKeyId: [], VukaTimestamp: [], VukaNonce: [], VukaSignature: [] }]
315-      responses:
316-        '201': { $ref: '#/components/responses/AcceptedReceipt' }
317-        '400': { $ref: '#/components/responses/InvalidRequest' }
318-        '401': { $ref: '#/components/responses/Unauthorized' }
319-  /v1/journeys/{id}/heartbeat:
320-    post:
```

FACT: `docs/VUKA-2-SPEC.md:289` requires fallback at signal receipt plus the journey's check-in window plus 30 seconds. Line 178 defines `window_s` only in `checkin_opened`; line 560's `signal_detected.window_ms = 975` is the audio window, not a check-in duration. The journey-start operation above specifies no request body carrying that duration. No walk/drive mapping was found; an initial clarification question suggesting that mapping was corrected before implementation.

### 4. Decision and blockers

PROPOSED question for Sibusiso/Lethabo with Vukosi: what authoritative source supplies the journey's 20/60-second check-in window before any opened event arrives, and can it change during a journey? Decide its ingestion/storage rule and behavior when absent. Do not silently use an arbitrary default or the audio window.

FACT: item 1 stopped under the user's explicit unspecified-behavior rule. The user's proposed missing-opened 409 rule and atomic single-use end authorisation instruction are acknowledged, not implemented or claimed accepted. Items 2–4 have not started because the user requested execution in order. No implementation test count or mutation result is claimed; clean-install suites, PostgreSQL tests, audits and mutation checks are not run for blocked product work.

### 5. Business handoff and next

Business reasoning: resolving the deadline source prevents an implementation from turning an undocumented default into a safety promise. Handoff: leads decide the source; resume item 1 on this isolated branch, then the remaining items in order. Nothing is ready to publish as a completed implementation.

FACT: checklist-only out-of-scope review: P3.Q1 is Ed25519 plus ML-DSA-65 root signing and published keys (conditional code work); P3.B9 is a human blockchain-attack rehearsal plus Hedera/OpenTimestamps documentation update and retirement of the R1.30 attack; P3.S19 is disposition of PR #43 S1–S4 findings, closed or carried with owners (review/coordination, with code only if a specific disposition calls for it). None started.
