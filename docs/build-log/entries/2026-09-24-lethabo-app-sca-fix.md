## 2026-09-24 | Lethabo (co-lead), via Claude Code assistant | App dependency findings: one fixed, one waived (SCA-W1) | PROPOSED — needs app and security approval

**Research** — OSV-Scanner in CI (the first real run after the repo went public) reported three advisories in `app/package-lock.json`:
- GHSA-gh4j-gqv2-49f6: fast-xml-parser 4.5.7, CVSS 6.1;
- GHSA-5p2g-fcmc-qvqq and GHSA-w3rx-r6r6-pgpr: image-size 1.2.1, CVSS 8.7 each, with no fixed version.

`npm ls` traced them to React Native CLI and Metro build tooling. Neither package ships in the APK.

**Real data / references** — The advisory summaries and dates were read from api.osv.dev on 24 Sep 2026.

**Business reasoning** — A red dependency scan on a public repo is the first thing a security judge sees. It must be fixed or honestly waived, never silenced.

**Competitor reference** — Not applicable.

Changed:
- `app/package.json`: an npm override pins `fast-xml-parser` `^5.7.0` (it resolves to 5.11.1). This **fixes** GHSA-gh4j-gqv2-49f6.
- `docs/security/SCA-WAIVERS.md`: waiver **SCA-W1** for the two image-size advisories. They are build-time only, Metro reads only our own repo assets, and there's no fix. The waiver expires 2026-10-31.
- `app/osv-scanner.toml`: ignores exactly those two IDs until the expiry, scoped to `app/`.

Evidence:
- After the override, `npx react-native config` resolves the Android project (`com.teamsonar.vuka`).
- A signed `gradlew assembleRelease` succeeds.
- `app/` holds no JXL, HEIF, HEIC or ICNS files.

Decision: none. The waiver needs the approvals it names.

Needs/blockers: Vukosi or Mutarisi (app) and Ipeleng (security) approve SCA-W1.

Business handoff: Not applicable.

Next: upgrade Metro once image-size publishes a fix.
