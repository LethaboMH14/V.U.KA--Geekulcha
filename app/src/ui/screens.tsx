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
import {BackHandler, Platform, Pressable, ScrollView, Share, StatusBar, StyleSheet, Text, TextInput, View} from 'react-native';
import {CheckCircle, GearSix, Microphone, Phone, ShareNetwork, ShieldChevron, UserPlus, Users, Waveform, WifiSlash} from './icons';
import {Chip, Eyebrow, GlassIcon, Key, Lamp, LevelMeter, ListeningLine, Panel, PinKeypad, QuietKey, Readout, Row, Rule, Surface, TopAppBar} from './components';
import {colors, fonts, radii, space, TOUCH, type} from './theme';
import {Onboarding} from './onboarding';
import {GuardianHome, GuardianSetup} from './guardian';
import {MyRecord} from './record';
import {device, DOWNLOAD_URL, JourneyStartError, type Delivery} from '../api/device';
import {version} from '../../package.json';
import {runTestClip, startDetection, testFeedAvailable, type ArmResult, type Detector, type Level} from '../sensors/detection';
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
  | 'guardianSetup'
  | 'guardianHome';
type CheckSession = Awaited<ReturnType<typeof device.openCheckin>>;
type Invite = {code: string; guardianId: string; at: number};

const pad2 = (n: number) => String(n).padStart(2, '0');
const hhmm = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

/** Edge to edge: the graphite surface runs under the translucent status bar. */
const TOP_INSET = Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 0;

