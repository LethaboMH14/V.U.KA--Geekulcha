/**
 * Mutarisi's sign-up flow (feature/ui), ported into VIGIL: create your
 * account (Google, email or phone), phone number, verify code, your name,
 * permissions, and invite guardians.
 *
 * Accounts are not live yet (Firebase sign-in comes later). Until then the
 * contact detail is kept on this phone only, is never sent to the server and
 * never enters the record; the code step is SIMULATED, exactly as in his
 * build. The member's identity stays the key made on this phone.
 */
import React, {useEffect, useState} from 'react';
import {AppState, Linking, PermissionsAndroid, Platform, StyleSheet, Text, TextInput, View} from 'react-native';
import {Eyebrow, Key, Lamp, Panel, QuietKey, TopAppBar} from './components';
import {colors, fonts, radii, space, type} from './theme';
import {canFullScreen, openFullScreenSettings} from '../sensors/detection';
import {askLocation} from '../sensors/location';

export type Account = {kind: 'google' | 'email' | 'phone'; contact: string; verified: false};

export const TOTAL_STEPS = 8;
export const StepMark = ({n}: {n: number}) => <Text style={styles.stepMark}>{`STEP ${n} OF ${TOTAL_STEPS}`}</Text>;
const Simulated = ({children}: {children: string}) => <Text style={styles.simTag}>{children}</Text>;

/** Step 2: how to sign up. */
export function AccountStep({onChoose, onBack}: {onChoose: (k: Account['kind']) => void; onBack: () => void}) {
  return (
    <View style={styles.screen}>
      <TopAppBar title="" onBack={onBack} />
      <StepMark n={2} />
      <Text style={type.display} accessibilityRole="header">
        Create your account
      </Text>
      <Text style={type.body}>Choose how you'd like to sign up. With Google or email, your mobile number is optional.</Text>
      <View style={{gap: 10, marginTop: space.sm}}>
        <Key label="Continue with Google" variant="plain" arrow onPress={() => onChoose('google')} />
        <Key label="Sign up with email" variant="plain" arrow onPress={() => onChoose('email')} />
        <Key label="Use your phone number" variant="signal" arrow onPress={() => onChoose('phone')} />
      </View>
      <Text style={type.caption}>VIGIL never asks for your Google password. Whichever you choose, your identity in VIGIL is a key made on this phone.</Text>
      <Simulated>GOOGLE AND EMAIL SIGN-IN GO LIVE WITH FIREBASE · FOR NOW KEPT ON THIS PHONE ONLY</Simulated>
    </View>
  );
}

/** Step 3 (phone): a South African mobile number, as Mutarisi validates it. */
export function PhoneStep({onNext, onSkip, onBack}: {onNext: (msisdn: string) => void; onSkip: () => void; onBack: () => void}) {
  const [digits, setDigits] = useState('');
  const [tried, setTried] = useState(false);
  const valid = /^[1-9][0-9]{8}$/.test(digits);
  return (
    <View style={styles.screen}>
      <TopAppBar title="" onBack={onBack} />
      <StepMark n={3} />
      <Text style={type.display} accessibilityRole="header">
        Phone number
      </Text>
      <Text style={type.body}>We'll text a code to check it's really you.</Text>
      <Text style={type.label}>Mobile number</Text>
      <View style={styles.phoneRow}>
        <Text style={styles.prefix}>+27</Text>
        <TextInput
          value={digits}
          onChangeText={t => setDigits(t.replace(/\D/g, '').slice(0, 9))}
          placeholder="82 555 0101"
          placeholderTextColor={colors.textDim}
          keyboardType="phone-pad"
          autoComplete="tel"
          style={[styles.field, {flex: 1}]}
          accessibilityLabel="Mobile number"
        />
      </View>
      <Text style={type.caption}>
        {tried && !valid
          ? 'Enter a valid South African mobile number — 9 digits, not starting with 0.'
          : 'Kept on this phone only. Nothing is sent until live sign-in.'}
      </Text>
      <View style={{flexGrow: 1}} />
      <Key label="Send code" variant={valid ? 'signal' : 'plain'} onPress={() => (valid ? onNext(`+27${digits}`) : setTried(true))} />
      <QuietKey label="Skip for now" onPress={onSkip} />
    </View>
  );
}

