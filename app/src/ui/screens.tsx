/**
 * VIGIL member screens and the guardian preview. All data here is SIMULATED
 * until the native modules and contract v2 client land.
 *
 * Duress rule: the Journey check, "Checked in" and the end-journey PIN are one
 * frame each for the normal and the duress PIN (ADR-0041). Nothing on screen
 * depends on which PIN it was, and none of those frames moves.
 *
 * Demo rule (no demo controls on the phone): the visible demo controls exist
 * only in debug builds. Pipeline builds keep a hidden long-press on the
 * "Journey active" heading so the check-in can be shown.
 */
import React, {useEffect, useState} from 'react';
import {BackHandler, Pressable, ScrollView, StatusBar, StyleSheet, Text, View} from 'react-native';
import {CaretLeft, CheckCircle, GearSix, Microphone, Phone, WifiSlash} from './icons';
import {Dial, Key, Lamp, Panel, PinKeypad, QuietKey, Readout, RoundKey, Row, Rule, Surface} from './components';
import {colors, fonts, space, TOUCH, type} from './theme';
import {version} from '../../package.json';

type Screen = 'ready' | 'active' | 'check' | 'checked' | 'end' | 'settings' | 'guardian';
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

export function VigilApp() {
  const [screen, setScreen] = useState<Screen>('ready');
  const [startedAt, setStartedAt] = useState<number | null>(null);
  // Debug-only state previews (offline, no guardians); fixed in release builds.
  const [online, setOnline] = useState(true);
  const [guardians, setGuardians] = useState<Guardian[]>(SIM_GUARDIANS);
  const home: Screen = startedAt ? 'active' : 'ready';

  // Android back: Settings and the guardian preview step back; the end-journey
  // PIN cancels back to the journey. The check-in and "Checked in" swallow
  // back identically for both PINs, so neither can be dismissed.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen === 'settings' || screen === 'end') {
        setScreen(home);
        return true;
      }
      if (screen === 'guardian') {
        setScreen('settings');
        return true;
      }
      return screen === 'check' || screen === 'checked';
    });
    return () => sub.remove();
  }, [screen, home]);

  if (screen === 'check') {
    return <JourneyCheck onDone={() => setScreen('checked')} />;
  }
  if (screen === 'checked') {
    return <CheckedIn onDone={() => setScreen('active')} />;
  }
  if (screen === 'end') {
    return (
      <EndJourney
        onDone={() => {
          setStartedAt(null);
          setScreen('ready');
        }}
        onCancel={() => setScreen('active')}
      />
    );
  }
  if (screen === 'guardian') {
    return <GuardianPreview onBack={() => setScreen('settings')} />;
  }
  return (
    <View style={{flex: 1}}>
      <Surface />
      <ScrollView contentContainerStyle={styles.page}>
        {screen === 'settings' ? (
          <Settings
            onBack={() => setScreen(home)}
            onGuardian={() => setScreen('guardian')}
            online={online}
            onToggleOnline={() => setOnline(o => !o)}
            noGuardians={guardians.length === 0}
            onToggleGuardians={() => setGuardians(g => (g.length ? [] : SIM_GUARDIANS))}
          />
        ) : screen === 'ready' ? (
          <Home
            guardians={guardians}
            onStart={() => {
              setStartedAt(Date.now());
              setScreen('active');
            }}
            onMenu={() => setScreen('settings')}
          />
        ) : (
          <JourneyActive
            startedAt={startedAt ?? Date.now()}
            guardians={guardians}
            online={online}
            onEnd={() => setScreen('end')}
            onSimCheck={() => setScreen('check')}
            onMenu={() => setScreen('settings')}
          />
        )}
        <Text style={styles.sim}>SIMULATED demo data · build {version}</Text>
      </ScrollView>
    </View>
  );
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
          <Text style={[type.readout, {color: g.accepted ? colors.textBody : colors.textDim}]}>
            {g.accepted ? 'ready' : 'pending'}
          </Text>
        </View>
      ))}
    </Panel>
  );
}

