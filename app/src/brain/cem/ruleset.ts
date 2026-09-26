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
import {CONTEXT, RULESET_V1} from '../detect';
import {LIFT_COOLDOWN_MS, LIFT_K_PCT, PROMPT_P_DB, SETTLE_AFTER_MS, STRONG_P_DB, type PromptRule} from './grader';
import {CEM_VERSION, CONTEXT_WINDOW_S, DISTRESS_CAP, HALF_LIFE_S, K_CONFLICT_PCT, LOOKBACK_S, REASONS, SUPPORT_WINDOW_S} from '.';

/**
 * 'v4': every confirmed detection prompts, nothing else does (spec V4).
 * 'cem1': V4 unchanged, plus lifts of record-level detections (ADR-0047,
 * PROPOSED). Active only for simulation subjects until ADR-0047 is accepted
 * by Sibusiso and Ipeleng and this digest is signed off by two leads (D10).
 */
export const PROMPT_RULE: PromptRule = 'cem1';

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
  context: CONTEXT.map(c => ({label: c.label, index: c.index, reason: c.reason})),
  grade: {
    prompt_rule: PROMPT_RULE,
    prompt_p_db: PROMPT_P_DB,
    strong_p_db: STRONG_P_DB,
    lift_k_pct: LIFT_K_PCT,
    lift_cooldown_ms: LIFT_COOLDOWN_MS,
    settle_after_ms: SETTLE_AFTER_MS,
    sim_subjects_only: true,
  },
};

export const RULESET_DIGEST = 'ea136b846bec3eb00c41c4dec181661abb9deabf038fcf32b38738d4cee5983b';
