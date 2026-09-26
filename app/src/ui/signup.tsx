/**
 * Mutarisi's sign-up flow (feature/ui), ported into VIGIL: create your
 * account (Google, email or phone), phone number, verify code, your name,
 * permissions, and invite guardians.
 *
 * In a build connected to Firebase, "Continue with Google" is a real Google
 * sign-in through Firebase Authentication (src/api/google.ts): Google and
 * Firebase receive it and confirm the email. Otherwise Google is SIMULATED and
 * says so. Either way the contact detail is kept on this phone, is never sent
 * to the VIGIL server and never enters the record; the code step is
 * SIMULATED, exactly as in his build. The member's identity stays the key
 * made on this phone.
 *
 * As in his 2026-09-26 build: the Terms and Privacy notice must be accepted
 * before any option works, the number is optional on the Google and email
 * routes, and the code can go by text or by email. The email route sets a
 * password (twice, at least 8 characters), kept only as a salted hash; the
 * channel the code went to becomes the default for password-reset codes.
 */
import React, {useEffect, useState} from 'react';
import {AppState, Linking, PermissionsAndroid, Platform, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {Eyebrow, Key, Lamp, Panel, QuietKey, TopAppBar} from './components';
import {colors, fonts, radii, space, type} from './theme';
import {canFullScreen, openFullScreenSettings} from '../sensors/detection';
import {DocumentText, PasswordFields, passwordProblem, type DocumentId} from './account';
import {askLocation} from '../sensors/location';
import type {AccountDetails} from '../api/device';
import {googleAvailable, googleSignIn, type GoogleAccount} from '../api/google';

/**
 * Sign-up details, kept on this phone only. `contact` is the route's own
 * detail: the email on Google and email, the +27 number on the phone route.
 * `phone` is the optional number on Google and email; `email` is an address
 * added at the code step on the phone route. `verified` is true only after a
 * real Google sign-in (device.ts AccountDetails).
 */
export type Account = AccountDetails;
export type Channel = 'sms' | 'email';

export const TOTAL_STEPS = 8;
export const StepMark = ({n}: {n: number}) => <Text style={styles.stepMark}>{`STEP ${n} OF ${TOTAL_STEPS}`}</Text>;
const Simulated = ({children}: {children: string}) => <Text style={styles.simTag}>{children}</Text>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** South African mobile numbers: 9 digits after +27, not starting with 0. */
const SA_MOBILE = /^[1-9][0-9]{8}$/;
const BAD_EMAIL = 'Enter a valid email address.';
const BAD_MOBILE = 'Enter a valid South African mobile number — 9 digits, not starting with 0.';

/**
 * Step 2: how to sign up. Nothing works until the Terms and Privacy notice
 * are accepted. Both are drafts (account.tsx DOCUMENTS): no terms exist yet,
 * and the privacy notice is PROPOSED. They say so; neither is invented.
 */
export function AccountStep({
  agreed,
  onAgree,
  onChoose,
  onBack,
  onSignIn,
  onGoogle,
}: {
  agreed: boolean;
  onAgree: (agreed: boolean) => void;
  onChoose: (k: Account['kind']) => void;
  onBack: () => void;
  /** "Already have an account? Sign in". */
  onSignIn?: () => void;
  /** A real Google sign-in succeeded (Firebase configured). Without it, Google is the SIMULATED route via `onChoose`. */
  onGoogle?: (a: GoogleAccount) => void;
}) {
  const [doc, setDoc] = useState<Extract<DocumentId, 'terms' | 'privacy'> | null>(null);
  const label = 'I agree to the Terms and the Privacy notice';
  const live = Boolean(onGoogle) && googleAvailable();
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState('');
  const google = async () => {
    if (!live || !onGoogle) return onChoose('google');
    if (busy) return;
    setBusy(true);
    setProblem('');
    const r = await googleSignIn();
    setBusy(false);
    if (r.ok) onGoogle(r.account);
    else setProblem(r.message);
  };
  return (
    <View style={styles.screen}>
      <TopAppBar title="" onBack={onBack} />
      <StepMark n={2} />
      <Text style={type.display} accessibilityRole="header">
        Create your account
      </Text>
      <Text style={type.body}>Choose how you'd like to sign up. With Google or email, your mobile number is optional.</Text>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{checked: agreed}}
        accessibilityLabel={label}
        onPress={() => onAgree(!agreed)}
        hitSlop={4}
        style={styles.consentRow}>
        <View style={[styles.box, agreed && styles.boxOn]}>{agreed ? <Text style={styles.tick}>✓</Text> : null}</View>
        <Text style={[type.body, {flex: 1, color: colors.textTitle}]}>{label}</Text>
      </Pressable>
      <View style={styles.docLinks}>
        <QuietKey label="Terms" onPress={() => setDoc(doc === 'terms' ? null : 'terms')} />
        <QuietKey label="Privacy notice" onPress={() => setDoc(doc === 'privacy' ? null : 'privacy')} />
      </View>
      {doc ? (
        <Panel>
          <DocumentText id={doc} />
          <View style={{marginTop: space.sm}}>
            <QuietKey label="Close" onPress={() => setDoc(null)} />
          </View>
        </Panel>
      ) : null}
      <View style={{gap: 10, marginTop: space.sm}}>
        <Key label={busy ? 'Opening Google…' : 'Continue with Google'} variant="plain" arrow disabled={!agreed} onPress={() => void google()} />
        <Key label="Sign up with email" variant="plain" arrow disabled={!agreed} onPress={() => onChoose('email')} />
        <Key label="Use your phone number" variant="signal" arrow disabled={!agreed} onPress={() => onChoose('phone')} />
      </View>
      {!agreed ? <Text style={type.caption}>Tick the box above to choose.</Text> : null}
      {problem ? (
        <Text style={[type.body, {color: colors.textTitle}]} accessibilityLiveRegion="polite">
          {problem}
        </Text>
      ) : null}
      <Text style={type.caption}>VIGIL never asks for your Google password. Whichever you choose, your identity in VIGIL is a key made on this phone.</Text>
      {live ? (
        <>
          <Text style={type.caption}>
            With Google, Google and Firebase Authentication check your email and keep a sign-in record of it. VIGIL's own server never receives it, and it never enters your record.
          </Text>
          <Simulated>EMAIL SIGN-UP IS NOT LIVE YET · KEPT ON THIS PHONE ONLY</Simulated>
        </>
      ) : (
        <Simulated>GOOGLE AND EMAIL SIGN-IN GO LIVE WITH FIREBASE · FOR NOW KEPT ON THIS PHONE ONLY</Simulated>
      )}
      {onSignIn ? <QuietKey label="Already have an account? Sign in" onPress={onSignIn} /> : null}
    </View>
  );
}

/**
 * Step 3: a South African mobile number, as Mutarisi validates it. Required on
 * the phone route; optional after Google or email (`optional` names the
 * route), where Skip leaves it out and the code goes by email instead.
 */
export function PhoneStep({
  optional,
  signedUpAs,
  verified,
  initial = '',
  onNext,
  onSkip,
  onBack,
}: {
  optional?: 'google' | 'email';
  signedUpAs?: string;
  /** Google confirmed `signedUpAs` (a real sign-in), rather than the SIMULATED route. */
  verified?: boolean;
  initial?: string;
  onNext: (msisdn: string) => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  const [digits, setDigits] = useState(initial.replace(/^\+27/, ''));
  const [tried, setTried] = useState(false);
  const valid = SA_MOBILE.test(digits);
  const intro = !optional
    ? "We'll text a code to check it's really you."
    : optional === 'email'
      ? "Optional. Add your mobile number and we'll text the code there, or skip and we'll email it."
      : "Optional. Add your mobile number and we'll text a code to check it, or skip for now.";
  return (
    <View style={styles.screen}>
      <TopAppBar title="" onBack={onBack} />
      <StepMark n={3} />
      <Text style={type.display} accessibilityRole="header">
        Phone number
      </Text>
      <Text style={type.body}>{intro}</Text>
      {optional && signedUpAs ? (
        <Text style={type.caption}>{optional === 'google' ? `Google · ${signedUpAs} · ${verified ? 'confirmed by Google' : 'simulated'}` : `Email · ${signedUpAs}`}</Text>
      ) : null}
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
      <Text style={type.caption}>{tried && !valid ? BAD_MOBILE : 'Kept on this phone only. Nothing is sent until live sign-in.'}</Text>
      <View style={{flexGrow: 1}} />
      <Key label="Send code" variant={valid ? 'signal' : 'plain'} onPress={() => (valid ? onNext(`+27${digits}`) : setTried(true))} />
      {optional ? <QuietKey label="Skip for now" onPress={onSkip} /> : null}
    </View>
  );
}

/**
 * Step 3 (Google or email): the address, kept on this phone. The email route
 * also sets a password, twice; `onNext` gets it once and the caller keeps
 * only its salted hash. It is cleared from this screen as it leaves.
 */
export function EmailStep({google, initial = '', onNext, onBack}: {google: boolean; initial?: string; onNext: (email: string, password?: string) => void; onBack: () => void}) {
  const [email, setEmail] = useState(initial);
  const [password, setPassword] = useState('');
  const [again, setAgain] = useState('');
  const [tried, setTried] = useState(false);
  const emailOk = EMAIL.test(email.trim());
  const problem = !emailOk ? BAD_EMAIL : google ? null : passwordProblem(password, again);
  const valid = problem === null;
  const next = () => {
    if (!valid) return setTried(true);
    const pw = google ? undefined : password;
    setPassword('');
    setAgain('');
    onNext(email.trim(), pw);
  };
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
      {!google ? <PasswordFields value={password} onChange={setPassword} confirm={again} onConfirm={setAgain} /> : null}
      <Text style={type.caption} accessibilityLiveRegion="polite">
        {tried && problem ? problem : google ? 'Kept on this phone. Nothing is sent until live sign-in.' : 'Kept on this phone. The password is saved only as a salted hash, never as typed.'}
      </Text>
      <Simulated>{google ? 'SIMULATED · GOOGLE SIGN-IN GOES LIVE WITH FIREBASE' : 'SIMULATED · NO EMAIL IS SENT YET'}</Simulated>
      <View style={{flexGrow: 1}} />
      <Key label="Continue" variant={valid ? 'signal' : 'plain'} onPress={next} />
    </View>
  );
}

/**
 * Step 4: verify the code (SIMULATED, as in Mutarisi's build). With `choose`,
 * the member picks text or email; a skipped number starts on email. Picking a
 * channel with nothing on file asks for it here (validated), hands it to
 * `onAdd`, and "sends" there. Nothing is sent.
 */
export function CodeStep({
  phone,
  email,
  choose,
  onAdd,
  onNext,
  onBack,
}: {
  phone?: string;
  email?: string;
  choose: boolean;
  onAdd: (channel: Channel, value: string) => void;
  /** With the channel the code went to: the default for password-reset codes. */
  onNext: (via: Channel) => void;
  onBack: () => void;
}) {
  const [code, setCode] = useState('');
  const [via, setVia] = useState<Channel>(phone ? 'sms' : 'email');
  const [asking, setAsking] = useState<Channel | null>(null);
  const [entry, setEntry] = useState('');
  const [tried, setTried] = useState(false);
  const valid = /^\d{6}$/.test(code);
  const entryValid = asking === 'email' ? EMAIL.test(entry.trim()) : SA_MOBILE.test(entry);

  const pick = (c: Channel) => {
    if (c === via && !asking) return;
    setEntry('');
    setTried(false);
    if (!(c === 'sms' ? phone : email)) {
      setAsking(c);
      return;
    }
    setAsking(null);
    setVia(c);
    setCode(''); // a new code "goes" to the newly chosen place
  };
  const send = () => {
    if (!asking) return;
    if (!entryValid) {
      setTried(true);
      return;
    }
    onAdd(asking, asking === 'email' ? entry.trim() : `+27${entry}`);
    setVia(asking);
    setAsking(null);
    setCode('');
  };

  return (
    <View style={styles.screen}>
      <TopAppBar title="" onBack={onBack} />
      <StepMark n={4} />
      <Text style={type.display} accessibilityRole="header">
        Verify code
      </Text>
      {choose ? (
        <View style={styles.channels} accessibilityRole="radiogroup">
          {(['sms', 'email'] as const).map(c => {
            const on = (asking ?? via) === c;
            return (
              <Pressable
                key={c}
                accessibilityRole="radio"
                accessibilityState={{selected: on}}
                onPress={() => pick(c)}
                style={[styles.channel, on && styles.channelOn]}>
                <Text style={[type.label, {color: on ? colors.textTitle : colors.textSecondary}]}>{c === 'sms' ? 'Text message' : 'Email'}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
      {asking ? (
        <Panel>
          <Text style={type.label}>{asking === 'email' ? 'Add your email' : 'Add your mobile number'}</Text>
          <Text style={[type.body, {marginTop: space.xs}]}>
            {asking === 'email' ? "We'll send the code to this address." : "We'll text the code to this number: +27, then 9 digits not starting with 0."}
          </Text>
          <View style={[styles.phoneRow, {marginTop: space.sm}]}>
            {asking === 'sms' ? <Text style={styles.prefix}>+27</Text> : null}
            <TextInput
              value={entry}
              onChangeText={t => setEntry(asking === 'sms' ? t.replace(/\D/g, '').slice(0, 9) : t)}
              placeholder={asking === 'email' ? 'you@example.com' : '82 555 0101'}
              placeholderTextColor={colors.textDim}
              keyboardType={asking === 'email' ? 'email-address' : 'phone-pad'}
              autoCapitalize="none"
              autoComplete={asking === 'email' ? 'email' : 'tel'}
              autoFocus
              style={[styles.field, {flex: 1}]}
              accessibilityLabel={asking === 'email' ? 'Email address' : 'Mobile number'}
            />
          </View>
          <Text style={[type.caption, {marginTop: space.xs}]} accessibilityLiveRegion="polite">
            {tried && !entryValid ? (asking === 'email' ? BAD_EMAIL : BAD_MOBILE) : 'Kept on this phone only.'}
          </Text>
          <View style={{gap: 10, marginTop: space.sm}}>
            <Key label="Send code" variant={entryValid ? 'signal' : 'plain'} onPress={send} />
            <QuietKey
              label="Cancel"
              onPress={() => {
                setAsking(null);
                setTried(false);
              }}
            />
          </View>
        </Panel>
      ) : (
        <>
          <Text style={type.body}>{via === 'sms' ? `Enter the 6-digit code we sent by text to ${phone ?? 'your phone'}.` : `Enter the 6-digit code we sent to ${email ?? 'your email'}.`}</Text>
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
          <Key label="Continue" variant={valid ? 'signal' : 'plain'} onPress={() => valid && onNext(via)} />
          <QuietKey label="Resend code" onPress={() => setCode('')} />
        </>
      )}
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
  consentRow: {flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 48},
  box: {width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: colors.controlEdge, alignItems: 'center', justifyContent: 'center'},
  boxOn: {backgroundColor: colors.action, borderColor: colors.action},
  tick: {fontFamily: fonts.bold, fontSize: 15, lineHeight: 18, color: colors.textInverse},
  docLinks: {flexDirection: 'row', gap: space.lg, marginTop: -space.sm},
  channels: {flexDirection: 'row', gap: space.sm},
  channel: {flex: 1, minHeight: 48, borderRadius: radii.key, borderWidth: 1, borderColor: colors.borderEmphasis, alignItems: 'center', justifyContent: 'center'},
  channelOn: {borderColor: colors.action, borderWidth: 2, backgroundColor: colors.keyFace},
});
