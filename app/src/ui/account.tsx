/**
 * Account screens ported from Mutarisi's Kotlin build (feature/ui, up to
 * 5aa5d24), decided in by Lethabo: returning-member sign-in and Welcome back,
 * forgot password, Settings → Recovery, and the documents.
 *
 * LOCAL ONLY, as in his build: no accounts server exists. Sign-in can only
 * find the account saved on THIS phone, and a member's identity is the
 * signing key made on this phone, so a new phone can't restore it. Codes are
 * SIMULATED (nothing is sent by text or email) and say so. Google sign-in is
 * real (Google and Firebase Authentication, src/api/google.ts) in a build
 * connected to Firebase, and SIMULATED otherwise. Nothing typed here is sent
 * to the VIGIL server or written to the record.
 */
import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {Dialog, Eyebrow, Key, Panel, PinKeypad, QuietKey, Row, TopAppBar} from './components';
import {colors, fonts, radii, space, type} from './theme';
import {InlineError, Simulated, useGoogle} from './signup';
import {device, EMAIL, maskEmail, maskPhone, MIN_PASSWORD, profileContacts, recoveryChannel, type RecoveryChannel} from '../api/device';


const BAD_EMAIL = 'Enter a valid email address.';
// His line, plus what is true of this build: the recovery code isn't built (spec §9, §14).
const NO_PIN_RESET = "Forgotten your PIN instead? It can only be recovered with your recovery code, not by email or text. Recovery codes aren't in this build yet.";

// ---- documents --------------------------------------------------------------

/**
 * The documents, in Mutarisi's format ("## " heading, "### " sub-heading,
 * anything else a paragraph). His doc_terms placeholder, and his doc_record
 * and doc_rights texts, changed only where they weren't true of this app. No
 * terms exist: the Terms are a labelled placeholder, not legal text. The
 * privacy notice is a draft (docs/PRIVACY-POLICY.md is PROPOSED) reduced to
 * what this app actually does.
 */
