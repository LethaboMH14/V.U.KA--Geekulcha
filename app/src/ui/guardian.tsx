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
 * Push (FCM, src/api/push.ts) is added on top when the build has Firebase:
 * a pushed alert shows the same notice and checks at once. Polling stays in
 * every case; without Firebase alerts arrive while the app is open.
 */
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {AppState, Linking, NativeModules, PermissionsAndroid, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View} from 'react-native';
import Bell from 'phosphor-react-native/lib/commonjs/icons/Bell';
import Prohibit from 'phosphor-react-native/lib/commonjs/icons/Prohibit';
import {Chip, Dialog, Eyebrow, GlassIcon, Key, Panel, QuietKey, Readout, Row, Rule, Surface, TopAppBar} from './components';
import {CaretRight, CheckCircle, Phone, ShieldChevron, UsersThree} from './icons';
import {colors, fonts, radii, space, type} from './theme';
import {device, type GuardianAlert} from '../api/device';
import {whyLine} from './whyLine';
import {AlertMap} from './map';
import {keepAwake} from '../sensors/location';
import {dropGuardianPush, registerGuardianPush, startGuardianPush} from '../api/push';

/** The guardian's alert notice and standby (native, Android only). */
type Notice = {
  showAlert?(t: string, b: string): void;
  clearAlert?(): void;
  consumeAlertOpen?(): Promise<boolean>;
  notificationsEnabled?(): Promise<boolean>;
  openNotificationSettings?(): void;
};
const notice: Notice | undefined = NativeModules.VigilLocation;

/**
 * True once when VIGIL was opened by tapping the alert notice (a poll found
 * the alert): the app then opens the alert, like Mutarisi's EXTRA_OPEN_ALERT.
 * A pushed alert's own notification is handled by push.ts instead.
 */
export async function consumeGuardianOpen(n: Notice | undefined = notice): Promise<boolean> {
  return Boolean(await n?.consumeAlertOpen?.().catch(() => false));
}

/**
 * "Stop being a guardian" (Mutarisi's LeaveGuardianSheet), on this phone:
 * the FCM token is deleted so pushes stop reaching it, any alert notice is
 * cleared and the guardian slot is forgotten. VIGIL's server isn't told (it
 * has no guardian-side removal), so the member should remove this guardian too.
 */
export async function leaveGuardian(): Promise<'member' | 'none'> {
  await dropGuardianPush().catch(() => undefined);
  notice?.clearAlert?.();
  stoodDownIds.clear();
  return device.leaveGuardian();
}

/** When a pushed alert last showed the notice (ms). */
let pushNoticeAt = 0;
/**
 * The alert notice, from a push or a poll. A poll finding the alert a push
 * just announced doesn't sound it a second time.
 */
function alertNotice(fromPush = false): void {
  if (fromPush) pushNoticeAt = Date.now();
  else if (Date.now() - pushNoticeAt < 60_000) return;
  notice?.showAlert?.(`${device.profile?.guardian?.memberName ?? 'Your member'} may need help`, "Open VUKA. Don't call or text them: call 10111.");
}

/** The alert checks running now (standby and the app-wide watch): a push runs them at once. */
const pollers = new Set<() => unknown>();

/**
 * Guardian push while the app runs (does nothing without Firebase): a
 * foreground alert shows the notice and checks now; tapping an alert's
 * notification calls onOpen. Polling carries on regardless.
 */
export function useGuardianPush(onOpen: () => void): void {
  const opener = useRef(onOpen);
  opener.current = onOpen;
  useEffect(
    () =>
      startGuardianPush({
        onAlert: () => {
          alertNotice(true);
          pollers.forEach(p => void p());
        },
        onOpen: () => opener.current(),
      }),
    [],
  );
}
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

/**
 * Android 13+ asks for notification permission; before that it is on unless
 * the person turned it off, which this app can't see without a native check,
 * so it says nothing rather than guess.
 */
