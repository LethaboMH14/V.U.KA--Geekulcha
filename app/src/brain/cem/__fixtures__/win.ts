import {CONTEXT, TARGETS, type AudioWindow} from '../../detect';

const idx = (label: string) => TARGETS.findIndex(t => t.label === label);

/** A window with one target class at `bp`, the rest 0, and optional context scores by label. */
export function win(seq: number, label: string | null, bp: number, endMs = seq * 488, context: Record<string, number> = {}): AudioWindow {
  const targetBp = TARGETS.map(() => 0);
  if (label) targetBp[idx(label)] = bp;
  const contextBp = CONTEXT.map(c => context[c.label] ?? 0);
  return {seq, endMs, targetBp, topIndex: label ? TARGETS[idx(label)].index : 494, topBp: bp, gunNeighbourBp: 0, contextBp};
}
