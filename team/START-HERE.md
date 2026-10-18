# Team start instructions — VIGIL + ANCHOR build

VUKA is now **VIGIL + ANCHOR** (ADR-0034). Your task list is the **Work order** section of your own `team/<name>.md`. It has steps, commands, acceptance checks, deadlines and your reviewer. The build spec is `docs/VUKA-2-SPEC.md`. **Final submission is Sun 27 Sep 09:00.**

## 1 · Day-one setup (everyone, about 20 minutes)

1. **Clone and pull:** `git clone https://github.com/LethaboMH14/V.U.KA--Geekulcha.git`, then `git pull` every session. All seven of you have write access.
2. **Install the secret-scanning hook.** The pre-commit hook **refuses every commit** until you do this (see `SECURITY.md`):
   - Windows: `pwsh -File scripts/install-security.ps1`
   - macOS/Linux: install Gitleaks 8.24.3, put it on your PATH, then run `git config --local core.hooksPath .githooks`
   - Never bypass the hook with `--no-verify`.
3. **Tools:** Node 22 LTS or newer, Python 3.11 and the GitHub CLI (`gh auth login`).
4. **Check it works:** `node scripts/check-docs.mjs && node scripts/check-intake.mjs` should pass, and `python scripts/economics_vigil_anchor.py` should print break-even 10,973 at R20.
5. **Fill in your team file:** your real AI tool and model (several still say `UNDECLARED`), your weekend availability, and one running-log line saying you **accept** your work order or what blocks you.
6. **Start your AI tool** with the prompt in `docs/SESSION-PROMPT.md`. Change one word: your name.

## 2 · Extra setup by role

| Who | Also set up | How to check it works |
|---|---|---|
| **Vukosi, Mutarisi** (Android) | Android Studio with SDK Platform 34 and JDK 17, per React Native 0.74's "Set Up Your Environment" guide; a phone with USB debugging on | `java -version` shows 17; `adb devices` lists your phone |
| **Sibusiso** (server) | Python 3.11 virtual environment; PostgreSQL 16 (local or Docker); Hedera portal **testnet** account; Azure for Students | `psql --version`; the testnet account id is recorded in your team file (never the key) |
| **Khutso** (delivery, `sim_bank`) | Firebase project for Cloud Messaging; a South African SMS gateway trial | Server credentials are in App Service settings or a local `.env` — never in git |
| **Ipeleng** (verify page, `shared/`) | Node 22+; vitest for `shared/` | `npm test` passes the contract tests (10/10 today). `test/openapi-contract.test.mjs` currently checks the archived v1 contract until P3.A1 replaces it |
| **Lethabo** (Figma) | Share Figma file `pZYQ3m68SWIMFqaOk8kN3R` with Mutarisi | Mutarisi can open it |
| **Babatunde** | Nothing extra | Can run the economics script |

**Phones:** the team needs at least two Android phones (user + guardian) and one cheap 2–3 GB phone for measurements. Confirm who brings what by **Thu 24 Sep 10:00**.

**Secrets:** keys, keystores, `.env` files, Firebase service-account files and the model file are git-ignored. If a secret ever reaches a commit, stop and tell Sibusiso and Ipeleng. Never paste a secret into an issue, a PR or chat.

## 3 · Your first task

| Person | First task (full steps in your work order) | Due | First reviewer |
|---|---|---|---|
| **Lethabo** | Pivot PR merged; PIN-authority rules with Ipeleng; Figma pages | Thu 12:00 | Sibusiso |
| **Sibusiso** | Canonical and Merkle vectors, then contract v2 | Thu 09:00 / 12:00 | Lethabo |
| **Vukosi** | File-by-file port → signed release APK cold-installed from a QR code | **Thu 22:00** | Lethabo |
| **Mutarisi** | UI foundation in `app/`; APK backup owner; guardian-min receiver | Thu / Fri 10:00 | Lethabo |
| **Khutso** | Re-check every 23 Sep evidence row; SAPS totals by eye | Thu 12:00 | Sibusiso |
| **Ipeleng** | PIN-authority rules with Lethabo; `shared/` canonical, DER and Merkle | Thu 12:00 / 14:00 | Lethabo |
| **Babatunde** | Run the economics script; rewrite competitors and Lean Canvas; start 5 user conversations | Thu 20:00 | Lethabo |

## 4 · How work moves

```text
git pull → read your work order → claim shared files in docs/OVERLAPS.md
→ git checkout -b <type>/<you>-<thing>     (RULES.md: docs/…, feat/…, fix/…)
→ work → node scripts/check-docs.mjs && node scripts/check-intake.mjs
→ update team/<you>.md · add docs/build-log/entries/<date>-<you>-<slug>.md · tick docs/CHECKLIST.md P3
→ push → open a PR → your reviewer is auto-requested (.github/CODEOWNERS)
```

**Build-weekend fast path** (Fri 16:00 → Sun 09:00): one lead plus one domain reviewer who isn't the author. Contracts, ADRs, security boundaries and governance still need both leads (RULES.md).

A task is done only with evidence, reviewer acceptance, your team file updated, a build-log entry and the checklist row ticked. Blocked tasks stay blocked; approval is never inferred from time passing.
