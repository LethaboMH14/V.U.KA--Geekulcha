/**
 * VIGIL member screens and the guardian preview, in the prototype's Ivory
 * glass. VIGIL is always on (ADR-0046, PROPOSED): once set up it listens by
 * itself, and only the member's PIN pauses it. Listening, checks, PINs and the
 * record are real on a phone (signed, queued, sent); guardians are still
 * SIMULATED until the guardian app lands.
 *
 * Duress rule: the check-in, "Checked in" and the pause PIN are one frame
 * each for the normal and the duress PIN (ADR-0041). Nothing on screen depends
 * on which PIN it was, and none of those frames moves.
 */
import React, {useEffect, useRef, useState} from 'react';
import {AppState, BackHandler, NativeModules, Platform, Pressable, ScrollView, Share, StatusBar, StyleSheet, Text, TextInput, View} from 'react-native';
import {CheckCircle, GearSix, Microphone, Phone, ShareNetwork, ShieldChevron, UserPlus, Users, WifiSlash} from './icons';
// Deep-imported one by one, as icons.ts does (the barrel opens every icon file).
import PencilSimple from 'phosphor-react-native/lib/commonjs/icons/PencilSimple';
import UserIcon from 'phosphor-react-native/lib/commonjs/icons/User';
import {Chip, Eyebrow, GlassIcon, Key, Lamp, LevelMeter, ListeningLine, Panel, PinKeypad, QuietKey, Readout, Row, Rule, Surface, TopAppBar} from './components';
import {colors, fonts, radii, space, THEME_CHOICE, THEME_CHOICES, TOUCH, type, type ThemeChoice} from './theme';
import {Onboarding} from './onboarding';
import {AccountSettings, Documents, Recovery} from './account';
import {AlertBanner, GuardianHome, GuardianSetup, useGuardianPush, useGuardianWatch} from './guardian';
import {openedFromGuardianPush, registerGuardianPush} from '../api/push';
import {MyRecord} from './record';
import {checkinRemainingMs, device, DOWNLOAD_URL, JourneyStartError, monoNow, profileContacts, type Delivery} from '../api/device';
import {version} from '../../package.json';
import {canFullScreen, consumeHelpRequest, openFullScreenSettings, runTestClip, startDetection, testFeedAvailable, type ArmResult, type Detector, type Level} from '../sensors/detection';
import {EmergencyButton, OutlineKey} from './help';
import {askLocation, startWindow, stopWindow, windowUntil} from '../sensors/location';
import type {Decision, Reason} from '../brain/detect';

type Screen =
  | 'boot'
  | 'onboarding'
  | 'home'
  | 'check'
  | 'checked'
  | 'end'
  | 'settings'
  | 'guardian'
  | 'recordPin'
  | 'record'
  | 'invitePin'
  | 'invite'
  | 'profileEdit'
  | 'guardianSetup'
  | 'guardianHome'
  | 'signInPin'
  | 'signOutPin'
  | 'recovery'
  | 'documents';
type CheckSession = Awaited<ReturnType<typeof device.openCheckin>>;
type Invite = {code: string; guardianId: string; at: number};

const pad2 = (n: number) => String(n).padStart(2, '0');
const hhmm = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

/** Edge to edge: the graphite surface runs under the translucent status bar. */
const TOP_INSET = Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 0;

