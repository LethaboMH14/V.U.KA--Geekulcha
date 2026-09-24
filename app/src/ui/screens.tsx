/**
 * VIGIL member screens, ported from the prototype reference
 * (prototype/src/pages/VigilHome.tsx). All data here is SIMULATED until the
 * native modules and contract v2 client land.
 *
 * Duress rule: the Journey check and "Checked in" are one frame each for the
 * normal and the duress PIN. Nothing on screen depends on which PIN it was.
 *
 * Demo rule (prototype: "no demo controls on the phone"): the visible demo
 * controls exist only in debug builds. Pipeline builds keep a hidden
 * long-press on the "Journey active" heading so the check-in can be shown.
 */
import React, {useEffect, useState} from 'react';
import {BackHandler, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {
  ArrowRight,
  CaretLeft,
  CheckCircle,
  DotsThreeCircle,
  Microphone,
  ShieldCheck,
  ShieldChevron,
  UserPlus,
  Users,
  WifiSlash,
  Waveform,
} from './icons';
import {AmbientField, Button, Card, Leaf, PinKeypad, StatusChip} from './components';
import {colors, fonts, space, TOUCH, type} from './theme';
import {version} from '../../package.json';

type Screen = 'ready' | 'active' | 'check' | 'checked' | 'settings';
type Guardian = {name: string; accepted: boolean};

/** SIMULATED until the contract v2 client lands. */
const SIM_GUARDIANS: Guardian[] = [
  {name: 'Thandi M.', accepted: true},
  {name: 'Sipho K.', accepted: true},
  {name: 'Ayanda N.', accepted: false},
];

const ICON = {size: 20, color: colors.textTitle} as const;

export function VigilApp() {
  const [screen, setScreen] = useState<Screen>('ready');
  const [armed, setArmed] = useState(false);
  // Debug-only state previews (offline, no guardians); fixed in release builds.
  const [online, setOnline] = useState(true);
  const [guardians, setGuardians] = useState<Guardian[]>(SIM_GUARDIANS);

  // Android back: Settings returns to the previous screen. The check-in and
  // "Checked in" swallow back identically for both PINs, so neither can be
  // dismissed and the behaviour reveals nothing.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen === 'settings') {
        setScreen(armed ? 'active' : 'ready');
        return true;
      }
      return screen === 'check' || screen === 'checked';
    });
    return () => sub.remove();
  }, [screen, armed]);

  if (screen === 'check') {
    return <JourneyCheck onDone={() => setScreen('checked')} />;
  }
  if (screen === 'checked') {
    return <CheckedIn onDone={() => setScreen('active')} />;
  }
  return (
    <View style={{flex: 1}}>
      <AmbientField />
      <ScrollView contentContainerStyle={styles.page}>
        {screen === 'settings' ? (
          <Settings
            onBack={() => setScreen(armed ? 'active' : 'ready')}
            online={online}
            onToggleOnline={() => setOnline(o => !o)}
            noGuardians={guardians.length === 0}
            onToggleGuardians={() => setGuardians(g => (g.length ? [] : SIM_GUARDIANS))}
          />
        ) : screen === 'ready' ? (
          <Home
            guardians={guardians}
            onStart={() => {
              setArmed(true);
              setScreen('active');
            }}
            onMenu={() => setScreen('settings')}
          />
        ) : (
          <JourneyActive
            guardians={guardians}
            online={online}
            onEnd={() => {
              setArmed(false);
              setScreen('ready');
            }}
            onSimCheck={() => setScreen('check')}
          />
        )}
        <Text style={styles.sim}>SIMULATED demo data · build {version}</Text>
      </ScrollView>
    </View>
  );
}

