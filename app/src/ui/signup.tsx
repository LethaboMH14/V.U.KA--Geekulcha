/**
 * Mutarisi's sign-up screens (feature/ui, up to 5aa5d24), screen by screen:
 * Create your account (terms first; Google, email or phone), Sign up with
 * email, Phone number, Verify code, Permissions and Invite guardians. His
 * copy is used as written except where a line wouldn't be true of VIGIL;
 * those are noted where they differ. The order lives in signupFlow.ts.
 *
 * In a build connected to Firebase, "Continue with Google" is a real Google
 * sign-in through Firebase Authentication (src/api/google.ts): Google and
 * Firebase receive it and confirm the email. Otherwise it is his SIMULATED
 * chooser, labelled so. Either way the contact details are kept on this
 * phone, are never sent to the VIGIL server and never enter the record; the
 * code step is SIMULATED, exactly as in his build. The member's identity
 * stays the key made on this phone.
 */
import React, {useEffect, useState} from 'react';
import {AppState, Linking, Modal, PermissionsAndroid, Platform, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {Dialog, Eyebrow, Key, Lamp, Panel, QuietKey, TopAppBar} from './components';
import {colors, fonts, radii, space, TOUCH, type} from './theme';
import {canFullScreen, openFullScreenSettings} from '../sensors/detection';
import {DocumentText, PasswordFields, passwordProblem, type DocumentId} from './account';
import type {AccountDetails} from '../api/device';
import {googleAvailable, googleSignIn, SIMULATED_GOOGLE_ACCOUNT, type GoogleAccount} from '../api/google';

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
export const Simulated = ({children}: {children: string}) => <Text style={styles.simTag}>{children}</Text>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** South African mobile numbers: 9 digits after +27, not starting with 0. */
const SA_MOBILE = /^[1-9][0-9]{8}$/;
const BAD_EMAIL = 'Enter a valid email address.';
const BAD_MOBILE = 'Enter a valid South African mobile number — 9 digits, not starting with 0.';
const RESEND_SECONDS = 45;

/** His form error box: shown only when there is something to say. */
export const InlineError = ({children}: {children: string}) =>
  children ? (
    <Text style={styles.error} accessibilityLiveRegion="polite">
      {children}
    </Text>
  ) : null;

const Field = (p: React.ComponentProps<typeof TextInput>) => <TextInput placeholderTextColor={colors.textDim} {...p} style={[styles.field, p.style]} />;

/**
 * His SIMULATED Google chooser ("Choose an account", one fixed example
 * account), shown only when this build has no Firebase. Nothing goes to Google.
 */
export function GoogleChooser({visible, onPick, onClose}: {visible: boolean; onPick: (a: GoogleAccount) => void; onClose: () => void}) {
  const a = SIMULATED_GOOGLE_ACCOUNT;
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.scrim}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessible={false} />
        <View style={styles.sheet} accessibilityViewIsModal>
          <View style={styles.sheetHead}>
            <Text style={[type.dialogTitle, {flex: 1}]} accessibilityRole="header">
              Choose an account
            </Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} hitSlop={8} style={styles.close}>
              <Text style={[type.label, {color: colors.textSecondary}]}>✕</Text>
            </Pressable>
          </View>
          <Simulated>SIMULATED CHOOSER</Simulated>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${a.name}, ${a.email}`}
            onPress={() => onPick(a)}
            android_ripple={{color: colors.ripple}}
            style={styles.accountRow}>
            <View style={styles.avatar}>
              <Text style={[type.label, {color: colors.textInverse}]}>{(a.givenName ?? 'G').charAt(0)}</Text>
            </View>
            <View style={{flex: 1}}>
              <Text style={type.label}>{a.name}</Text>
              <Text style={[type.caption, {marginTop: 2}]}>{a.email}</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

/**
 * Google in a screen: the real sign-in when this build has Firebase, else
 * the SIMULATED chooser. `onAccount` gets the account and whether Google
 * confirmed it. Returns the button handler, its busy flag, a problem to
 * show, and the chooser to render.
 */
export function useGoogle(onAccount: (a: GoogleAccount, verified: boolean) => void) {
  const live = googleAvailable();
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState('');
  const [choosing, setChoosing] = useState(false);
  const start = async () => {
    setProblem('');
    if (!live) return setChoosing(true);
    if (busy) return;
    setBusy(true);
    const r = await googleSignIn();
    setBusy(false);
    if (r.ok) onAccount(r.account, true);
    else setProblem(r.message);
  };
  const chooser = (
    <GoogleChooser
      visible={choosing}
      onClose={() => setChoosing(false)}
      onPick={a => {
        setChoosing(false);
        onAccount(a, false);
      }}
    />
  );
  return {live, busy, problem, start, chooser};
}

/**
 * Step 2, "Create your account". The Terms and Privacy notice must be ticked
 * before any option works. Both are drafts (account.tsx DOCUMENTS): no terms
 * exist yet, and the privacy notice is PROPOSED. They say so.
 */
export function AccountStep({
  agreed,
  onAgree,
  onChoose,
  onGoogle,
  onBack,
  onSignIn,
}: {
  agreed: boolean;
  onAgree: (agreed: boolean) => void;
  onChoose: (k: 'email' | 'phone') => void;
  /** Google chose an account: real (verified) with Firebase, else the SIMULATED chooser's. */
  onGoogle: (a: GoogleAccount, verified: boolean) => void;
  onBack: () => void;
  /** "Already have an account? Sign in". */
  onSignIn: () => void;
}) {
  const [doc, setDoc] = useState<Extract<DocumentId, 'terms' | 'privacy'> | null>(null);
  const label = 'I agree to the Terms and the Privacy notice';
  const google = useGoogle(onGoogle);
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
        <Text style={[type.body, {flex: 1, color: colors.textTitle}]}>
          I agree to the{' '}
          <Text style={styles.link} onPress={() => setDoc(doc === 'terms' ? null : 'terms')} accessibilityRole="link">
            Terms
          </Text>{' '}
          and the{' '}
          <Text style={styles.link} onPress={() => setDoc(doc === 'privacy' ? null : 'privacy')} accessibilityRole="link">
            Privacy notice
          </Text>
        </Text>
      </Pressable>
      {doc ? (
        <Panel>
          <DocumentText id={doc} />
          <View style={{marginTop: space.sm}}>
            <QuietKey label="Close" onPress={() => setDoc(null)} />
          </View>
        </Panel>
      ) : null}
      <View style={{gap: 10, marginTop: space.sm}}>
        <Key label={google.busy ? 'Opening Google…' : 'Continue with Google'} variant="plain" disabled={!agreed} onPress={() => void google.start()} />
        <Key label="Sign up with email" variant="plain" disabled={!agreed} onPress={() => onChoose('email')} />
        <Key label="Use your phone number" variant="signal" disabled={!agreed} onPress={() => onChoose('phone')} />
      </View>
      <InlineError>{google.problem}</InlineError>
      <Text style={type.caption}>With Google we use your name and email to set up your profile. We never see your Google password.</Text>
      {google.live ? (
        // Kept (true of VIGIL): who receives a real Google sign-in, and who doesn't.
        <Text style={type.caption}>
          Google and Firebase Authentication check your email and keep a sign-in record of it. VIGIL's own server never receives it, and it never enters your record.
        </Text>
      ) : (
        <Simulated>SIMULATED GOOGLE · GOES LIVE WITH FIREBASE · KEPT ON THIS PHONE ONLY</Simulated>
      )}
      <QuietKey label="Already have an account? Sign in" onPress={onSignIn} />
      {google.chooser}
    </View>
  );
}

/**
 * "Sign up with email": the member's own email and a password (twice, at
 * least 8 characters). `onNext` gets the password once; the caller keeps
 * only its salted hash, and this screen clears it as it leaves.
 */
export function EmailStep({initial = '', onNext, onBack}: {initial?: string; onNext: (email: string, password: string) => void; onBack: () => void}) {
  const [email, setEmail] = useState(initial);
  const [password, setPassword] = useState('');
  const [again, setAgain] = useState('');
  const [error, setError] = useState('');
  const next = () => {
    const problem = !EMAIL.test(email.trim()) ? BAD_EMAIL : passwordProblem(password, again);
    if (problem) return setError(problem);
    setError('');
    const pw = password;
    setPassword('');
    setAgain('');
    onNext(email.trim(), pw);
  };
  return (
    <View style={styles.screen}>
      <TopAppBar title="" onBack={onBack} />
      <StepMark n={2} />
      <Text style={type.display} accessibilityRole="header">
        Sign up with email
      </Text>
      <Text style={type.label}>Email</Text>
      <Field
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.co.za"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        accessibilityLabel="Email"
      />
      <PasswordFields value={password} onChange={setPassword} confirm={again} onConfirm={setAgain} hint="At least 8 characters." />
      <InlineError>{error}</InlineError>
      <Simulated>SIMULATED · NO ACCOUNT SERVER YET · KEPT ON THIS PHONE</Simulated>
      <View style={{flexGrow: 1}} />
      <Key label="Continue" variant="signal" onPress={next} />
    </View>
  );
}

/**
 * Step 3, "Phone number", validated as he validates it. Required on the phone
 * route and at sign-in; optional after Google or email ("Skip for now"), when
 * the code goes by email instead.
 */
export function PhoneStep({
  optional,
  signedUpAs,
  initial = '',
  onNext,
  onSkip,
  onBack,
}: {
  optional: boolean;
  /** The account line on the optional screen: "Google · … · simulated" or "Email · …". */
  signedUpAs?: string;
  initial?: string;
  onNext: (msisdn: string) => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  const [digits, setDigits] = useState(initial.replace(/^\+27/, ''));
  const [error, setError] = useState(false);
  return (
    <View style={styles.screen}>
      <TopAppBar title="" onBack={onBack} />
      <StepMark n={3} />
      <Text style={type.display} accessibilityRole="header">
        Phone number
      </Text>
      <Text style={type.body}>
        {optional ? "Optional. Add your mobile number and we'll text the code there, or skip and we'll email it." : "We'll text a code to check it's really you."}
      </Text>
      {optional && signedUpAs ? <Text style={type.caption}>{signedUpAs}</Text> : null}
      <Text style={type.label}>Mobile number</Text>
      <View style={styles.phoneRow}>
        <Text style={styles.prefix}>+27</Text>
        <Field
          value={digits}
          onChangeText={t => setDigits(t.replace(/\D/g, '').slice(0, 9))}
          placeholder="82 555 0101"
          keyboardType="phone-pad"
          autoComplete="tel"
          style={[styles.mono, {flex: 1}]}
          accessibilityLabel="Mobile number"
        />
      </View>
      <InlineError>{error ? BAD_MOBILE : ''}</InlineError>
      {/* Kept: his "One account per number. SIMs are RICA-registered." isn't enforced here, so this says what is true. */}
      <Text style={type.caption}>Kept on this phone only. Nothing is sent until live sign-in.</Text>
      <View style={{flexGrow: 1}} />
      <Key
        label="Send code"
        variant="signal"
        onPress={() => {
          if (!SA_MOBILE.test(digits)) return setError(true);
          setError(false);
          onNext(`+27${digits}`);
        }}
      />
      {optional ? <QuietKey label="Skip for now" onPress={onSkip} /> : null}
    </View>
  );
}

/**
 * Step 4, "Verify code" (SIMULATED, as in his build: any 6 digits continue,
 * and the sixth digit submits). With `choose`, the member picks text or
 * email; a skipped number starts on email. Picking a channel with nothing on
 * file opens his "Add your email" / "Add your mobile number" pop-up, checked
 * before it closes, then "sends" there. Nothing is sent.
 */
export function CodeStep({
  phone,
  email,
  choose,
  busy = false,
  onAdd,
  onNext,
  onBack,
}: {
  phone?: string;
  email?: string;
  choose: boolean;
  /** The caller is checking the code (sign-in): digits are ignored meanwhile. */
  busy?: boolean;
  onAdd: (channel: Channel, value: string) => void;
  /** With the channel the code went to: the default for password-reset codes. */
  onNext: (via: Channel) => void;
  onBack: () => void;
}) {
  const [code, setCode] = useState('');
  const [via, setVia] = useState<Channel>(phone ? 'sms' : 'email');
  const [asking, setAsking] = useState<Channel | null>(null);
  const [entry, setEntry] = useState('');
  const [entryError, setEntryError] = useState('');
  const [left, setLeft] = useState(RESEND_SECONDS);
  const [sent, setSent] = useState(0);

  // "Resend in 0:45", counting down from each send.
  useEffect(() => {
    setLeft(RESEND_SECONDS);
    const t = setInterval(() => setLeft(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [sent]);

  const resend = () => {
    // SIMULATED: nothing is sent; this only restarts the countdown.
    setCode('');
    setSent(n => n + 1);
  };
  const pick = (c: Channel) => {
    if (c === via) return;
    if (!(c === 'sms' ? phone : email)) {
      setEntry('');
      setEntryError('');
      setAsking(c);
      return;
    }
    setVia(c);
    resend(); // a new code "goes" to the newly chosen place
  };
  const add = () => {
    if (!asking) return;
    const text = entry.trim();
    const ok = asking === 'email' ? EMAIL.test(text) : SA_MOBILE.test(text);
    if (!ok) return setEntryError(asking === 'email' ? BAD_EMAIL : BAD_MOBILE);
    onAdd(asking, asking === 'email' ? text : `+27${text}`);
    setVia(asking);
    setAsking(null);
    resend();
  };
  const type6 = (t: string) => {
    if (busy) return;
    const digits = t.replace(/\D/g, '').slice(0, 6);
    if (digits.length < 6) return setCode(digits);
    setCode('');
    onNext(via);
  };

  return (
    <View style={styles.screen}>
      <TopAppBar title="" onBack={onBack} />
      <StepMark n={4} />
      <Text style={type.display} accessibilityRole="header">
        Verify code
      </Text>
      <Text style={type.body}>{via === 'email' ? `Enter the 6-digit code we sent to ${email ?? 'your email'}.` : `Enter the 6-digit code we sent by text to ${phone ?? 'your phone'}.`}</Text>
      <Simulated>SIMULATED · NO CODE IS SENT · ANY 6 DIGITS CONTINUE</Simulated>
      {choose ? (
        <View style={styles.channels} accessibilityRole="radiogroup">
          {(['sms', 'email'] as const).map(c => {
            const on = via === c;
            return (
              <Pressable key={c} accessibilityRole="radio" accessibilityState={{selected: on}} onPress={() => pick(c)} style={[styles.channel, on && styles.channelOn]}>
                <Text style={[type.label, {color: on ? colors.textTitle : colors.textSecondary}]}>{c === 'sms' ? 'Text message' : 'Email'}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
      <Field
        value={code}
        onChangeText={type6}
        keyboardType="number-pad"
        autoComplete="sms-otp"
        textContentType="oneTimeCode"
        placeholder="••••••"
        style={styles.code}
        accessibilityLabel={`Code, ${code.length} of 6 digits entered`}
      />
      {left > 0 ? (
        <Text style={[type.caption, {textAlign: 'center', fontVariant: ['tabular-nums']}]}>{`Resend in ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`}</Text>
      ) : (
        <QuietKey label="Didn't get it? Resend the code." onPress={resend} />
      )}
      <Dialog
        visible={asking !== null}
        title={asking === 'email' ? 'Add your email' : 'Add your mobile number'}
        confirm="Send code"
        onConfirm={add}
        cancel="Cancel"
        onCancel={() => setAsking(null)}>
        <View style={{gap: space.sm}}>
          <Text style={type.body}>{asking === 'email' ? "We'll send the code to this address." : "We'll text the code to this number: +27, then 9 digits not starting with 0."}</Text>
          <Text style={type.label}>{asking === 'email' ? 'Email' : 'Mobile number'}</Text>
          <View style={styles.phoneRow}>
            {asking === 'sms' ? <Text style={styles.prefix}>+27</Text> : null}
            <Field
              value={entry}
              onChangeText={t => setEntry(asking === 'sms' ? t.replace(/\D/g, '').slice(0, 9) : t)}
              placeholder={asking === 'email' ? 'you@example.com' : '82 555 0101'}
              keyboardType={asking === 'email' ? 'email-address' : 'phone-pad'}
              autoCapitalize="none"
              autoComplete={asking === 'email' ? 'email' : 'tel'}
              autoFocus
              style={{flex: 1}}
              accessibilityLabel={asking === 'email' ? 'Email' : 'Mobile number'}
            />
          </View>
          <InlineError>{entryError}</InlineError>
        </View>
      </Dialog>
    </View>
  );
}

type PermState = 'granted' | 'denied' | 'unasked';
/** Android's API level (0 elsewhere): notifications need asking from 33. */
const API = typeof Platform.Version === 'number' ? Platform.Version : 0;

/**
 * Step 6, "Permissions", as his: Continue asks for everything missing at
 * once; after that, Continue goes on only with the microphone and
 * notifications allowed, and otherwise becomes "Open settings".
 */
export function PermissionsStep({onNext, onBack}: {onNext: () => void; onBack: () => void}) {
  const [asked, setAsked] = useState(false);
  const [mic, setMic] = useState(false);
  const [notes, setNotes] = useState(false);
  const [loc, setLoc] = useState(false);
  const [full, setFull] = useState(true);

  const refresh = async () => {
    if (Platform.OS !== 'android') return;
    const has = (p: string) => PermissionsAndroid.check(p as never).catch(() => false);
    setMic(await has(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO));
    setNotes(API >= 33 ? await has(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS) : true);
    setLoc((await has(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)) || (await has(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION)));
    setFull(await canFullScreen());
  };
  // Re-checked on every return, in case the member comes back from the phone's Settings.
  useEffect(() => {
    void refresh();
    const sub = AppState.addEventListener('change', s => s === 'active' && void refresh());
    return () => sub.remove();
  }, []);

  const missing = () => {
    const P = PermissionsAndroid.PERMISSIONS;
    const out: string[] = [];
    if (!mic) out.push(P.RECORD_AUDIO);
    if (!notes && API >= 33) out.push(P.POST_NOTIFICATIONS);
    if (!loc) out.push(P.ACCESS_FINE_LOCATION, P.ACCESS_COARSE_LOCATION);
    return out;
  };
  const cont = async () => {
    const ask = missing();
    if (Platform.OS === 'android' && !asked && ask.length) {
      await PermissionsAndroid.requestMultiple(ask as never).catch(() => undefined);
      setAsked(true);
      await refresh();
      return;
    }
    onNext();
  };
  const state = (granted: boolean): PermState => (granted ? 'granted' : asked ? 'denied' : 'unasked');
  const rows: {title: string; reason: string; denied: string; s: PermState}[] = [
    // Kept: VIGIL listens while active, not only during an armed journey, so the reasons say so.
    {title: 'Microphone', reason: 'To listen for distress sounds while VIGIL is active. Sound is judged on this phone and discarded within three seconds.', denied: "VIGIL can't listen without this.", s: state(mic)},
    {title: 'Notifications', reason: 'To show a check-in and the listening notice.', denied: "VIGIL can't listen without this.", s: state(notes)},
    {title: 'Location · optional', reason: "Optional — shares a fix with guardians if you don't answer a check-in.", denied: 'Listening still works, without a location fix.', s: state(loc)},
  ];
  const blocked = asked && !(mic && notes);
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
              <Lamp tone={r.s === 'granted' ? 'green' : 'unlit'} />
              <View style={{flex: 1}}>
                <Text style={type.label}>{r.title}</Text>
                <Text style={[type.caption, {marginTop: 2}]}>{r.s === 'denied' ? r.denied : r.reason}</Text>
              </View>
              <Text style={type.caption}>{r.s === 'granted' ? 'Allowed' : r.s === 'denied' ? 'Not allowed' : 'Not asked yet'}</Text>
            </View>
          ))}
        </View>
      </Panel>
      {blocked ? <InlineError>Open Settings on this phone and allow microphone and notifications to continue.</InlineError> : null}
      {!full ? (
        <>
          <Text style={type.caption}>Full-screen alerts aren't allowed on this phone. Your check-in will arrive as a high-priority notification instead.</Text>
          {/* Kept: VIGIL can open Android's full-screen setting directly. */}
          <QuietKey label="Allow full-screen check-ins" onPress={openFullScreenSettings} />
        </>
      ) : null}
      <View style={{flexGrow: 1}} />
      {blocked ? <Key label="Open settings" variant="signal" onPress={() => void Linking.openSettings()} /> : <Key label="Continue" variant="signal" onPress={() => void cont()} />}
    </View>
  );
}

/**
 * Step 8, "Invite guardians". Kept: the invite is the real one (a PIN, then a
 * one-time code from the server), not his SIMULATED sheet; the list shows the
 * invites this phone has made.
 */
export function InviteStep({invites, onInvite, onFinish}: {invites: number; onInvite: () => void; onFinish: () => void}) {
  return (
    <View style={styles.screen}>
      <StepMark n={8} />
      <Text style={type.display} accessibilityRole="header">
        Invite guardians
      </Text>
      <Panel>
        <Eyebrow>Guardians</Eyebrow>
        <Text style={[type.body, {marginTop: space.sm}]}>We recommend at least two guardians who don't live with you.</Text>
        {invites === 0 ? (
          <Text style={[type.caption, {marginTop: space.sm}]}>No guardians yet. Invite someone you trust to get started.</Text>
        ) : (
          <View style={{marginTop: space.sm, gap: 4}}>
            {Array.from({length: invites}, (_, i) => (
              <Text key={i} style={type.label}>{`Invite ${i + 1}`}</Text>
            ))}
            <Text style={type.caption}>{`${invites} sent · accepted invites show in your guardian's app`}</Text>
          </View>
        )}
      </Panel>
      <Key label="Invite a guardian" variant="plain" onPress={onInvite} />
      <Panel>
        <Text style={type.label}>What your guardians will see</Text>
        <Text style={[type.body, {marginTop: space.xs}]}>
          A guardian only hears from VIGIL if you don't answer a check-in, or if you use your duress PIN. They'll see your name, why you were
          alerted, and a location fix if one was shared — never your day-to-day movement.
        </Text>
      </Panel>
      <View style={{flexGrow: 1}} />
      <Key label="Finish setup" variant="signal" onPress={onFinish} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flexGrow: 1, gap: space.md},
  stepMark: {fontFamily: fonts.mono, fontSize: 12, letterSpacing: 1, color: colors.textDim},
  simTag: {fontFamily: fonts.mono, fontSize: 11, letterSpacing: 0.5, color: colors.amberText},
  error: {...type.body, color: colors.textTitle, borderWidth: 1, borderColor: colors.borderEmphasis, borderRadius: radii.key, padding: space.sm},
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
  mono: {fontFamily: fonts.mono},
  code: {fontFamily: fonts.mono, fontSize: 24, letterSpacing: 8, textAlign: 'center'},
  permRow: {flexDirection: 'row', alignItems: 'center', gap: space.md},
  consentRow: {flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 48},
  box: {width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: colors.controlEdge, alignItems: 'center', justifyContent: 'center'},
  boxOn: {backgroundColor: colors.action, borderColor: colors.action},
  tick: {fontFamily: fonts.bold, fontSize: 15, lineHeight: 18, color: colors.textInverse},
  link: {color: colors.textTitle, fontFamily: fonts.semibold, textDecorationLine: 'underline'},
  channels: {flexDirection: 'row', gap: space.sm},
  channel: {flex: 1, minHeight: 48, borderRadius: radii.key, borderWidth: 1, borderColor: colors.borderEmphasis, alignItems: 'center', justifyContent: 'center'},
  channelOn: {borderColor: colors.action, borderWidth: 2, backgroundColor: colors.keyFace},
  scrim: {flex: 1, backgroundColor: colors.scrim, justifyContent: 'flex-end'},
  sheet: {backgroundColor: colors.dialogFill, borderTopLeftRadius: radii.dialog, borderTopRightRadius: radii.dialog, padding: space.lg, gap: space.sm},
  sheetHead: {flexDirection: 'row', alignItems: 'center'},
  close: {minWidth: TOUCH, minHeight: TOUCH, alignItems: 'center', justifyContent: 'center'},
  accountRow: {flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 64, paddingVertical: space.sm},
  avatar: {width: 40, height: 40, borderRadius: 20, backgroundColor: colors.action, alignItems: 'center', justifyContent: 'center'},
});