const ASKS_FOR_NOTIFICATIONS = Platform.OS === 'android' && Number(Platform.Version) >= 33;
export async function notificationsOff(n: Notice | undefined = notice): Promise<boolean> {
  // Mutarisi's areNotificationsEnabled(): also sees notifications turned off in settings, on any version.
  if (n?.notificationsEnabled) {
    const on = await n.notificationsEnabled().catch(() => null);
    if (on !== null) return !on;
  }
  return ASKS_FOR_NOTIFICATIONS ? !(await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS).catch(() => true)) : false;
}

/** "Turn on notifications": VUKA's notification settings (Android 8+), else the app's settings page. */
const openNotificationSettings = () => (notice?.openNotificationSettings ? notice.openNotificationSettings() : void Linking.openSettings());

/* ── Setup ───────────────────────────────────────────────────── */

export function GuardianSetup({onDone, onBack}: {onDone: () => void; onBack: () => void}) {
  const [step, setStep] = useState<'code' | 'consent'>('code');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Mutarisi's "Turn on alerts?" pop-up: once per enrolment, over the consent screen.
  const [askAlerts, setAskAlerts] = useState(false);
  const alertsAsked = useRef(false);
  const alertsDeclined = useRef(false);
  const clean = code.trim().toLowerCase();
  const codeOk = /^[0-9a-f]{8}-\d{6}$/.test(clean);
  const who = name.trim() || 'your member';

  const toConsent = () => {
    setStep('consent');
    if (alertsAsked.current) return;
    alertsAsked.current = true;
    // Only when it is missing: Android never asks again for a permission already given.
    void notificationsOff().then(off => off && setAskAlerts(true));
  };
  const allowAlerts = async () => {
    setAskAlerts(false);
    // The answer doesn't block enrolment: standby shows how to turn them on later.
    // Android can't ask again (before 13 there is no prompt; after "Don't allow"
    // twice it stops asking; or they were turned off in settings): open VUKA's
    // notification settings instead, as Mutarisi's standby does.
    const r = ASKS_FOR_NOTIFICATIONS ? await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS).catch(() => null) : null;
    if (r === PermissionsAndroid.RESULTS.DENIED) return;
    if (await notificationsOff()) openNotificationSettings();
  };

  const accept = async () => {
    if (!agree || busy) return;
    setBusy(true);
    setError(null);
    try {
      await device.becomeGuardian(clean, name);
      // Push on top of polling when the build has Firebase; asks for
      // notifications unless they just said "Not now". Never blocks enrolment.
      void registerGuardianPush({ask: !alertsDeclined.current});
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
                  <Eyebrow>Guardian · step 1 of 2</Eyebrow>
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
              <Key label="Continue" variant={codeOk ? 'guardian' : 'plain'} disabled={!codeOk} onPress={toConsent} />
            </>
          ) : (
            <>
              <Panel hero tone="guardian">
                <Eyebrow>Step 2 of 2 · POPIA · what being a guardian means</Eyebrow>
                <View style={{gap: space.md, marginTop: space.md}}>
                  {[
                    ['You are told', `when VIGIL thinks ${who} may need help: a check-in not answered, their second PIN used, or their phone going quiet during an alert. With an alert, you see what VIGIL noticed in words (for example "a scream") and how strong the signs were.`],
                    ['Where', `only during an alert: where ${who}'s phone is, on a map, for up to 30 minutes. It is kept until 24 hours after the alert ends. The map pictures come from OpenFreeMap, which sees the area you look at.`],
                    ['You are not told', `where ${who} is on ordinary days, any recording (VIGIL never keeps one), or anything else about their life.`],
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
      <Dialog
        visible={askAlerts}
        tone="guardian"
        title="Turn on alerts?"
        icon={<Bell size={22} weight="bold" color={colors.amberText} />}
        confirm="Allow"
        onConfirm={() => void allowAlerts()}
        cancel="Not now"
        onCancel={() => {
          alertsDeclined.current = true;
          setAskAlerts(false);
        }}>
        {`If ${who} may need help, VIGIL shows you a notification, even when your phone is locked or you're in another app. Without it, you'd only see the alert when you next open VIGIL.`}
      </Dialog>
    </View>
  );
}

/* ── Home ────────────────────────────────────────────────────── */

type Answer = 'called_10111' | 'handling' | 'stand_down';
type Acked = Record<string, Answer[]>;

/**
 * Claim one answer for one alert before sending it. False when it is already
 * on its way or recorded, so a second press (or a double tap) sends nothing.
 * The caller releases the claim if the write fails, so it can be retried.
 */
export function claimAnswer(claimed: Set<string>, incidentId: string, action: Answer): boolean {
  const key = `${incidentId}:${action}`;
  if (claimed.has(key)) return false;
  claimed.add(key);
  return true;
}

/** The recorded state in words. Never claims a call happened: only that Call 10111 was pressed. */
export function answerStatus(acks: readonly Answer[]): string | null {
  if (acks.includes('stand_down')) {
    return acks.includes('called_10111') ? "Stood down. You confirmed they're safe." : "Stood down without calling 10111. You confirmed they're safe.";
  }
  if (acks.includes('called_10111')) return 'You pressed Call 10111, recorded.';
  return null;
}

/** The "Are they safe?" confirmation; before Call 10111 it says 10111 won't be called from this alert. */
export function standDownQuestion(acks: readonly Answer[]): string {
  return acks.includes('called_10111')
    ? "Only stand down if you know they're safe."
    : "Only stand down if you know they're safe. 10111 won't be called from this alert.";
}

export type TimelineStep = {label: string; at: string | null};

/**
 * Mutarisi's "Response recorded" timeline, from this alert's real times and
 * the answers this phone sent (each with the time it was recorded). Never a
 * step that didn't happen: while the alert is open and not stood down, the
 * last row says what it is waiting on.
 */
export function answerTimeline(
  alert: Pick<GuardianAlert, 'opened_at' | 'closed_at'>,
  acks: readonly Answer[],
  at: Partial<Record<Answer, string>>,
): TimelineStep[] {
  const steps: TimelineStep[] = [{label: 'Alert raised', at: alert.opened_at}];
  for (const a of acks) {
    steps.push({label: a === 'called_10111' ? 'You pressed Call 10111' : a === 'handling' ? "You're handling it" : 'You stood down', at: at[a] ?? null});
  }
  if (!acks.includes('stand_down')) {
    steps.push(alert.closed_at ? {label: 'Alert closed', at: alert.closed_at} : {label: 'Waiting on stand-down or closure', at: null});
  }
  return steps;
}

/** A failed write, said plainly: nothing is claimed as recorded. */
export function notRecorded(action: Answer): string {
  const what = action === 'called_10111' ? 'Your Call 10111 press' : action === 'handling' ? "\"I'm handling it\"" : 'Your stand down';
  return `${what} wasn't recorded yet. Check your data and try again.`;
}

/** Alerts this phone's guardian stood down from, this session: the banner stops asking. */
const stoodDownIds = new Set<string>();

/**
 * The alert that still needs this guardian: open, and not stood down
 * (Mutarisi's GuardianAlerts.needsAttention). Null when none does.
 */
export function needsAttention(alerts: readonly GuardianAlert[], stoodDown: ReadonlySet<string> = stoodDownIds): GuardianAlert | null {
  return alerts.find(x => !x.closed_at && !stoodDown.has(x.incident_id)) ?? null;
}

/**
 * For a member who is also someone's guardian: watch for alerts app-wide,
 * so a new one pops up on any screen (and in the background). Returns the
 * alert that still needs them, for the banner.
 */
export function useGuardianWatch(enabled: boolean): GuardianAlert | null {
  const told = useRef(new Set<string>());
  const [open, setOpen] = useState<GuardianAlert | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let live = true;
    const poll = async () => {
      const a = await device.guardianAlerts().catch(() => null);
      if (!live || !a) return;
      setOpen(needsAttention(a));
      const fresh = a.find(x => !x.closed_at && !told.current.has(x.incident_id));
      if (fresh) {
        told.current.add(fresh.incident_id);
        alertNotice();
      }
    };
    void poll();
    const t = setInterval(poll, 10_000);
    pollers.add(poll);
    return () => {
      live = false;
      clearInterval(t);
      pollers.delete(poll);
    };
  }, [enabled]);
  return enabled ? open : null;
}

