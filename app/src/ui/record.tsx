/**
 * My record: the member's own copy of every entry the server has received
 * from this phone, oldest first, with each entry's hash (spec F14, §4).
 *
 * The record's fingerprint is the hash of its newest entry: every entry's hash
 * covers the one before it, so a change anywhere earlier changes this value.
 *
 * Duress parity: entries are named by kind only, so a check answered with the
 * duress PIN reads exactly like one answered normally. Entries are numbered in
 * this phone's own order, never by chain index: after a duress PIN the server
 * appends its own entries, and a jump in the numbers would give that away.
 */
import React, {useEffect, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {Lamp, Panel, Readout, Rule, TopAppBar} from './components';
import {colors, fonts, space, type} from './theme';
import {device, type Delivery, type RecordEntry} from '../api/device';
import type {RecordCheck} from '../api/verifyRecord';

type Check = {state: 'checking'} | {state: 'done'; result: RecordCheck} | {state: 'unreachable'; detail: string};

const KIND: Record<string, string> = {
  registration: 'Record created',
  journey_armed: 'Journey started',
  journey_ended: 'Journey ended',
  signal_detected: 'Sound detected',
  checkin_opened: 'Journey check shown',
  checkin_result: 'Journey check answered',
  pin_authorised: 'PIN confirmed',
};

const pad2 = (n: number) => String(n).padStart(2, '0');
const when = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};
const short = (h: string) => `${h.slice(0, 8)}…${h.slice(-8)}`;

export function MyRecord({onBack}: {onBack: () => void}) {
  const [entries, setEntries] = useState<RecordEntry[] | null>(null);
  const [d, setD] = useState<Delivery>(device.delivery());
  const [open, setOpen] = useState<number | null>(null);
  const [check, setCheck] = useState<Check | null>(device.simulated ? null : {state: 'checking'});

  // The server's copy of this record, checked on this phone (F14).
  useEffect(() => {
    if (device.simulated) return;
    let live = true;
    device
      .checkMyRecord()
      .then(result => live && setCheck({state: 'done', result}))
      .catch(e => live && setCheck({state: 'unreachable', detail: String(e instanceof Error ? e.message : e)}));
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    let live = true;
    const load = () => device.myRecord().then(e => live && setEntries(e)).catch(() => live && setEntries([]));
    load();
    const off = device.onDelivery(x => {
      setD(x);
      load();
    });
    void device.flush();
    return () => {
      live = false;
      off();
    };
  }, []);

  const head = entries && entries.length ? entries[entries.length - 1] : null;
  return (
    <View style={styles.screen}>
      <TopAppBar title="My record" onBack={onBack} />

      <Panel>
        <Text style={type.label}>Fingerprint</Text>
        <Text style={[type.caption, {marginTop: 2}]}>The hash of your newest entry. A change to any earlier entry would change it.</Text>
        <Text style={styles.hash} selectable accessibilityLabel={head ? `Fingerprint ${head.event_hash}` : 'No fingerprint yet'}>
          {head ? head.event_hash : entries === null ? 'Loading…' : device.simulated ? 'None: the preview sends nothing' : 'None yet: nothing has been received'}
        </Text>
        <Rule />
        <Readout label="Record" value={device.profile?.subjectId ?? '—'} />
        <Rule />
        <Readout label="Received" value={String(d.received)} lamp={<Lamp tone={d.received ? 'green' : 'unlit'} />} />
        <Rule />
        <Readout label="Waiting on this phone" value={String(d.queued)} lamp={<Lamp tone={d.queued ? 'bone' : 'unlit'} hollow={!d.queued} />} />
        {d.lastError ? <Text style={[type.caption, {marginTop: space.sm}]}>Last send: {d.lastError}</Text> : null}
      </Panel>

      {check ? <ServerCheck check={check} /> : null}

      <Panel>
        <Text style={type.label}>Public anchor</Text>
        <Text style={[type.body, {marginTop: space.xs}]}>
          {check?.state === 'done' && check.result.anchored
            ? 'Anchored: the server’s export includes a proof for its newest entry.'
            : 'Not published yet. This server doesn’t run the hourly anchor, so no entry has a public proof. Your hashes are still checked against the server’s chain above.'}
        </Text>
      </Panel>

      {entries && entries.length ? (
        <Panel style={{padding: 0, overflow: 'hidden'}}>
          {entries
            .map((e, n) => ({e, n: n + 1}))
            .reverse()
            .map(({e, n}, i) => (
              <View key={e.seq}>
                {i > 0 ? <View style={styles.rowRule} /> : null}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Entry ${n}, ${KIND[e.kind] ?? e.kind}, ${when(e.ts)}`}
                  accessibilityHint="Shows the full hash"
                  onPress={() => setOpen(open === e.seq ? null : e.seq)}
                  style={({pressed}) => [styles.entry, pressed && {backgroundColor: colors.keyFacePressed}]}>
                  <Text style={styles.index}>{String(n).padStart(2, '0')}</Text>
                  <View style={{flex: 1, gap: 2}}>
                    <Text style={type.label}>{KIND[e.kind] ?? e.kind}</Text>
                    <Text style={type.caption}>{when(e.ts)}</Text>
                    {open === e.seq ? (
                      <Text style={[styles.hash, {marginTop: space.xs}]} selectable>
                        {e.event_hash}
                        {'\n'}event {e.event_id}
                      </Text>
                    ) : (
                      <Text style={styles.hashShort}>{short(e.event_hash)}</Text>
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
function ServerCheck({check}: {check: Check}) {
  if (check.state === 'checking') {
    return (
      <Panel>
        <Readout label="Server’s copy" value="checking…" lamp={<Lamp tone="unlit" />} />
      </Panel>
    );
  }
  if (check.state === 'unreachable') {
    return (
      <Panel>
        <Readout label="Server’s copy" value="not checked" lamp={<Lamp tone="unlit" hollow />} />
        <Text style={[type.caption, {marginTop: space.sm}]}>Couldn’t reach the server to fetch it. {check.detail}</Text>
      </Panel>
    );
  }
  const r = check.result;
  return (
    <Panel>
      <Readout label="Server’s copy" value={r.ok ? 'checks out' : `broken at entry ${r.firstBroken}`} lamp={<Lamp tone={r.ok ? 'green' : 'unlit'} hollow={!r.ok} />} />
      <Rule />
      {r.ok ? (
        <Text style={[type.body, {marginTop: space.xs}]}>
          Checked on this phone: all {r.entries} entries link together, every payload matches what was signed, and
          {r.mine.inside ? ` all ${r.mine.inside} receipts this phone kept are in it, unchanged.` : ' none of this phone’s receipts fall inside it yet.'}
        </Text>
      ) : (
        <Text style={[type.body, {marginTop: space.xs, color: colors.textTitle}]}>
          Entry {r.firstBroken} doesn’t check: {r.reason}
        </Text>
      )}
      <Text style={[type.caption, {marginTop: space.sm}]}>
        Signatures and the public anchor are checked by the verify page, not on this phone.
      </Text>
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