export const DOCUMENTS = {
  terms: {
    title: 'Terms and conditions',
    text: `## Draft — not the final terms
These terms are a placeholder. They have not been written or reviewed by the VUKA team or a legal adviser, and they will be replaced before VUKA is offered to the public. Nothing here adds to or overrides the Privacy notice.
## What VUKA is
VUKA is a hackathon prototype. Parts of it are simulated and say so on screen: Google sign-in is real only in builds connected to Firebase and simulated in the others, and sign-in and password-reset codes are not sent by text or email.
## Emergencies
VUKA does not replace emergency services. In danger, call 10111.
## Your data
How your personal information is used is set out in the Privacy notice.`,
  },
  privacy: {
    title: 'Privacy notice',
    text: `## Draft — not the final notice
This is a draft. The full notice (docs/PRIVACY-POLICY.md) is PROPOSED and awaits team and legal review. VUKA is a hackathon prototype. Team SONAR has no registered legal entity. Information Officer registration is prepared, not submitted. Contact route: UNDEFINED — team to set.
## Kept on this phone only
Your name and surname, your mobile number and email, how you signed up, your recovery choice, and, if you signed up with email, a salted hash of your password (never the password itself). These are never sent to the VUKA server and never written to your record.
### If you use Google
If you sign up or sign in with Google in a build connected to Firebase, Google and Firebase Authentication (Google's sign-in service, in the team's Firebase project) receive that sign-in and keep your Google email, name and account ID to confirm it.
## Your PINs
Each PIN is kept on this phone as a hash. A PIN never leaves the phone.
## Sound
Sound is judged on this phone. Audio is not stored or sent; a detection carries a sound label and score.
## What goes to the VUKA server
Signed events: your registration (never your phone number, IMEI, serial or Android ID), listening starting and pausing, detections, check-ins and PIN-confirmed actions. While VIGIL listens, a heartbeat every 30 seconds carries a speed bucket, not your location. A detection can carry where the phone was, and location is sent for 30 minutes after a check-in (PROPOSED, ADR-0048); the server keeps that only if your guardians were alerted.
## Hashes
Hashes are permanent: a hash cannot be reversed into your data, but it stays in the chain.`,
  },
  rights: {
    title: 'Your rights',
    text: `## Your choices and rights
The spec uses your consent for your journey data, and each guardian's own consent for their data. A guardian sees a privacy notice before they join.
### Access
My record in Settings, after your PIN, shows your record as the server holds it, checked on this phone. While an incident is open, and for six hours (specified) after its last PIN entry, it ends before the incident.
### Correction
UNDEFINED — needs a decision. The chain is append-only; the repo does not define a correction request process.
### Deletion
Specified, not in this app yet: a PIN-gated request, a 72-hour cooling-off, then payload and salt removal; residuals remain so the chain can still be checked.
### Objection
The repo does not define an objection process. Contact route: UNDEFINED — team to set.
### Complaint
You may complain to the Information Regulator of South Africa.
## Guardians
In this app, adding a guardian needs your PIN and gives a one-time code to share. Removing a guardian (specified: after a 24-hour delay) is not in this app yet.
## Your key and this phone
Your identity in VIGIL is a signing key made on this phone. It never leaves the phone, so a new phone can't restore your account. Signing out keeps it here; sign back in with the details you used on this phone and your PIN.`,
  },
  record: {
    title: 'About the record',
    text: `## About the record
Your record proves when each entry was made, not what happened. The anchor proves when, not what.
## In this app today
Each entry is signed on this phone by a key that never leaves it, queued, and sent to the VUKA demo server, which links it into your hash chain and returns a receipt this phone keeps. My record checks the server's copy against those receipts.
Anchoring to Hedera isn't connected to this app yet, so your record is not anchored.
## What stays
Hashes are permanent: a hash cannot be reversed into your data, but it stays in the chain.
## Limits
A signature shows that a key was used; it does not prove the event was genuine. VUKA is a hackathon prototype.`,
  },
} as const;
export type DocumentId = keyof typeof DOCUMENTS;

/** One document's text, laid out by its "## " / "### " markers. */
export function DocumentText({id}: {id: DocumentId}) {
  const lines = DOCUMENTS[id].text.split('\n').filter(l => l.trim());
  return (
    <View>
      {lines.map((l, i) =>
        l.startsWith('## ') ? (
          <Text key={i} style={[type.label, {marginTop: i ? space.lg : 0}]} accessibilityRole="header">
            {l.slice(3)}
          </Text>
        ) : l.startsWith('### ') ? (
          <Text key={i} style={[type.label, {marginTop: space.md, color: colors.textSecondary}]}>
            {l.slice(4)}
          </Text>
        ) : (
          <Text key={i} style={[type.body, {marginTop: space.xs}]}>
            {l}
          </Text>
        ),
      )}
    </View>
  );
}

/**
 * A document page. Opened from a Settings row (`initial`, as his Settings →
 * Documents and your rights), Back returns to Settings; without one it is a
 * list of all four.
 */
export function Documents({onBack, initial}: {onBack: () => void; initial?: DocumentId}) {
  const [open, setOpen] = useState<DocumentId | null>(initial ?? null);
  if (open) {
    return (
      <View style={styles.screen}>
        <TopAppBar title={DOCUMENTS[open].title} onBack={initial ? onBack : () => setOpen(null)} />
        <Panel>
          <DocumentText id={open} />
        </Panel>
      </View>
    );
  }
  const detail: Record<DocumentId, string> = {
    terms: 'Draft placeholder: no terms have been written yet',
    privacy: 'Draft: what this app keeps and sends',
    rights: 'Access, deletion, guardians and your key',
    record: 'What your record proves, and what it does not',
  };
  return (
    <View style={styles.screen}>
      <TopAppBar title="Documents and your rights" onBack={onBack} />
      <Panel style={{padding: 0, overflow: 'hidden'}}>
        {(Object.keys(DOCUMENTS) as DocumentId[]).map((id, i) => (
          <View key={id}>
            {i ? <View style={styles.rowRule} /> : null}
            <Row label={DOCUMENTS[id].title} detail={detail[id]} onPress={() => setOpen(id)} />
          </View>
        ))}
      </Panel>
    </View>
  );
}