export function VigilApp() {
  const [screen, setScreen] = useState<Screen>('boot');
  // When listening began (a server-issued session is running), or null.
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [invite, setInvite] = useState<Invite | null>(null);
  const home: Screen = 'home';
  const detector = useRef<Detector | null>(null);
  const journeyId = useRef<string | null>(null);
  const check = useRef<Promise<CheckSession> | null>(null);
  const [armError, setArmError] = useState<ArmResult | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  // Paused by the member (PIN). Listening stays off until they turn it on.
  const [paused, setPaused] = useState(false);
  const [level, setLevel] = useState<Level>({label: null, score: 0, threshold: 0});
  const delivery = useDelivery();

  // First run goes through onboarding; after that, straight to listening.
  useEffect(() => {
    device
      .load()
      .then(({profile, pinsSet}) =>
        setScreen(profile?.role === 'guardian' ? 'guardianHome' : profile && pinsSet ? 'home' : 'onboarding'),
      )
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
    check.current = device.openCheckin(journeyId.current ?? 'sim_jny_none', signalEventId);
    setScreen('check');
  };

  const startListening = async () => {
    if (starting || startedAt) return;
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
      const {result, detector: d} = await startDetection({
        journeyId: id,
        appVersion: version,
        // Evidence first: every confirmed detection is signed and queued (V7, V8).
        onRecord: (_decision, payload) => device.signal(id, payload),
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

  const pauseListening = async () => {
    // Stop listening and let any detection already in flight finish first,
    // so nothing can open a check-in once listening has stopped.
    await detector.current?.stop().catch(() => undefined);
    detector.current = null;
    journeyId.current = null;
    setStartedAt(null);
    setLevel({label: null, score: 0, threshold: 0});
    setPaused(true);
    setScreen('home');
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
      if (screen === 'guardian' || screen === 'record' || screen === 'recordPin' || screen === 'invitePin' || screen === 'invite') {
        setScreen('settings');
        return true;
      }
      return screen === 'check' || screen === 'checked';
    });
    return () => sub.remove();
  }, [screen, home]);

  if (screen === 'boot') {
    return <View style={{flex: 1, backgroundColor: colors.bgBase}} />;
  }
  if (screen === 'onboarding') {
    return <Onboarding onDone={() => setScreen('home')} onGuardian={() => setScreen('guardianSetup')} />;
  }
  if (screen === 'guardianSetup') {
    return <GuardianSetup onDone={() => setScreen('guardianHome')} onBack={() => setScreen('onboarding')} />;
  }
  if (screen === 'guardianHome') {
    return <GuardianHome />;
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
        onShown={() => void session.then(c => c.shown())}
        onEnter={async pin => (await session).enter(pin)}
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
        onDone={pauseListening}
        onCancel={() => setScreen('home')}
      />
    );
  }
  if (screen === 'guardian') {
    return <GuardianPreview onBack={() => setScreen('settings')} />;
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
      <ScrollView contentContainerStyle={styles.page}>
        {screen === 'record' ? (
          <MyRecord onBack={() => setScreen('settings')} />
        ) : screen === 'invite' && invite ? (
          <InviteShare invite={invite} onDone={() => setScreen('home')} />
        ) : screen === 'settings' ? (
          <Settings
            onBack={() => setScreen(home)}
            onGuardian={() => setScreen('guardian')}
            onRecord={() => setScreen(device.simulated ? 'record' : 'recordPin')}
            onInvite={() => setScreen('invitePin')}
            delivery={delivery}
            detector={startedAt ? detector.current : null}
          />
        ) : startedAt ? (
          <Listening
            since={startedAt}
            onInvite={() => setScreen('invitePin')}
            delivery={delivery}
            level={level}
            onPause={() => setScreen('end')}
            onSimCheck={device.simulated ? () => openCheck('00000000-0000-4000-8000-000000000000') : undefined}
            onMenu={() => setScreen('settings')}
          />
        ) : (
          <NotListening
            onInvite={() => setScreen('invitePin')}
            paused={paused}
            starting={starting}
            armError={armError}
            startError={startError}
            onStart={() => {
              setPaused(false);
              setArmError(null);
              void startListening();
            }}
            onMenu={() => setScreen('settings')}
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

/** The prototype's greeting row: eyebrow, first name, settings in a glass circle. */
function Greeting({onMenu}: {onMenu: () => void}) {
  return (
    <View style={styles.greeting}>
      <View>
        <Eyebrow style={{marginBottom: 4}}>{greeting(new Date())}</Eyebrow>
        <Text style={styles.name}>{device.profile?.firstName ?? 'VIGIL'}</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Settings" onPress={onMenu} hitSlop={6} style={styles.iconBtn}>
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
      return "VIGIL needs the microphone to listen. Allow it in the app's settings, then turn listening on.";
    case 'notifications':
      return 'VIGIL needs to show its listening notification. Allow notifications, then turn listening on.';
    case 'model':
      return "The listening model on this phone didn't pass its check, so VIGIL can't listen. Reinstall the app.";
    case 'capture':
      return "VIGIL couldn't start listening. Keep the app open, then turn listening on.";
    default:
      return 'Listening is not available on this device.';
  }
}

function NotListening({
  onInvite,
  paused,
  starting,
  armError,
  startError,
  onStart,
  onMenu,
}: {
  onInvite: () => void;
  paused: boolean;
  starting: boolean;
  armError: ArmResult | null;
  startError: string | null;
  onStart: () => void;
  onMenu: () => void;
}) {
  const why = armError && !armError.ok ? armMessage(armError) : startError;
  return (
    <View style={styles.screen}>
      <Greeting onMenu={onMenu} />
      <Panel hero>
        <View style={styles.rowHeader}>
          <GlassIcon>
            <ShieldChevron size={20} color={colors.textTitle} />
          </GlassIcon>
          <Eyebrow>VIGIL</Eyebrow>
        </View>
        <Text style={[type.display, {marginTop: space.md}]} accessibilityRole="header">
          {starting ? 'Starting…' : paused ? 'Paused' : 'Not listening'}
        </Text>
        <Text style={[type.body, {marginTop: 10, marginBottom: 20}]} accessibilityLiveRegion="polite">
          {why ??
            (paused
              ? 'You paused listening with your PIN. Nothing is heard until you turn it back on.'
              : 'VIGIL listens on this phone all the time. If it hears trouble, it asks for your PIN.')}
        </Text>
        <Key label={starting ? 'Starting…' : 'Turn on listening'} variant="signal" arrow onPress={onStart} disabled={starting} />
      </Panel>
      <GuardiansCard delivery={device.delivery()} live={false} onInvite={onInvite} />
      <View style={styles.note}>
        <Microphone size={16} color={colors.textDim} style={{marginTop: 2}} />
        <Text style={[type.caption, {flex: 1}]}>Discreet, not invisible: Android shows a microphone dot while VIGIL is listening.</Text>
      </View>
    </View>
  );
}

function Listening({
  since,
  onInvite,
  delivery,
  level,
  onPause,
  onSimCheck,
  onMenu,
}: {
  since: number;
  onInvite: () => void;
  delivery: Delivery;
  level: Level;
  onPause: () => void;
  /** Browser preview only: a check-in with no detection behind it. */
  onSimCheck?: () => void;
  onMenu: () => void;
}) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);
  const mins = Math.floor((now - since) / 60000);
  return (
    <View style={styles.screen}>
      <Greeting onMenu={onMenu} />
      <Panel hero>
        <View style={styles.rowHeader}>
          <GlassIcon>
            <Waveform size={20} color={colors.textTitle} />
          </GlassIcon>
          <Eyebrow>VIGIL · listening</Eyebrow>
        </View>
        <Text style={[type.display, {marginTop: space.md}]} accessibilityRole="header">
          Listening
        </Text>
        <View style={{marginTop: space.md, marginBottom: space.xs}}>
          <ListeningLine />
        </View>
        <Text style={[type.body, {marginBottom: space.lg}]}>
          On this phone, all the time{mins >= 1 ? ` · for ${mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)} h ${mins % 60} min`}` : ''}. If it hears
          trouble, it asks for your PIN.
        </Text>
        <LevelMeter score={level.score} threshold={level.threshold} label={level.label} />
      </Panel>
      <GuardiansCard delivery={delivery} live onInvite={onInvite} />
      <Key label="Pause listening" variant="ghost" onPress={onPause} accessibilityHint="Asks for your PIN" />
      {onSimCheck ? <QuietKey label="Preview: show a check-in" onPress={onSimCheck} /> : null}
    </View>
  );
}

/** A send that failed for want of a network, not because the server refused it. */
const offline = (d: Delivery) => Boolean(d.lastError && !/^\d{3} /.test(d.lastError));

function Settings({
  onBack,
  onGuardian,
  onRecord,
  onInvite,
  delivery,
  detector,
}: {
  onBack: () => void;
  onGuardian: () => void;
  onRecord: () => void;
  onInvite: () => void;
  delivery: Delivery;
  detector: Detector | null;
}) {
  return (
    <View style={styles.screen}>
      <TopAppBar title="Settings" onBack={onBack} />
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
        <Row label="Guardian view" detail="Preview what a guardian sees (simulated)" onPress={onGuardian} />
      </Panel>
      {!device.simulated ? <ServerSetting /> : null}
      {testFeedAvailable() ? <DetectorTest detector={detector} /> : null}

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
  onEnter,
  onDone,
}: {
  onShown: () => void;
  onEnter: (pin: string) => Promise<'checked' | 'retry'>;
  onDone: () => void;
}) {
  const [retry, setRetry] = useState(false);
  const busy = useRef(false);
  // checkin_opened means "shown on screen" (§3), so it is recorded on mount.
  useEffect(() => {
    onShown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const submit = async (pin: string) => {
    if (busy.current) return;
    busy.current = true;
    try {
      // The screen learns only "checked" or "try again", never which PIN.
      if ((await onEnter(pin)) === 'checked') onDone();
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
      <Text style={styles.pinNote} accessibilityLiveRegion="polite">
        {retry ? 'Try again' : ''}
      </Text>
      <PinKeypad onComplete={submit} />
    </ScrollView>
  );
}

function CheckedIn({onDone}: {onDone: () => void}) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [onDone]);
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

/** Pausing listening needs the PIN (ADR-0041, G35). Same frame for both PINs. */
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
        Pause listening
      </Text>
      <Text style={[type.body, {textAlign: 'center', marginTop: space.sm}]}>Enter your PIN to pause listening</Text>
      <Text style={styles.pinNote} accessibilityLiveRegion="polite">
        {retry ? 'Try again' : ''}
      </Text>
      <PinKeypad onComplete={submit} />
      <View style={{marginTop: space.lg}}>
        <QuietKey label="Keep listening" onPress={onCancel} />
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
  greeting: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.sm, marginBottom: space.xs},
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
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: radii.round,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  segmentItem: {flex: 1, minHeight: 40, borderRadius: radii.round, alignItems: 'center', justifyContent: 'center'},
  segmentOn: {backgroundColor: colors.amberFill, borderWidth: 1, borderColor: '#F2D48A'},
});
