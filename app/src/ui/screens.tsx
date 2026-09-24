/**
 * VIGIL member screens, ported from the prototype reference
 * (prototype/src/pages/VigilHome.tsx). All data here is SIMULATED until the
 * native modules and contract v2 client land.
 *
 * Duress rule: the Journey check and "Checked in" are one frame each for the
 * normal and the duress PIN. Nothing on screen depends on which PIN it was.
 */
import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {Button, Card, Leaf, PinKeypad, StatusChip} from './components';
import {colors, space, type} from './theme';

type JourneyState = 'ready' | 'active' | 'check' | 'checked';

const SIM_GUARDIANS = [
  {name: 'Thandi M.', accepted: true},
  {name: 'Sipho K.', accepted: true},
  {name: 'Ayanda N.', accepted: false},
];

export function VigilApp() {
  const [state, setState] = useState<JourneyState>('ready');

  if (state === 'check') {
    return <JourneyCheck onDone={() => setState('checked')} />;
  }
  if (state === 'checked') {
    return <CheckedIn onDone={() => setState('active')} />;
  }
  return (
    <ScrollView style={{backgroundColor: colors.bgBase}} contentContainerStyle={styles.page}>
      {state === 'ready' ? (
        <Home onStart={() => setState('active')} />
      ) : (
        <JourneyActive onEnd={() => setState('ready')} onSimCheck={() => setState('check')} />
      )}
      <Text style={styles.sim}>SIMULATED demo data · pipeline build 0.0.1</Text>
    </ScrollView>
  );
}

function Home({onStart}: {onStart: () => void}) {
  const accepted = SIM_GUARDIANS.filter(g => g.accepted).length;
  return (
    <View style={{gap: space.md}}>
      <View>
        <Text style={type.eyebrow}>Good evening</Text>
        <Text style={styles.name}>Lerato</Text>
      </View>

      <Card hero>
        <View style={styles.row}>
          <Leaf mark="◇" />
          <Text style={type.eyebrow}>VIGIL</Text>
        </View>
        <Text style={[type.hero, {marginTop: 12}]} accessibilityRole="header">
          Ready
        </Text>
        <Text style={[type.body, {marginTop: 10, marginBottom: 20}]}>
          VIGIL isn't listening yet. Start a journey and it will listen on this phone until you end it.
        </Text>
        <Button label="Start journey" trailing="→" onPress={onStart} />
      </Card>

      <Card>
        <View style={styles.row}>
          <Leaf mark="◎" />
          <Text style={type.label}>Guardians ready</Text>
        </View>
        <Text style={[type.body, {color: colors.textLabel, marginTop: 10}]}>
          {accepted} accepted · {SIM_GUARDIANS.length - accepted} pending
        </Text>
        <Text style={[type.caption, {marginTop: 4, color: colors.textSecondary}]}>
          We recommend at least two guardians who don't live with you.
        </Text>
      </Card>

      <Text style={[type.caption, {paddingHorizontal: 4}]}>
        Discreet, not invisible: Android shows a microphone dot while a journey is active.
      </Text>
    </View>
  );
}

function JourneyActive({onEnd, onSimCheck}: {onEnd: () => void; onSimCheck: () => void}) {
  const accepted = SIM_GUARDIANS.filter(g => g.accepted).length;
  return (
    <View style={{gap: space.md}}>
      <Card hero>
        <View style={styles.row}>
          <Leaf mark="∿" />
          <Text style={type.eyebrow}>VIGIL · listening</Text>
        </View>
        <Text style={[type.hero, {marginTop: 12}]} accessibilityRole="header">
          Journey active
        </Text>
        <ListeningLine />
        <Text style={[type.body, {marginTop: 8}]}>Listening on this phone.</Text>
      </Card>

      <Card>
        <View style={[styles.row, {justifyContent: 'space-between'}]}>
          <View style={styles.row}>
            <Leaf mark="◎" />
            <Text style={type.label}>Guardians ready</Text>
          </View>
          <StatusChip tone="received" label="Server reached" />
        </View>
        <View style={{marginTop: 14, gap: 10}}>
          {SIM_GUARDIANS.map(g => (
            <View key={g.name} style={[styles.row, {justifyContent: 'space-between'}]}>
              <Text style={{fontSize: 14, color: colors.textLabel}}>{g.name}</Text>
              <Text style={{fontSize: 13, color: g.accepted ? colors.textSecondary : colors.textDim}}>
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
      <Button
        label="Demo: show a journey check"
        variant="ghost"
        onPress={onSimCheck}
        accessibilityHint="Simulates the check-in that a detection would open"
      />
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
      <Text style={[type.body, {textAlign: 'center', marginTop: 8, marginBottom: 32}]}>
        Enter your PIN to continue
      </Text>
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
    <View style={[styles.flat, {alignItems: 'center'}]}>
      <View style={styles.tick}>
        <Text style={{fontSize: 34, color: colors.greenText}}>✓</Text>
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
    <View style={styles.wave} accessibilityElementsHidden importantForAccessibility="no">
      {bars.map((h, i) => (
        <View key={i} style={[styles.bar, {height: h}]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {padding: space.xl, paddingTop: 36, gap: space.md},
  name: {fontSize: 26, fontWeight: '600', color: colors.textTitle, letterSpacing: -0.2},
  row: {flexDirection: 'row', alignItems: 'center', gap: 10},
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
