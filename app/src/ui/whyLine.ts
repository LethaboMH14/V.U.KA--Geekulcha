import type {GuardianAlert} from '../api/device';
import {REASONS} from '../brain/cem';

/** "VIGIL noticed a scream and the phone grabbed: strong signs." Words only, never a number. */
export function whyLine(why: GuardianAlert['why']): string | null {
  if (!why || why.reasons.length === 0) return null;
  const words = why.reasons.map(r => (r in REASONS ? REASONS[r as keyof typeof REASONS].words : r.replace(/_/g, ' ')));
  const list = words.length === 1 ? words[0] : `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`;
  return `VIGIL noticed ${list}: ${why.band} signs.`;
}