export function VigilApp() {
  const [screen, setScreen] = useState<Screen>('boot');
  // A member who is also someone's guardian hears about alerts on any screen.
  const guardianAlert = useGuardianWatch(device.profile?.role === 'member' && Boolean(device.profile?.guardian) && !device.signedOut && screen !== 'guardianHome');
  // Where guardian standby's back goes: Home's "You're a guardian" card or Settings.
  const [guardianFrom, setGuardianFrom] = useState<Screen>('settings');
  // Tapping a pushed guardian alert opens standby, like the banner: never from
  // a check-in, any PIN screen, setup or while signed out (V5/V6).
  useGuardianPush(() => {
    const p = device.profile;
    const busy = ['boot', 'onboarding', 'check', 'checked', 'end', 'recordPin', 'invitePin', 'signInPin', 'signOutPin', 'guardianSetup'].includes(screen);
    if (!p?.guardian || busy || (p.role === 'member' && device.signedOut)) return;
    if (screen !== 'guardianHome') setGuardianFrom(screen === 'home' ? 'home' : 'settings');
    setScreen('guardianHome');
  });
  // Mutarisi's amber banner while an alert needs this guardian. Only on the
  // screens below; never on the check-in or any PIN screen (V5/V6).
  const alertBanner = guardianAlert ? (
    <View style={{paddingTop: TOP_INSET + space.sm, paddingHorizontal: 16}}>
      <AlertBanner
        who={device.profile?.guardian?.memberName ?? 'your member'}
        onOpen={() => {
          setGuardianFrom(screen === 'home' ? 'home' : 'settings');
          setScreen('guardianHome');
        }}
      />
    </View>
  ) : null;
  // When listening began (a server-issued session is running), or null.
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [invite, setInvite] = useState<Invite | null>(null);
  const home: Screen = 'home';
  const detector = useRef<Detector | null>(null);
  const journeyId = useRef<string | null>(null);
  const check = useRef<Promise<CheckSession> | null>(null);
  const checkIds = useRef<{signal: string; opened: string | null} | null>(null);
  const [armError, setArmError] = useState<ArmResult | null>(null);
  const [sharingUntil, setSharingUntil] = useState(0);
  const [startError, setStartError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  // A ref, not state: the 30 s retry timer must see a start already under way,
  // or it would start a second listening session while the permission
  // dialogs are still open.
  const startingRef = useRef(false);
  // Paused by the member (PIN). Listening stays off until they turn it on.
  const [paused, setPaused] = useState(false);
  const [level, setLevel] = useState<Level>({label: null, score: 0, threshold: 0});
  const delivery = useDelivery();

  // First run goes through onboarding; after that, straight to listening.
  useEffect(() => {
    device
      .load()
      .then(async ({profile, pinsSet}) => {
        const member = Boolean(profile && pinsSet && !profile.signedOut);
        // Guardian push when the build has Firebase (else nothing is sent; polling as before).
        const guarding = Boolean(profile?.guardian && (profile.role === 'guardian' || member));
        if (guarding) void registerGuardianPush();
        // Launched by tapping a pushed alert: straight to standby.
        if (guarding && profile?.role === 'member' && (await openedFromGuardianPush())) {
          setGuardianFrom('home');
          return setScreen('guardianHome');
        }
        // Signed out: Welcome, until they sign in with this phone's account and their PIN.
        setScreen(profile?.role === 'guardian' ? 'guardianHome' : member ? 'home' : 'onboarding');
      })
      .catch(() => setScreen('onboarding'));
  }, []);

  // Anything still waiting is retried every 30 s while the app is open.
  useEffect(() => {
    const t = setInterval(() => {
      if (device.delivery().queued > 0) void device.flush();
    }, 30000);
    return () => clearInterval(t);
  }, []);

  // Heartbeats every 30 s while listening (V9): activity bucket only.
  useEffect(() => {
    if (!startedAt || !journeyId.current) return;
    const id = journeyId.current;
    const beat = () => void device.heartbeat(id, detector.current?.speedBucket() ?? 'unknown');
    beat();
    const t = setInterval(beat, 30000);
    return () => clearInterval(t);
  }, [startedAt]);

  // Only a detection opens a check-in (V4, V11), and only once the detection
  // is queued: the check-in names the signal that caused it.
  const openCheck = (signalEventId: string) => {
    detector.current?.setCheckinOpen(true);
    // ADR-0048: location for 30 minutes after ANY check-in, before any answer,
    // so it is the same after either PIN (V5). The server keeps it only if
    // guardians were alerted.
    const jid = journeyId.current;
    if (jid) setSharingUntil(startWindow(fix => device.sendLocation(jid, fix)));
    checkIds.current = {signal: signalEventId, opened: null};
    check.current = device.openCheckin(journeyId.current ?? 'sim_jny_none', signalEventId, {
      // CEM-1: PIN behaviour counts toward later evidence only once it is signed and queued.
      onPinObserved: p => detector.current?.observePin(p),
    });
    setScreen('check');
  };

  /**
   * Home's Emergency button or the Quick Settings tile: open a check-in now.
   * The same screen, the same PINs and the same escalation as a detection.
   * One at a time: the grader's prompt slot, and a ref for the moment the
   * event is being queued (the browser preview has no grader).
   */
  const helping = useRef(false);
  const askForHelp = async () => {
    const jid = journeyId.current;
    if (!jid || helping.current || screen === 'check' || screen === 'checked') return;
    if (detector.current && !detector.current.reserveForHelp()) return;
    helping.current = true;
    try {
      const id = await device.help(jid, version);
      openCheck(id);
    } catch {
      detector.current?.setCheckinOpen(false);
    } finally {
      helping.current = false;
    }
  };
  // Opened from the Quick Settings tile: ask once listening is running.
  useEffect(() => {
    if (!startedAt) return;
    const check = () => void consumeHelpRequest().then(asked => asked && void askForHelp());
    check();
    const sub = AppState.addEventListener('change', s => s === 'active' && check());
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt]);

  /** The countdown: null until the server has the check-in; never longer than it allows. */
  const checkRemaining = (): number | null => {
    const ids = checkIds.current;
    if (!ids?.opened) return null;
    const opened = device.receipt(ids.opened);
    const signal = device.receipt(ids.signal);
    return checkinRemainingMs(monoNow(), {signalQueuedAt: signal?.queuedAt, openedQueuedAt: opened?.queuedAt, openedReceived: Boolean(opened?.received)});
  };

  const startListening = async () => {
    if (startingRef.current || journeyId.current) return;
    startingRef.current = true;
    setArmError(null);
    setStartError(null);
    setStarting(true);
    try {
      // The server issues the session id; without it no check-in could reach a guardian.
      let id: string;
      try {
        id = await device.startJourney(version);
      } catch (e) {
        setStartError(
          e instanceof JourneyStartError && e.reason === 'offline'
            ? "Not listening yet: VIGIL can't reach its server, so your guardians couldn't be alerted. It tries again every 30 seconds."
            : `Not listening: the server refused to start (${e instanceof Error ? e.message : String(e)}).`,
        );
        return;
      }
      // Optional: without it, listening still works; a guardian just sees no map.
      await askLocation();
      const {result, detector: d} = await startDetection({
        journeyId: id,
        appVersion: version,
        subjectId: device.profile?.subjectId ?? '',
        // Evidence first: every detection is signed and queued (V7, V8), with
        // its reasons (evidence_observed), so the record says why as well as what.
        onSignal: payload => device.signal(id, payload),
        onEvidence: evidence => device.evidence(id, evidence),
        onPrompt: (_decision, signalEventId) => openCheck(signalEventId),
        onLevel: setLevel,
      });
      // 'unsupported' is the browser preview and tests: no microphone, so
      // listening runs as a simulation. On a phone, a refused permission or a
      // failed model check does not arm (V1).
      if (!result.ok && result.reason !== 'unsupported') {
        setArmError(result);
        return;
      }
      detector.current = d ?? null;
      journeyId.current = id;
      setStartedAt(Date.now());
    } finally {
      startingRef.current = false;
      setStarting(false);
    }
  };

  // Always on (ADR-0046, PROPOSED): listening starts by itself once set up,
  // and retries every 30 s while the server can't be reached. Only a paused
  // member, a refused permission or a failed model check stops it.
  useEffect(() => {
    if (screen !== 'home' || paused || startedAt || armError) return;
    void startListening();
    const t = setInterval(() => void startListening(), 30000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, paused, startedAt, armError]);

  const pauseListening = async (then: Screen = 'home') => {
    // Stop listening and let any detection already in flight finish first,
    // so nothing can open a check-in once listening has stopped.
    await detector.current?.stop().catch(() => undefined);
    stopWindow();
    setSharingUntil(0);
    detector.current = null;
    journeyId.current = null;
    setStartedAt(null);
    setLevel({label: null, score: 0, threshold: 0});
    setPaused(true);
    setScreen(then);
  };

  // Android back: Settings and the guardian preview step back; the pause PIN
  // cancels back home. The check-in and "Checked in" swallow back identically
  // for both PINs, so neither can be dismissed.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen === 'settings' || screen === 'end') {
        setScreen(home);
        return true;
      }
      if (screen === 'signInPin') {
        setScreen('onboarding');
        return true;
      }
      if (screen === 'guardian' || screen === 'record' || screen === 'recordPin' || screen === 'invitePin' || screen === 'invite' || screen === 'profileEdit' || screen === 'signOutPin' || screen === 'recovery' || screen === 'documents') {
        setScreen('settings');
        return true;
      }
      if ((screen === 'guardianHome' || screen === 'guardianSetup') && device.profile?.role === 'member') {
        setScreen(screen === 'guardianHome' ? guardianFrom : 'settings');
        return true;
      }
      return screen === 'check' || screen === 'checked';
    });
    return () => sub.remove();
  }, [screen, home, guardianFrom]);

  if (screen === 'boot') {
    return <View style={{flex: 1, backgroundColor: colors.bgBase}} />;
  }
  if (screen === 'onboarding') {
    return <Onboarding onDone={() => setScreen('home')} onGuardian={() => setScreen('guardianSetup')} onInvite={() => setScreen('invitePin')} onSignIn={() => setScreen('signInPin')} />;
  }
  if (screen === 'signInPin') {
    // Returning member: the normal PIN prompt. Both PINs let them in the same way.
    const first = device.profile?.firstName?.trim();
    return (
      <PinGate
        title={first ? `Welcome back, ${first}` : 'Welcome back'}
        prompt="Enter your PIN"
        onEnter={pin => device.signIn(pin)}
        onDone={() => {
          // Signed in: protection comes back on (always on, ADR-0046).
          setPaused(false);
          setScreen('home');
        }}
        onCancel={() => setScreen('onboarding')}
      />
    );
  }
  if (screen === 'signOutPin') {
    // Signing out stops protection, so it is the pause path: the same PIN
    // check and signed end_journey authorisation (device.signOut). Same frame for both PINs.
    return (
      <PinGate
        title="Sign out"
        prompt="Enter your PIN to sign out. VIGIL stops listening until you sign in again."
        onEnter={pin => device.signOut(journeyId.current, pin)}
        onDone={() => void pauseListening('onboarding')}
        onCancel={() => setScreen('settings')}
      />
    );
  }
  if (screen === 'guardianSetup') {
    const member = device.profile?.role === 'member' && !device.signedOut;
    return <GuardianSetup onDone={() => setScreen('guardianHome')} onBack={() => setScreen(member ? 'settings' : 'onboarding')} />;
  }
  if (screen === 'guardianHome') {
    // A member who also guards someone comes back to where they opened it (Home or Settings).
    return <GuardianHome onBack={device.profile?.role === 'member' ? () => setScreen(guardianFrom) : undefined} onSetUpSelf={() => setScreen('onboarding')} />;
  }
  if (screen === 'invitePin') {
    return (
      <PinGate
        title="Add a guardian"
        prompt="Enter your PIN to invite a guardian"
        onEnter={async pin => {
          const r = await device.inviteGuardian(pin);
          if (r === 'retry') return 'retry';
          setInvite({...r, at: Date.now()});
          return 'ok';
        }}
        onDone={() => setScreen('invite')}
        onCancel={() => setScreen('settings')}
      />
    );
  }
  if (screen === 'check' && check.current) {
    const session = check.current;
    return (
      <JourneyCheck
        onShown={() =>
          void session
            .then(c => c.shown())
            .then(openedId => {
              if (checkIds.current) checkIds.current.opened = openedId;
            })
        }
        remaining={checkRemaining}
        onEnter={async (pin, entryMs) => (await session).enter(pin, entryMs)}
        onDone={() => setScreen('checked')}
      />
    );
  }
  if (screen === 'checked') {
    return (
      <CheckedIn
        onDone={() => {
          detector.current?.setCheckinOpen(false);
          setScreen('home');
        }}
      />
    );
  }
  if (screen === 'end') {
    return (
      <EndJourney
        onEnter={pin => device.endJourney(journeyId.current ?? 'sim_jny_none', pin)}
        onDone={() => void pauseListening()}
        onCancel={() => setScreen('home')}
      />
    );
  }
  if (screen === 'guardian') {
    return alertBanner ? (
      <View style={{flex: 1, backgroundColor: colors.bgBase}}>
        {alertBanner}
        <GuardianPreview onBack={() => setScreen('settings')} />
      </View>
    ) : (
      <GuardianPreview onBack={() => setScreen('settings')} />
    );
  }
  if (screen === 'recordPin') {
    return (
      <PinGate
        title="My record"
        prompt="Enter your PIN to see your record"
        onEnter={pin => device.authoriseExport(pin)}
        onDone={() => setScreen('record')}
        onCancel={() => setScreen('settings')}
      />
    );
  }
  return (
    <View style={{flex: 1}}>
      <Surface />
      {alertBanner}
      <ScrollView contentContainerStyle={[styles.page, alertBanner ? {paddingTop: 12} : null]} keyboardShouldPersistTaps="handled">
        {screen === 'record' ? (
          <MyRecord onBack={() => setScreen('settings')} />
        ) : screen === 'profileEdit' ? (
          <EditProfile onDone={() => setScreen('settings')} />
        ) : screen === 'invite' && invite ? (
          <InviteShare invite={invite} onDone={() => setScreen('home')} />
        ) : screen === 'recovery' ? (
          <Recovery onDone={() => setScreen('settings')} />
        ) : screen === 'documents' ? (
          <Documents onBack={() => setScreen('settings')} />
        ) : screen === 'settings' ? (
          <Settings
            onBack={() => setScreen(home)}
            onGuardian={() => setScreen('guardian')}
            onGuard={() => {
              setGuardianFrom('settings');
              setScreen(device.profile?.guardian ? 'guardianHome' : 'guardianSetup');
            }}
            onRecord={() => setScreen(device.simulated ? 'record' : 'recordPin')}
            onInvite={() => setScreen('invitePin')}
            onProfile={() => setScreen('profileEdit')}
            onRecovery={() => setScreen('recovery')}
            onDocuments={() => setScreen('documents')}
            onSignOut={() => setScreen('signOutPin')}
            delivery={delivery}
            detector={startedAt ? detector.current : null}
          />
        ) : (
          <Home
            since={startedAt}
            onInvite={() => setScreen('invitePin')}
            delivery={delivery}
            level={level}
            sharingUntil={sharingUntil}
            paused={paused}
            starting={starting}
            armError={armError}
            startError={startError}
            onStart={() => {
              setPaused(false);
              setArmError(null);
              void startListening();
            }}
            onHelp={() => void askForHelp()}
            onPause={() => setScreen('end')}
            onSimCheck={device.simulated ? () => openCheck('00000000-0000-4000-8000-000000000000') : undefined}
            onMenu={() => setScreen('settings')}
            onGuardianStandby={
              device.profile?.guardian
                ? () => {
                    setGuardianFrom('home');
                    setScreen('guardianHome');
                  }
                : undefined
            }
          />
        )}
        <Text style={styles.sim}>
          {device.simulated ? 'SIMULATED preview: nothing signed or sent' : 'Demo server'} · build{' '}
          <Text style={styles.simId}>{version}</Text>
        </Text>
      </ScrollView>
    </View>
  );
}

