/**
 * VIGIL member screens and the guardian preview. Journeys, checks, PINs and
 * the record are real on a phone (signed, queued, sent); guardians are still
 * SIMULATED until the guardian app lands.
 *
 * Duress rule: the Journey check, "Checked in" and the end-journey PIN are one
 * frame each for the normal and the duress PIN (ADR-0041). Nothing on screen
 * depends on which PIN it was, and none of those frames moves.
 *
 * Demo rule (no demo controls on the phone): the visible demo controls exist
 * only in debug builds. Pipeline builds keep a hidden long-press on the
 * "Journey active" heading so the check-in can be shown.
 */
import React, {useEffect, useRef, useState} from 'react';
import {BackHandler, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View} from 'react-native';
import {CheckCircle, GearSix, Microphone, Phone, WifiSlash} from './icons';
import {Dial, Key, Lamp, Panel, PinKeypad, QuietKey, Readout, RoundKey, Row, Rule, Surface, TopAppBar} from './components';
import {colors, fonts, radii, space, TOUCH, type} from './theme';
import {Onboarding} from './onboarding';
import {MyRecord} from './record';
import {device, JourneyStartError, type Delivery} from '../api/device';
import {version} from '../../package.json';
import {runTestClip, startDetection, testFeedAvailable, type ArmResult, type Detector} from '../sensors/detection';
import type {Decision, Reason} from '../brain/detect';

type Screen = 'boot' | 'onboarding' | 'ready' | 'active' | 'check' | 'checked' | 'end' | 'settings' | 'guardian' | 'recordPin' | 'record';
type CheckSession = Awaited<ReturnType<typeof device.openCheckin>>;
type Guardian = {name: string; accepted: boolean};

/** SIMULATED until the contract v2 client lands. */
const SIM_GUARDIANS: Guardian[] = [
  {name: 'Thandi M.', accepted: true},
  {name: 'Sipho K.', accepted: true},
  {name: 'Ayanda N.', accepted: false},
];