// ---- fields -----------------------------------------------------------------

/**
 * Password fields with Show/Hide, as his: a "Password" label, an optional
 * hint under the field, and a second "Confirm password" field sharing the
 * toggle. The eye icon is a Show/Hide text button here.
 */
export function PasswordFields({
  value,
  onChange,
  confirm,
  onConfirm,
  label = 'Password',
  confirmLabel = `Confirm ${label.toLowerCase()}`,
  hint,
}: {
  value: string;
  onChange: (s: string) => void;
  confirm?: string;
  onConfirm?: (s: string) => void;
  label?: string;
  confirmLabel?: string;
  hint?: string;
}) {
  const [shown, setShown] = useState(false);
  const field = (v: string, set: (s: string) => void, a11y: string) => (
    <TextInput
      value={v}
      onChangeText={set}
      secureTextEntry={!shown}
      autoCapitalize="none"
      autoCorrect={false}
      autoComplete="password"
      placeholderTextColor={colors.textDim}
      style={styles.field}
      accessibilityLabel={a11y}
    />
  );
  return (
    <View style={{gap: space.sm}}>
      <View style={styles.labelRow}>
        <Text style={type.label}>{label}</Text>
        <QuietKey label={shown ? 'Hide password' : 'Show password'} onPress={() => setShown(s => !s)} />
      </View>
      {field(value, onChange, label)}
      {hint ? <Text style={type.caption}>{hint}</Text> : null}
      {onConfirm ? (
        <>
          <Text style={[type.label, {marginTop: space.xs}]}>{confirmLabel}</Text>
          {field(confirm ?? '', onConfirm, confirmLabel)}
        </>
      ) : null}
    </View>
  );
}

/** The password rules at sign-up and reset: a message, or null when fine. */
export function passwordProblem(password: string, again: string): string | null {
  if (password.length < MIN_PASSWORD) return `Use at least ${MIN_PASSWORD} characters for your password.`;
  if (password !== again) return "Those two passwords don't match.";
  return null;
}

const Field = (p: React.ComponentProps<typeof TextInput>) => <TextInput placeholderTextColor={colors.textDim} {...p} style={[styles.field, p.style]} />;

const CodeField = ({code, setCode}: {code: string; setCode: (s: string) => void}) => (
  <Field
    value={code}
    onChangeText={t => setCode(t.replace(/\D/g, '').slice(0, 6))}
    keyboardType="number-pad"
    autoComplete="sms-otp"
    textContentType="oneTimeCode"
    placeholder="••••••"
    style={styles.code}
    accessibilityLabel="Six-digit code"
  />
);


// ---- sign-in ----------------------------------------------------------------

/**
 * His "Sign in" (SignInExistingFragment), one screen: Sign in with Google,
 * Sign in with your phone number (the phone and code steps, then the PIN),
 * or email and password here. A match with the account saved on this phone
 * calls `onFound`, and "Welcome back" asks for the PIN. A wrong email or
 * password gets one message that never says which part was wrong.
 *
 * LOCAL ONLY, as his: no accounts server exists, so only an account made on
 * this phone can be found. Google is real through Firebase when this build
 * is configured, and his SIMULATED chooser otherwise.
 */
