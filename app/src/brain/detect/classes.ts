/**
 * The YAMNet classes VIGIL listens for (spec V3, §18; ADR-0039(3)).
 *
 * Mapped by LABEL, never by position: the predecessor app shipped indices that
 * pointed at the wrong classes (427 is "Firecracker", not a gunshot). The
 * indices below were read from the label list embedded in the registered model
 * (sha256 10c95ea3…17de) and are checked again at load by `checkLabels`, which
 * fails closed on any mismatch.
 *
 * Sorted by index ascending, so "ties go to the lowest index" is simply "first
 * in this list wins".
 */
export type Family = 'voice' | 'glass' | 'gun';

export type TargetClass = {
  readonly label: string;
  readonly index: number;
  readonly family: Family;
};

export const TARGETS: readonly TargetClass[] = [
  {label: 'Shout', index: 6, family: 'voice'},
  {label: 'Yell', index: 9, family: 'voice'},
  {label: 'Screaming', index: 11, family: 'voice'},
  {label: 'Gunshot, gunfire', index: 421, family: 'gun'},
  {label: 'Machine gun', index: 422, family: 'gun'},
  {label: 'Fusillade', index: 423, family: 'gun'},
  {label: 'Glass', index: 435, family: 'glass'},
  {label: 'Shatter', index: 437, family: 'glass'},
  {label: 'Breaking', index: 464, family: 'glass'},
] as const;

/**
 * The gun-like classes' excluded neighbours (ADR-0039(3): 420 and 424–427).
 * A gun-like score only counts when it beats all of them in the same window:
 * on ESC-50, every false "Gunshot" came from fireworks, thunder or a can
 * opening, and in each the model's own top guess was one of these.
 */
export const GUN_NEIGHBOURS: readonly {label: string; index: number}[] = [
  {label: 'Explosion', index: 420},
  {label: 'Artillery fire', index: 424},
  {label: 'Cap gun', index: 425},
  {label: 'Fireworks', index: 426},
  {label: 'Firecracker', index: 427},
] as const;

/**
 * Context classes (CEM-0 section 3, PROPOSED): sounds that explain or weaken a
 * trigger. Scored only beside a trigger, never on their own. Indices read from
 * the label list embedded in the registered model (sha256 10c95ea3…17de).
 * Unlike TARGETS they are optional: a mismatch disables context, never V4.
 */
export type ContextReason = 'media_context' | 'crowd_context' | 'children_playing' | 'laughter' | 'siren_nearby' | 'distress_vocal';

export const CONTEXT: readonly {label: string; index: number; reason: ContextReason}[] = [
  {label: 'Laughter', index: 13, reason: 'laughter'},
  {label: 'Crying, sobbing', index: 19, reason: 'distress_vocal'},
  {label: 'Whimper', index: 21, reason: 'distress_vocal'},
  {label: 'Groan', index: 33, reason: 'distress_vocal'},
  {label: 'Gasp', index: 39, reason: 'distress_vocal'},
  {label: 'Cheering', index: 61, reason: 'crowd_context'},
  {label: 'Applause', index: 62, reason: 'crowd_context'},
  {label: 'Crowd', index: 64, reason: 'crowd_context'},
  {label: 'Children playing', index: 66, reason: 'children_playing'},
  {label: 'Music', index: 132, reason: 'media_context'},
  {label: 'Video game music', index: 267, reason: 'media_context'},
  {label: 'Police car (siren)', index: 317, reason: 'siren_nearby'},
  {label: 'Ambulance (siren)', index: 318, reason: 'siren_nearby'},
  {label: 'Fire engine, fire truck (siren)', index: 319, reason: 'siren_nearby'},
  {label: 'Siren', index: 390, reason: 'siren_nearby'},
  {label: 'Television', index: 518, reason: 'media_context'},
  {label: 'Radio', index: 519, reason: 'media_context'},
] as const;

/** Mismatches between the model and CONTEXT; non-empty means context is off. */
export function checkContextLabels(labels: readonly string[]): string[] {
  return CONTEXT.filter(c => labels.indexOf(c.label) !== c.index || labels.lastIndexOf(c.label) !== c.index).map(
    c => `context label "${c.label}" is not at ${c.index}`,
  );
}

/** The number of classes YAMNet scores (the model's output width). */
export const YAMNET_CLASSES = 521;

/**
 * Checks the model's own label list against TARGETS. Returns the mismatches;
 * an empty list means the model and this table agree. The app refuses to arm
 * detection unless it is empty.
 */
export function checkLabels(labels: readonly string[]): string[] {
  const problems: string[] = [];
  if (labels.length !== YAMNET_CLASSES) {
    problems.push(`expected ${YAMNET_CLASSES} labels, got ${labels.length}`);
  }
  for (const t of [...TARGETS, ...GUN_NEIGHBOURS]) {
    const found = labels.indexOf(t.label);
    if (found === -1) {
      problems.push(`label "${t.label}" not in the model`);
    } else if (found !== t.index) {
      problems.push(`label "${t.label}" is at ${found}, expected ${t.index}`);
    } else if (labels.lastIndexOf(t.label) !== found) {
      problems.push(`label "${t.label}" appears more than once`);
    }
  }
  return problems;
}