function useDelivery(): Delivery {
  const [d, setD] = useState<Delivery>(device.delivery());
  useEffect(() => {
    const off = device.onDelivery(setD);
    return () => {
      off();
    };
  }, []);
  return d;
}

const greeting = (d: Date) => (d.getHours() < 12 ? 'Good morning' : d.getHours() < 18 ? 'Good afternoon' : 'Good evening');

/**
 * The greeting: eyebrow and first name centred (Mutarisi's 012f997), with
 * Settings in a glass circle at the right. It is the way into Settings here,
 * so it stays (his decorative dots icon had no job and went).
 */
function Greeting({onMenu}: {onMenu: () => void}) {
  return (
    <View style={styles.greeting}>
      <View style={{alignItems: 'center', paddingHorizontal: TOUCH}}>
        <Eyebrow style={{marginBottom: 4}}>{greeting(new Date())}</Eyebrow>
        <Text style={[styles.name, {textAlign: 'center'}]} accessibilityRole="header">
          {device.profile?.firstName ?? 'VIGIL'}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Settings"
        onPress={onMenu}
        hitSlop={6}
        style={[styles.iconBtn, {position: 'absolute', right: 0, top: 0, bottom: 0}]}>
        <GlassIcon>
          <GearSix size={20} color={colors.textTitle} />
        </GlassIcon>
      </Pressable>
    </View>
  );
}

/** Guardians and server contact, merged into one supporting card. */
function GuardiansCard({delivery, live, onInvite}: {delivery: Delivery; live: boolean; onInvite: () => void}) {
  const invites = device.profile?.invites ?? [];
  const contact = delivery.lastContactAt && Date.now() - Date.parse(delivery.lastContactAt) < 75000;
  return (
    <Panel>
      <View style={styles.panelHead}>
        <View style={styles.rowHeader}>
          <GlassIcon>
            <Users size={20} color={colors.textTitle} />
          </GlassIcon>
          <Text style={styles.cardTitle}>Guardians</Text>
        </View>
        {device.simulated ? (
          <Chip status="simulated" label="Simulated" />
        ) : live ? (
          contact ? (
            <Chip status="received" label="Server reached" />
          ) : (
            <Chip status="neutral" label={offline(delivery) ? 'Offline' : 'Connecting'} />
          )
        ) : null}
      </View>
      <Text style={[type.body, {marginTop: space.md}]}>
        {invites.length
          ? `You've invited ${invites.length} guardian${invites.length === 1 ? '' : 's'}. If you don't answer a check-in, they're told.`
          : "No guardians yet, so an unanswered check-in alerts no one. Invite two people who don't live with you."}
      </Text>
      <View style={{marginTop: space.md}}>
        <Key label="Add a guardian" variant="plain" icon={<UserPlus size={18} color={colors.textTitle} />} onPress={onInvite} />
      </View>
      {live && delivery.lastContactAt ? (
        <>
          <Rule />
          <Text style={[type.caption, {color: colors.textSecondary}]}>
            Last server contact <Text style={type.readout}>{hhmm(new Date(delivery.lastContactAt))}</Text>.
            {delivery.queued && !device.simulated ? ` ${delivery.queued} waiting on this phone.` : ''}
          </Text>
        </>
      ) : null}
      {live && offline(delivery) ? (
        <View style={[styles.note, {marginTop: space.sm}]}>
          <WifiSlash size={16} color={colors.textDim} style={{marginTop: 2}} />
          <Text style={[type.caption, {flex: 1, color: colors.textSecondary}]}>
            No network. Alerts need data. Events wait on this phone and are lost if it's wiped before they're sent.
          </Text>
        </View>
      ) : null}
    </Panel>
  );
}