/**
 * Mutarisi's alert banner (activity_main.xml): amber, like the alert, on
 * every screen while an alert needs this guardian, never on the alert itself
 * or the member's own check-in and PIN screens. Tapping it opens the alert.
 */
export function AlertBanner({who, onOpen}: {who: string; onOpen: () => void}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Alert: ${who}. Tap to open`}
      accessibilityLiveRegion="assertive"
      onPress={onOpen}
      android_ripple={{color: colors.ripple}}
      style={styles.banner}>
      <Prohibit size={22} color={colors.amberText} />
      <View style={{flex: 1}}>
        <Text style={[type.label, {color: colors.amberText, fontFamily: fonts.semibold}]} numberOfLines={1}>
          Alert · {who}
        </Text>
        <Text style={[type.caption, {color: colors.amberText}]}>tap to open</Text>
      </View>
      <CaretRight size={16} color={colors.amberText} />
    </Pressable>
  );
}

export function GuardianHome({onBack, onSetUpSelf, onLeft}: {onBack?: () => void; onSetUpSelf?: () => void; onLeft?: (left: 'member' | 'none') => void} = {}) {
  const g = device.profile?.guardian;
  const who = g?.memberName ?? 'your member';
  const [alerts, setAlerts] = useState<GuardianAlert[] | null>(null);
  const [reached, setReached] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [acked, setAcked] = useState<Acked>({});
  const [ackedAt, setAckedAt] = useState<Record<string, Partial<Record<Answer, string>>>>({});
  const [notifOff, setNotifOff] = useState(false);
  const [failed, setFailed] = useState<{id: string; action: Answer} | null>(null);
  const [stoodDown, setStoodDown] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const claimed = useRef(new Set<string>());
  const live = useRef(true);
  const told = useRef(new Set<string>());

  const poll = useCallback(async () => {
    try {
      const a = await device.guardianAlerts();
      if (!live.current) return;
      // A new open alert pops up even when this app is in the background.
      const fresh = a.find(x => !x.closed_at && !told.current.has(x.incident_id));
      if (fresh) {
        told.current.add(fresh.incident_id);
        alertNotice();
      }
      // Not while a just-pushed alert may still be on its way to this list.
      if (!a.some(x => !x.closed_at) && Date.now() - pushNoticeAt >= 60_000) notice?.clearAlert?.();
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
    // Standing by: keep checking with the screen locked (renewed every hour).
    keepAwake(2 * 3600, true);
    const renew = setInterval(() => keepAwake(2 * 3600, true), 3600_000);
    const t = setInterval(poll, 5000);
    pollers.add(poll);
    return () => {
      live.current = false;
      clearInterval(t);
      clearInterval(renew);
      pollers.delete(poll);
    };
  }, [poll]);

  // Re-checked whenever VIGIL comes back to the front, e.g. from the phone's settings.
  useEffect(() => {
    const check = () => void notificationsOff().then(off => live.current && setNotifOff(off));
    check();
    const sub = AppState.addEventListener('change', s => s === 'active' && check());
    return () => sub.remove();
  }, []);

  const open = alerts?.find(a => !a.closed_at) ?? null;
  const past = (alerts ?? []).filter(a => a !== open);
  const done = stoodDown && !open ? alerts?.find(a => a.incident_id === stoodDown) ?? null : null;
  const answer = async (a: GuardianAlert, action: Answer) => {
    // Each answer is sent once per alert; pressing again only reopens the dialer.
    if (!claimAnswer(claimed.current, a.incident_id, action)) return;
    setFailed(null);
    try {
      await device.acknowledge(a.incident_id, action);
      setAcked(x => ({...x, [a.incident_id]: [...(x[a.incident_id] ?? []), action]}));
      setAckedAt(x => ({...x, [a.incident_id]: {...x[a.incident_id], [action]: new Date().toISOString()}}));
      if (action === 'stand_down') {
        stoodDownIds.add(a.incident_id);
        setStoodDown(a.incident_id);
        void poll();
      }
    } catch {
      claimed.current.delete(`${a.incident_id}:${action}`);
      if (live.current) setFailed({id: a.incident_id, action});
    }
  };

  return (
    <View style={{flex: 1}}>
      <Surface tone="guardian" />
      <ScrollView contentContainerStyle={styles.page}>
        {onBack ? <TopAppBar title="You're a guardian" onBack={onBack} tone="guardian" /> : null}
        <View style={styles.screen}>
          <View style={styles.greeting}>
            <View>
              <Eyebrow style={{marginBottom: 4}}>Guardian</Eyebrow>
              <Text style={styles.name}>{who}</Text>
            </View>
            <Chip status={reached && !offline ? 'received' : 'neutral'} label={offline ? 'Offline' : reached ? `Checked ${hhmm(reached)}` : 'Connecting'} />
          </View>

          {notifOff && !open ? (
            <View style={styles.notice} accessibilityLiveRegion="polite">
              <Text style={[type.body, {color: colors.amberText}]}>Notifications are off for VIGIL, so an alert can't reach you until you open the app.</Text>
              <View style={{marginTop: space.md}}>
                <Key label="Turn on notifications" variant="guardianPlain" icon={<Bell size={18} weight="bold" color={colors.amberText} />} onPress={openNotificationSettings} />
              </View>
            </View>
          ) : null}

          {open ? (
            <OpenAlert
              who={who}
              alert={open}
              acks={acked[open.incident_id] ?? []}
              ackedAt={ackedAt[open.incident_id] ?? {}}
              onAnswer={a => answer(open, a)}
              failed={failed?.id === open.incident_id ? failed.action : null}
            />
          ) : done ? (
            <>
            <Panel hero tone="guardian">
              <Eyebrow>Stood down · {hhmm(done.opened_at)}</Eyebrow>
              <Text style={[type.body, {marginTop: space.sm}]} accessibilityLiveRegion="polite">
                {answerStatus(acked[done.incident_id] ?? [])}
              </Text>
              <View style={{marginTop: space.md}}>
                <Key
                  label={`Call ${who}`}
                  variant="guardianPlain"
                  icon={<Phone size={20} weight="bold" color={colors.amberText} />}
                  onPress={() => void Linking.openURL('tel:')}
                />
              </View>
              <Text style={[type.caption, {marginTop: space.sm}]}>You stood down, so you can call {who} now. Your phone's dialer opens; VIGIL doesn't keep their number.</Text>
              <QuietKey label="Back to standby" tone="guardian" onPress={() => setStoodDown(null)} />
            </Panel>
            <Timeline who={who} steps={answerTimeline(done, acked[done.incident_id] ?? [], ackedAt[done.incident_id] ?? {})} />
            </>
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

          <Panel tone="guardian">
            <Text style={type.label}>Alerts to this phone</Text>
            <Readout label="How" value={alertsDelivery(g)} />
            <Rule />
            <Readout label="Last alert" value={alerts?.length ? hhmm(alerts[0].opened_at) : alerts ? 'None yet' : '—'} />
          </Panel>

          {/* Mutarisi's "Your guardian role" (Standby.tsx). */}
          <Panel>
            <Text style={type.label}>Your guardian role</Text>
            {onSetUpSelf && device.profile?.role === 'guardian' ? (
              <Row label="Set up VUKA for yourself" detail={`Be protected too. You stay ${who}'s guardian.`} onPress={onSetUpSelf} leading={<ShieldChevron size={20} color={colors.textLabel} />} />
            ) : null}
            {onLeft ? (
              <Row label="Stop being a guardian" detail="You won't get their alerts any more" onPress={() => setLeaving(true)} leading={<UsersThree size={20} color={colors.textLabel} />} />
            ) : null}
          </Panel>

          <Text style={styles.sim}>
            Demo server · guardian key <Text style={styles.simId}>{g?.keyId ?? '—'}</Text> · build <Text style={styles.simId}>{version}</Text>
          </Text>
        </View>
      </ScrollView>
      <Dialog
        visible={leaving}
        tone="guardian"
        title="Stop being a guardian?"
        confirm="Stop being a guardian"
        onConfirm={() => {
          setLeaving(false);
          void leaveGuardian().then(left => onLeft?.(left));
        }}
        cancel="Keep being a guardian"
        onCancel={() => setLeaving(false)}>
        {leaveBody(who, device.profile?.role !== 'guardian')}
      </Dialog>
    </View>
  );
}

