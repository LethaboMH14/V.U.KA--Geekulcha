/**
 * The guardian side of VIGIL: the same app, for the person a member trusts.
 *
 * Setup: the member shares a download link and a one-time code (10 minutes,
 * 5 tries). The guardian enters it, reads what being a guardian means (POPIA
 * s18: what is shared, what is kept, how to stop), agrees, and enrols this
 * phone's own key (#96 `POST /v1/guardians/accept`).
 *
 * Home: while the app is open it asks for alerts every 5 s with that key
 * (`GET /v1/guardians/me/alerts`). An alert leads with G4, "Don't call or text
 * them. Call 10111."; calling the member unlocks only after stand-down or
 * closure. Every answer is signed with this phone's key (G5, `guardian_ack`).
 * No push yet: alerts arrive while the app is open (FCM is PR #95's path).
 */
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Linking, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View} from 'react-native';
import {Chip, Eyebrow, GlassIcon, Key, Lamp, Panel, QuietKey, Readout, Rule, Surface, TopAppBar} from './components';
import {CheckCircle, Phone, ShieldChevron, UsersThree} from './icons';
import {colors, fonts, radii, space, type} from './theme';
import {device, type GuardianAlert} from '../api/device';
import {whyLine} from './whyLine';
import {version} from '../../package.json';