/** The invite: a one-time code (10 minutes) and a message to share. */
function InviteShare({invite, onDone}: {invite: Invite; onDone: () => void}) {
  const [left, setLeft] = useState(600 - Math.floor((Date.now() - invite.at) / 1000));
  useEffect(() => {
    const t = setInterval(() => setLeft(600 - Math.floor((Date.now() - invite.at) / 1000)), 1000);
    return () => clearInterval(t);
  }, [invite.at]);
  const name = device.profile?.firstName || 'Someone';
  const message =
    `${name} asked you to be their VIGIL guardian.\n\n` +
    `1. Install VIGIL: ${DOWNLOAD_URL}\n` +
    `2. Open it and tap "I'm a guardian"\n` +
    `3. Enter the code ${invite.code} (valid for 10 minutes)`;
  const expired = left <= 0;
  return (
    <View style={styles.screen}>
      <TopAppBar title="Add a guardian" onBack={onDone} />
      <Panel hero>
        <Eyebrow>One-time code</Eyebrow>
        <Text style={styles.code} selectable accessibilityLabel={`Code ${invite.code.split('').join(' ')}`}>
          {invite.code}
        </Text>
        <Text style={[type.body, {marginTop: space.sm}]}>
          {expired
            ? 'This code has expired. Make a new one.'
            : `Valid for ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}. Send it with the download link to the person you trust.`}
        </Text>
        <View style={{marginTop: space.lg}}>
          <Key
            label="Share invite"
            variant="signal"
            icon={<ShareNetwork size={18} weight="bold" color={colors.textInverse} />}
            disabled={expired}
            onPress={() => void Share.share({message})}
          />
        </View>
      </Panel>
      <Text style={type.caption}>
        They install VIGIL, tap "I'm a guardian", enter the code and agree. They are then told if you don't answer a
        check-in, or if you use your second PIN.
      </Text>
      <Key label="Done" variant="ghost" onPress={onDone} />
    </View>
  );
}

/** Plain words for why listening didn't start (spec V1). */
function armMessage(e: ArmResult): string {
  if (e.ok) return '';
  switch (e.reason) {
    case 'microphone':
      return "VIGIL needs the microphone to listen. Allow it in the app's settings, then tap Activate.";
    case 'notifications':
      return 'VIGIL needs to show its listening notification. Allow notifications, then tap Activate.';
    case 'model':
      return "The listening model on this phone didn't pass its check, so VIGIL can't listen. Reinstall the app.";
    case 'capture':
      return "VIGIL couldn't start listening. Keep the app open, then tap Activate.";
    default:
      return 'Listening is not available on this device.';
  }
}

/**
 * Home: one layout for both states (Mutarisi's design). The hero card's
 * button toggles in place: "Activate" starts listening; while active it is an
 * outlined "Deactivate", which opens the same pause PIN as before (ADR-0041:
 * one frame for both PINs). The Emergency button and Guardians stay put.
 * Unlike his simulated build, "Active" here means the microphone really is
 * listening (ADR-0046), so the card says so.
 */