export function SignIn({onFound, onPhone, onCreate, onBack}: {onFound: () => void; onPhone: () => void; onCreate: () => void; onBack: () => void}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [wrong, setWrong] = useState(false);
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [changed, setChanged] = useState(false);
  const [notFound, setNotFound] = useState<string | null>(null);

  const google = useGoogle(async a => {
    const found = await device.findAccount({kind: 'google', email: a.email}).catch(() => false);
    if (found) onFound();
    else setNotFound(a.email);
  });
  const signIn = async () => {
    if (busy) return;
    setBusy(true);
    try {
      // A password alone isn't enough: findAccount also needs the finished profile that "Welcome back" signs into.
      const ok = await device.findAccount({kind: 'email', email: email.trim(), password}).catch(() => false);
      setPassword('');
      setWrong(!ok);
      if (ok) onFound();
    } finally {
      setBusy(false);
    }
  };

  if (forgot) {
    return (
      <ForgotPassword
        initialEmail={email.trim()}
        onBack={() => setForgot(false)}
        onDone={() => {
          setForgot(false);
          setWrong(false);
          setChanged(true);
        }}
      />
    );
  }
  return (
    <View style={styles.screen}>
      <TopAppBar title="" onBack={onBack} />
      <Eyebrow>Welcome back</Eyebrow>
      <Text style={type.display} accessibilityRole="header">
        Sign in
      </Text>
      <View style={{gap: 10}}>
        <Key label={google.busy ? 'Opening Google…' : 'Sign in with Google'} variant="plain" onPress={() => void google.start()} />
        <Key label="Sign in with your phone number" variant="plain" onPress={onPhone} />
      </View>
      <InlineError>{google.problem}</InlineError>
      <View style={styles.orRow}>
        <View style={styles.orRule} />
        <Text style={type.caption}>or with email</Text>
        <View style={styles.orRule} />
      </View>
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
      <PasswordFields value={password} onChange={setPassword} />
      <QuietKey label="Forgot password?" onPress={() => setForgot(true)} />
      <InlineError>{wrong ? "That email and password don't match an account on this phone." : ''}</InlineError>
      <Key label={busy ? 'Checking…' : 'Sign in'} variant="signal" onPress={() => void signIn()} />
      <Simulated>LOCAL ONLY · ACCOUNTS ON OTHER PHONES CAN'T BE FOUND YET</Simulated>
      {google.live ? (
        <Text style={type.caption}>With Google, the sign-in goes to Google and Firebase Authentication; VIGIL's own server never receives your email.</Text>
      ) : null}
      <QuietKey label="New to VUKA? Create an account" onPress={onCreate} />
      {google.chooser}
      <Dialog
        visible={notFound !== null}
        title="No account found"
        confirm="Create an account"
        onConfirm={() => {
          setNotFound(null);
          onCreate();
        }}
        cancel="Cancel"
        onCancel={() => setNotFound(null)}>
        {`There's no VUKA account for ${notFound ?? ''} on this phone.`}
      </Dialog>
      <Dialog visible={changed} title="Password changed" confirm="OK" onConfirm={() => setChanged(false)} onCancel={() => setChanged(false)}>
        Sign in with your new password. You'll still need your PIN.
      </Dialog>
    </View>
  );
}

/**
 * His "Welcome back": the account is on this phone, so the member signs back
 * in with their PIN. Both PINs sign in the same way, on the same screen; a
 * wrong PIN shows the same "Try again." every time. Nothing is sent.
 */
export function WelcomeBack({onSignedIn, onBack, differentNumber}: {onSignedIn: () => void; onBack: () => void; differentNumber: boolean}) {
  const [retry, setRetry] = useState(false);
  const [busy, setBusy] = useState(false);
  const first = device.profile?.firstName?.trim();
  const submit = async (pin: string) => {
    if (busy) return;
    setBusy(true);
    try {
      if ((await device.signIn(pin)) === 'ok') return onSignedIn();
      setRetry(true);
    } catch {
      setRetry(true);
    } finally {
      setBusy(false);
    }
  };
  return (
    <View style={styles.screen}>
      <TopAppBar title="" onBack={onBack} />
      <Eyebrow>Sign in</Eyebrow>
      <Text style={type.display} accessibilityRole="header">
        Enter your PIN
      </Text>
      <Text style={type.title}>{first ? `Welcome back, ${first}` : 'Welcome back'}</Text>
      <Text style={type.body}>Your VUKA account is on this phone. Enter your PIN to sign back in.</Text>
      <Simulated>LOCAL ONLY · ACCOUNTS ON OTHER PHONES CAN'T BE FOUND YET</Simulated>
      <Text style={[type.label, {textAlign: 'center', marginTop: space.sm}]} accessibilityLiveRegion="polite">
        {retry ? 'Try again.' : 'Enter your PIN'}
      </Text>
      <PinKeypad onComplete={pin => void submit(pin)} />
      {differentNumber ? <QuietKey label="Use a different number" onPress={onBack} /> : null}
    </View>
  );
}

