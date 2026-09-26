/**
 * My record (F14): the server's copy of the member's record, fetched after
 * the export PIN and checked on this phone before anything is shown.
 *
 * What is shown is only the server's held export (T30, §9): while an incident
 * is open, and for its hold period, it ends at the pre-incident head, the same
 * for either PIN. The phone's own receipts are used to check that export and
 * are never listed on their own, so nothing past the held head appears.
 *
 * The fingerprint is the hash of the export's newest entry: every entry's
 * hash covers the one before it, so a change anywhere earlier changes it.
 *
 * Duress parity: rows are named by kind only. A check answered with the
 * duress PIN reads exactly like one answered normally.
 *
 * Layout (the Kotlin app's Record tab, adopted): the export's entries are
 * grouped newest first (`groupRecord`): each journey start → end is one
 * "Active session", anything outside a journey its own record. Tapping one
 * opens a view-only page of its entries (sequence, full hash, the hash it
 * links to) with that record's share of the phone's chain check. Grouping
 * only changes how the same checked rows are laid out, never which rows.
 */
import React, {useEffect, useMemo, useState} from 'react';
import {BackHandler, Pressable, StyleSheet, Text, View} from 'react-native';
import {Chip, Lamp, Panel, Readout, Rule, TopAppBar} from './components';
import {CaretRight, Waveform} from './icons';
import {colors, fonts, space, type} from './theme';
import {device, type Delivery, type RecordRow} from '../api/device';
import type {RecordCheck} from '../api/verifyRecord';
import {groupRecord, ZERO_HASH, type RecordGroup} from './recordGroups';

const KIND: Record<string, string> = {
  registration: 'Record created',
  journey_armed: 'Journey started',
  journey_ended: 'Journey ended',
  signal_detected: 'Sound detected',
  checkin_opened: 'Journey check shown',
  checkin_result: 'Journey check answered',
  pin_authorised: 'PIN confirmed',
  no_answer: 'Journey check not answered',
  answered_late: 'Journey check answered late',
  contact_lost: 'Contact lost',
  incident_closed: 'Alert closed',
  removed: 'Details deleted, hash kept',
};

const pad2 = (n: number) => String(n).padStart(2, '0');
const when = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};
const whenSec = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : `${when(iso)}:${pad2(d.getSeconds())}`;
};
const hhmm = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};
const sameDay = (a: string, b: string) => when(a).slice(0, 10) === when(b).slice(0, 10);
const kindLabel = (k: string) => KIND[k] ?? k;

const title = (g: RecordGroup) => (g.session ? 'Active session' : kindLabel(g.entries[0].kind));
const count = (n: number) => `${n} entr${n === 1 ? 'y' : 'ies'}`;
const CHAIN_WORD = {intact: 'chain intact', broken_here: 'chain broken', broken_earlier: 'can’t confirm'} as const;

/** Row sub-line: until when (or no end yet), how many entries, the chain word. */
function summary(g: RecordGroup): string {
  const first = g.entries[0].ts;
  const last = g.entries[g.entries.length - 1].ts;
  const until = g.open ? 'No end recorded yet' : g.session ? `Until ${sameDay(first, last) ? hhmm(last) : when(last)}` : null;
  return [until, count(g.entries.length), CHAIN_WORD[g.status]].filter(Boolean).join(' · ');
}

type State =
  | {state: 'checking'}
  | {state: 'done'; check: RecordCheck; rows: RecordRow[]}
  | {state: 'unreachable'; detail: string}
  | {state: 'preview'};