function Home({guardians, onStart, onMenu}: {guardians: Guardian[]; onStart: () => void; onMenu: () => void}) {
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
        <RoundKey label="Start journey" onPress={onStart} />
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
  online,
  onEnd,
  onSimCheck,
  onMenu,
}: {
  startedAt: number;
  guardians: Guardian[];
  online: boolean;
  onEnd: () => void;
  onSimCheck: () => void;
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
        {/* Hidden, unlabelled: a long press shows the check-in in pipeline builds. */}
        <Pressable onLongPress={onSimCheck} delayLongPress={1500} accessible={false}>
          <Text style={type.display} accessibilityRole="header">
            Journey active
          </Text>
        </Pressable>
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
          <Text style={[type.caption, {fontFamily: fonts.mono}]}>on journey</Text>
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
          label="Server"
          value={online ? `reached ${hhmm(new Date(now))}` : 'offline'}
          lamp={<Lamp tone={online ? 'green' : 'unlit'} />}
        />
        {!online ? (
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
      {__DEV__ ? (
        <QuietKey label="Demo: show a journey check" onPress={onSimCheck} />
      ) : null}
    </View>
  );
}

function Settings({
  onBack,
  onGuardian,
  online,
  onToggleOnline,
  noGuardians,
  onToggleGuardians,
}: {
  onBack: () => void;
  onGuardian: () => void;
  online: boolean;
  onToggleOnline: () => void;
  noGuardians: boolean;
  onToggleGuardians: () => void;
}) {
  return (
    <View style={styles.screen}>
      <BackLink label="Back" onPress={onBack} />
      <Text style={type.title} accessibilityRole="header">
        Settings
      </Text>
      <Panel style={{padding: 0, overflow: 'hidden'}}>
        <View style={styles.infoRow}>
          <Text style={type.label}>Security scorecard</Text>
          <Text style={[type.caption, {marginTop: 2}]}>
            Arrives with the live scorecard. No number is shown until one is computed.
          </Text>
        </View>
        <View style={styles.rowRule} />
        <Row label="Guardian view" detail="Preview what a guardian sees (simulated)" onPress={onGuardian} />
      </Panel>
      {__DEV__ ? (
        <Panel>
          <Text style={type.label}>Demo states (debug builds only)</Text>
          <View style={{gap: space.sm, marginTop: space.md}}>
            <Key label={online ? 'Show offline' : 'Show online'} onPress={onToggleOnline} />
            <Key label={noGuardians ? 'Restore guardians' : 'Show no guardians'} onPress={onToggleGuardians} />
          </View>
        </Panel>
      ) : null}
    </View>
  );
}

function BackLink({label, onPress, tone = 'member'}: {label: string; onPress: () => void; tone?: 'member' | 'guardian'}) {
  const c = tone === 'guardian' ? colors.amberInk : colors.cobaltInk;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.back}>
      <CaretLeft size={20} color={c} />
      <Text style={[type.label, {color: c}]}>{label}</Text>
    </Pressable>
  );
}

/**
 * Flat and plain: no panels, no motion, one frame for both PINs. It scrolls
 * when the window is short (landscape), so the keypad is never cut off.
 */
function JourneyCheck({onDone}: {onDone: () => void}) {
  return (
    <ScrollView style={{backgroundColor: colors.bgBase}} contentContainerStyle={styles.flat}>
      <Text style={[type.title, {textAlign: 'center'}]} accessibilityRole="header">
        Journey check
      </Text>
      <Text style={[type.body, {textAlign: 'center', marginTop: space.sm, marginBottom: space.xl}]}>
        Enter your PIN to continue
      </Text>
      <PinKeypad onComplete={() => onDone()} />
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

/** Ending a journey needs the PIN (ADR-0041). Same frame for both PINs. */
function EndJourney({onDone, onCancel}: {onDone: () => void; onCancel: () => void}) {
  return (
    <ScrollView style={{backgroundColor: colors.bgBase}} contentContainerStyle={styles.flat}>
      <Text style={[type.title, {textAlign: 'center'}]} accessibilityRole="header">
        End journey
      </Text>
      <Text style={[type.body, {textAlign: 'center', marginTop: space.sm, marginBottom: space.xl}]}>
        Enter your PIN to end this journey
      </Text>
      <PinKeypad onComplete={() => onDone()} />
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
      <StatusBar barStyle="light-content" backgroundColor={colors.guardianBase} />
      <Surface tone="guardian" />
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.screen}>
          <BackLink label="Settings" onPress={onBack} tone="guardian" />
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
                <Text style={[type.readout, {textAlign: 'center'}]}>You acknowledged at 22:01</Text>
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
          <Text style={styles.sim}>SIMULATED guardian preview · build {version}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {flexGrow: 1, padding: space.lg, paddingTop: space.md, width: '100%', maxWidth: 560, alignSelf: 'center'},
  screen: {flexGrow: 1, gap: space.md},
  topBar: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: TOUCH},
  wordmark: {fontFamily: fonts.bold, fontSize: 15, letterSpacing: 3, color: colors.textTitle},
  iconBtn: {minHeight: TOUCH, minWidth: TOUCH, justifyContent: 'center', alignItems: 'center', marginRight: -space.sm},
  panelHead: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  guardianRow: {flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 40},
  keyZone: {flexGrow: 1, justifyContent: 'center', paddingVertical: space.lg},
  lampLine: {flexDirection: 'row', alignItems: 'center', gap: space.sm},
  note: {flexDirection: 'row', alignItems: 'flex-start', gap: space.sm},
  back: {flexDirection: 'row', alignItems: 'center', gap: space.xs, minHeight: TOUCH, alignSelf: 'flex-start'},
  infoRow: {paddingHorizontal: space.md, paddingVertical: space.md},
  rowRule: {height: 1, backgroundColor: colors.hairline, marginHorizontal: space.md},
  sim: {...type.caption, fontFamily: fonts.mono, fontSize: 11, textAlign: 'center', marginTop: space.md},
  flat: {flexGrow: 1, justifyContent: 'center', padding: space.lg, paddingVertical: space.xl},
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