function Home({
  since,
  onInvite,
  delivery,
  level,
  sharingUntil,
  paused,
  starting,
  armError,
  startError,
  onStart,
  onHelp,
  onPause,
  onSimCheck,
  onMenu,
  onGuardianStandby,
}: {
  /** When listening began, or null while VIGIL is not active. */
  since: number | null;
  onInvite: () => void;
  delivery: Delivery;
  level: Level;
  /** When the 30-minute location window after a check-in ends (0: none). */
  sharingUntil: number;
  paused: boolean;
  starting: boolean;
  armError: ArmResult | null;
  startError: string | null;
  onStart: () => void;
  /** Emergency: the member asks themselves (a check-in, while active). */
  onHelp: () => void;
  /** Deactivate: the pause PIN. */
  onPause: () => void;
  /** Browser preview only: a check-in with no detection behind it. */
  onSimCheck?: () => void;
  onMenu: () => void;
  /** Only when this phone is also someone's guardian: the way into standby. */
  onGuardianStandby?: () => void;
}) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);
  const active = since !== null;
  const mins = since !== null ? Math.floor((now - since) / 60000) : 0;
  const why = armError && !armError.ok ? armMessage(armError) : startError;
  const title = active ? 'Active' : starting ? 'Starting…' : why ? 'Not listening' : 'Ready';
  const body = active
    ? `Listening on this phone, all the time${mins >= 1 ? ` · for ${mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)} h ${mins % 60} min`}` : ''}. If it hears trouble, it asks for your PIN.`
    : why ??
      (paused
        ? 'You deactivated VIGIL with your PIN. Nothing is heard until you activate it again.'
        : "VIGIL isn't listening yet. Activate it and it listens on this phone until you deactivate it with your PIN.");
  return (
    <View style={styles.screen}>
      <Greeting onMenu={onMenu} />
      <Panel hero>
        <View style={styles.rowHeader}>
          <GlassIcon>
            <ShieldChevron size={20} color={colors.textTitle} />
          </GlassIcon>
          <Eyebrow>{active ? 'VIGIL · listening' : 'VIGIL'}</Eyebrow>
        </View>
        <Text style={[type.display, {marginTop: space.md}]} accessibilityRole="header" accessibilityLiveRegion="polite">
          {title}
        </Text>
        {active ? (
          <View style={{marginTop: space.md, marginBottom: space.xs}}>
            <ListeningLine />
          </View>
        ) : null}
        <Text style={[type.body, {marginTop: 10, marginBottom: 20}]} accessibilityLiveRegion="polite">
          {body}
        </Text>
        {active ? (
          <View style={{marginBottom: 20}}>
            <LevelMeter score={level.score} threshold={level.threshold} label={level.label} />
          </View>
        ) : null}
        {active ? (
          <OutlineKey label="Deactivate" onPress={onPause} accessibilityHint="Asks for your PIN" />
        ) : (
          <Key label={starting ? 'Starting…' : 'Activate'} variant="signal" onPress={onStart} disabled={starting} />
        )}
      </Panel>
      {active && sharingUntil > now && windowUntil() ? (
        <View style={styles.note}>
          <Text style={[type.caption, {flex: 1}]}>
            After a check-in, this phone sends its location until {hhmmOf(sharingUntil)}. Your guardians see it only if they were
            alerted.
          </Text>
        </View>
      ) : null}
      {active ? <FullScreenNotice /> : null}
      <EmergencyButton onHelp={onHelp} listening={active} />
      <GuardiansCard delivery={delivery} live={active} onInvite={onInvite} />
      {onGuardianStandby ? (
        // Mutarisi's guardianRoleCard: urgent alerts don't wait for this; they
        // arrive as a notification and the banner on every screen.
        <Panel style={{padding: 0, overflow: 'hidden'}}>
          <Row
            leading={<ShieldChevron size={20} color={colors.textTitle} />}
            label="You're a guardian"
            detail="Open guardian standby"
            onPress={onGuardianStandby}
          />
        </Panel>
      ) : null}
      <View style={styles.note}>
        <Microphone size={16} color={colors.textDim} style={{marginTop: 2}} />
        <Text style={[type.caption, {flex: 1}]}>Discreet, not invisible: Android shows a microphone dot while VIGIL is active.</Text>
      </View>
      {active && onSimCheck ? <QuietKey label="Preview: show a check-in" onPress={onSimCheck} /> : null}
    </View>
  );
}

/**
 * Ivory, Silver, Midnight or System (Mutarisi's design and ThemePrefs:
 * System follows the phone's dark mode, Midnight or Ivory). The choice is
 * kept on the phone and applies the next time VIGIL opens.
 */
function AppearanceSetting() {
  const [picked, setPicked] = useState<ThemeChoice>(THEME_CHOICE);
  const names: Record<ThemeChoice, string> = {ivory: 'Ivory', silver: 'Silver', midnight: 'Midnight', system: 'System'};
  const choose = (t: ThemeChoice) => {
    setPicked(t);
    (NativeModules.VigilLocation as {setTheme?: (n: string) => void} | undefined)?.setTheme?.(t);
  };
  return (
    <Panel>
      <Eyebrow>Appearance</Eyebrow>
      <View style={[styles.segment, {marginTop: space.sm}]}>
        {THEME_CHOICES.map(t => (
          <Pressable
            key={t}
            accessibilityRole="button"
            accessibilityState={{selected: picked === t}}
            onPress={() => choose(t)}
            style={[styles.segmentItem, picked === t && {backgroundColor: colors.actionDim}]}>
            <Text style={[type.label, {color: colors.textTitle}]}>{names[t]}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={[type.caption, {marginTop: space.sm}]}>
        {picked !== THEME_CHOICE
          ? 'Applies the next time you open VIGIL.'
          : picked === 'system'
            ? "Follows your phone's light or dark mode each time VIGIL opens."
            : 'Midnight is easier on the eyes at night.'}
      </Text>
    </Panel>
  );
}

/**
 * Android 14+ can stop a check-in from opening over other apps. Until the
 * member allows it, a check-in while VIGIL is in the background is only a
 * notification that slides away, so say so, once, plainly. Rechecked when
 * the member comes back from Settings.
 */
function FullScreenNotice() {
  const [allowed, setAllowed] = useState(true);
  useEffect(() => {
    const check = () => void canFullScreen().then(setAllowed);
    check();
    const sub = AppState.addEventListener('change', s => s === 'active' && check());
    return () => sub.remove();
  }, []);
  if (allowed) return null;
  return (
    <Panel>
      <Eyebrow>So a check-in can reach you</Eyebrow>
      <Text style={[type.body, {marginTop: space.sm, marginBottom: space.md}]}>
        When VIGIL is in the background, a check-in has to open over your other apps and the lock screen. Android needs you to allow
        that once.
      </Text>
      <Key label="Allow full-screen check-ins" variant="plain" arrow onPress={openFullScreenSettings} />
    </Panel>
  );
}

const hhmmOf = (ms: number) => {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

/** A send that failed for want of a network, not because the server refused it. */
const offline = (d: Delivery) => Boolean(d.lastError && !/^\d{3} /.test(d.lastError));

function Settings({
  onBack,
  onGuardian,
  onGuard,
  onRecord,
  onInvite,
  onProfile,
  onRecovery,
  onDocuments,
  onSignOut,
  delivery,
  detector,
}: {
  onBack: () => void;
  onGuardian: () => void;
  /** Be someone else's guardian too (or open that view). */
  onGuard: () => void;
  onRecord: () => void;
  onInvite: () => void;
  /** Edit profile, after the PIN. */
  onProfile: () => void;
  /** Mutarisi's account rows (account.tsx): Recovery, Documents and your rights, Sign out. */
  onRecovery: () => void;
  onDocuments: () => void;
  onSignOut: () => void;
  delivery: Delivery;
  detector: Detector | null;
}) {
  return (
    <View style={styles.screen}>
      <TopAppBar title="Settings" onBack={onBack} center />
      {device.profile?.role === 'member' ? <ProfileHeader onPress={onProfile} /> : null}
      <Panel style={{padding: 0, overflow: 'hidden'}}>
        <Row
          label="My record"
          detail={delivery.queued ? `${delivery.queued} waiting on this phone` : 'Your record, checked on this phone'}
          onPress={onRecord}
        />
        <View style={styles.rowRule} />
        <View style={styles.infoRow}>
          <Text style={type.label}>Security scorecard</Text>
          <Text style={[type.caption, {marginTop: 2}]}>
            Arrives with the live scorecard. No number is shown until one is computed.
          </Text>
        </View>
        <View style={styles.rowRule} />
        <Row label="Add a guardian" detail="Needs your PIN; gives a one-time code to share" onPress={onInvite} />
        <View style={styles.rowRule} />
        <Row
          label={device.profile?.guardian ? `You guard ${device.profile.guardian.memberName}` : "Be someone's guardian"}
          detail={device.profile?.guardian ? 'Open your guardian view' : 'Enter the code they sent you'}
          onPress={onGuard}
        />
        <View style={styles.rowRule} />
        <Row label="Guardian view" detail="Preview what a guardian sees (simulated)" onPress={onGuardian} />
      </Panel>
      <AppearanceSetting />
      {device.profile?.role === 'member' ? <AccountSettings onRecovery={onRecovery} onDocuments={onDocuments} onSignOut={onSignOut} /> : null}
      {!device.simulated ? <ServerSetting /> : null}
      {testFeedAvailable() ? <DetectorTest detector={detector} /> : null}

    </View>
  );
}

/**
 * Mutarisi's Settings profile: a big initials circle with a pencil badge and
 * the full name. Tapping it asks for the PIN, then opens Edit profile.
 */
function ProfileHeader({onPress}: {onPress: () => void}) {
  const p = device.profile;
  const first = p?.firstName.trim() ?? '';
  const last = p?.surname?.trim() ?? '';
  const initials = [first, last].map(s => s.charAt(0).toUpperCase()).join('');
  const name = [first, last].filter(Boolean).join(' ') || 'Your profile';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name}. Edit your details`}
      onPress={onPress}
      android_ripple={{color: colors.ripple, borderless: true}}
      style={styles.profile}>
      <View>
        <View style={styles.avatar}>
          {initials ? (
            <Text style={styles.initials} importantForAccessibility="no">
              {initials}
            </Text>
          ) : (
            <UserIcon size={48} color={colors.textTitle} />
          )}
        </View>
        <View style={styles.pencil}>
          <PencilSimple size={18} weight="bold" color={colors.textInverse} />
        </View>
      </View>
      <Text style={[type.title, {marginTop: space.md, textAlign: 'center'}]}>{name}</Text>
      <Text style={[type.caption, {marginTop: 2}]}>Edit profile · kept on this phone</Text>
    </Pressable>
  );
}

/**
 * Edit profile (after the PIN): first name, surname, +27 mobile and email,
 * with the sign-up forms' rules. Kept on this phone only: nothing is sent,
 * nothing is written to the record, and no code checks a new number or email.
 */
