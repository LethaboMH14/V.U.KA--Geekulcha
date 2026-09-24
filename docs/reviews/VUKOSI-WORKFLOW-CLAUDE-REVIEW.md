# Vukosi workflow: independent Claude review

**FACT: assistant review, 23 September 2026. Claude Code, model `claude-opus-5-5` (Opus 5.5, as the session reports it), at Vukosi's request.** This is a cross-family review of the Codex draft ([readiness review](VUKOSI-PR43-READINESS.md), [workflow](../VUKOSI-VIGIL-WORKFLOW.md), [Codex entry](../build-log/entries/2026-09-23-codex-vukosi-vigil-workflow.md)). It is **not** a GitHub review, it is not human approval, and it does not accept any work-order date. Criteria T/U/S.

## Remote state: refreshed, with limits

| Ref | At the Codex snapshot | Now (`git fetch` + `git ls-remote origin 'refs/pull/*'`) | Change |
|---|---|---|---|
| `origin/main` | `0cdd372` | `0cdd372` | none. **Pivot not merged** |
| #43 head | `0c6d202` | `0c6d202` (merge ref present, so still open) | none |
| #39 head | `ee0966c` | `ee0966c` (merge ref present) | none |
| #44 head | `241e34a` | `241e34a` (merge ref present) | none |
| #42 head | `616d012` | `616d012`, no merge ref (closed) | none |

**NOT RUN:** GitHub reviews, comments and CI results for #43/#39/#44/#42 since the snapshot. `gh` 2.100.0 is installed but not logged in, and the repository's REST API returns 404 without authentication (it is private). "Unchanged" above covers commit heads only. A new review, a new comment, P3.L8 progress or Ipeleng's security review could exist on GitHub and not show here. Re-check once `gh auth status` succeeds.

**Implementation base:** `main` does not contain the VIGIL spec. The only base that has it is #43's `0c6d202`, an **open** PR. Any packet built now is stacked on an unmerged base and must be rebased onto `main` once #43 merges. If #43 changes before merging, the packet's spec pin must be rechecked.

## Disposition of the Codex findings

| Codex finding | Independent verdict | Evidence |
|---|---|---|
| R1 retry vs nonce replay (P1) | **Confirmed, and wider than stated.** | §7 (`docs/VUKA-2-SPEC.md:181–185`) signs `{method, path, ts, body_sha256, nonce}`, never accepts a nonce twice, and says "a retry sends the **same** signed bytes". §4 (`:134`) promises the original receipt on an identical retry. **Extra trigger:** V8 queues events while there is no data, and MASTER-CONTEXT says "delivery needs data". A `signal_detected` or `journey_armed` queued for more than 120 s is later sent with its original request `ts`, and §7's skew rule rejects it. Only the four check-in/PIN kinds are exempt. So the ordinary offline-then-deliver path fails as written, not just the lost-response case. **Needed decision (Sibusiso + Ipeleng + both leads, contract v2):** is the request envelope re-signed on each attempt (a fresh nonce and `ts` around immutable event bytes)? And does the `event_id` idempotency lookup run before or after nonce/skew rejection? Oracle: T06 plus a new "queued 10 min offline, then delivered" case. |
| R2 normal PIN unlocks calling (P1) | **Confirmed.** | `team/mutarisi.md:67` says the call button unlocks after "`stand_down` or a normal PIN". This contradicts G4 (`VUKA-2-SPEC.md:49`), §8 (`:212`: a normal PIN never closes an incident) and Mutarisi's own domain rule (`team/mutarisi.md:20`). It does not block Vukosi's first packet. It does block wiring the check-in result into guardian UI. Owners: Lethabo/Ipeleng. |
| R3 reboot re-arm trigger (P2) | **Confirmed.** | V10 (`:43`) promises a notification after reboot. §11 (`:278`) and the manifest rules forbid `RECEIVE_BOOT_COMPLETED`, and nothing else in the app can run after a reboot until the user opens it. As written, V10 cannot be demonstrated. The likely honest form is "re-arm offered on next launch", but that is **Lethabo's decision**, not an implementation choice. |
| R4 stale coordination, shared-module deadline (P2) | **Confirmed, and the deadline conflict is inside one file as well.** | `docs/CHECKLIST.md:53` gives P3.S2 as Sep 24 12:00. The spec (`:338`) says 14:00. `team/ipeleng.md:26` says "by Thu 12:00", while `:52` and `:89` say 14:00. `app/` ownership: Vukosi's order creates the RN project (`team/vukosi.md:58`), and Mutarisi's order "sets up the UI foundation in `app/`" (`team/mutarisi.md:25`). Both write `app/package.json` and the lockfile. Proposed sequencing, pending Mutarisi/Lethabo: Vukosi's scaffold commit lands first, and Mutarisi adds dependencies on top. The workflow keeps 14:00 as the conservative dependency. |
| R5 archived producer tests (P2) | Accepted as reported, **not re-run** here. | Not in Vukosi's critical path. |
| `actor_id` in signed statement | **Closed. Do not reopen.** | `VUKA-2-SPEC.md:129–132` and T21 (`:401`) at `0c6d202`. |
| Sibusiso APPROVED ≠ security review | **Confirmed.** | `docs/ADR-ACCEPTANCE-RECORD.md:15`: Ipeleng's recorded review is "**Pending**". ADR-0036 is accepted with P3.L8 as a precondition for implementing §9 (`:9`). P3.L8 is ☐ in `docs/CHECKLIST.md:64`. Neither Sibusiso's acceptance nor the GitHub badge replaces either one. Both are human decisions. |