/** Step 3 (Google or email): the address, kept on this phone. */
export function EmailStep({google, onNext, onBack}: {google: boolean; onNext: (email: string) => void; onBack: () => void}) {
  const [email, setEmail] = useState('');
  const [tried, setTried] = useState(false);
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  return (
    <View style={styles.screen}>
      <TopAppBar title="" onBack={onBack} />
      <StepMark n={3} />
      <Text style={type.display} accessibilityRole="header">
        {google ? 'Your Google account' : 'Sign up with email'}
      </Text>
      <Text style={type.body}>{google ? 'The Google account to sign in with.' : "We'll send a code to check it's really you."}</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="thandi@example.com"
        placeholderTextColor={colors.textDim}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        style={styles.field}
        accessibilityLabel="Email address"
      />
      <Text style={type.caption}>{tried && !valid ? 'Enter a valid email address.' : 'Kept on this phone. Nothing is sent until live sign-in.'}</Text>
      <Simulated>{google ? 'SIMULATED · GOOGLE SIGN-IN GOES LIVE WITH FIREBASE' : 'SIMULATED · NO EMAIL IS SENT YET'}</Simulated>
      <View style={{flexGrow: 1}} />
      <Key label="Continue" variant={valid ? 'signal' : 'plain'} onPress={() => (valid ? onNext(email.trim()) : setTried(true))} />
    </View>
  );
}

/** Step 4: verify the code (SIMULATED, as in Mutarisi's build). */
export function CodeStep({via, onNext, onBack}: {via: 'sms' | 'email'; onNext: () => void; onBack: () => void}) {
  const [code, setCode] = useState('');
  const valid = /^\d{6}$/.test(code);
  return (
    <View style={styles.screen}>
      <TopAppBar title="" onBack={onBack} />
      <StepMark n={4} />
      <Text style={type.display} accessibilityRole="header">
        Verify code
      </Text>
      <Text style={type.body}>{via === 'sms' ? 'Enter the 6-digit code we sent by SMS.' : 'Enter the 6-digit code we sent by email.'}</Text>
      <Simulated>SIMULATED · NO CODE IS SENT · ANY 6 DIGITS CONTINUE</Simulated>
      <TextInput
        value={code}
        onChangeText={t => setCode(t.replace(/\D/g, '').slice(0, 6))}
        keyboardType="number-pad"
        autoComplete="sms-otp"
        textContentType="oneTimeCode"
        placeholder="••••••"
        placeholderTextColor={colors.textDim}
        style={[styles.field, styles.code]}
        accessibilityLabel="Six-digit code"
      />
      <View style={{flexGrow: 1}} />
      <Key label="Continue" variant={valid ? 'signal' : 'plain'} onPress={() => valid && onNext()} />
      <QuietKey label="Resend code" onPress={() => setCode('')} />
    </View>
  );
}

type PermState = 'granted' | 'needed' | 'unavailable';