function EditProfile({onDone}: {onDone: () => void}) {
  const p = device.profile;
  const had = profileContacts(p);
  const [first, setFirst] = useState(p?.firstName ?? '');
  const [last, setLast] = useState(p?.surname ?? '');
  const [digits, setDigits] = useState(had.phone?.replace(/^\+27/, '') ?? '');
  const [email, setEmail] = useState(had.email ?? '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const save = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await device.setProfileDetails({name: first, surname: last, phone: digits ? `+27${digits}` : undefined, email});
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <View style={styles.screen}>
      <TopAppBar title="Edit profile" onBack={onDone} />
      <Text style={type.body}>
        {had.phone || had.email ? 'Keep at least a mobile number or an email so we can reach you.' : 'Your name is shown in the invite you send a guardian.'}
      </Text>
      <Panel>
        <Text style={type.label}>First name</Text>
        <TextInput
          value={first}
          onChangeText={setFirst}
          autoCapitalize="words"
          autoComplete="name-given"
          textContentType="givenName"
          maxLength={30}
          style={styles.input}
          accessibilityLabel="First name"
        />
        <Text style={[type.label, {marginTop: space.md}]}>Surname</Text>
        <TextInput
          value={last}
          onChangeText={setLast}
          autoCapitalize="words"
          autoComplete="name-family"
          textContentType="familyName"
          style={styles.input}
          accessibilityLabel="Surname"
        />
        <Text style={[type.label, {marginTop: space.md}]}>Mobile number</Text>
        <View style={styles.phoneRow}>
          <Text style={styles.prefix}>+27</Text>
          <TextInput
            value={digits}
            onChangeText={t => setDigits(t.replace(/\D/g, '').slice(0, 9))}
            placeholder="82 555 0101"
            placeholderTextColor={colors.textDim}
            keyboardType="phone-pad"
            autoComplete="tel"
            style={[styles.input, {flex: 1}]}
            accessibilityLabel="Mobile number"
          />
        </View>
        <Text style={[type.label, {marginTop: space.md}]}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={colors.textDim}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          autoComplete="email"
          style={styles.input}
          accessibilityLabel="Email"
        />
      </Panel>
      <Text style={[type.body, {color: colors.textTitle, minHeight: error ? undefined : 0}]} accessibilityLiveRegion="polite">
        {error}
      </Text>
      <Text style={type.caption}>
        Changes are kept on this phone only. No code is sent to check a new number or email: no SMS or email service is connected yet.
        A guardian who has already joined keeps the name they saved.
      </Text>
      <Key label={busy ? 'Saving…' : 'Save'} variant="signal" onPress={() => void save()} />
      <QuietKey label="Cancel" onPress={onDone} />
    </View>
  );
}

/** Where this phone sends its record. Release builds accept https only. */
function ServerSetting() {
  const [url, setUrl] = useState(device.profile?.serverUrl ?? '');
  const [saved, setSaved] = useState(false);
  const valid = /^https:\/\/[^\s/]+/.test(url.trim()) || (testFeedAvailable() && /^http:\/\/(10\.0\.2\.2|localhost|127\.0\.0\.1)(:\d+)?\/?$/.test(url.trim()));
  return (
    <Panel>
      <Text style={type.label}>Server</Text>
      <Text style={[type.caption, {marginTop: 2}]}>Where this phone sends its record. Only https addresses are accepted.</Text>
      <TextInput
        value={url}
        onChangeText={t => {
          setUrl(t);
          setSaved(false);
        }}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        style={styles.field}
        accessibilityLabel="Server address"
      />
      <View style={{marginTop: space.sm}}>
        <Key
          label={saved ? 'Saved' : 'Save server'}
          onPress={() => {
            if (!valid) return;
            void device.setServer(url).then(() => setSaved(true));
          }}
        />
      </View>
      {!valid ? <Text style={[type.caption, {marginTop: space.sm}]}>That isn’t an https address.</Text> : null}
    </Panel>
  );
}

/** One reason, in words and exact numbers. */
function reasonText(r: Reason): string {
  switch (r.rule) {
    case 'top':
      return `Model's top class over all 521: ${r.top_index} at ${r.top_bp} bp`;
    case 'gun_neighbour':
      return `${r.class_label} ${r.score_bp} bp vs excluded neighbours ${r.neighbour_bp} bp: ${r.pass ? 'beats them' : 'does not'}`;
    case 'threshold':
      return `${r.class_label}: ${r.score_bp} ${r.pass ? '≥' : '<'} ${r.threshold_bp} bp`;
    case 'record_threshold':
      return `${r.class_label}: ${r.score_bp} ≥ record threshold ${r.threshold_bp} bp (record only unless lifted)`;
    case 'winner':
      return `Winner: ${r.class_label} (${r.class_index}) at ${r.score_bp} bp, of ${r.qualifying} qualifying`;
    case 'confirm':
      return `Confirm (${r.family}): windows ${r.window_seqs.join(' and ')}: ${r.pass ? 'confirmed' : 'not yet'}`;
    case 'duplicate':
      return `Same ${r.family} event ${r.since_ms} ms ago (gap ${r.record_gap_ms}): ${r.pass ? 'new' : 'duplicate'}`;
    case 'cooldown':
      return `Prompt cooldown: ${r.since_ms} of ${r.cooldown_ms} ms: ${r.prompt ? 'prompt' : 'record only'}`;
    case 'checkin_open':
      return 'A check-in is already open: record only';
    case 'motion':
      return `Motion corroboration: ${r.items} item(s) in the last ${r.lookback_ms} ms`;
  }
}

/**
 * Test builds only (-PvigilTestFeed=true): runs a clip placed in the app's
 * files folder through this phone's model and the same engine as listening,
 * and shows the decision with every reason. Never in a normal build.
 */
function DetectorTest({detector}: {detector: Detector | null}) {
  const [out, setOut] = useState<string[]>([]);
  const run = async (name: string) => {
    setOut([`Running ${name}…`]);
    try {
      // While listening, the clip goes through the live engine: a detection is
      // recorded and opens the check-in exactly as the microphone would.
      const {windows, decisions} = detector ? await detector.feedClip(name) : await runTestClip(name);
      const fired = decisions.find(d => d.record);
      const show: Decision | undefined = fired ?? decisions.reduce<Decision | undefined>((best, d) => {
        const score = (x?: Decision) => {
          const t = x?.reasons.find(r => r.rule === 'threshold');
          return t && t.rule === 'threshold' ? t.score_bp : -1;
        };
        return score(d) > score(best) ? d : best;
      }, undefined);
      setOut([
        `${name}: ${windows} windows · ${fired ? `DETECTED: ${fired.candidate?.class_label}` : 'no detection'}`,
        ...(show ? show.reasons.map(reasonText) : []),
      ]);
    } catch (e) {
      setOut([`${name}: ${String(e)}`]);
    }
  };
  return (
    <Panel>
      <Text style={type.label}>Detector test (test build only)</Text>
      <Text style={[type.caption, {marginTop: 2}]}>
        Uncalibrated thresholds. Clips come from the app's files folder.{' '}
        {detector ? 'Listening: a detection is recorded and opens the check-in.' : 'Not listening: results only.'}
      </Text>
      <View style={{gap: space.sm, marginTop: space.md}}>
        <Key label="Run glass.wav" onPress={() => run('glass.wav')} />
        <Key label="Run negative.wav" onPress={() => run('negative.wav')} />
      </View>
      {out.map((line, i) => (
        <Text key={i} style={[i === 0 ? type.label : type.caption, {marginTop: space.sm}]}>
          {line}
        </Text>
      ))}
    </Panel>
  );
}

/**
 * Flat and plain: no panels, no motion, one frame for both PINs. It scrolls
 * when the window is short (landscape), so the keypad is never cut off.
 */