export function MyRecord({onBack}: {onBack: () => void}) {
  const [s, setS] = useState<State>(device.simulated ? {state: 'preview'} : {state: 'checking'});
  const [d, setD] = useState<Delivery>(device.delivery());
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    const off = device.onDelivery(setD);
    if (device.simulated) return () => void off();
    let live = true;
    device
      .checkMyRecord()
      .then(({check, rows}) => live && setS({state: 'done', check, rows}))
      .catch(e => live && setS({state: 'unreachable', detail: String(e instanceof Error ? e.message : e)}));
    return () => {
      live = false;
      off();
    };
  }, []);

  const done = s.state === 'done' ? s : null;
  const head = done?.check.ok ? done.check.head : null;
  const groups = useMemo(() => (done ? groupRecord(done.rows, done.check.firstBroken) : []), [done]);
  const detail = done?.check.ok ? groups.find(g => g.id === open) ?? null : null;

  // Android back closes the record page first; only while it is open, so the
  // app's own back handling (to Settings) applies on the list. Registered
  // after the app's handler, so it is asked first.
  useEffect(() => {
    if (!detail) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setOpen(null);
      return true;
    });
    return () => sub.remove();
  }, [detail]);

  if (detail && done) return <RecordDetail group={detail} check={done.check} onBack={() => setOpen(null)} />;

  return (
    <View style={styles.screen}>
      <TopAppBar title="My record" onBack={onBack} />

      <Panel>
        <Text style={type.label}>Fingerprint</Text>
        <Text style={[type.caption, {marginTop: 2}]}>The hash of your newest entry. A change to any earlier entry would change it.</Text>
        <Text style={styles.hash} selectable accessibilityLabel={head ? `Fingerprint ${head}` : 'No fingerprint'}>
          {head ??
            (s.state === 'checking'
              ? 'Fetching and checking…'
              : s.state === 'preview'
                ? 'None: the preview sends nothing'
                : s.state === 'unreachable'
                  ? 'Not shown: your record couldn’t be fetched and checked'
                  : 'Not shown: the record didn’t check out')}
        </Text>
        <Rule />
        <Readout label="Record" value={device.profile?.subjectId ?? '—'} />
        <Rule />
        <Readout label="Waiting on this phone" value={String(d.queued)} lamp={<Lamp tone={d.queued ? 'bone' : 'unlit'} hollow={!d.queued} />} />
      </Panel>

      <ServerCheck s={s} />

      <Panel>
        <Text style={type.label}>Public anchor</Text>
        <Text style={[type.body, {marginTop: space.xs}]}>
          {done?.check.anchored
            ? 'Anchored: your record includes a public proof for its newest entry.'
            : 'Not published yet. This server doesn’t run the hourly anchor, so no entry has a public proof yet.'}
        </Text>
      </Panel>

      {done?.check.ok && groups.length ? (
        <Panel style={{padding: 0, overflow: 'hidden'}}>
          <Text style={[type.eyebrow, styles.listHead]}>Records</Text>
          {groups.map((g, i) => (
            <View key={g.id}>
              {i > 0 ? <View style={styles.rowRule} /> : null}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${title(g)}, ${when(g.entries[0].ts)}, ${summary(g)}`}
                accessibilityHint="Opens this record, view only"
                onPress={() => setOpen(g.id)}
                android_ripple={{color: colors.ripple}}
                style={({pressed}) => [styles.entry, pressed && {backgroundColor: colors.keyFacePressed}]}>
                <View style={styles.lead}>
                  {g.session ? <Waveform size={18} color={colors.textTitle} /> : <Text style={styles.index}>{String(g.id).padStart(2, '0')}</Text>}
                </View>
                <View style={{flex: 1, gap: 2}}>
                  <Text style={type.label}>{title(g)}</Text>
                  <Text style={type.caption}>{summary(g)}</Text>
                </View>
                <Text style={styles.trailing}>{when(g.entries[0].ts)}</Text>
                <CaretRight size={14} color={colors.textDim} />
              </Pressable>
            </View>
          ))}
        </Panel>
      ) : null}
    </View>
  );
}

/**
 * One record's entries, oldest first. VIEW ONLY: nothing here changes the
 * record. The chain check is this record's share of the phone's check of the
 * whole export; it is not a separate check.
 */
function RecordDetail({group: g, check, onBack}: {group: RecordGroup; check: RecordCheck; onBack: () => void}) {
  const first = g.entries[0].ts;
  const [chainTitle, chainBody] =
    g.status === 'intact'
      ? ['Chain intact', 'Every entry here links to the one before it and matches what was signed, as checked on this phone.']
      : g.status === 'broken_here'
        ? [`Chain broken at entry ${check.firstBroken}`, check.reason ?? 'That entry, or its link, doesn’t check.']
        : ['Can’t be confirmed', `The chain breaks earlier, at entry ${check.firstBroken}, so nothing after it can be confirmed.`];
  return (
    <View style={styles.screen}>
      <TopAppBar title={title(g)} onBack={onBack} />
      <View style={styles.detailMeta}>
        <Text style={[type.eyebrow, {flex: 1}]}>My record · {when(first).slice(0, 10)}</Text>
        <Chip status="neutral" label="View only" />
      </View>

      <Panel>
        <Readout
          label="Checked on this phone"
          value={g.status === 'intact' ? 'checks out' : g.status === 'broken_here' ? 'broken here' : 'can’t confirm'}
          lamp={<Lamp tone={g.status === 'intact' ? 'green' : 'unlit'} hollow={g.status !== 'intact'} />}
        />
        <Rule />
        <Text style={[type.label, {marginTop: space.xs}]} accessibilityLiveRegion="polite">
          {chainTitle}
        </Text>
        <Text style={[type.body, {marginTop: 2}]}>{chainBody}</Text>
        <Text style={[type.caption, {marginTop: space.sm}]}>Signatures and the public anchor are checked by the verify page, not on this phone.</Text>
      </Panel>

      <Panel style={{padding: 0, overflow: 'hidden'}}>
        <Text style={[type.eyebrow, styles.listHead]}>What happened</Text>
        {g.entries.map((e, i) => (
          <View key={e.hash}>
            {i > 0 ? <View style={styles.rowRule} /> : null}
            <View
              style={styles.entry}
              accessible
              accessibilityLabel={`Entry ${e.index}, ${kindLabel(e.kind)}, ${whenSec(e.ts)}${e.fromThisPhone ? ', from this phone' : ''}`}>
              <Text style={styles.index}>{String(e.index).padStart(2, '0')}</Text>
              <View style={{flex: 1, gap: 2}}>
                <Text style={type.label}>{kindLabel(e.kind)}</Text>
                <Text style={type.caption}>
                  {sameDay(first, e.ts) ? whenSec(e.ts).slice(11) : whenSec(e.ts)}
                  {e.fromThisPhone ? ' · from this phone' : ''}
                </Text>
                <Text style={[type.caption, {marginTop: space.xs}]}>Hash</Text>
                <Text style={styles.hashSmall} selectable>
                  {e.hash}
                </Text>
                <Text style={type.caption}>Links to{e.linkChecked ? '' : ' (not confirmed)'}</Text>
                <Text style={styles.hashSmall} selectable>
                  {e.prevHash === null ? 'not in this record' : e.prevHash === ZERO_HASH ? `${ZERO_HASH} (start of record)` : e.prevHash}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </Panel>

      <Text style={[type.caption, styles.footnote]}>
        {check.anchored
          ? 'Entries can’t be edited here. Each entry’s hash covers the one before it, so a change anywhere shows up in the check. Your record includes a public proof for its newest entry.'
          : 'Entries can’t be edited here. Each entry’s hash covers the one before it, so a change anywhere shows up in the check. Not published yet: this server doesn’t run the hourly anchor, so no entry has a public proof yet.'}
      </Text>
    </View>
  );
}

/** What the phone found when it checked the server's copy. */
function ServerCheck({s}: {s: State}) {
  if (s.state === 'preview') return null;
  if (s.state === 'checking') {
    return (
      <Panel>
        <Readout label="Checked on this phone" value="checking…" lamp={<Lamp tone="unlit" />} />
      </Panel>
    );
  }
  if (s.state === 'unreachable') {
    return (
      <Panel>
        <Readout label="Checked on this phone" value="not yet" lamp={<Lamp tone="unlit" hollow />} />
        <Text style={[type.caption, {marginTop: space.sm}]}>
          Your record is shown only once it has been fetched and checked. Couldn’t reach the server: {s.detail}
        </Text>
      </Panel>
    );
  }
  const r = s.check;
  return (
    <Panel>
      <Readout label="Checked on this phone" value={r.ok ? 'checks out' : `broken at entry ${r.firstBroken}`} lamp={<Lamp tone={r.ok ? 'green' : 'unlit'} hollow={!r.ok} />} />
      <Rule />
      {r.ok ? (
        <Text style={[type.body, {marginTop: space.xs}]}>
          All {r.entries} entries link together, every payload matches what was signed, and
          {r.mine.inside ? ` all ${r.mine.inside} receipts this phone kept are in it, unchanged.` : ' none of this phone’s receipts fall inside it yet.'}
        </Text>
      ) : (
        <Text style={[type.body, {marginTop: space.xs, color: colors.textTitle}]}>
          Entry {r.firstBroken} doesn’t check: {r.reason}
        </Text>
      )}
      <Text style={[type.caption, {marginTop: space.sm}]}>Signatures and the public anchor are checked by the verify page, not on this phone.</Text>
    </Panel>
  );
}

const styles = StyleSheet.create({
  screen: {flexGrow: 1, gap: space.md},
  hash: {fontFamily: fonts.mono, fontSize: 13, lineHeight: 20, color: colors.textTitle, marginVertical: space.sm},
  hashSmall: {fontFamily: fonts.mono, fontSize: 12, lineHeight: 18, color: colors.textTitle},
  entry: {flexDirection: 'row', gap: space.md, paddingHorizontal: space.md, paddingVertical: space.md, alignItems: 'flex-start'},
  lead: {width: 36, minHeight: 22, justifyContent: 'center'},
  trailing: {fontFamily: fonts.mono, fontSize: 12, lineHeight: 20, color: colors.textDim},
  listHead: {paddingHorizontal: space.md, paddingTop: space.md, paddingBottom: space.xs},
  detailMeta: {flexDirection: 'row', alignItems: 'center', gap: space.sm},
  footnote: {paddingHorizontal: space.xs},
  index: {fontFamily: fonts.mono, fontSize: 13, lineHeight: 22, color: colors.cobaltInk, width: 36},
  rowRule: {height: 1, backgroundColor: colors.hairline, marginHorizontal: space.md},
});