/** Step 6: what VIGIL needs, each asked for here, each shown as it stands. */
export function PermissionsStep({onNext, onBack}: {onNext: () => void; onBack: () => void}) {
  const [mic, setMic] = useState<PermState>('needed');
  const [notes, setNotes] = useState<PermState>('needed');
  const [loc, setLoc] = useState<PermState>('needed');
  const [full, setFull] = useState<PermState>('needed');
  /** Permissions Android will no longer ask for ("Don't ask again"): only Settings can grant them. */
  const [blocked, setBlocked] = useState<string[]>([]);

  const refresh = async () => {
    if (Platform.OS !== 'android') {
      [setMic, setNotes, setLoc, setFull].forEach(f => f('unavailable'));
      return;
    }
    const has = (p: string) => PermissionsAndroid.check(p as never).then(ok => (ok ? 'granted' : 'needed') as PermState);
    setMic(await has(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO));
    setNotes(Platform.Version >= 33 ? await has(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS) : 'granted');
    setLoc(await has(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION));
    setFull((await canFullScreen()) ? 'granted' : 'needed');
  };
  useEffect(() => {
    void refresh();
    const sub = AppState.addEventListener('change', s => s === 'active' && void refresh());
    return () => sub.remove();
  }, []);

  const ask = async (p: string) => {
    const r = await PermissionsAndroid.request(p as never).catch(() => undefined);
    if (r === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) setBlocked(b => (b.includes(p) ? b : [...b, p]));
    await refresh();
  };
  const settingsOnly = (p: string, state: PermState) => state === 'needed' && blocked.includes(p);
  const rows: {title: string; why: string; state: PermState; onPress: () => void; required: boolean; settings?: boolean}[] = [
    {title: 'Microphone', why: 'To listen for trouble. Sound is judged on this phone and discarded within three seconds.', state: mic, onPress: () => void ask(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO), required: true, settings: settingsOnly(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, mic)},
    {title: 'Notifications', why: 'So a check-in can reach you, and VIGIL can show that it is listening.', state: notes, onPress: () => void ask(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS), required: true, settings: settingsOnly(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS, notes)},
    {title: 'Location', why: 'Only for 30 minutes after a check-in, and your guardians see it only if they were alerted.', state: loc, onPress: () => void askLocation().then(refresh), required: false},
    {title: 'Full-screen check-ins', why: 'So a check-in can open over other apps and the lock screen.', state: full, onPress: openFullScreenSettings, required: false},
  ];
  const ready = mic !== 'needed' && notes !== 'needed';
  return (
    <View style={styles.screen}>
      <TopAppBar title="" onBack={onBack} />
      <StepMark n={6} />
      <Text style={type.display} accessibilityRole="header">
        Permissions
      </Text>
      <Text style={type.body}>VIGIL needs a few permissions to listen and to reach you.</Text>
      <Panel>
        <View style={{gap: space.md}}>
          {rows.map(r => (
            <View key={r.title} style={styles.permRow}>
              <Lamp tone={r.state === 'granted' ? 'green' : 'unlit'} />
              <View style={{flex: 1}}>
                <Text style={type.label}>
                  {r.title}
                  {r.required ? '' : ' (optional)'}
                </Text>
                <Text style={[type.caption, {marginTop: 2}]}>{r.why}</Text>
              </View>
              {r.state === 'needed' ? <QuietKey label={r.settings ? 'Open settings' : 'Allow'} onPress={r.settings ? () => void Linking.openSettings() : r.onPress} /> : <Text style={type.caption}>{r.state === 'granted' ? 'Allowed' : '—'}</Text>}
            </View>
          ))}
        </View>
      </Panel>
      {full === 'needed' ? (
        <Text style={type.caption}>Full-screen alerts aren't allowed on this phone yet. Your check-in will arrive as a high-priority notification instead.</Text>
      ) : null}
      <View style={{flexGrow: 1}} />
      <Key label="Continue" variant={ready ? 'signal' : 'plain'} onPress={() => ready && onNext()} />
      {!ready ? (
        <Text style={type.caption}>
          {blocked.length ? 'Android won\u2019t ask again. Tap Open settings, allow it under Permissions, then come back.' : 'Allow the microphone and notifications to continue.'}
        </Text>
      ) : null}
    </View>
  );
}

/** Step 8: invite guardians (the real, PIN-gated invite), then finish. */
export function InviteStep({onInvite, onFinish}: {onInvite: () => void; onFinish: () => void}) {
  return (
    <View style={styles.screen}>
      <StepMark n={8} />
      <Text style={type.display} accessibilityRole="header">
        Invite guardians
      </Text>
      <Panel>
        <Eyebrow>Guardians</Eyebrow>
        <Text style={[type.body, {marginTop: space.sm}]}>We recommend at least two guardians who don't live with you.</Text>
        <View style={{marginTop: space.md}}>
          <Key label="Invite a guardian" variant="signal" arrow onPress={onInvite} />
        </View>
      </Panel>
      <Panel>
        <Text style={type.label}>What your guardians will see</Text>
        <Text style={[type.body, {marginTop: space.xs}]}>
          A guardian only hears from VIGIL if you don't answer a check-in, or if you use your second PIN. They'll see your name, why
          you were alerted, and where your phone is if it was shared — never your day-to-day movement.
        </Text>
      </Panel>
      <View style={{flexGrow: 1}} />
      <Key label="Finish setup" variant="plain" onPress={onFinish} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flexGrow: 1, gap: space.md},
  stepMark: {fontFamily: fonts.mono, fontSize: 12, letterSpacing: 1, color: colors.textDim},
  simTag: {fontFamily: fonts.mono, fontSize: 11, letterSpacing: 0.5, color: colors.amberText},
  phoneRow: {flexDirection: 'row', alignItems: 'center', gap: space.sm},
  prefix: {fontFamily: fonts.medium, fontSize: 18, color: colors.textTitle, paddingHorizontal: 4},
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
  code: {fontFamily: fonts.mono, fontSize: 24, letterSpacing: 8, textAlign: 'center'},
  permRow: {flexDirection: 'row', alignItems: 'center', gap: space.md},
});
