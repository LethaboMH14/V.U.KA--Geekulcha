/**
 * Everything that decides what VIGIL records and when it asks, as one
 * canonical object, and its SHA-256. The digest goes into every
 * `evidence_observed`, so a changed threshold, weight or prompt rule is
 * visible in the member's own record.
 *
 * The prompt rule and thresholds are build-time constants, never switchable
 * on the phone. The digest is recorded here by hand and checked by
 * __tests__/ruleset.test.ts, so a change that forgets to update it fails CI.
 */
import {RULESET_V1} from '../detect';
import {CEM_VERSION, CONTEXT_WINDOW_S, DISTRESS_CAP, HALF_LIFE_S, K_CONFLICT_PCT, LOOKBACK_S, REASONS, SUPPORT_WINDOW_S} from '.';

/** 'v4': every confirmed detection prompts (spec V4). 'cem1' is ADR-0047, PROPOSED. */
export const PROMPT_RULE = 'v4' as const;

export const RULESET_CANONICAL = {
  detect: RULESET_V1,
  cem: {
    version: CEM_VERSION,
    half_life_s: HALF_LIFE_S,
    lookback_s: LOOKBACK_S,
    support_window_s: SUPPORT_WINDOW_S,
    context_window_s: CONTEXT_WINDOW_S,
    distress_cap: DISTRESS_CAP,
    k_conflict_pct: K_CONFLICT_PCT,
    reasons: Object.fromEntries(Object.entries(REASONS).map(([k, v]) => [k, v.db])),
  },
  prompt_rule: PROMPT_RULE,
};

export const RULESET_DIGEST = '41c9f661465fdcfa27aa2109edafad2f9e759f5303b5a51c97ac1ed0a032a9b3';