/**
 * "Create account" on a phone that already holds a member's account. It
 * never wipes the keys, PINs, profile or queue: it explains instead.
 */
export function AccountOnThisPhone({onSignIn, onBack}: {onSignIn: () => void; onBack: () => void}) {
  const name = device.profile?.firstName?.trim();
  return (
    <View style={styles.screen}>
      <TopAppBar title="" onBack={onBack} />
      <Text style={type.display} accessibilityRole="header">
        This phone already has an account
      </Text>
      <Panel>
        <Text style={type.body}>
          {`${name ? `It belongs to ${name}. ` : ''}Your identity in VIGIL is the signing key made on this phone, with its record and PINs. Creating another account here would replace them, so VIGIL doesn't do that. Nothing has been deleted.`}
        </Text>
      </Panel>
      <Text style={type.caption}>
        Sign in with the Google account, email or number used on this phone. A forgotten email password can be reset from Sign in. A forgotten PIN can't be recovered in this build: PIN recovery uses a recovery code (spec §9), which isn't built yet.
      </Text>
      <View style={{flexGrow: 1}} />
      <Key label="Sign in" variant="signal" arrow onPress={onSignIn} />
      <QuietKey label="Back" onPress={onBack} />
    </View>
  );
}

/**
 * Forgot password: the account email, then a code to the recovery contact
 * (SIMULATED: any 6 digits), then a new password twice. Resets the email
 * password only, never the PIN.
 */
