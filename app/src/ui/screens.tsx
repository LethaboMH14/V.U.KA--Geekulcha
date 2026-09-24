/**
 * VIGIL member screens, ported from the prototype reference
 * (prototype/src/pages/VigilHome.tsx). All data here is SIMULATED until the
 * native modules and contract v2 client land.
 *
 * Duress rule: the Journey check and "Checked in" are one frame each for the
 * normal and the duress PIN. Nothing on screen depends on which PIN it was.
 *
 * Demo rule (prototype: "no demo controls on the phone"): the visible demo
 * trigger exists only in debug builds. Pipeline builds keep a hidden
 * long-press on the "Journey active" title so the check-in can be shown.
 */
import React, {useEffect, useState} from 'react';
import {BackHandler, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {
  ArrowRight,
  CaretLeft,
  CaretRight,
  CheckCircle,
  DotsThreeCircle,
  Microphone,
  ShieldCheck,
  ShieldChevron,
  Users,
  Waveform,
} from './icons';
import {AmbientField, Button, Card, Leaf, PinKeypad, StatusChip} from './components';
import {colors, fonts, space, TOUCH, type} from './theme';
import {version} from '../../package.json';

type Screen = 'ready' | 'active' | 'check' | 'checked' | 'settings';

const SIM_GUARDIANS = [
  {name: 'Thandi M.', accepted: true},
  {name: 'Sipho K.', accepted: true},
  {name: 'Ayanda N.', accepted: false},
];

const ICON = {size: 20, color: colors.textTitle} as const;

export function VigilApp() {
  const [screen, setScreen] = useState<Screen>('ready');
  const [armed, setArmed] = useState(false);

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
          <Settings onBack={() => setScreen(armed ? 'active' : 'ready')} />
        ) : screen === 'ready' ? (
          <Home
            onStart={() => {
              setArmed(true);
              setScreen('active');
            }}
            onMenu={() => setScreen('settings')}
          />
        ) : (
          <JourneyActive
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

function Home({onStart, onMenu}: {onStart: () => void; onMenu: () => void}) {
  const accepted = SIM_GUARDIANS.filter(g => g.accepted).length;
  return (
    <View style={{gap: space.md}}>
      <View style={[styles.row, {justifyContent: 'space-between'}]}>
        <View>
          <Text style={type.eyebrow}>Good evening</Text>
          <Text style={styles.name}>Lerato</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Menu" onPress={onMenu} hitSlop={8} style={styles.iconBtn}>
          <DotsThreeCircle size={26} color={colors.textDim} />
        </Pressable>
      </View>

      <Card hero>
        <View style={styles.row}>
          <Leaf>
            <ShieldChevron {...ICON} />
          </Leaf>
          <Text style={type.eyebrow}>VIGIL</Text>
        </View>
        <Text style={[type.hero, {marginTop: 12}]} accessibilityRole="header">
          Ready
        </Text>
        <Text style={[type.body, {marginTop: 10, marginBottom: 20}]}>
          VIGIL isn't listening yet. Start a journey and it will listen on this phone until you end it.
        </Text>
        <Button label="Start journey" trailing={<ArrowRight size={18} weight="bold" color="#FFFFFF" />} onPress={onStart} />
      </Card>

      <Card>
        <View style={styles.row}>
          <Leaf>
            <Users {...ICON} />
          </Leaf>
          <Text style={type.label}>Guardians ready</Text>
        </View>
        <Text style={[type.body, {color: colors.textLabel, marginTop: 10}]}>
          {accepted} accepted · {SIM_GUARDIANS.length - accepted} pending
        </Text>
        <Text style={[type.caption, {marginTop: 4, color: colors.textSecondary}]}>
          We recommend at least two guardians who don't live with you.
        </Text>
      </Card>

      <View style={[styles.row, {alignItems: 'flex-start', paddingHorizontal: 4}]}>
        <Microphone size={16} color={colors.textDim} style={{marginTop: 2}} />
        <Text style={[type.caption, {flex: 1}]}>
          Discreet, not invisible: Android shows a microphone dot while a journey is active.
        </Text>
      </View>
    </View>
  );
}

function JourneyActive({onEnd, onSimCheck}: {onEnd: () => void; onSimCheck: () => void}) {
  const accepted = SIM_GUARDIANS.filter(g => g.accepted).length;
  return (
    <View style={{gap: space.md}}>
      <Card hero>
        <View style={styles.row}>
          <Leaf>
            <Waveform {...ICON} />
          </Leaf>
          <Text style={type.eyebrow}>VIGIL · listening</Text>
        </View>
        {/* Hidden, unlabelled: a long press shows the check-in in pipeline builds. */}
        <Pressable onLongPress={onSimCheck} delayLongPress={1500} accessible={false}>
          <Text style={[type.hero, {marginTop: 12}]} accessibilityRole="header">
            Journey active
          </Text>
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
            <Text style={type.label}>Guardians ready</Text>
          </View>
          <StatusChip tone="received" label="Server reached" />
        </View>
        <View style={{marginTop: 14, gap: 10}}>
          {SIM_GUARDIANS.map(g => (
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
        <View style={styles.divider} />
        <Text style={[type.caption, {color: colors.textSecondary}]}>
          {accepted} of {SIM_GUARDIANS.length} would be alerted if you don't answer a check.
        </Text>
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

function Settings({onBack}: {onBack: () => void}) {
  return (
    <View style={{gap: space.md}}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onBack} style={[styles.row, styles.iconBtn]}>
        <CaretLeft size={20} color={colors.action} />
        <Text style={[type.label, {color: colors.action}]}>Back</Text>
      </Pressable>
      <Text style={type.hero} accessibilityRole="header">
        Settings
      </Text>
      <Card>
        <View style={[styles.row, {justifyContent: 'space-between'}]}>
          <View style={[styles.row, {flex: 1}]}>
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
          <CaretRight size={18} color={colors.textDim} />
        </View>
      </Card>
    </View>
  );
}

/** Flat and plain: no cards, no motion, one frame for both PINs. */
function JourneyCheck({onDone}: {onDone: () => void}) {
  return (
    <View style={styles.flat}>
      <Text style={[type.title, {textAlign: 'center'}]} accessibilityRole="header">
        Journey check
      </Text>
      <Text style={[type.body, {textAlign: 'center', marginTop: 8, marginBottom: 32}]}>Enter your PIN to continue</Text>
      <PinKeypad onComplete={() => onDone()} />
    </View>
  );
}

function CheckedIn({onDone}: {onDone: () => void}) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <View style={[styles.flat, {alignItems: 'center'}]} accessibilityLiveRegion="assertive">
      <View style={styles.tick}>
        <CheckCircle size={40} weight="fill" color={colors.greenText} />
      </View>
      <Text style={[type.hero, {marginTop: 18}]} accessibilityRole="header">
        Checked in
      </Text>
      <Text style={[type.body, {marginTop: 6}]}>Journey continues</Text>
    </View>
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
  name: {fontFamily: fonts.semibold, fontSize: 26, color: colors.textTitle, letterSpacing: -0.2},
  guardian: {fontFamily: fonts.regular, fontSize: 14, color: colors.textLabel},
  row: {flexDirection: 'row', alignItems: 'center', gap: 10},
  iconBtn: {minHeight: TOUCH, minWidth: TOUCH, justifyContent: 'center', alignItems: 'center'},
  divider: {height: 1, backgroundColor: colors.border, marginVertical: 14},
  sim: {...type.caption, textAlign: 'center', marginTop: 8},
  flat: {flex: 1, backgroundColor: colors.bgBase, justifyContent: 'center', padding: space.xl},
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
