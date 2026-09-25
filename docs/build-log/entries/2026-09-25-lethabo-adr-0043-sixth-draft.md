## 2026-09-25 | Lethabo (co-lead, acting security lead), via Claude Code assistant | ADR-0043 sixth draft: scheduled revocation replaces the alarm-only key; exports on a uniform 72 h release | PROPOSED — for Ipeleng's review and Sibusiso's acceptance

**Research** — A fifth adversarial review round of the programme and ADR-0043 found 7 high-severity problems. Six trace to the fifth draft's "alarm-only" old key, and one to the export route. Each is dispositioned in `SECURITY-PROGRAMME.md` §11, "Revision 5 review".

**Real data / references** — The ADR-0042 registry rules in spec §4a: one unrevoked device key per subject, revocation by `received_at`.

**Business reasoning** — A bank or insurer asks two questions: can recovery be used to silence a victim, and can a victim always get their own record? The fifth draft answered the first by creating a key the verifier can't check. The sixth draft answers both with rules a stranger can check from the chain.

**Competitor reference** — Not applicable.

Changed:
- **Recovery never silences the old phone.** A recovery made during an armed journey, or within 72 h of the last journey ending, schedules the old key's revocation for exactly 72 h after it is received. Nothing extends that time. Until then the old key is a full device key.
  - The condition uses journey times only, which the phone already shows, never incident state.
  - The device ingest endpoint gives one transport acknowledgement to both keys, with or without an open incident.
  - `key_revoked` carries `effective_at`, and the verifier honours it. ADR-0042 and spec §4a join the "Amends, on acceptance" list.
- **Exports:** every export is released 72 h after the request, whatever the incident state, and guardians aren't told about it.
- **Tests proposed for §15:** T67 revised, T68 (the export release) and T69 (the verifier honours `effective_at`).
- **Rejected:** the alarm-only key, a "revoke now" button, and guardian notices of exports. Refusing recovery during an incident stays rejected, because it locks the member out.
- **Residuals stated:**
  - a thief holding a lost phone keeps a valid key for up to 72 h after a recovery made near a journey;
  - a phone that stays offline for more than 72 h loses what it queued;
  - an urgent record request waits 72 h unless the s23 process is used.

Evidence: document change only. No code implements ADR-0043 yet.

Decision: none. ADR-0043 stays Proposed until Ipeleng reviews it and Sibusiso accepts it.

Needs/blockers: Ipeleng's review; Sibusiso's acceptance; a sixth review round.

Business handoff: None.

**Revision 7 (same day).** A further review round resolved 4 of the 7 earlier findings, left 3 partial and raised 6 new ones. The seventh draft answers them:
- every recovery schedules revocation 72 h out, with no journey condition;
- recovery epochs: one current key and any number of retiring keys, whose deadlines never move;
- a retiring key sends safety events only, and its governance and data actions have no effect;
- member-facing receipts become an opaque `receipt_id`;
- late outbox detections are accepted with deadlines from receipt;
- an export is a snapshot taken at the request.

Proposed tests T70–T72 are added. Dispositions are in `SECURITY-PROGRAMME.md` §11, "Revision 6 review".

**Revision 8 (same day).** A Claude red-team pass on revision 7 ran while the second reviewer's quota was exhausted. It resolved 4 of the 6 earlier findings, left 2 partial and raised 8 new ones. The eighth draft answers them:
- a retiring key's normal-PIN governance follows the duress path, and a duress PIN is an alarm from any unrevoked key;
- the journey list is per device key;
- the phone never shows export state;
- removals and deletions during an incident are queued;
- the member can rotate the recovery code;
- journeys on a retiring key end with `key_retired`;
- `no_effect` entries are added, and the snapshot head is anchored at the request.

Two findings are partly accepted, with their residuals stated: automatic rotation of the recovery code, and silent acceptance after the deadline.

Next: the second reviewer's round on revision 8 when its quota resets; the amendments land in the acceptance PR.