function Home({guardians, onStart, onMenu}: {guardians: Guardian[]; onStart: () => void; onMenu: () => void}) {
  const accepted = guardians.filter(g => g.accepted).length;
  return (
    <View style={{gap: space.md}}>
      <View style={[styles.row, {justifyContent: 'space-between'}]}>
        <Text style={styles.greeting} accessibilityRole="header">
          Good evening, Lerato
        </Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Menu" onPress={onMenu} hitSlop={8} style={styles.iconBtn}>
          <DotsThreeCircle size={26} color={colors.textDim} />
        </Pressable>
      </View>

      <Card hero>
        <View style={styles.row}>
          <Leaf>
            <ShieldChevron {...ICON} />
          </Leaf>
          <Text style={type.hero} accessibilityRole="header">
            Ready
          </Text>
        </View>
        <Text style={[type.body, {marginTop: 12, marginBottom: 20}]}>
          VIGIL isn't listening yet. Start a journey and it will listen on this phone until you end it.
        </Text>
        <Button label="Start journey" trailing={<ArrowRight size={18} weight="bold" color={colors.actionText} />} onPress={onStart} />
      </Card>

      {guardians.length === 0 ? (
        <Card>
          <View style={styles.row}>
            <Leaf>
              <UserPlus {...ICON} />
            </Leaf>
            <Text style={type.label}>No guardians yet</Text>
          </View>
          <Text style={[type.body, {marginTop: 10}]}>
            If you don't answer a check, VIGIL alerts your guardians. Add two people who don't live with you.
          </Text>
        </Card>
      ) : (
        <Card>
          <View style={styles.row}>
            <Leaf>
              <Users {...ICON} />
            </Leaf>
            <Text style={type.label}>Guardians</Text>
          </View>
          <Text style={[type.body, {color: colors.textLabel, marginTop: 10}]}>
            {accepted} accepted · {guardians.length - accepted} pending
          </Text>
          <Text style={[type.caption, {marginTop: 4, color: colors.textSecondary}]}>
            We recommend at least two guardians who don't live with you.
          </Text>
        </Card>
      )}

      <View style={[styles.row, {alignItems: 'flex-start', paddingHorizontal: 4}]}>
        <Microphone size={16} color={colors.textDim} style={{marginTop: 2}} />
        <Text style={[type.caption, {flex: 1}]}>
          Discreet, not invisible: Android shows a microphone dot while a journey is active.
        </Text>
      </View>
    </View>
  );
}

function JourneyActive({
  guardians,
  online,
  onEnd,
  onSimCheck,
}: {
  guardians: Guardian[];
  online: boolean;
  onEnd: () => void;
  onSimCheck: () => void;
}) {
  const accepted = guardians.filter(g => g.accepted).length;
  return (
    <View style={{gap: space.md}}>
      <Card hero>
        {/* Hidden, unlabelled: a long press shows the check-in in pipeline builds. */}
        <Pressable onLongPress={onSimCheck} delayLongPress={1500} accessible={false}>
          <View style={styles.row}>
            <Leaf>
              <Waveform {...ICON} />
            </Leaf>
            <Text style={type.hero} accessibilityRole="header">
              Journey active
            </Text>
          </View>
        </Pressable>
        <ListeningLine />
        <Text style={[type.body, {marginTop: 8}]}>Listening on this phone.</Text>
      </Card>

      <Card>
        <View style={[styles.row, {justifyContent: 'space-between'}]}>
          <View style={styles.row}>
            <Leaf>
              <Users {...ICON} />
            </Leaf>
            <Text style={type.label}>Guardians</Text>
          </View>
          {online ? <StatusChip tone="received" label="Server reached" /> : <StatusChip tone="neutral" label="Offline" />}
        </View>
        {guardians.length === 0 ? (
          <Text style={[type.body, {marginTop: 12}]}>
            No guardians yet, so an unanswered check alerts no one. Add a guardian from Settings.
          </Text>
        ) : (
          <View style={{marginTop: 14, gap: 10}}>
            {guardians.map(g => (
              <View
                key={g.name}
                accessible
                accessibilityLabel={`${g.name}, ${g.accepted ? 'ready' : 'pending'}`}
                style={[styles.row, {justifyContent: 'space-between'}]}>
                <Text style={styles.guardian}>{g.name}</Text>
                <Text style={[type.caption, {color: g.accepted ? colors.textSecondary : colors.textDim}]}>
                  {g.accepted ? 'Ready' : 'Pending'}
                </Text>
              </View>
            ))}
          </View>
        )}
        <View style={styles.divider} />
        {online ? (
          <Text style={[type.caption, {color: colors.textSecondary}]}>
            {accepted} of {guardians.length} would be alerted if you don't answer a check.
          </Text>
        ) : (
          <View style={[styles.row, {alignItems: 'flex-start'}]}>
            <WifiSlash size={16} color={colors.textDim} style={{marginTop: 2}} />
            <Text style={[type.caption, {flex: 1, color: colors.textSecondary}]}>
              No network. Alerts need data. Events wait on this phone and are lost if it's wiped before they're sent.
            </Text>
          </View>
        )}
      </Card>

      <Button label="End journey" variant="ghost" onPress={onEnd} />
      {__DEV__ ? (
        <Button
          label="Demo: show a journey check"
          variant="ghost"
          onPress={onSimCheck}
          accessibilityHint="Debug builds only. Simulates the check-in a detection would open"
        />
      ) : null}
    </View>
  );
}

