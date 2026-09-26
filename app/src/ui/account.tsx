/**
 * Account screens ported from Mutarisi's Kotlin build (feature/ui, up to
 * 012f997), decided in by Lethabo: returning-member sign-in, forgot
 * password, Settings → Recovery, and Settings → Documents and your rights.
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
import {Eyebrow, Key, Panel, QuietKey, Row, TopAppBar} from './components';
import {colors, fonts, radii, space, type} from './theme';
import {googleAvailable, googleSignIn} from '../api/google';
import {device, EMAIL, maskEmail, maskPhone, MIN_PASSWORD, profileContacts, recoveryChannel, type RecoveryChannel, type SignInRoute} from '../api/device';

const Simulated = ({children}: {children: string}) => <Text style={styles.simTag}>{children}</Text>;

const BAD_EMAIL = 'Enter a valid email address.';
const BAD_MOBILE = 'Enter a valid South African mobile number — 9 digits, not starting with 0.';
const SA_DIGITS = /^[1-9][0-9]{8}$/;
const NO_PIN_RESET = "This resets your email password only. It never resets your PIN: PIN recovery uses a recovery code (spec §9), which isn't built yet.";

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

/** Settings → Documents and your rights. */
export function Documents({onBack}: {onBack: () => void}) {
  const [open, setOpen] = useState<DocumentId | null>(null);
  if (open) {
    return (
      <View style={styles.screen}>
        <TopAppBar title={DOCUMENTS[open].title} onBack={() => setOpen(null)} />
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

/** A password field with Show/Hide. `confirm` is a second field that shares the toggle. */
export function PasswordFields({
  value,
  onChange,
  confirm,
  onConfirm,
  label = 'Password',
}: {
  value: string;
  onChange: (s: string) => void;
  confirm?: string;
  onConfirm?: (s: string) => void;
  label?: string;
}) {
  const [shown, setShown] = useState(false);
  const field = (v: string, set: (s: string) => void, a11y: string, placeholder: string) => (
    <TextInput
      value={v}
      onChangeText={set}
      secureTextEntry={!shown}
      autoCapitalize="none"
      autoCorrect={false}
      autoComplete="password"
      placeholder={placeholder}
      placeholderTextColor={colors.textDim}
      style={styles.field}
      accessibilityLabel={a11y}
    />
  );
  return (
    <View style={{gap: space.sm}}>
      <View style={styles.labelRow}>
        <Text style={type.label}>{label}</Text>
        <QuietKey label={shown ? 'Hide' : 'Show'} onPress={() => setShown(s => !s)} />
      </View>
      {field(value, onChange, label, `At least ${MIN_PASSWORD} characters`)}
      {onConfirm ? field(confirm ?? '', onConfirm, `${label}, again`, 'Enter it again') : null}
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

const Problem = ({children}: {children: string}) =>
  children ? (
    <Text style={[type.body, {color: colors.textTitle}]} accessibilityLiveRegion="polite">
      {children}
    </Text>
  ) : null;

// ---- sign-in ----------------------------------------------------------------

type SignInStep = 'choose' | 'google' | 'phone' | 'code' | 'email' | 'forgot' | 'notFound';

/**
 * "Already have an account? Sign in": Google (real through Firebase when
 * configured, else SIMULATED), phone (SIMULATED code) or email and password. A match with the account saved on this phone
 * calls `onFound`, and the caller asks for the PIN (the normal PIN prompt;
 * both PINs let the member in the same way). Anything else is "No account
 * found", never a hint about which part was wrong.
 */
export function SignIn({onFound, onCreate, onBack}: {onFound: () => void; onCreate: () => void; onBack: () => void}) {
  const [step, setStep] = useState<SignInStep>('choose');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [digits, setDigits] = useState('');
  const [code, setCode] = useState('');
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [who, setWho] = useState('');
  const [problem, setProblem] = useState('');
  const googleLive = googleAvailable();

  const go = (s: SignInStep) => {
    setTried(false);
    setProblem('');
    setStep(s);
  };
  const attempt = async (route: SignInRoute, label: string) => {
    if (busy) return;
    setBusy(true);
    try {
      const found = await device.findAccount(route).catch(() => false);
      setPassword('');
      if (found) onFound();
      else {
        setWho(label);
        go('notFound');
      }
    } finally {
      setBusy(false);
    }
  };
  const emailOk = EMAIL.test(email.trim());
  /** Real Google sign-in, then the same match as any Google sign-in: the account email on this phone. */
  const google = async () => {
    if (!googleLive) return go('google');
    if (busy) return;
    setProblem('');
    setBusy(true);
    const r = await googleSignIn();
    setBusy(false);
    if (r.ok) await attempt({kind: 'google', email: r.account.email}, r.account.email);
    else setProblem(r.message);
  };

  if (step === 'forgot') {
    return <ForgotPassword initialEmail={email.trim()} onBack={() => go('email')} />;
  }
  return (
    <View style={styles.screen}>
      <TopAppBar title="" onBack={step === 'choose' ? onBack : () => go(step === 'code' ? 'phone' : 'choose')} />
      {step === 'choose' ? (
        <>
          <Text style={type.display} accessibilityRole="header">
            Sign in
          </Text>
          <Text style={type.body}>Sign in with the account you made on this phone, then your PIN.</Text>
          <View style={{gap: 10, marginTop: space.sm}}>
            <Key label={busy && googleLive ? 'Opening Google…' : 'Sign in with Google'} variant="plain" arrow onPress={() => void google()} />
            <Key label="Sign in with email" variant="plain" arrow onPress={() => go('email')} />
            <Key label="Use your phone number" variant="signal" arrow onPress={() => go('phone')} />
          </View>
          <Problem>{problem}</Problem>
          <Text style={type.caption}>
            Your account lives on this phone only: there is no accounts server yet. Your identity in VIGIL is the signing key on this phone, so a new phone can't restore it.
            {googleLive ? " With Google, the sign-in goes to Google and Firebase Authentication; VIGIL's own server never receives your email." : ''}
          </Text>
          <QuietKey label="Don't have an account? Create account" onPress={onCreate} />
        </>
      ) : step === 'google' ? (
        <>
          <Text style={type.display} accessibilityRole="header">
            Your Google account
          </Text>
          <Text style={type.body}>The Google account you signed up with on this phone.</Text>
          <Field
            value={email}
            onChangeText={setEmail}
            placeholder="thandi@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            accessibilityLabel="Email address"
          />
          <Text style={type.caption}>{tried && !emailOk ? BAD_EMAIL : 'Checked against this phone only. Nothing is sent.'}</Text>
          <Simulated>SIMULATED · GOOGLE SIGN-IN GOES LIVE WITH FIREBASE</Simulated>
          <View style={{flexGrow: 1}} />
          <Key label={busy ? 'Checking…' : 'Continue'} variant={emailOk ? 'signal' : 'plain'} onPress={() => (emailOk ? void attempt({kind: 'google', email: email.trim()}, email.trim()) : setTried(true))} />
        </>
      ) : step === 'email' ? (
        <>
          <Text style={type.display} accessibilityRole="header">
            Sign in with email
          </Text>
          <Text style={type.label}>Email</Text>
          <Field
            value={email}
            onChangeText={setEmail}
            placeholder="thandi@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            accessibilityLabel="Email address"
          />
          <PasswordFields value={password} onChange={setPassword} />
          <Text style={type.caption}>{tried && !emailOk ? BAD_EMAIL : 'Checked against this phone only. Nothing is sent. You still need your PIN.'}</Text>
          <QuietKey label="Forgot password?" onPress={() => go('forgot')} />
          <View style={{flexGrow: 1}} />
          <Key
            label={busy ? 'Checking…' : 'Continue'}
            variant={emailOk && password ? 'signal' : 'plain'}
            onPress={() => (emailOk && password ? void attempt({kind: 'email', email: email.trim(), password}, email.trim()) : setTried(true))}
          />
        </>
      ) : step === 'phone' ? (
        <>
          <Text style={type.display} accessibilityRole="header">
            Phone number
          </Text>
          <Text style={type.body}>The number you signed up with on this phone. We'll text a code to check it's you.</Text>
          <View style={styles.phoneRow}>
            <Text style={styles.prefix}>+27</Text>
            <Field
              value={digits}
              onChangeText={t => setDigits(t.replace(/\D/g, '').slice(0, 9))}
              placeholder="82 555 0101"
              keyboardType="phone-pad"
              autoComplete="tel"
              style={{flex: 1}}
              accessibilityLabel="Mobile number"
            />
          </View>
          <Text style={type.caption}>{tried && !SA_DIGITS.test(digits) ? BAD_MOBILE : 'Checked against this phone only.'}</Text>
          <View style={{flexGrow: 1}} />
          <Key
            label="Send code"
            variant={SA_DIGITS.test(digits) ? 'signal' : 'plain'}
            onPress={() => {
              if (!SA_DIGITS.test(digits)) return setTried(true);
              setCode('');
              go('code');
            }}
          />
        </>
      ) : step === 'code' ? (
        <>
          <Text style={type.display} accessibilityRole="header">
            Verify code
          </Text>
          <Text style={type.body}>{`Enter the 6-digit code we sent by text to +27${digits}.`}</Text>
          <Simulated>SIMULATED · NO CODE IS SENT · ANY 6 DIGITS CONTINUE</Simulated>
          <CodeField code={code} setCode={setCode} />
          <View style={{flexGrow: 1}} />
          <Key
            label={busy ? 'Checking…' : 'Continue'}
            variant={code.length === 6 ? 'signal' : 'plain'}
            onPress={() => code.length === 6 && void attempt({kind: 'phone', phone: `+27${digits}`}, `+27${digits}`)}
          />
        </>
      ) : (
        <>
          <Text style={type.display} accessibilityRole="header">
            No account found
          </Text>
          <Panel>
            <Text style={type.body}>
              {`There's no VIGIL account for ${who} on this phone that matches what you entered. An account lives on the phone that made it: a new phone can't restore one.`}
            </Text>
          </Panel>
          <View style={{flexGrow: 1}} />
          <Key label="Create account" variant="signal" onPress={onCreate} />
          <QuietKey label="Cancel" onPress={() => go('choose')} />
        </>
      )}
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
export function ForgotPassword({initialEmail, onBack}: {initialEmail: string; onBack: () => void}) {
  const [stage, setStage] = useState<'email' | 'reset' | 'done'>('email');
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
    if (!device.canResetPassword(email.trim())) return setProblem("There's no VIGIL account with an email password for that address on this phone.");
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
      setStage('done');
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
        {stage === 'done' ? 'Password changed' : 'Reset your password'}
      </Text>
      {stage === 'email' ? (
        <>
          <Text style={type.body}>Enter the email you sign in with. We'll send a code to the recovery contact you chose in Settings.</Text>
          <Field
            value={email}
            onChangeText={setEmail}
            placeholder="thandi@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            accessibilityLabel="Email address"
          />
          <Problem>{problem}</Problem>
          <Text style={type.caption}>{NO_PIN_RESET}</Text>
          <View style={{flexGrow: 1}} />
          <Key label="Send code" variant="signal" onPress={send} />
        </>
      ) : stage === 'reset' ? (
        <>
          <Text style={type.body}>{`Enter the code we sent to ${to}, then choose a new password.`}</Text>
          <Simulated>SIMULATED · NO CODE IS SENT · ANY 6 DIGITS CONTINUE</Simulated>
          <CodeField code={code} setCode={setCode} />
          <PasswordFields label="New password" value={password} onChange={setPassword} confirm={again} onConfirm={setAgain} />
          <Problem>{problem}</Problem>
          <Text style={type.caption}>Saved on this phone only, as a salted hash. {NO_PIN_RESET}</Text>
          <View style={{flexGrow: 1}} />
          <Key label={busy ? 'Saving…' : 'Save new password'} variant="signal" onPress={() => void save()} />
        </>
      ) : (
        <>
          <Panel>
            <Text style={type.body}>Sign in with your new password. You'll still need your PIN.</Text>
          </Panel>
          <View style={{flexGrow: 1}} />
          <Key label="Back to sign in" variant="signal" onPress={onBack} />
        </>
      )}
    </View>
  );
}

// ---- settings ---------------------------------------------------------------

const recoveryDetail = (ch: RecoveryChannel | null) =>
  ch === 'email' ? 'Password resets go to your email' : ch === 'phone' ? 'Password resets go to your mobile number' : 'Choose where password resets go';

/** Settings rows: Recovery, Documents and your rights, Sign out. */
export function AccountSettings({onRecovery, onDocuments, onSignOut}: {onRecovery: () => void; onDocuments: () => void; onSignOut: () => void}) {
  return (
    <>
      <Panel style={{padding: 0, overflow: 'hidden'}}>
        <Row label="Recovery" detail={recoveryDetail(recoveryChannel(device.profile))} onPress={onRecovery} />
        <View style={styles.rowRule} />
        <Row label="Documents and your rights" detail="Terms (draft), privacy notice (draft), your rights, about the record" onPress={onDocuments} />
      </Panel>
      <Panel style={{padding: 0, overflow: 'hidden'}}>
        <Row label="Sign out of this phone" detail="Needs your PIN · VIGIL stops listening until you sign in again" onPress={onSignOut} />
      </Panel>
    </>
  );
}

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
      <Problem>{problem}</Problem>
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
