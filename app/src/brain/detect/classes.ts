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
  for (const t of TARGETS) {
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