function Settings({
  onBack,
  online,
  onToggleOnline,
  noGuardians,
  onToggleGuardians,
}: {
  onBack: () => void;
  online: boolean;
  onToggleOnline: () => void;
  noGuardians: boolean;
  onToggleGuardians: () => void;
}) {
  return (
    <View style={{gap: space.md}}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onBack} style={[styles.row, styles.iconBtn, {alignSelf: 'flex-start'}]}>
        <CaretLeft size={20} color={colors.action} />
        <Text style={[type.label, {color: colors.action}]}>Back</Text>
      </Pressable>
      <Text style={type.hero} accessibilityRole="header">
        Settings
      </Text>
      <Card>
        <View style={[styles.row, {alignItems: 'flex-start'}]}>
          <Leaf>
            <ShieldCheck {...ICON} />
          </Leaf>
          <View style={{flex: 1}}>
            <Text style={type.label}>Security &amp; privacy</Text>
            <Text style={[type.caption, {marginTop: 2}]}>
              The live evidence score arrives with the security scorecard. No number is shown until it's computed.
            </Text>
          </View>
        </View>
      </Card>
      {__DEV__ ? (
        <Card>
          <Text style={type.label}>Demo states (debug builds only)</Text>
          <View style={{gap: 10, marginTop: 12}}>
            <Button label={online ? 'Show offline' : 'Show online'} variant="ghost" onPress={onToggleOnline} />
            <Button label={noGuardians ? 'Restore guardians' : 'Show no guardians'} variant="ghost" onPress={onToggleGuardians} />
          </View>
        </Card>
      ) : null}
    </View>
  );
}

/**
 * Flat and plain: no cards, no motion, one frame for both PINs. It scrolls
 * when the window is short (landscape), so the keypad is never cut off.
 */
function JourneyCheck({onDone}: {onDone: () => void}) {
  return (
    <ScrollView style={{backgroundColor: colors.bgBase}} contentContainerStyle={styles.flat}>
      <Text style={[type.title, {textAlign: 'center'}]} accessibilityRole="header">
        Journey check
      </Text>
      <Text style={[type.body, {textAlign: 'center', marginTop: 8, marginBottom: 28}]}>Enter your PIN to continue</Text>
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
        <CheckCircle size={40} weight="fill" color={colors.greenText} />
      </View>
      <Text style={[type.hero, {marginTop: 18}]} accessibilityRole="header">
        Checked in
      </Text>
      <Text style={[type.body, {marginTop: 6}]}>Journey continues</Text>
    </ScrollView>
  );
}

function ListeningLine() {
  // Static waveform bars; motion arrives with Reanimated in the native pass.
  const bars = [6, 12, 20, 14, 8, 18, 26, 16, 10, 22, 12, 7, 15, 24, 11, 6];
  return (
    <View style={styles.wave} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {bars.map((h, i) => (
        <View key={i} style={[styles.bar, {height: h}]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {padding: space.xl, paddingTop: 36, gap: space.md, width: '100%', maxWidth: 560, alignSelf: 'center'},
  greeting: {fontFamily: fonts.semibold, fontSize: 24, lineHeight: 30, color: colors.textTitle, letterSpacing: -0.2, flex: 1},
  guardian: {fontFamily: fonts.regular, fontSize: 14, color: colors.textLabel},
  row: {flexDirection: 'row', alignItems: 'center', gap: 12},
  iconBtn: {minHeight: TOUCH, minWidth: TOUCH, justifyContent: 'center', alignItems: 'center'},
  divider: {height: 1, backgroundColor: colors.border, marginVertical: 14},
  sim: {...type.caption, textAlign: 'center', marginTop: 8},
  flat: {flexGrow: 1, justifyContent: 'center', padding: space.xl, paddingVertical: 32},
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
  wave: {flexDirection: 'row', alignItems: 'center', gap: 4, height: 32, marginTop: 16},
  bar: {width: 4, borderRadius: 2, backgroundColor: colors.action, opacity: 0.8},
});