function JourneyCheck({
  onShown,
  remaining,
  onEnter,
  onDone,
}: {
  onShown: () => void;
  /** ms left (a lower bound on the server's own deadline), or null before the server has it. */
  remaining: () => number | null;
  onEnter: (pin: string, entryMs: number) => Promise<'checked' | 'retry'>;
  onDone: () => void;
}) {
  const [retry, setRetry] = useState(false);
  const [left, setLeft] = useState<number | null>(null);
  const busy = useRef(false);
  // The parent re-renders every audio window; keep the timer steady.
  const remainingRef = useRef(remaining);
  remainingRef.current = remaining;
  // The same plain line for both PINs; it never says why the check-in opened.
  useEffect(() => {
    const t = setInterval(() => setLeft(remainingRef.current()), 500);
    return () => clearInterval(t);
  }, []);
  // checkin_opened means "shown on screen" (§3), so it is recorded on mount.
  useEffect(() => {
    onShown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const submit = async (pin: string, entryMs: number) => {
    if (busy.current) return;
    busy.current = true;
    try {
      // The screen learns only "checked" or "try again", never which PIN.
      if ((await onEnter(pin, entryMs)) === 'checked') onDone();
      else setRetry(true);
    } catch {
      // The signed answer couldn't be written: never show it as accepted.
      // "Try again" looks the same whichever PIN it was; the check stays open,
      // so an unanswered check still reaches guardians at its deadline.
      setRetry(true);
    } finally {
      busy.current = false;
    }
  };
  return (
    <ScrollView style={{backgroundColor: colors.bgBase}} contentContainerStyle={styles.flat}>
      <Text style={[type.title, {textAlign: 'center'}]} accessibilityRole="header">
        Check-in
      </Text>
      <Text style={[type.body, {textAlign: 'center', marginTop: space.sm}]}>Enter your PIN to continue</Text>
      <Text style={[type.caption, {textAlign: 'center', marginTop: space.xs, fontVariant: ['tabular-nums']}]}>{countdownText(left)}</Text>
      <Text style={styles.pinNote} accessibilityLiveRegion="polite">
        {retry ? 'Try again' : ''}
      </Text>
      <PinKeypad onComplete={submit} />
    </ScrollView>
  );
}

/** "Answer when you can" until the server has the check-in, then M:SS, then a plain time's-up line. */
export function countdownText(ms: number | null): string {
  if (ms === null) return 'Answer when you can';
  if (ms <= 0) return "Time's up. You can still answer";
  const s = Math.ceil(ms / 1000);
  return `Check-in · ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function CheckedIn({onDone}: {onDone: () => void}) {
  // The parent re-renders every audio window with a new onDone; a timer keyed
  // on it would restart forever and this screen would never move on.
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    const t = setTimeout(() => done.current(), 2600);
    return () => clearTimeout(t);
  }, []);
  return (
    <ScrollView
      style={{backgroundColor: colors.bgBase}}
      contentContainerStyle={[styles.flat, {alignItems: 'center'}]}
      accessibilityLiveRegion="assertive">
      <View style={styles.tick}>
        <CheckCircle size={40} weight="fill" color={colors.greenInk} />
      </View>
      <Text style={[type.title, {marginTop: space.md}]} accessibilityRole="header">
        Checked in
      </Text>
      <Text style={[type.body, {marginTop: space.xs}]}>VIGIL keeps listening</Text>
    </ScrollView>
  );
}

/**
 * A PIN prompt for a settings action (§9). Same frame, wording and outcome
 * for both PINs; a duress PIN here is a duress signal (V6).
 */
function PinGate({
  title,
  prompt,
  onEnter,
  onDone,
  onCancel,
}: {
  title: string;
  prompt: string;
  onEnter: (pin: string) => Promise<'ok' | 'retry'>;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [retry, setRetry] = useState(false);
  const busy = useRef(false);
  const submit = async (pin: string) => {
    if (busy.current) return;
    busy.current = true;
    try {
      if ((await onEnter(pin)) === 'ok') onDone();
      else setRetry(true);
    } catch {
      setRetry(true);
    } finally {
      busy.current = false;
    }
  };
  return (
    <ScrollView style={{backgroundColor: colors.bgBase}} contentContainerStyle={styles.flat}>
      <Text style={[type.title, {textAlign: 'center'}]} accessibilityRole="header">
        {title}
      </Text>
      <Text style={[type.body, {textAlign: 'center', marginTop: space.sm}]}>{prompt}</Text>
      <Text style={styles.pinNote} accessibilityLiveRegion="polite">
        {retry ? 'Try again' : ''}
      </Text>
      <PinKeypad onComplete={submit} />
      <View style={{marginTop: space.lg}}>
        <QuietKey label="Back" onPress={onCancel} />
      </View>
    </ScrollView>
  );
}

/** Deactivate (pausing listening) needs the PIN (ADR-0041, G35). Same frame for both PINs. */
function EndJourney({
  onEnter,
  onDone,
  onCancel,
}: {
  onEnter: (pin: string) => Promise<'ended' | 'retry'>;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [retry, setRetry] = useState(false);
  const busy = useRef(false);
  const submit = async (pin: string) => {
    if (busy.current) return;
    busy.current = true;
    try {
      if ((await onEnter(pin)) === 'ended') onDone();
      else setRetry(true);
    } catch {
      // The authorisation couldn't be written: VIGIL keeps listening.
      setRetry(true);
    } finally {
      busy.current = false;
    }
  };
  return (
    <ScrollView style={{backgroundColor: colors.bgBase}} contentContainerStyle={styles.flat}>
      <Text style={[type.title, {textAlign: 'center'}]} accessibilityRole="header">
        Deactivate
      </Text>
      <Text style={[type.body, {textAlign: 'center', marginTop: space.sm}]}>Enter your PIN to stop VIGIL listening</Text>
      <Text style={styles.pinNote} accessibilityLiveRegion="polite">
        {retry ? 'Try again' : ''}
      </Text>
      <PinKeypad onComplete={submit} />
      <View style={{marginTop: space.lg}}>
        <QuietKey label="Keep VIGIL active" onPress={onCancel} />
      </View>
    </ScrollView>
  );
}

type GuardianState = 'standby' | 'alert' | 'closed';
type Ack = 'called_10111' | 'handling' | 'stand_down';

/**
 * What a guardian sees, on the guardian's own phone. Amber is this mode's
 * territory. SIMULATED: fixed times, no network, no calls placed.
 *
 * G4: the alert leads with "Don't call or text them. Call 10111." Calling the
 * member unlocks only after stand-down or closure: a ringing phone in a
 * coercer's hands can put the member at risk. G5: acknowledgements
 * (called_10111, handling, stand_down) are signed with the guardian's own key.
 */
function GuardianPreview({onBack}: {onBack: () => void}) {
  const [state, setState] = useState<GuardianState>('standby');
  const [acks, setAcks] = useState<Ack[]>([]);
  const [note, setNote] = useState<string | null>(null);
  const ack = (a: Ack) => {
    setAcks(x => (x.includes(a) ? x : [...x, a]));
    setNote(null);
  };
  const stoodDown = acks.includes('stand_down');
  return (
    <View style={{flex: 1}}>
      <Surface tone="guardian" />
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.screen}>
          <TopAppBar title="Guardian view" onBack={onBack} tone="guardian" />
          <Chip status="simulated" label="Simulated preview · no calls placed" />
          <View style={styles.segment} accessibilityRole="radiogroup" accessibilityLabel="Preview state">
            {(['standby', 'alert', 'closed'] as const).map(s => (
              <Pressable
                key={s}
                accessibilityRole="radio"
                accessibilityLabel={s === 'standby' ? 'Standby' : s === 'alert' ? 'Alert' : 'Closed'}
                accessibilityState={{selected: state === s}}
                onPress={() => {
                  setState(s);
                  setAcks([]);
                  setNote(null);
                }}
                style={[styles.segmentItem, state === s && styles.segmentOn]}>
                <Text style={[type.caption, {color: state === s ? colors.amberText : colors.textSecondary, fontFamily: fonts.medium}]}>
                  {s === 'standby' ? 'Standby' : s === 'alert' ? 'Alert' : 'Closed'}
                </Text>
              </Pressable>
            ))}
          </View>

          {state === 'standby' ? (
            <>
              <Panel hero tone="guardian">
                <Eyebrow>Guardian · Lerato</Eyebrow>
                <Text style={[type.display, {marginTop: space.sm}]} accessibilityRole="header">
                  All quiet
                </Text>
                <Text style={[type.body, {marginTop: space.sm}]}>VIGIL is listening on Lerato's phone. Nothing needs you right now.</Text>
              </Panel>
              <Panel tone="guardian">
                <Readout label="Last contact" value="21:52" lamp={<Lamp tone="green" />} />
                <Rule />
                <Readout label="Checks answered this week" value="2" />
              </Panel>
              <Text style={type.caption}>You hear from VIGIL only if Lerato may need help.</Text>
            </>
          ) : state === 'alert' ? (
            <>
              <Panel hero tone="guardian">
                <Eyebrow style={{color: colors.amberText}}>Alert · 21:58</Eyebrow>
                <Text style={[type.display, {marginTop: space.sm}]} accessibilityRole="header">
                  Lerato may need help
                </Text>
                <View style={styles.g4}>
                  <Text style={styles.g4Text}>Don't call or text Lerato. Call 10111.</Text>
                  <Text style={[type.caption, {color: colors.amberText, marginTop: 4}]}>
                    If someone is with Lerato, a ringing phone could put them at risk.
                  </Text>
                </View>
                <Key
                  label="Call 10111"
                  variant="guardian"
                  icon={<Phone size={20} weight="bold" color={colors.textInverse} />}
                  onPress={() => {
                    ack('called_10111');
                    setNote("In the real app this opens your phone's dialer on 10111. The preview doesn't place calls.");
                  }}
                />
              </Panel>
              <Panel tone="guardian">
                <Readout label="Check opened" value="21:57" />
                <Rule />
                <Readout label="Not answered by" value="21:58" lamp={<Lamp tone="amber" />} />
                <Rule />
                <Readout label="Last contact" value="21:56" />
              </Panel>
              {note ? <Text style={type.caption}>{note}</Text> : null}
              <View style={{gap: space.sm}}>
                <Key label={acks.includes('handling') ? "You're handling it" : "I'm handling it"} variant="guardianPlain" onPress={() => ack('handling')} />
                <Key label={stoodDown ? 'Stood down' : 'Stand down: Lerato is safe'} variant="ghost" onPress={() => ack('stand_down')} />
              </View>
              {stoodDown ? (
                <Key
                  label="Call Lerato"
                  variant="plain"
                  icon={<Phone size={20} color={colors.textTitle} />}
                  onPress={() => setNote("Unlocked after stand-down. The preview doesn't place calls.")}
                />
              ) : (
                <Text style={type.caption}>Calling Lerato unlocks after you stand down or the alert closes.</Text>
              )}
              <Text style={type.caption}>
                Each answer is signed with this phone's own key and joins Lerato's record. VIGIL doesn't dispatch anyone.
              </Text>
            </>
          ) : (
            <>
              <Panel hero tone="guardian">
                <Eyebrow>Guardian · Lerato</Eyebrow>
                <Text style={[type.display, {marginTop: space.sm}]} accessibilityRole="header">
                  Alert closed
                </Text>
                <Text style={[type.body, {marginTop: space.sm}]}>A guardian stood down at 22:07. You can call Lerato now.</Text>
              </Panel>
              <Panel tone="guardian">
                <Readout label="Alert raised" value="21:58" />
                <Rule />
                <Readout label="Closed" value="22:07" />
              </Panel>
              <Text style={type.caption}>This tells you the alert closed. It doesn't tell you where Lerato is.</Text>
            </>
          )}
          <Text style={styles.sim}>
            SIMULATED guardian preview · build <Text style={styles.simId}>{version}</Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const TOP = TOP_INSET;
const styles = StyleSheet.create({
  page: {flexGrow: 1, paddingHorizontal: 22, paddingBottom: 28, paddingTop: 12 + TOP, width: '100%', maxWidth: 560, alignSelf: 'center'},
  screen: {flexGrow: 1, gap: 14},
  greeting: {alignItems: 'center', justifyContent: 'center', minHeight: TOUCH, marginTop: space.sm, marginBottom: space.xs},
  name: {fontFamily: fonts.semibold, fontSize: 26, lineHeight: 32, letterSpacing: -0.3, color: colors.textTitle},
  iconBtn: {minHeight: TOUCH, minWidth: TOUCH, justifyContent: 'center', alignItems: 'flex-end'},
  rowHeader: {flexDirection: 'row', alignItems: 'center', gap: 10},
  cardTitle: {fontFamily: fonts.semibold, fontSize: 15, color: colors.textTitle},
  code: {fontFamily: fonts.mono, fontSize: 30, lineHeight: 38, letterSpacing: 1, color: colors.textTitle, marginTop: space.sm},
  panelHead: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm},
  guardianRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 28},
  note: {flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, paddingHorizontal: 4},
  infoRow: {paddingHorizontal: 20, paddingVertical: space.md},
  rowRule: {height: 1, backgroundColor: colors.borderSubtle, marginHorizontal: 20},
  sim: {...type.caption, fontSize: 12, textAlign: 'center', marginTop: space.md},
  simId: {fontFamily: fonts.mono, fontSize: 11},
  pinNote: {...type.body, color: colors.textTitle, textAlign: 'center', minHeight: 44, marginTop: space.sm, marginBottom: space.sm},
  field: {
    minHeight: 52,
    marginTop: space.md,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.bgSurface,
    paddingHorizontal: space.md,
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.textTitle,
  },
  profile: {alignItems: 'center', alignSelf: 'center', paddingVertical: space.sm, paddingHorizontal: space.md, minHeight: TOUCH},
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.actionDim,
    borderWidth: 1,
    borderColor: colors.actionLine,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {fontFamily: fonts.semibold, fontSize: 40, lineHeight: 48, color: colors.dark ? colors.textTitle : colors.action},
  pencil: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.action,
    borderWidth: 2,
    borderColor: colors.bgBase,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    minHeight: 52,
    marginTop: space.xs,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.bgSurface,
    paddingHorizontal: space.md,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textTitle,
  },
  phoneRow: {flexDirection: 'row', alignItems: 'center', gap: space.sm},
  prefix: {fontFamily: fonts.medium, fontSize: 16, color: colors.textTitle, marginTop: space.xs},
  /** The check-in, "Checked in" and PIN prompts: a solid ivory, flat and plain. */
  flat: {flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 40, paddingTop: 24 + TOP, backgroundColor: colors.bgBase},
  tick: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.greenFill,
    borderWidth: 1,
    borderColor: colors.greenBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.6)',
    borderRadius: radii.round,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.edgeLight,
  },
  segmentItem: {flex: 1, minHeight: 40, borderRadius: radii.round, alignItems: 'center', justifyContent: 'center'},
  segmentOn: {backgroundColor: colors.amberFill, borderWidth: 1, borderColor: '#F2D48A'},
});