const pad2 = (n: number) => String(n).padStart(2, '0');
const clockOf = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${pad2(Math.floor(s / 3600))}:${pad2(Math.floor((s % 3600) / 60))}:${pad2(s % 60)}`;
};
const hhmm = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

/** Edge to edge: the graphite surface runs under the translucent status bar. */
const TOP_INSET = Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 0;

export function VigilApp() {
  const [screen, setScreen] = useState<Screen>('boot');
  const [startedAt, setStartedAt] = useState<number | null>(null);
  // Debug-only preview of the no-guardians state.
  const [guardians, setGuardians] = useState<Guardian[]>(SIM_GUARDIANS);
  const home: Screen = startedAt ? 'active' : 'ready';
  const detector = useRef<Detector | null>(null);
  const journeyId = useRef<string | null>(null);
  const check = useRef<Promise<CheckSession> | null>(null);
  const [armError, setArmError] = useState<ArmResult | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const delivery = useDelivery();

  // First run goes through onboarding; after that, straight to Home.
  useEffect(() => {
    device
      .load()
      .then(({profile, pinsSet}) => setScreen(profile && pinsSet ? 'ready' : 'onboarding'))
      .catch(() => setScreen('onboarding'));
  }, []);

  // Anything still waiting is retried every 30 s while the app is open.
  useEffect(() => {
    const t = setInterval(() => {
      if (device.delivery().queued > 0) void device.flush();
    }, 30000);
    return () => clearInterval(t);
  }, []);

  // Heartbeats every 30 s while a journey runs (V9): activity bucket only.
  useEffect(() => {
    if (!startedAt || !journeyId.current) return;
    const id = journeyId.current;
    const beat = () => void device.heartbeat(id, detector.current?.speedBucket() ?? 'unknown');
    beat();
    const t = setInterval(beat, 30000);
    return () => clearInterval(t);
  }, [startedAt]);

  // Only a detection opens a Journey check (V4, V11), and only once the
  // detection is queued: the check-in names the signal that caused it.
  const openCheck = (signalEventId: string) => {
    detector.current?.setCheckinOpen(true);
    check.current = device.openCheckin(journeyId.current ?? 'sim_jny_none', signalEventId);
    setScreen('check');
  };

  const startJourney = async () => {
    if (starting) return;
    setArmError(null);
    setStartError(null);
    setStarting(true);
    try {
      // The server issues the journey id; without it no check-in could reach a guardian.
      let id: string;
      try {
        id = await device.startJourney(version);
      } catch (e) {
        setStartError(
          e instanceof JourneyStartError && e.reason === 'offline'
            ? "Journey not started: VIGIL can't reach its server, so your guardians couldn't be alerted. Check your data, then try again."
            : `Journey not started: the server refused it (${e instanceof Error ? e.message : String(e)}).`,
        );
        return;
      }
      const {result, detector: d} = await startDetection({
        journeyId: id,
        appVersion: version,
        // Evidence first: every confirmed detection is signed and queued (V7, V8).
        onRecord: (_decision, payload) => device.signal(id, payload),
        onPrompt: (_decision, signalEventId) => openCheck(signalEventId),
      });
      // 'unsupported' is the browser preview and tests: no microphone, so the
      // journey runs as a simulation. On a phone, a refused permission or a
      // failed model check does not arm (V1).
      if (!result.ok && result.reason !== 'unsupported') {
        setArmError(result);
        return;
      }
      detector.current = d ?? null;
      journeyId.current = id;
      setStartedAt(Date.now());
      setScreen('active');
    } finally {
      setStarting(false);
    }
  };

  const endJourney = async () => {
    // Stop listening and let any detection already in flight finish first,
    // so nothing can open a check-in on a journey that has ended.
    await detector.current?.stop().catch(() => undefined);
    detector.current = null;
    journeyId.current = null;
    setStartedAt(null);
    setScreen('ready');
  };

  // Android back: Settings and the guardian preview step back; the end-journey
  // PIN cancels back to the journey. The check-in and "Checked in" swallow
  // back identically for both PINs, so neither can be dismissed.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen === 'settings' || screen === 'end') {
        setScreen(home);
        return true;
      }
      if (screen === 'guardian' || screen === 'record' || screen === 'recordPin') {
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
    return <Onboarding onDone={() => setScreen('ready')} />;
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
          setScreen('active');
        }}
      />
    );
  }
  if (screen === 'end') {
    return (
      <EndJourney
        onEnter={pin => device.endJourney(journeyId.current ?? 'sim_jny_none', pin)}
        onDone={endJourney}
        onCancel={() => setScreen('active')}
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
        ) : screen === 'settings' ? (
          <Settings
            onBack={() => setScreen(home)}
            onGuardian={() => setScreen('guardian')}
            onRecord={() => setScreen(device.simulated ? 'record' : 'recordPin')}
            delivery={delivery}
            detector={startedAt ? detector.current : null}
            noGuardians={guardians.length === 0}
            onToggleGuardians={() => setGuardians(g => (g.length ? [] : SIM_GUARDIANS))}
          />
        ) : screen === 'ready' ? (
          <Home
            guardians={guardians}
            onStart={startJourney}
            armError={armError}
            startError={startError}
            starting={starting}
            onMenu={() => setScreen('settings')}
          />
        ) : (
          <JourneyActive
            startedAt={startedAt ?? Date.now()}
            guardians={guardians}
            delivery={delivery}
            onEnd={() => setScreen('end')}
            onSimCheck={device.simulated ? () => openCheck('00000000-0000-4000-8000-000000000000') : undefined}
            onMenu={() => setScreen('settings')}
          />
        )}
        <Text style={styles.sim}>
          {device.simulated ? 'SIMULATED preview: nothing signed or sent' : 'Guardians SIMULATED'} · build{' '}
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

function TopBar({onMenu}: {onMenu: () => void}) {
  return (
    <View style={styles.topBar}>
      <Text style={styles.wordmark} accessibilityRole="text" accessibilityLabel="VIGIL">
        VIGIL
      </Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Settings" onPress={onMenu} hitSlop={8} style={styles.iconBtn}>
        <GearSix size={24} color={colors.textDim} />
      </Pressable>
    </View>
  );
}

function GuardianList({guardians}: {guardians: Guardian[]}) {
  const ready = guardians.filter(g => g.accepted).length;
  return (
    <Panel>
      <View style={styles.panelHead}>
        <Text style={type.label}>Guardians</Text>
        <Text style={type.readout}>
          {ready}/{guardians.length} ready
        </Text>
      </View>
      <Rule />
      {guardians.map(g => (
        <View
          key={g.name}
          accessible
          accessibilityLabel={`${g.name}, ${g.accepted ? 'ready' : 'invitation pending'}`}
          style={styles.guardianRow}>
          <Lamp tone="bone" hollow={!g.accepted} />
          <Text style={[type.body, {flex: 1, color: colors.textTitle}]}>{g.name}</Text>
          <Text style={[type.body, {color: g.accepted ? colors.textBody : colors.textDim}]}>
            {g.accepted ? 'ready' : 'pending'}
          </Text>
        </View>
      ))}
    </Panel>
  );
}

/** Plain words for why a journey didn't start (spec V1). */
function armMessage(e: ArmResult): string {
  if (e.ok) return '';
  switch (e.reason) {
    case 'microphone':
      return "VIGIL needs the microphone to listen during a journey. Allow it in the app's settings, then start again.";
    case 'notifications':
      return 'VIGIL needs to show its journey notification while it listens. Allow notifications, then start again.';
    case 'model':
      return "The listening model on this phone didn't pass its check, so VIGIL can't listen. Reinstall the app.";
    case 'capture':
      return "VIGIL couldn't start listening. Keep the app open while you start the journey, then try again.";
    default:
      return 'Listening is not available on this device.';
  }
}

function Home({
  guardians,
  onStart,
  onMenu,
  armError,
  startError,
  starting,
}: {
  guardians: Guardian[];
  onStart: () => void;
  onMenu: () => void;
  armError: ArmResult | null;
  startError: string | null;
  starting: boolean;
}) {
  return (
    <View style={styles.screen}>
      <TopBar onMenu={onMenu} />
      <View style={{gap: space.sm, marginTop: space.lg}}>
        <Text style={type.display} accessibilityRole="header">
          Ready
        </Text>
        <Text style={type.body}>Not listening. Start a journey and VIGIL listens on this phone until you end it.</Text>
      </View>

      {guardians.length === 0 ? (
        <Panel>
          <Text style={type.label}>No guardians yet</Text>
          <Text style={[type.body, {marginTop: space.xs}]}>
            If you don't answer a check, VIGIL alerts your guardians. Add two people who don't live with you.
          </Text>
        </Panel>
      ) : (
        <GuardianList guardians={guardians} />
      )}

      <View style={styles.keyZone}>
        <RoundKey label={starting ? 'Starting…' : 'Start journey'} onPress={onStart} />
        {armError && !armError.ok ? (
          <Text style={[type.body, styles.armError]} accessibilityLiveRegion="polite">
            {armMessage(armError)}
          </Text>
        ) : startError ? (
          <Text style={[type.body, styles.armError]} accessibilityLiveRegion="polite">
            {startError}
          </Text>
        ) : null}
      </View>

      <View style={styles.note}>
        <Microphone size={16} color={colors.textDim} style={{marginTop: 2}} />
        <Text style={[type.caption, {flex: 1}]}>
          Discreet, not invisible: Android shows a microphone dot while a journey is active.
        </Text>
      </View>
    </View>
  );
}

function JourneyActive({
  startedAt,
  guardians,
  delivery,
  onEnd,
  onSimCheck,
  onMenu,
}: {
  startedAt: number;
  guardians: Guardian[];
  delivery: Delivery;
  onEnd: () => void;
  /** Browser preview only: a journey check with no detection behind it. */
  onSimCheck?: () => void;
  onMenu: () => void;
}) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const ready = guardians.filter(g => g.accepted).length;
  return (
    <View style={styles.screen}>
      <TopBar onMenu={onMenu} />
      <View style={{gap: space.sm, marginTop: space.lg}}>
        <Text style={type.display} accessibilityRole="header">
          Journey active
        </Text>
        <View style={styles.lampLine}>
          <Lamp tone="signal" breathing />
          <Text style={type.body}>Listening on this phone</Text>
        </View>
      </View>

      <View style={styles.keyZone}>
        <Dial>
          <Text style={type.clock} accessibilityLabel={`Journey time ${clockOf(now - startedAt)}`}>
            {clockOf(now - startedAt)}
          </Text>
          <Text style={[type.caption, {color: colors.textBody}]}>on journey</Text>
        </Dial>
      </View>

      <Panel>
        <Readout
          label="Guardians ready"
          value={guardians.length ? `${ready} of ${guardians.length}` : 'none'}
          lamp={<Lamp tone="bone" hollow={ready === 0} />}
        />
        <Rule />
        <Readout
          label="Last contact"
          value={device.simulated ? 'preview' : delivery.lastContactAt ? hhmm(new Date(delivery.lastContactAt)) : 'not yet'}
          lamp={<Lamp tone={delivery.lastContactAt && Date.now() - Date.parse(delivery.lastContactAt) < 75000 ? 'green' : 'unlit'} />}
        />
        <Rule />
        <Readout
          label="Waiting on this phone"
          value={String(delivery.queued)}
          lamp={<Lamp tone={delivery.queued ? 'bone' : 'unlit'} hollow={!delivery.queued} />}
        />
        {offline(delivery) ? (
          <View style={[styles.note, {marginTop: space.sm}]}>
            <WifiSlash size={16} color={colors.textDim} style={{marginTop: 2}} />
            <Text style={[type.caption, {flex: 1}]}>
              No network. Alerts need data. Events wait on this phone and are lost if it's wiped before they're sent.
            </Text>
          </View>
        ) : guardians.length === 0 ? (
          <Text style={[type.caption, {marginTop: space.sm}]}>
            No guardians yet, so an unanswered check alerts no one.
          </Text>
        ) : null}
      </Panel>

      <Key label="End journey" onPress={onEnd} accessibilityHint="Asks for your PIN" />
      {onSimCheck ? <QuietKey label="Preview: show a journey check" onPress={onSimCheck} /> : null}
    </View>
  );
}

/** A send that failed for want of a network, not because the server refused it. */
const offline = (d: Delivery) => Boolean(d.lastError && !/^\d{3} /.test(d.lastError));

function Settings({
  onBack,
  onGuardian,
  onRecord,
  delivery,
  detector,
  noGuardians,
  onToggleGuardians,
}: {
  onBack: () => void;
  onGuardian: () => void;
  onRecord: () => void;
  delivery: Delivery;
  detector: Detector | null;
  noGuardians: boolean;
  onToggleGuardians: () => void;
}) {
  return (
    <View style={styles.screen}>
      <TopAppBar title="Settings" onBack={onBack} />
      <Panel style={{padding: 0, overflow: 'hidden'}}>
        <Row
          label="My record"
          detail={`${delivery.received} received · ${delivery.queued} waiting on this phone`}
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
        <Row label="Guardian view" detail="Preview what a guardian sees (simulated)" onPress={onGuardian} />
      </Panel>
      {!device.simulated ? <ServerSetting /> : null}
      {testFeedAvailable() ? <DetectorTest detector={detector} /> : null}
      {__DEV__ ? (
        <Panel>
          <Text style={type.label}>Demo states (debug builds only)</Text>
          <View style={{gap: space.sm, marginTop: space.md}}>
            <Key label={noGuardians ? 'Restore guardians' : 'Show no guardians'} onPress={onToggleGuardians} />
          </View>
        </Panel>
      ) : null}
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
 * files folder through this phone's model and the same engine as a journey,
 * and shows the decision with every reason. Never in a normal build.
 */
function DetectorTest({detector}: {detector: Detector | null}) {
  const [out, setOut] = useState<string[]>([]);
  const run = async (name: string) => {
    setOut([`Running ${name}…`]);
    try {
      // During a journey the clip goes through that journey: a detection is
      // recorded and opens the Journey check exactly as the microphone would.
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
        {detector ? 'A journey is running: a detection is recorded and opens the Journey check.' : 'No journey: results only.'}
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
      // The evidence couldn't be written: behave as a normal check, never reveal it.
      onDone();
    } finally {
      busy.current = false;
    }
  };
  return (
    <ScrollView style={{backgroundColor: colors.bgBase}} contentContainerStyle={styles.flat}>
      <Text style={[type.title, {textAlign: 'center'}]} accessibilityRole="header">
        Journey check
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
      <Text style={[type.body, {marginTop: space.xs}]}>Journey continues</Text>
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
      onDone();
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

/** Ending a journey needs the PIN (ADR-0041). Same frame for both PINs. */
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
      onDone();
    } finally {
      busy.current = false;
    }
  };
  return (
    <ScrollView style={{backgroundColor: colors.bgBase}} contentContainerStyle={styles.flat}>
      <Text style={[type.title, {textAlign: 'center'}]} accessibilityRole="header">
        End journey
      </Text>
      <Text style={[type.body, {textAlign: 'center', marginTop: space.sm}]}>Enter your PIN to end this journey</Text>
      <Text style={styles.pinNote} accessibilityLiveRegion="polite">
        {retry ? 'Try again' : ''}
      </Text>
      <PinKeypad onComplete={submit} />
      <View style={{marginTop: space.lg}}>
        <QuietKey label="Keep the journey going" onPress={onCancel} />
      </View>
    </ScrollView>
  );
}

type GuardianState = 'standby' | 'alert' | 'ended';

/**
 * What a guardian sees, on the guardian's own phone. Amber is this mode's
 * territory. SIMULATED: fixed times, no network.
 */
function GuardianPreview({onBack}: {onBack: () => void}) {
  const [state, setState] = useState<GuardianState>('standby');
  const [acked, setAcked] = useState(false);
  const [called, setCalled] = useState(false);
  return (
    <View style={{flex: 1}}>
      <Surface tone="guardian" />
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.screen}>
          <TopAppBar title="Guardian view (preview)" onBack={onBack} tone="guardian" />
          <View style={styles.segment} accessibilityRole="radiogroup" accessibilityLabel="Preview state">
            {(['standby', 'alert', 'ended'] as const).map(s => (
              <Pressable
                key={s}
                accessibilityRole="radio"
                accessibilityLabel={s === 'standby' ? 'Standby' : s === 'alert' ? 'Alert' : 'Ended'}
                accessibilityState={{selected: state === s}}
                onPress={() => {
                  setState(s);
                  setAcked(false);
                  setCalled(false);
                }}
                style={[styles.segmentItem, state === s && styles.segmentOn]}>
                <Text style={[type.caption, {color: state === s ? colors.onAmber : colors.textBody, fontFamily: fonts.medium}]}>
                  {s === 'standby' ? 'Standby' : s === 'alert' ? 'Alert' : 'Ended'}
                </Text>
              </Pressable>
            ))}
          </View>

          {state === 'standby' ? (
            <>
              <View style={{gap: space.sm}}>
                <Text style={styles.guardianDisplay} accessibilityRole="header">
                  Lerato is on a journey
                </Text>
                <View style={styles.lampLine}>
                  <Lamp tone="amber" />
                  <Text style={type.body}>Nothing needs you right now.</Text>
                </View>
              </View>
              <Panel tone="guardian">
                <Readout label="Journey started" value="21:14" />
                <Rule />
                <Readout label="Last contact" value="21:52" lamp={<Lamp tone="green" />} />
                <Rule />
                <Readout label="Checks answered" value="2" />
              </Panel>
              <Text style={type.caption}>
                You hear from VIGIL only if Lerato may need help, or when the journey ends.
              </Text>
            </>
          ) : state === 'alert' ? (
            <>
              <View style={{gap: space.sm}}>
                <Text style={styles.guardianDisplay} accessibilityRole="header">
                  Lerato may need help
                </Text>
                <Text style={type.body}>Lerato didn't answer a journey check.</Text>
              </View>
              <Panel tone="guardian">
                <Readout label="Check opened" value="21:57" />
                <Rule />
                <Readout label="Alert raised" value="21:58" lamp={<Lamp tone="amber" />} />
                <Rule />
                <Readout label="Last contact" value="21:56" />
              </Panel>
              <Key label="Call Lerato" variant="guardian" icon={<Phone size={20} weight="bold" color={colors.onAmber} />} onPress={() => setCalled(true)} />
              {called ? (
                <Text style={type.caption}>In the real app this opens your phone's dialer. The preview doesn't place calls.</Text>
              ) : null}
              {acked ? (
                <Text style={[type.body, {textAlign: 'center'}]}>
                  You acknowledged at <Text style={type.readout}>22:01</Text>
                </Text>
              ) : (
                <Key label="I've reached Lerato" variant="guardianPlain" onPress={() => setAcked(true)} />
              )}
              <Text style={type.caption}>
                VIGIL doesn't dispatch anyone. You decide what happens next.
              </Text>
            </>
          ) : (
            <>
              <View style={{gap: space.sm}}>
                <Text style={styles.guardianDisplay} accessibilityRole="header">
                  Journey ended
                </Text>
                <Text style={type.body}>Lerato entered a PIN to end the journey.</Text>
              </View>
              <Panel tone="guardian">
                <Readout label="Started" value="21:14" />
                <Rule />
                <Readout label="Ended" value="22:07" />
                <Rule />
                <Readout label="Duration" value="00:53" />
              </Panel>
              <Text style={type.caption}>
                This tells you a PIN was entered. It doesn't tell you where Lerato is.
              </Text>
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

const styles = StyleSheet.create({
  page: {flexGrow: 1, padding: space.lg, paddingTop: space.md + TOP_INSET, width: '100%', maxWidth: 560, alignSelf: 'center'},
  screen: {flexGrow: 1, gap: space.md},
  topBar: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: TOUCH},
  wordmark: {fontFamily: fonts.bold, fontSize: 15, letterSpacing: 3, color: colors.textTitle},
  iconBtn: {minHeight: TOUCH, minWidth: TOUCH, justifyContent: 'center', alignItems: 'center', marginRight: -space.sm},
  panelHead: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  guardianRow: {flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 40},
  keyZone: {flexGrow: 1, justifyContent: 'center', paddingVertical: space.lg},
  armError: {textAlign: 'center', color: colors.textTitle, marginTop: space.md},
  lampLine: {flexDirection: 'row', alignItems: 'center', gap: space.sm},
  note: {flexDirection: 'row', alignItems: 'flex-start', gap: space.sm},
  infoRow: {paddingHorizontal: space.md, paddingVertical: space.md},
  rowRule: {height: 1, backgroundColor: colors.hairline, marginHorizontal: space.md},
  sim: {...type.caption, fontSize: 12, textAlign: 'center', marginTop: space.md},
  simId: {fontFamily: fonts.mono, fontSize: 11},
  pinNote: {...type.body, color: colors.textTitle, textAlign: 'center', minHeight: 48, marginTop: space.sm, marginBottom: space.sm},
  field: {
    minHeight: 52,
    marginTop: space.md,
    borderRadius: radii.key,
    borderWidth: 1,
    borderColor: colors.controlEdge,
    backgroundColor: colors.keyFace,
    paddingHorizontal: space.md,
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.textTitle,
  },
  flat: {flexGrow: 1, justifyContent: 'center', padding: space.lg, paddingVertical: space.xl, paddingTop: space.xl + TOP_INSET},
  tick: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.greenWash,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guardianDisplay: {...type.display, fontSize: 34, lineHeight: 38, letterSpacing: -0.9},
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.guardianRaised,
    borderRadius: 12,
    padding: space.xs,
    gap: space.xs,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  segmentItem: {flex: 1, minHeight: TOUCH, borderRadius: 9, alignItems: 'center', justifyContent: 'center'},
  segmentOn: {backgroundColor: colors.amber},
});