/** How alerts reach this phone: push only when the server has this phone's FCM token. */
export function alertsDelivery(g: {push?: {server: string}} | undefined, server = device.profile?.serverUrl): string {
  return g?.push && g.push.server === server ? 'Push, and checked every 5 s' : 'Checked every 5 s while VIGIL runs';
}

/** The "Stop being a guardian?" body (Mutarisi's dialog_leave_guardian), honest that the server isn't told. */
export function leaveBody(who: string, member: boolean): string {
  const after = member
    ? "Your own VIGIL account and guardians aren't affected."
    : 'This phone goes back to the start screen.';
  return `You'll stop getting ${who}'s alerts on this phone. ${after} VIGIL's server isn't told, so ask ${who} to remove you in their Settings too. To be their guardian again, they'll need to send you a new invite.`;
}

function OpenAlert({
  who,
  alert,
  acks,
  ackedAt,
  onAnswer,
  failed,
}: {
  who: string;
  alert: GuardianAlert;
  acks: Answer[];
  ackedAt: Partial<Record<Answer, string>>;
  onAnswer: (a: Answer) => void;
  failed: Answer | null;
}) {
  const stood = acks.includes('stand_down');
  const status = answerStatus(acks);
  // Confirmed, because standing down closes the alert (H6) and unlocks calling them (G4).
  const [confirming, setConfirming] = useState(false);
  return (
    <>
      <Panel hero tone="guardian">
        <Eyebrow style={{color: colors.amberText}}>Alert · {hhmm(alert.opened_at)}</Eyebrow>
        <Text style={[type.display, {marginTop: space.sm}]} accessibilityRole="header">
          {who} may need help
        </Text>
        <Text style={[type.body, {marginTop: space.sm}]}>{WHY[alert.trigger](who)}</Text>
        {whyLine(alert.why) ? <Text style={[type.body, {marginTop: space.xs}]}>{whyLine(alert.why)}</Text> : null}
        {alert.location ? (
          <AlertMap loc={alert.location} who={who} />
        ) : (
          <View style={{marginTop: space.md}}>
            <Text style={type.label}>Location unavailable</Text>
            <Text style={[type.caption, {marginTop: 2}]}>No location fix was shared with this alert.</Text>
          </View>
        )}
        <View style={styles.g4}>
          <Text style={styles.g4Text}>Don't call or text {who}. Call 10111.</Text>
          <Text style={[type.caption, {color: colors.amberText, marginTop: 4}]}>If someone is with {who}, a ringing phone could put them at risk.</Text>
        </View>
        {status ? (
          <Text style={[type.label, {marginBottom: space.sm}]} accessibilityLiveRegion="polite">
            {status}
          </Text>
        ) : null}
        {/* Stays after the first press so the dialer can be reopened; only the first press is sent. */}
        <Key
          label="Call 10111"
          variant="guardian"
          icon={<Phone size={20} weight="bold" color={colors.textInverse} />}
          onPress={() => {
            onAnswer('called_10111');
            void Linking.openURL('tel:10111');
          }}
        />
        <Text style={[type.caption, {marginTop: space.sm}]}>Opens your phone's dialer with 10111 ready. Press call there.</Text>
      </Panel>
      <View style={{gap: space.sm}}>
        <Key label={acks.includes('handling') ? "You're handling it" : "I'm handling it"} variant="guardianPlain" onPress={() => onAnswer('handling')} />
        <Key label={stood ? 'Stood down' : `Stand down: ${who} is safe`} variant="ghost" onPress={stood ? () => undefined : () => setConfirming(true)} />
      </View>
      {acks.length ? <Timeline who={who} steps={answerTimeline(alert, acks, ackedAt)} /> : null}
      {failed ? (
        <View style={{gap: space.sm}}>
          <Text style={[type.caption, {color: colors.amberText}]} accessibilityLiveRegion="polite">
            {notRecorded(failed)}
          </Text>
          <Key label="Try again" variant="guardianPlain" onPress={() => onAnswer(failed)} />
        </View>
      ) : null}
      <Key label={`Call ${who}`} variant="plain" icon={<Phone size={20} weight="bold" color={colors.textDim} />} disabled={!stood} onPress={() => void Linking.openURL('tel:')} />
      <Text style={type.caption}>
        Their phone ringing could put them in more danger, so calling {who} unlocks after you stand down or the alert closes. You can still use your phone for anything else, like reaching family.
      </Text>
      <Text style={type.caption}>Each answer is signed with this phone's key and joins {who}'s record. VIGIL doesn't dispatch anyone.</Text>
      <Dialog
        visible={confirming}
        tone="guardian"
        title="Are they safe?"
        confirm="Yes, stand down"
        onConfirm={() => {
          setConfirming(false);
          onAnswer('stand_down');
        }}
        cancel="No"
        onCancel={() => setConfirming(false)}>
        {standDownQuestion(acks)}
      </Dialog>
    </>
  );
}