## New findings

### C1: P2: `.gitignore` blocks the class map and CSV clip lists

**FACT:** `.gitignore:18` ignores `*.csv`. The work order maps classes "from `yamnet_class_map.csv`" and M1 commits "clip-ID lists and licences". **Impact:** an executor either force-adds a file that is excluded repo-wide, or edits the shared `.gitignore` without a claim. Clip lists saved as `.csv` also vanish from review without any error. **Required evidence / resolution:** the first packet fetches the class map into a gitignored location with a recorded digest and never commits it. M1 clip lists use `.json` or `.txt`, or the `.gitignore` owner approves a narrow `!` exception. There is no silent `git add -f`.

### C2: P2: the registered YAMNet digest has no source of record

**FACT:** `docs/MODEL-LICENCES.md:13,37–41` registers sha256 `10c95ea3…17de` (4,126,810 bytes), measured on the **predecessor repositories' copies**. It says "converted to TFLite. No version tag". No URL is tied to that blob. **Impact:** `fetch_models.py` has no known-good download URL. A public TFLite build may have a different digest, and "updating the register to match" would destroy the only provenance the project has. **Resolution:** the packet fails closed on a mismatch and records the observed digest. Choosing the source of record (the authorised predecessor file, or a public URL whose digest matches) is Vukosi's call, with Lethabo reviewing.

### C3: P3: the asset path differs between placeholder and work order

`app/android/assets/models/.gitkeep` (the placeholder) versus `app/android/app/src/main/assets/models/` (the work order, and the standard RN/Gradle layout). The packet uses the work-order path, which `*.tflite` already ignores, and leaves the placeholder for the scaffold packet to reconcile.

### C4: P3: the workflow's toolchain line is stale

**FACT (this session, read-only):** `node`, `npm`, `npx`, `adb`, `sdkmanager`, `gradle`, `codex` and `claude` are not on PATH. There is no SDK at `%LOCALAPPDATA%\Android\Sdk` or `C:\Android\Sdk`, and no Android Studio under Program Files. No `adb.exe` was found under the user profile within 5 levels. JDK 17.0.19 is on PATH. Python 3.12.7 is available via `py -3.12`, with numpy 2.5.3 installed and `ai_edge_litert` absent. MSYS `python` is 3.12.11. The only Node found is Playwright's bundled `…\ms-playwright-go\1.50.1\node.exe` (v22.13.1). It is fine for running the repo's doc checks. It is **not** a project toolchain, and npm is absent. This is a search of common locations, not proof that nothing is installed elsewhere. **Impact:** P3.V1 (the RN 0.74.5 scaffold) and D1 are blocked on toolchain facts from Vukosi, which is why the first packet is Python-only.

## Workflow document: kept vs changed

The Codex workflow's structure holds: packet cycle, separate checkouts, cross-family review, M-row acceptance, fallbacks. Changes made in [the workflow](../VUKOSI-VIGIL-WORKFLOW.md) are limited to the toolchain correction (C4), a pointer to this review, the first packet, and the dated deadline list. Two points need a human choice rather than an edit:

- **M7's ground truth** needs a definition before a drive is spent on it (Ipeleng/Khutso). The draft already says so. I agree.
- **The D1 fallback depends on Mutarisi's toolchain too.** If both laptops lack an Android SDK on Thursday morning, the fallback fails at the same time as the primary. Leads should confirm at least one working Android build machine early Thursday (a question, not a new deadline).

## Verification performed

- `git fetch origin --prune`; `git ls-remote origin 'refs/pull/*'`: results in the table above.
- `node scripts/check-docs.mjs` and `node scripts/check-intake.mjs` (Playwright-bundled Node v22.13.1): **passed** at baseline. They were re-run after these edits and the result is in the build-log entry.
- `node --test "test/**/*.test.mjs"`: **10/10 pass**. These are v1 contract tests, not T01–T24.
- No device, Android build, model download or measurement was performed. T03/T17/T18/T20 and M1–M7 are **NOT RUN**.
