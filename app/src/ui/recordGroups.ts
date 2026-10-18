/**
 * My record's grouping (ported from the Kotlin app's RecordGroups.kt): the
 * held export's entries, newest record first. Each `journey_armed` → its
 * `journey_ended` is one session holding everything recorded during it; an
 * entry outside a journey is a record on its own. Grouping is presentation
 * only: every row still comes from the server's held export, checked on this
 * phone, and no entry appears in two records.
 *
 * The chain status of a record comes from the phone's existing check of the
 * whole export (`RecordCheck.firstBroken`): a record containing the first
 * broken entry is "broken here"; a record after it "can't be confirmed".
 */
import type {RecordRow} from '../api/device';

export const ZERO_HASH = '0'.repeat(64);
export const SESSION_START = 'journey_armed';
export const SESSION_END = 'journey_ended';

export type GroupStatus = 'intact' | 'broken_here' | 'broken_earlier';

export type RecordEntryView = RecordRow & {
  /** The hash this entry links to: the previous entry's hash, or 64 zeros for the first. Null if the previous entry isn't in the rows. */
  prevHash: string | null;
  /** True when the phone's check covered this entry's link (it comes before the first broken entry). */
  linkChecked: boolean;
};

export type RecordGroup = {
  /** The first entry's index: stable for the same export. */
  id: number;
  session: boolean;
  /** A session whose `journey_ended` isn't in this record (yet). */
  open: boolean;
  /** Oldest first. */
  entries: RecordEntryView[];
  status: GroupStatus;
};

export function groupStatus(first: number, last: number, firstBroken: number | null): GroupStatus {
  if (firstBroken === null) return 'intact';
  if (firstBroken >= first && firstBroken <= last) return 'broken_here';
  if (firstBroken < first) return 'broken_earlier';
  return 'intact';
}

/** Newest record first; entries inside a record oldest first. */
export function groupRecord(rows: readonly RecordRow[], firstBroken: number | null): RecordGroup[] {
  const sorted = rows.slice().sort((a, b) => a.index - b.index);
  const views: RecordEntryView[] = sorted.map((r, i) => {
    const before = i > 0 ? sorted[i - 1] : null;
    const prevHash = r.index === 0 ? ZERO_HASH : before && before.index === r.index - 1 ? before.hash : null;
    return {...r, prevHash, linkChecked: firstBroken === null || r.index < firstBroken};
  });

  const runs: {session: boolean; entries: RecordEntryView[]}[] = [];
  let open: RecordEntryView[] | null = null;
  for (const e of views) {
    if (e.kind === SESSION_START) {
      if (open) runs.push({session: true, entries: open});
      open = [e];
    } else if (open) {
      open.push(e);
      if (e.kind === SESSION_END) {
        runs.push({session: true, entries: open});
        open = null;
      }
    } else {
      runs.push({session: false, entries: [e]});
    }
  }
  if (open) runs.push({session: true, entries: open});

  return runs
    .map(({session, entries}) => {
      const first = entries[0].index;
      const last = entries[entries.length - 1].index;
      return {
        id: first,
        session,
        open: session && entries[entries.length - 1].kind !== SESSION_END,
        entries,
        status: groupStatus(first, last, firstBroken),
      };
    })
    .reverse();
}

/** Where a bank or insurer checks a shared record (the public ledger dashboard). */
export const VERIFY_URL = 'https://lethabomh14.github.io/V.U.KA--Geekulcha/dashboard/ledger/#verify';

export type SharedRecord<E> = {format: 'vuka-export-v2'; export: E; shared_at: string};

/**
 * "Share with a bank or insurer": exactly the export My record fetched and
 * checked (the held export under T30), wrapped for the ledger's verify page.
 * A deep copy, unchanged: nothing is added, dropped or re-ordered, and later
 * changes to the screen's copy can't leak into it. `now` is ms since epoch;
 * `shared_at` is RFC 3339 UTC to the second.
 */
export function buildShare<E>(exp: E, now: number): SharedRecord<E> {
  return {
    format: 'vuka-export-v2',
    export: JSON.parse(JSON.stringify(exp)) as E,
    shared_at: new Date(now).toISOString().replace(/\.\d{3}Z$/, 'Z'),
  };
}