/** "Response recorded": the alert's times and this phone's answers, in order. */
function Timeline({who, steps}: {who: string; steps: TimelineStep[]}) {
  return (
    <Panel tone="guardian">
      <Eyebrow>Response recorded</Eyebrow>
      <View style={{marginTop: space.sm}}>
        {steps.map((st, i) => (
          <View key={`${st.label}-${i}`} style={styles.step} accessible accessibilityLabel={`${st.label}${st.at ? `, ${hhmm(st.at)}` : ''}`}>
            <View style={styles.stepRail}>
              <View style={[styles.stepNode, st.at ? styles.stepNodeOn : null]} />
              {i < steps.length - 1 ? <View style={styles.stepLine} /> : null}
            </View>
            <Text style={[type.body, {flex: 1, color: st.at ? colors.textLabel : colors.textDim}]}>{st.label}</Text>
            <Text style={type.readout}>{st.at ? hhmm(st.at) : '—'}</Text>
          </View>
        ))}
      </View>
      <Text style={[type.caption, {marginTop: space.sm}]}>Your answers are signed with this phone's key and join {who}'s record. The alert time is VIGIL's server's; your answers are timed on this phone.</Text>
    </Panel>
  );
}

/* ── Welcome choice ──────────────────────────────────────────── */

export function GuardianChoice({onGuardian}: {onGuardian: () => void}) {
  return <QuietKey label="I'm a guardian" onPress={onGuardian} />;
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.md,
    backgroundColor: colors.amberFill,
    borderWidth: 1,
    borderColor: colors.amberStrong,
    overflow: 'hidden',
  },
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
    backgroundColor: colors.fieldFill,
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
    backgroundColor: colors.fieldFill,
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
  notice: {padding: space.md, borderRadius: radii.md, borderWidth: 1.5, borderColor: colors.amberText, backgroundColor: colors.amberFill},
  step: {flexDirection: 'row', alignItems: 'flex-start', gap: space.md, minHeight: 40},
  stepRail: {width: 12, alignItems: 'center', alignSelf: 'stretch', paddingTop: 6},
  stepNode: {width: 10, height: 10, borderRadius: 5, borderWidth: 1.5, borderColor: colors.amberText},
  stepNodeOn: {backgroundColor: colors.amberText},
  stepLine: {flex: 1, width: 1.5, marginTop: 2, backgroundColor: colors.border},
  g4Text: {fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22, color: colors.amberText},
  sim: {...type.caption, fontSize: 12, textAlign: 'center', marginTop: space.md},
  simId: {fontFamily: fonts.mono, fontSize: 11},
});