export function ForgotPassword({initialEmail, onBack, onDone}: {initialEmail: string; onBack: () => void; onDone: () => void}) {
  const [stage, setStage] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [again, setAgain] = useState('');
  const [problem, setProblem] = useState('');
  const [busy, setBusy] = useState(false);

  const p = device.profile;
  const c = profileContacts(p);
  const to = recoveryChannel(p) === 'phone' && c.phone ? `your mobile number, ${maskPhone(c.phone)}` : `your email, ${maskEmail(c.email ?? '')}`;

  const send = () => {
    if (!EMAIL.test(email.trim())) return setProblem(BAD_EMAIL);
    if (!device.canResetPassword(email.trim())) return setProblem("There's no VUKA account with an email password for that address on this phone.");
    setProblem('');
    setStage('reset');
  };
  const save = async () => {
    if (busy) return;
    const bad = code.length !== 6 ? 'Enter the 6-digit code.' : passwordProblem(password, again);
    if (bad) return setProblem(bad);
    setBusy(true);
    try {
      await device.resetPassword(email.trim(), password);
      setPassword('');
      setAgain('');
      setProblem('');
      onDone();
    } catch (e) {
      setProblem(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.screen}>
      <TopAppBar title="" onBack={onBack} />
      <Text style={type.display} accessibilityRole="header">
        Reset your password
      </Text>
      {stage === 'email' ? (
        <>
          <Text style={type.body}>Enter the email you sign in with. We'll send a code to the recovery contact you chose in Settings.</Text>
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
        </>
      ) : (
        <>
          <Text style={type.body}>{`Enter the code we sent to ${to}, then choose a new password.`}</Text>
          <Simulated>SIMULATED · NO CODE IS SENT · ANY 6 DIGITS CONTINUE</Simulated>
          <Text style={type.label}>6-digit code</Text>
          <CodeField code={code} setCode={setCode} />
          <PasswordFields label="New password" value={password} onChange={setPassword} confirm={again} onConfirm={setAgain} />
        </>
      )}
      <InlineError>{problem}</InlineError>
      <Key label={stage === 'email' ? 'Send code' : busy ? 'Saving…' : 'Save new password'} variant="signal" onPress={stage === 'email' ? send : () => void save()} />
      <Text style={type.caption}>{NO_PIN_RESET}</Text>
    </View>
  );
}

// ---- settings ---------------------------------------------------------------

/** His Recovery row's detail line. */
export const recoveryDetail = (ch: RecoveryChannel | null) =>
  ch === 'email' ? 'Password resets go to your email' : ch === 'phone' ? 'Password resets go to your mobile number' : 'Choose where password resets go';

/**
 * Settings → Recovery: Email or Mobile number for password-reset codes. Only
 * a contact on the profile can be picked. The PIN is not recovered this way.
 */
export function Recovery({onDone}: {onDone: () => void}) {
  const p = device.profile;
  const c = profileContacts(p);
  const [selected, setSelected] = useState<RecoveryChannel | null>(recoveryChannel(p));
  const [problem, setProblem] = useState('');
  const options: {ch: RecoveryChannel; label: string; value?: string}[] = [
    {ch: 'email', label: 'Email', value: c.email ? maskEmail(c.email) : undefined},
    {ch: 'phone', label: 'Mobile number', value: c.phone ? maskPhone(c.phone) : undefined},
  ];
  const save = async () => {
    if (!selected) return;
    try {
      await device.setRecovery(selected);
      onDone();
    } catch (e) {
      setProblem(e instanceof Error ? e.message : String(e));
    }
  };
  return (
    <View style={styles.screen}>
      <TopAppBar title="Recovery" onBack={onDone} />
      <Text style={type.body}>
        {p?.password
          ? 'Where should we send a code if you forget your email password?'
          : "You don't sign in with an email password, so no reset code is used. Your choice is kept anyway."}
      </Text>
      <View style={{gap: space.sm}} accessibilityRole="radiogroup">
        {options.map(o => {
          const on = selected === o.ch;
          return (
            <Pressable
              key={o.ch}
              accessibilityRole="radio"
              accessibilityState={{selected: on, disabled: !o.value}}
              disabled={!o.value}
              onPress={() => setSelected(o.ch)}
              style={[styles.card, on && styles.cardOn, !o.value && {opacity: 0.5}]}>
              <Text style={type.label}>{o.label}</Text>
              <Text style={[type.caption, {marginTop: 2}]}>{o.value ?? 'Not set · add it in Edit profile'}</Text>
            </Pressable>
          );
        })}
      </View>
      <InlineError>{problem}</InlineError>
      <Panel>
        <Eyebrow>Your PIN</Eyebrow>
        <Text style={[type.body, {marginTop: space.sm}]}>
          A code by email or text never resets your PIN: someone holding your phone could ask for one. PIN recovery uses a recovery code (spec §9), which isn't built yet.
        </Text>
      </Panel>
      <Simulated>SIMULATED · NO CODE IS SENT BY TEXT OR EMAIL YET</Simulated>
      <Key label="Continue" variant={selected ? 'signal' : 'plain'} onPress={() => void save()} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flexGrow: 1, gap: space.md},
  simTag: {fontFamily: fonts.mono, fontSize: 11, letterSpacing: 0.5, color: colors.amberText},
  rowRule: {height: 1, backgroundColor: colors.borderSubtle, marginHorizontal: 20},
  labelRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  orRow: {flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.sm},
  orRule: {flex: 1, height: 1, backgroundColor: colors.borderSubtle},
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
  card: {minHeight: 64, borderRadius: radii.key, borderWidth: 1, borderColor: colors.borderEmphasis, padding: space.md, justifyContent: 'center'},
  cardOn: {borderColor: colors.action, borderWidth: 2, backgroundColor: colors.keyFace},
});
