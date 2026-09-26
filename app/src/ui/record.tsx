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
 */
import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {Lamp, Panel, Readout, Rule, TopAppBar} from './components';
import {colors, fonts, space, type} from './theme';
import {device, type Delivery, type RecordRow} from '../api/device';
import type {RecordCheck} from '../api/verifyRecord';

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
const short = (h: string) => `${h.slice(0, 8)}…${h.slice(-8)}`;

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

      {done?.check.ok && done.rows.length ? (
        <Panel style={{padding: 0, overflow: 'hidden'}}>
          {done.rows
            .slice()
            .reverse()
            .map((r, i) => (
              <View key={r.hash}>
                {i > 0 ? <View style={styles.rowRule} /> : null}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Entry ${r.index}, ${KIND[r.kind] ?? r.kind}, ${when(r.ts)}${r.fromThisPhone ? ', from this phone' : ''}`}
                  accessibilityHint="Shows the full hash"
                  onPress={() => setOpen(open === r.index ? null : r.index)}
                  style={({pressed}) => [styles.entry, pressed && {backgroundColor: colors.keyFacePressed}]}>
                  <Text style={styles.index}>{String(r.index).padStart(2, '0')}</Text>
                  <View style={{flex: 1, gap: 2}}>
                    <Text style={type.label}>{KIND[r.kind] ?? r.kind}</Text>
                    <Text style={type.caption}>
                      {when(r.ts)}
                      {r.fromThisPhone ? ' · from this phone' : ''}
                    </Text>
                    {open === r.index ? (
                      <Text style={[styles.hash, {marginTop: space.xs}]} selectable>
                        {r.hash}
                      </Text>
                    ) : (
                      <Text style={styles.hashShort}>{short(r.hash)}</Text>
                    )}
                  </View>
                </Pressable>
              </View>
            ))}
        </Panel>
      ) : null}
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
  hashShort: {fontFamily: fonts.mono, fontSize: 12, lineHeight: 18, color: colors.textDim},
  entry: {flexDirection: 'row', gap: space.md, paddingHorizontal: space.md, paddingVertical: space.md, alignItems: 'flex-start'},
  index: {fontFamily: fonts.mono, fontSize: 13, lineHeight: 22, color: colors.cobaltInk, width: 36},
  rowRule: {height: 1, backgroundColor: colors.hairline, marginHorizontal: space.md},
});
