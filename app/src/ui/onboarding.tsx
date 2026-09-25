/**
 * First run: name, the everyday PIN, the duress PIN, then the genesis entry
 * of the member's record (spec §3, §9, V5, V6).
 *
 * PINs are compared here only to catch typos, then handed to the PIN module,
 * which keeps an Argon2id hash of each and nothing else. The name stays on the
 * phone: the registration entry doesn't carry it.
 */
import React, {useEffect, useState} from 'react';
import {Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, View} from 'react-native';
import {Eyebrow, GlassIcon, Key, Lamp, Panel, PinKeypad, QuietKey, Readout, Rule, Surface, TopAppBar} from './components';
import {Microphone, ShieldChevron} from './icons';
import {colors, fonts, radii, space, TOUCH, type} from './theme';
import {version} from '../../package.json';
import {device, type Delivery} from '../api/device';

type Step = 'welcome' | 'name' | 'pin' | 'pinAgain' | 'duressIntro' | 'duress' | 'duressAgain' | 'record';

const TOP_INSET = Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 0;

export function Onboarding({onDone, onGuardian}: {onDone: () => void; onGuardian: () => void}) {
  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [duress, setDuress] = useState('');
  const [note, setNote] = useState('');

  if (step === 'pin' || step === 'pinAgain' || step === 'duress' || step === 'duressAgain') {
    const copy = {
      pin: ['Choose your PIN', 'Four digits. You answer check-ins and pause listening with it.'],
      pinAgain: ['Enter your PIN again', 'So a typo can’t lock you out.'],
      duress: ['Choose your second PIN', 'Four digits, different from your everyday PIN.'],
      duressAgain: ['Enter your second PIN again', 'So a typo can’t lock you out.'],
    }[step];
    const onComplete = (entered: string) => {
      if (step === 'pin') {
        setPin(entered);
        setNote('');
        setStep('pinAgain');
      } else if (step === 'pinAgain') {
        if (entered === pin) {
          setNote('');
          setStep('duressIntro');
        } else {
          setPin('');
          setNote('Those didn’t match. Choose your PIN again.');
          setStep('pin');
        }
      } else if (step === 'duress') {
        if (entered === pin) {
          setNote('That’s your everyday PIN. Choose a different one.');
          return;
        }
        setDuress(entered);
        setNote('');
        setStep('duressAgain');
      } else if (entered === duress) {
        setNote('');
        setStep('record');
      } else {
        setDuress('');
        setNote('Those didn’t match. Choose your second PIN again.');
        setStep('duress');
      }
    };
    return (
      <ScrollView style={{backgroundColor: colors.bgBase}} contentContainerStyle={styles.flat}>
        <Text style={styles.stepMark}>{step.startsWith('pin') ? '02' : '03'} / 04</Text>
        <Text style={[type.title, {textAlign: 'center'}]} accessibilityRole="header">
          {copy[0]}
        </Text>
        <Text style={[type.body, {textAlign: 'center', marginTop: space.sm}]}>{copy[1]}</Text>
        {/* Reserved height, so a message never moves the keypad. */}
        <Text style={styles.note} accessibilityLiveRegion="polite">
          {note}
        </Text>
        <PinKeypad key={step} onComplete={onComplete} />
        <View style={{marginTop: space.lg}}>
          <QuietKey
            label="Back"
            onPress={() => {
              setNote('');
              setStep(step === 'pin' ? 'name' : step === 'pinAgain' ? 'pin' : step === 'duress' ? 'duressIntro' : 'duress');
            }}
          />
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={{flex: 1}}>
      <Surface />
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        {step === 'welcome' ? (
          <Welcome onNext={() => setStep('name')} onGuardian={onGuardian} />
        ) : step === 'name' ? (
          <NameStep name={name} setName={setName} onBack={() => setStep('welcome')} onNext={() => setStep('pin')} />
        ) : step === 'duressIntro' ? (
          <DuressIntro onBack={() => setStep('pin')} onNext={() => setStep('duress')} />
        ) : (
          <CreateRecord name={name} pin={pin} duress={duress} onDone={onDone} />
        )}
        {device.simulated ? (
          <Text style={styles.sim}>
            SIMULATED preview: PINs held in memory, nothing signed or sent · build <Text style={styles.simId}>{version}</Text>
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

function Welcome({onNext, onGuardian}: {onNext: () => void; onGuardian: () => void}) {
  const lines = [
    'It listens on this phone all the time, for trouble like breaking glass or a scream.',
    'A distress sound shows a quiet check-in, not an alarm.',
    'Your guardians only hear from VIGIL if you don’t answer, or if you use your second PIN.',
  ];
  return (
    <View style={styles.screen}>
      <View style={{paddingTop: 12, alignItems: 'center', gap: 6}}>
        <Eyebrow>VUKA</Eyebrow>
        <Text style={[type.body, {textAlign: 'center'}]}>You are not alone. You don’t have to ask.</Text>
      </View>
      <Panel hero>
        <View style={styles.rowHeader}>
          <GlassIcon>
            <ShieldChevron size={20} color={colors.textTitle} />
          </GlassIcon>
          <Eyebrow>VIGIL</Eyebrow>
        </View>
        <Text style={[type.display, {marginTop: space.md}]} accessibilityRole="header">
          What VIGIL does
        </Text>
        <View style={{gap: 10, marginTop: 14}}>
          {lines.map(l => (
            <Text key={l} style={type.body}>
              {l}
            </Text>
          ))}
        </View>
      </Panel>
      <View style={styles.noteRow}>
        <Microphone size={16} color={colors.textDim} style={{marginTop: 2}} />
        <Text style={[type.caption, {flex: 1}]}>
          Discreet, not invisible: Android shows a microphone dot while VIGIL is listening. Sound is judged on this phone
          and discarded within three seconds.
        </Text>
      </View>
      <View style={{flexGrow: 1}} />
      <View style={{gap: 10}}>
        <Key label="Get started" variant="signal" arrow onPress={onNext} />
        <Key label="I'm a guardian" variant="ghost" onPress={onGuardian} accessibilityHint="Someone sent you a code" />
      </View>
    </View>
  );
}

function NameStep({name, setName, onBack, onNext}: {name: string; setName: (s: string) => void; onBack: () => void; onNext: () => void}) {
  const clean = name.trim();
  const valid = clean.length >= 1 && clean.length <= 30;
  const [tried, setTried] = useState(false);
  return (
    <View style={styles.screen}>
      <TopAppBar title="01 / 04" onBack={onBack} />
      <Text style={type.title} accessibilityRole="header">
        What should your guardians call you?
      </Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="First name"
        placeholderTextColor={colors.textDim}
        autoFocus
        autoCapitalize="words"
        autoComplete="name-given"
        textContentType="givenName"
        maxLength={30}
        returnKeyType="next"
        onSubmitEditing={() => (valid ? onNext() : setTried(true))}
        style={styles.field}
        accessibilityLabel="First name"
      />
      <Text style={type.caption}>
        {tried && !valid ? 'Enter a first name to continue.' : 'Guardians see it in alerts. It stays on this phone and isn’t written to your record.'}
      </Text>
      <View style={{flexGrow: 1}} />
      <Key label="Continue" variant={valid ? 'signal' : 'plain'} onPress={() => (valid ? onNext() : setTried(true))} />
    </View>
  );
}

function DuressIntro({onBack, onNext}: {onBack: () => void; onNext: () => void}) {
  return (
    <View style={styles.screen}>
      <TopAppBar title="03 / 04" onBack={onBack} />
      <Text style={type.title} accessibilityRole="header">
        Now a second PIN
      </Text>
      <Text style={type.body}>
        Use it if someone is forcing you to open VIGIL. Every screen looks exactly as it does with your everyday PIN, and
        your guardians are told you need help.
      </Text>
      <Panel>
        <Text style={type.label}>Choose one you’ll remember under stress</Text>
        <Text style={[type.body, {marginTop: space.xs}]}>
          It works at every PIN prompt: check-ins, pausing listening and opening your record.
        </Text>
      </Panel>
      <View style={{flexGrow: 1}} />
      <Key label="Choose second PIN" variant="signal" onPress={onNext} />
    </View>
  );
}

type Phase = 'idle' | 'working' | 'made' | 'failed';

function CreateRecord({name, pin, duress, onDone}: {name: string; pin: string; duress: string; onDone: () => void}) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState('');
  const [d, setD] = useState<Delivery>(device.delivery());
  useEffect(() => {
    const off = device.onDelivery(setD);
    return () => {
      off();
    };
  }, []);

  const create = async () => {
    setPhase('working');
    setError('');
    try {
      await device.setPins(pin, duress);
      await device.register(name.trim(), version);
      await device.flush();
      setPhase('made');
    } catch (e) {
      setError(String(e instanceof Error ? e.message : e));
      setPhase('failed');
    }
  };

  const sent = d.received > 0;
  return (
    <View style={styles.screen}>
      <Text style={styles.stepMarkLeft}>04 / 04</Text>
      <Text style={type.title} accessibilityRole="header">
        Start your record
      </Text>
      <Text style={type.body}>
        Your record is a chain of entries: each sound heard, each check, each alert. Each entry is signed by a key that never
        leaves this phone, and anyone can check that nothing in the chain was changed.
      </Text>

      {phase === 'made' || (phase === 'working' && sent) ? (
        <Panel>
          <Readout
            label="First entry"
            value={sent ? 'received' : device.simulated ? 'simulated' : 'on this phone'}
            lamp={<Lamp tone={sent ? 'green' : 'unlit'} />}
          />
          <Rule />
          <Readout label="Record" value={device.profile?.subjectId ?? '—'} />
          {!sent && !device.simulated ? (
            <Text style={[type.caption, {marginTop: space.sm}]}>
              Saved and signed on this phone. It sends when the server can be reached.
              {d.lastError ? `\n${d.lastError}` : ''}
            </Text>
          ) : null}
        </Panel>
      ) : null}

      {phase === 'failed' ? (
        <Text style={[type.body, {color: colors.textTitle}]} accessibilityLiveRegion="polite">
          The record couldn’t be created on this phone: {error}
        </Text>
      ) : null}

      <View style={{flexGrow: 1}} />
      {phase === 'made' ? (
        <Key label="Done" variant="signal" onPress={onDone} />
      ) : (
        <Key label={phase === 'working' ? 'Creating…' : phase === 'failed' ? 'Try again' : 'Create my record'} variant="signal" onPress={phase === 'working' ? () => undefined : create} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {flexGrow: 1, padding: space.lg, paddingTop: space.md + TOP_INSET, width: '100%', maxWidth: 560, alignSelf: 'center'},
  screen: {flexGrow: 1, gap: space.md},
  flat: {flexGrow: 1, justifyContent: 'center', padding: space.lg, paddingVertical: space.xl, paddingTop: space.xl + TOP_INSET},
  wordmark: {fontFamily: fonts.bold, fontSize: 15, letterSpacing: 3, color: colors.textTitle, minHeight: TOUCH, textAlignVertical: 'center', paddingTop: 14},
  rowHeader: {flexDirection: 'row', alignItems: 'center', gap: 10},
  noteRow: {flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, paddingHorizontal: 4},
  stepRow: {flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 36},
  stepIndex: {fontFamily: fonts.mono, fontSize: 13, color: colors.cobaltInk, width: 22},
  stepMark: {fontFamily: fonts.mono, fontSize: 13, color: colors.textDim, textAlign: 'center', marginBottom: space.md},
  stepMarkLeft: {fontFamily: fonts.mono, fontSize: 13, color: colors.textDim, minHeight: TOUCH, paddingTop: 14},
  note: {...type.body, color: colors.textTitle, textAlign: 'center', minHeight: 48, marginTop: space.sm, marginBottom: space.sm},
  field: {
    minHeight: 56,
    borderRadius: radii.key,
    borderWidth: 1,
    borderColor: colors.controlEdge,
    backgroundColor: colors.keyFace,
    paddingHorizontal: space.md,
    fontFamily: fonts.regular,
    fontSize: 18,
    color: colors.textTitle,
  },
  sim: {...type.caption, fontSize: 12, textAlign: 'center', marginTop: space.md},
  simId: {fontFamily: fonts.mono, fontSize: 11},
});