const TOP = Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 0;
const pad2 = (n: number) => String(n).padStart(2, '0');
const hhmm = (iso: string) => {
  const d = new Date(iso);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

const WHY: Record<GuardianAlert['trigger'], (n: string) => string> = {
  duress_signal: n => `${n} used their second PIN: they may be being forced.`,
  no_answer: n => `${n} didn't answer a check-in after VIGIL heard trouble.`,
  contact_lost: n => `${n}'s phone stopped checking in during an alert.`,
  unknown: n => `${n} may need help.`,
};

/* ── Setup ───────────────────────────────────────────────────── */

export function GuardianSetup({onDone, onBack}: {onDone: () => void; onBack: () => void}) {
  const [step, setStep] = useState<'code' | 'consent'>('code');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clean = code.trim().toLowerCase();
  const codeOk = /^[0-9a-f]{8}-\d{6}$/.test(clean);
  const who = name.trim() || 'your member';

  const accept = async () => {
    if (!agree || busy) return;
    setBusy(true);
    setError(null);
    try {
      await device.becomeGuardian(clean, name);
      onDone();
    } catch (e) {
      const m = String(e instanceof Error ? e.message : e);
      setError(
        /^401 /.test(m)
          ? 'That code didn’t work. Codes last 10 minutes and allow 5 tries: ask for a new one.'
          : /^\d{3} /.test(m)
            ? `The server refused: ${m}`
            : 'Couldn’t reach VIGIL’s server. Check your data and try again.',
      );
      setStep('code');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{flex: 1}}>
      <Surface tone="guardian" />
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <View style={styles.screen}>
          <TopAppBar title={step === 'code' ? 'Become a guardian' : 'Before you agree'} onBack={step === 'code' ? onBack : () => setStep('code')} tone="guardian" />
          {step === 'code' ? (
            <>
              <Panel hero tone="guardian">
                <View style={styles.rowHeader}>
                  <GlassIcon>
                    <UsersThree size={20} color={colors.textTitle} />
                  </GlassIcon>
                  <Eyebrow>Guardian</Eyebrow>
                </View>
                <Text style={[type.display, {marginTop: space.md, fontSize: 28, lineHeight: 32}]} accessibilityRole="header">
                  Someone trusts you
                </Text>
                <Text style={[type.body, {marginTop: space.sm}]}>
                  They sent you a code. Enter it here to be told if VIGIL thinks they may need help.
                </Text>
              </Panel>
              <Panel tone="guardian">
                <Text style={type.label}>Whose guardian are you?</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Their first name"
                  placeholderTextColor={colors.textDim}
                  autoCapitalize="words"
                  maxLength={30}
                  style={styles.field}
                  accessibilityLabel="Their first name"
                />
                <Text style={[type.label, {marginTop: space.lg}]}>Your code</Text>
                <TextInput
                  value={code}
                  onChangeText={setCode}
                  placeholder="1a2b3c4d-123456"
                  placeholderTextColor={colors.textDim}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[styles.field, {fontFamily: fonts.mono, letterSpacing: 0.5}]}
                  accessibilityLabel="Invite code"
                />
                <Text style={[type.caption, {marginTop: space.sm}]}>Codes last 10 minutes. Only the name stays on this phone.</Text>
                {error ? (
                  <Text style={[type.body, {marginTop: space.md, color: colors.amberText}]} accessibilityLiveRegion="polite">
                    {error}
                  </Text>
                ) : null}
              </Panel>
              <Key label="Continue" variant={codeOk ? 'guardian' : 'plain'} arrow disabled={!codeOk} onPress={() => setStep('consent')} />
            </>
          ) : (
            <>
              <Panel hero tone="guardian">
                <Eyebrow>POPIA · what being a guardian means</Eyebrow>
                <View style={{gap: space.md, marginTop: space.md}}>
                  {[
                    ['You are told', `when VIGIL thinks ${who} may need help: a check-in not answered, their second PIN used, or their phone going quiet during an alert. With an alert, you see what VIGIL noticed in words (for example "a scream") and how strong the signs were.`],
                    ['You are not told', `where ${who} is, any recording (VIGIL never keeps one), or anything about ordinary days.`],
                    ['What is kept', 'a key made on this phone, and your answers (called 10111, handling it, stand down). Each answer is signed and joins their record.'],
                    ['You can stop', `any time: ${who} can remove you, and uninstalling ends it.`],
                  ].map(([h, b]) => (
                    <View key={h}>
                      <Text style={type.label}>{h}</Text>
                      <Text style={[type.body, {marginTop: 2}]}>{b}</Text>
                    </View>
                  ))}
                </View>
              </Panel>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{checked: agree}}
                onPress={() => setAgree(a => !a)}
                style={styles.agree}>
                <View style={[styles.box, agree && styles.boxOn]}>{agree ? <CheckCircle size={18} weight="fill" color={colors.amberText} /> : null}</View>
                <Text style={[type.body, {flex: 1, color: colors.textLabel}]}>
                  I agree to be {who}'s guardian, and to calling 10111 rather than {who} during an alert.
                </Text>
              </Pressable>
              <Key label={busy ? 'Joining…' : 'Become a guardian'} variant={agree ? 'guardian' : 'plain'} disabled={!agree || busy} onPress={accept} />
            </>
          )}
          <Text style={styles.sim}>
            Demo server · alerts arrive while this app is open · build <Text style={styles.simId}>{version}</Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

/* ── Home ────────────────────────────────────────────────────── */

type Acked = Record<string, ('called_10111' | 'handling' | 'stand_down')[]>;

export function GuardianHome() {
  const g = device.profile?.guardian;
  const who = g?.memberName ?? 'your member';
  const [alerts, setAlerts] = useState<GuardianAlert[] | null>(null);
  const [reached, setReached] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [acked, setAcked] = useState<Acked>({});
  const [note, setNote] = useState<string | null>(null);
  const live = useRef(true);

  const poll = useCallback(async () => {
    try {
      const a = await device.guardianAlerts();
      if (!live.current) return;
      setAlerts(a);
      setReached(new Date().toISOString());
      setOffline(false);
    } catch {
      if (live.current) setOffline(true);
    }
  }, []);

  useEffect(() => {
    live.current = true;
    void poll();
    const t = setInterval(poll, 5000);
    return () => {
      live.current = false;
      clearInterval(t);
    };
  }, [poll]);

  const open = alerts?.find(a => !a.closed_at) ?? null;
  const past = (alerts ?? []).filter(a => a !== open);
  const answer = async (a: GuardianAlert, action: 'called_10111' | 'handling' | 'stand_down') => {
    setNote(null);
    try {
      await device.acknowledge(a.incident_id, action);
      setAcked(x => ({...x, [a.incident_id]: [...(x[a.incident_id] ?? []), action]}));
      if (action === 'stand_down') void poll();
    } catch (e) {
      setNote(`Your answer wasn't sent: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  return (
    <View style={{flex: 1}}>
      <Surface tone="guardian" />
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.screen}>
          <View style={styles.greeting}>
            <View>
              <Eyebrow style={{marginBottom: 4}}>Guardian</Eyebrow>
              <Text style={styles.name}>{who}</Text>
            </View>
            <Chip status={reached && !offline ? 'received' : 'neutral'} label={offline ? 'Offline' : reached ? `Checked ${hhmm(reached)}` : 'Connecting'} />
          </View>

          {open ? (
            <OpenAlert who={who} alert={open} acks={acked[open.incident_id] ?? []} onAnswer={a => answer(open, a)} note={note} />
          ) : (
            <Panel hero tone="guardian">
              <View style={styles.rowHeader}>
                <GlassIcon>
                  <ShieldChevron size={20} color={colors.textTitle} />
                </GlassIcon>
                <Eyebrow>VIGIL · {who}</Eyebrow>
              </View>
              <Text style={[type.display, {marginTop: space.md}]} accessibilityRole="header">
                All quiet
              </Text>
              <Text style={[type.body, {marginTop: space.sm}]}>
                Nothing needs you right now. Keep VIGIL open or check back: alerts arrive while this app is open.
              </Text>
            </Panel>
          )}

          {past.length ? (
            <Panel tone="guardian">
              <Text style={type.label}>Earlier alerts</Text>
              {past.slice(0, 5).map(a => (
                <View key={a.incident_id}>
                  <Rule />
                  <Readout label={`${hhmm(a.opened_at)} · ${a.trigger === 'duress_signal' ? 'second PIN' : a.trigger === 'no_answer' ? 'no answer' : 'contact lost'}`} value={a.close_reason === 'stand_down' ? 'stood down' : a.close_reason ?? 'closed'} />
                </View>
              ))}
            </Panel>
          ) : null}

          <Text style={styles.sim}>
            Demo server · guardian key <Text style={styles.simId}>{g?.keyId ?? '—'}</Text> · build <Text style={styles.simId}>{version}</Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function OpenAlert({
  who,
  alert,
  acks,
  onAnswer,
  note,
}: {
  who: string;
  alert: GuardianAlert;
  acks: string[];
  onAnswer: (a: 'called_10111' | 'handling' | 'stand_down') => void;
  note: string | null;
}) {
  const stood = acks.includes('stand_down');
  return (
    <>
      <Panel hero tone="guardian">
        <Eyebrow style={{color: colors.amberText}}>Alert · {hhmm(alert.opened_at)}</Eyebrow>
        <Text style={[type.display, {marginTop: space.sm}]} accessibilityRole="header">
          {who} may need help
        </Text>
        <Text style={[type.body, {marginTop: space.sm}]}>{WHY[alert.trigger](who)}</Text>
        {whyLine(alert.why) ? <Text style={[type.body, {marginTop: space.xs}]}>{whyLine(alert.why)}</Text> : null}
        <View style={styles.g4}>
          <Text style={styles.g4Text}>Don't call or text {who}. Call 10111.</Text>
          <Text style={[type.caption, {color: colors.amberText, marginTop: 4}]}>If someone is with {who}, a ringing phone could put them at risk.</Text>
        </View>
        <Key
          label={acks.includes('called_10111') ? 'Call 10111 again' : 'Call 10111'}
          variant="guardian"
          icon={<Phone size={20} weight="bold" color={colors.textInverse} />}
          onPress={() => {
            onAnswer('called_10111');
            void Linking.openURL('tel:10111');
          }}
        />
      </Panel>
      <View style={{gap: space.sm}}>
        <Key label={acks.includes('handling') ? "You're handling it" : "I'm handling it"} variant="guardianPlain" onPress={() => onAnswer('handling')} />
        <Key label={stood ? 'Stood down' : `Stand down: ${who} is safe`} variant="ghost" onPress={() => onAnswer('stand_down')} />
      </View>
      {note ? <Text style={[type.caption, {color: colors.amberText}]}>{note}</Text> : null}
      <Text style={type.caption}>
        Each answer is signed with this phone's key and joins {who}'s record. VIGIL doesn't dispatch anyone. Calling {who} unlocks after the alert closes.
      </Text>
    </>
  );
}

/* ── Welcome choice ──────────────────────────────────────────── */

export function GuardianChoice({onGuardian}: {onGuardian: () => void}) {
  return <QuietKey label="I'm a guardian" onPress={onGuardian} />;
}

const styles = StyleSheet.create({
  page: {flexGrow: 1, paddingHorizontal: 22, paddingBottom: 28, paddingTop: 12 + TOP, width: '100%', maxWidth: 560, alignSelf: 'center'},
  screen: {flexGrow: 1, gap: 14},
  greeting: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.sm, marginBottom: space.xs},
  name: {fontFamily: fonts.semibold, fontSize: 26, lineHeight: 32, letterSpacing: -0.3, color: colors.textTitle},
  rowHeader: {flexDirection: 'row', alignItems: 'center', gap: 10},
  field: {
    minHeight: 52,
    marginTop: space.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: space.md,
    fontFamily: fonts.regular,
    fontSize: 17,
    color: colors.textTitle,
  },
  agree: {flexDirection: 'row', alignItems: 'flex-start', gap: space.md, paddingHorizontal: 4, minHeight: 48},
  box: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.controlEdge,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  boxOn: {borderColor: colors.amberText, backgroundColor: colors.amberFill},
  g4: {
    marginTop: space.md,
    marginBottom: space.md,
    padding: space.md,
    borderRadius: radii.sm,
    backgroundColor: colors.amberFill,
    borderWidth: 1,
    borderColor: '#F2D48A',
  },
  g4Text: {fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22, color: colors.amberText},
  sim: {...type.caption, fontSize: 12, textAlign: 'center', marginTop: space.md},
  simId: {fontFamily: fonts.mono, fontSize: 11},
});
