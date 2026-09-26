/**
 * First run, in Mutarisi's order (feature/ui nav_graph.xml, up to 5aa5d24):
 * Welcome → Create your account → (Google | email | phone) → Phone number →
 * Verify code → Your name → Permissions → Set your PINs → Invite guardians,
 * and "Already have an account? Sign in" → Sign in → Welcome back (PIN). The
 * order and every Back target are in signupFlow.ts, shared with Android Back.
 *
 * Differences kept on purpose, each for a reason:
 * - "Start your record" follows the PINs: it registers this phone's key and
 *   the genesis entry of the member's record with the server (spec §3, V5).
 *   Once it exists there is no going back to the PINs.
 * - Both PINs are set on one keypad that looks the same for each (V5, T15);
 *   only the setup copy says which is which.
 * - Google is a real sign-in through Firebase when this build has it, and his
 *   SIMULATED chooser otherwise (google.ts).
 * - Nothing typed here is sent to the VIGIL server or written to the record:
 *   the name, contacts and password hash stay in the phone's profile.
 * - A phone whose member signed out keeps its key, PINs and record, so it
 *   never signs up over them: Welcome offers Sign in instead.
 */
import React, {useEffect, useState} from 'react';
import {BackHandler, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, View} from 'react-native';
import {Dialog, Eyebrow, GlassIcon, Key, Lamp, Panel, PinKeypad, QuietKey, Readout, Rule, Surface, TopAppBar} from './components';
import {Microphone, ShieldChevron} from './icons';
import {colors, fonts, radii, space, type} from './theme';
import {version} from '../../package.json';
import {device, type Delivery, type PasswordHash, type RecoveryChannel} from '../api/device';
import {AccountStep, CodeStep, EmailStep, InlineError, InviteStep, PermissionsStep, PhoneStep, StepMark, type Account, type Channel} from './signup';
import {AccountOnThisPhone, SignIn, WelcomeBack} from './account';
import {googleName, type GoogleAccount} from '../api/google';
import {back as backOf, chooseCodeChannel, next as nextOf, phoneOptional, type Action, type FlowState, type Route, type Step} from './signupFlow';

const TOP_INSET = Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 0;

export function Onboarding({
  onDone,
  onGuardian,
  onInvite,
  onSignedIn,
}: {
  onDone: () => void;
  onGuardian: () => void;
  onInvite?: () => void;
  /** Sign-in matched this phone's account and its PIN was entered: protection comes back on. */
  onSignedIn: () => void;
}) {
  const [step, setStep] = useState<Step>('welcome');
  /** A member's account is already on this phone (they signed out): never sign up over it. */
  const hasAccount = device.signedOut;
  const [route, setRoute] = useState<Route | null>(null);
  /** On the sign-in phone route (his `signingIn`). */
  const [signingIn, setSigningIn] = useState(false);
  /** Terms and Privacy notice ticked on "Create your account": held here so Back doesn't lose it. */
  const [agreed, setAgreed] = useState(false);
  /** The email route's password, as a salted hash only. */
  const [password, setPassword] = useState<PasswordHash | undefined>(undefined);
  /** Where the sign-up code went: the default for password-reset codes. */
  const [codeVia, setCodeVia] = useState<Channel | undefined>(undefined);
  const [emailError, setEmailError] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [account, setAccount] = useState<Account | null>(null);
  /** The number typed on the sign-in phone route (never saved). */
  const [signInPhone, setSignInPhone] = useState('');
  const [checking, setChecking] = useState(false);
  const [noAccount, setNoAccount] = useState(false);
  const [pin, setPin] = useState('');
  const [duress, setDuress] = useState('');

  const flow: FlowState = {route, signingIn, hasAccount, agreed};
  const go = (action: Action) => {
    const to = nextOf(step, action, flow);
    if (to === 'home') onDone();
    else if (to) setStep(to);
  };
  const back = () => {
    const to = backOf(step, flow);
    if (to) setStep(to);
  };
  // Android's system Back walks the steps like the on-screen Back, instead of closing the app mid-sign-up.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (step === 'welcome') return false;
      back();
      return true;
    });
    return () => sub.remove();
  });

  /** A new route starts clean: no email, number or password from an earlier choice. */
  const startRoute = (r: Route) => {
    setRoute(r);
    setSigningIn(false);
    setAccount(null);
    setPassword(undefined);
    setCodeVia(undefined);
  };
  const onGoogle = (g: GoogleAccount, verified: boolean) => {
    startRoute('google');
    setAccount({kind: 'google', contact: g.email, verified});
    // As his: the name step is filled in from the Google account, and can be changed.
    const n = googleName(g);
    if (n.first) setName(n.first.slice(0, 30));
    if (n.last) setSurname(n.last.slice(0, 40));
    go('google');
  };
  /** Sign-in by phone: the code checked out; is this number this phone's account? */
  const checkNumber = async () => {
    if (checking) return;
    setChecking(true);
    const found = await device.findAccount({kind: 'phone', phone: signInPhone}).catch(() => false);
    setChecking(false);
    if (found) go('found');
    else setNoAccount(true);
  };

  const sim = device.simulated ? (
    <Text style={styles.sim}>
      SIMULATED preview: PINs held in memory, nothing signed or sent · build <Text style={styles.simId}>{version}</Text>
    </Text>
  ) : null;

  return (
    <View style={{flex: 1}}>
      <Surface />
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        {step === 'welcome' ? (
          <Welcome signedOut={hasAccount} onNext={() => go('getStarted')} onGuardian={onGuardian} onSignIn={() => go('signIn')} onCreate={() => go('create')} />
        ) : step === 'signIn' ? (
          <SignIn
            onBack={back}
            onFound={() => {
              setSigningIn(false);
              go('found');
            }}
            onPhone={() => {
              setRoute('phone');
              setSigningIn(true);
              setSignInPhone('');
              go('phone');
            }}
            onCreate={() => {
              setSigningIn(false);
              go('create');
            }}
          />
        ) : step === 'welcomeBack' ? (
          <WelcomeBack onBack={back} onSignedIn={onSignedIn} differentNumber={signingIn} />
        ) : step === 'haveAccount' ? (
          <AccountOnThisPhone onBack={back} onSignIn={() => go('signIn')} />
        ) : step === 'account' ? (
          <AccountStep
            agreed={agreed}
            onAgree={setAgreed}
            onBack={back}
            onSignIn={() => go('signIn')}
            onGoogle={onGoogle}
            onChoose={k => {
              startRoute(k);
              go(k);
            }}
          />
        ) : step === 'email' ? (
          <>
            <EmailStep
              initial={account?.kind === 'email' ? account.contact : ''}
              onBack={back}
              onNext={async (email, pw) => {
                // Only the salted hash is kept; the typed password goes no further.
                try {
                  setPassword(await device.hashPassword(pw));
                } catch (e) {
                  setEmailError(e instanceof Error ? e.message : String(e));
                  return;
                }
                setEmailError('');
                // The same email again keeps a number already given (the phone step shows it and can skip it).
                setAccount(a => ({kind: 'email', contact: email, phone: a?.kind === 'email' ? a.phone : undefined, verified: false}));
                go('continue');
              }}
            />
            <InlineError>{emailError}</InlineError>
          </>
        ) : step === 'phone' ? (
          <PhoneStep
            key={signingIn ? 'signIn' : 'signUp'}
            optional={phoneOptional(flow)}
            signedUpAs={
              account && account.kind !== 'phone'
                ? account.kind === 'google'
                  ? `Google · ${account.contact} · ${account.verified ? 'confirmed by Google' : 'simulated'}`
                  : `Email · ${account.contact}`
                : undefined
            }
            initial={signingIn ? signInPhone : (account?.kind === 'phone' ? account.contact : account?.phone) ?? ''}
            onBack={back}
            onSkip={() => {
              // Drop any number given earlier: the code goes by email.
              setAccount(a => (a ? ({...a, phone: undefined} as Account) : a));
              go('skip');
            }}
            onNext={msisdn => {
              if (signingIn) setSignInPhone(msisdn);
              else setAccount(a => (route === 'phone' || !a ? {kind: 'phone', contact: msisdn, verified: false} : ({...a, phone: msisdn} as Account)));
              go('sendCode');
            }}
          />
        ) : step === 'code' ? (
          <>
            <CodeStep
              phone={signingIn ? signInPhone : account?.kind === 'phone' ? account.contact : account?.phone}
              email={signingIn ? undefined : account?.kind === 'phone' ? account.email : account?.contact}
              choose={chooseCodeChannel(flow)}
              busy={checking}
              onAdd={(channel, value) => setAccount(a => (a ? (channel === 'sms' ? ({...a, phone: value} as Account) : {...a, email: value}) : a))}
              onBack={back}
              onNext={via => {
                if (signingIn) return void checkNumber();
                setCodeVia(via);
                go('verified');
              }}
            />
            <Dialog
              visible={noAccount}
              title="No account found"
              confirm="Create an account"
              onConfirm={() => {
                setNoAccount(false);
                // Carry on signing up with the number just checked (on a phone with no account yet).
                const to = nextOf('code', 'create', flow);
                setSigningIn(false);
                setRoute('phone');
                setAccount({kind: 'phone', contact: signInPhone, verified: false});
                setPassword(undefined);
                if (to && to !== 'home') setStep(to);
              }}
              cancel="Try another number"
              onCancel={() => {
                setNoAccount(false);
                go('tryAnother');
              }}>
              There's no VUKA account for this number on this phone.
            </Dialog>
          </>
        ) : step === 'name' ? (
          <NameStep name={name} setName={setName} surname={surname} setSurname={setSurname} fromGoogle={route === 'google'} onBack={back} onNext={() => go('continue')} />
        ) : step === 'permissions' ? (
          <PermissionsStep onBack={back} onNext={() => go('continue')} />
        ) : step === 'pins' ? (
          <SetPins
            onBack={back}
            onDone={(normal, second) => {
              setPin(normal);
              setDuress(second);
              go('continue');
            }}
          />
        ) : step === 'invite' ? (
          <InviteStep invites={device.profile?.invites?.length ?? 0} onInvite={onInvite ?? onDone} onFinish={() => go('finish')} />
        ) : (
          <CreateRecord
            name={name}
            pin={pin}
            duress={duress}
            account={account}
            surname={surname}
            password={password}
            recovery={codeVia === 'sms' ? 'phone' : codeVia === 'email' ? 'email' : undefined}
            onDone={() => {
              // The PINs are with the PIN module now; drop them from this screen's memory.
              setPin('');
              setDuress('');
              go('continue');
            }}
          />
        )}
        {sim}
      </ScrollView>
    </View>
  );
}

/** His Welcome. The first body line says what VIGIL does (it listens while active, ADR-0046), not his journey arming. */
function Welcome({signedOut, onNext, onGuardian, onSignIn, onCreate}: {signedOut: boolean; onNext: () => void; onGuardian: () => void; onSignIn: () => void; onCreate: () => void}) {
  const lines = [
    'It listens on this phone while VIGIL is active — never when you have deactivated it.',
    'A distress sound shows a quiet check-in, not an alarm.',
    'Your guardians only hear from VIGIL if you don’t answer, or if you use your duress PIN.',
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
        <Text style={[type.caption, {flex: 1}]}>Discreet, not invisible: Android shows a microphone dot while VIGIL is listening.</Text>
      </View>
      {signedOut ? (
        <Panel>
          <Text style={type.label}>Signed out</Text>
          <Text style={[type.body, {marginTop: space.xs}]}>
            VIGIL isn’t listening on this phone. Your account, key and record are still here: sign in to turn protection back on.
          </Text>
        </Panel>
      ) : null}
      <View style={{flexGrow: 1}} />
      {signedOut ? (
        // Kept: sign-up would replace this phone's key and record, so a signed-out phone is offered Sign in.
        <View style={{gap: 10}}>
          <Key label="Sign in" variant="signal" onPress={onSignIn} />
          <QuietKey label="Create account" onPress={onCreate} />
        </View>
      ) : (
        <View style={{gap: 10}}>
          <Key label="Get started" variant="signal" onPress={onNext} />
          <Key label="I'm a guardian" variant="ghost" onPress={onGuardian} accessibilityHint="Someone sent you a code" />
        </View>
      )}
    </View>
  );
}

/** His "Your name" (step 5). After Google it is filled in from the account and can be changed. */
function NameStep({
  name,
  setName,
  surname,
  setSurname,
  fromGoogle,
  onBack,
  onNext,
}: {
  name: string;
  setName: (s: string) => void;
  surname: string;
  setSurname: (s: string) => void;
  fromGoogle: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  const [error, setError] = useState(false);
  const submit = () => {
    const ok = name.trim().length >= 1 && surname.trim().length >= 1;
    setError(!ok);
    if (ok) onNext();
  };
  return (
    <View style={styles.screen}>
      <TopAppBar title="" onBack={onBack} />
      <StepMark n={5} />
      <Text style={type.display} accessibilityRole="header">
        Your name
      </Text>
      <Text style={type.body}>
        {fromGoogle ? "We've filled this in from your Google account. Change it if you'd rather guardians see something else." : 'Guardians see this name on an alert.'}
      </Text>
      <Text style={type.label}>First name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Thandi"
        placeholderTextColor={colors.textDim}
        autoCapitalize="words"
        autoComplete="name-given"
        textContentType="givenName"
        maxLength={30}
        returnKeyType="next"
        style={styles.field}
        accessibilityLabel="First name"
      />
      <Text style={type.label}>Surname</Text>
      <TextInput
        value={surname}
        onChangeText={setSurname}
        placeholder="Dlamini"
        placeholderTextColor={colors.textDim}
        autoCapitalize="words"
        autoComplete="name-family"
        textContentType="familyName"
        maxLength={40}
        onSubmitEditing={submit}
        style={styles.field}
        accessibilityLabel="Surname"
      />
      <InlineError>{error ? 'Enter both your first name and surname.' : ''}</InlineError>
      <View style={{flexGrow: 1}} />
      <Key label="Continue" variant="signal" onPress={submit} />
    </View>
  );
}

type PinStage = 'normal1' | 'normal2' | 'duress1' | 'duress2';

/**
 * His "Set your PINs" (step 7): the normal PIN twice, then the duress PIN
 * twice, on one keypad that is the same for both. The PINs stay in this
 * screen's memory until the duress PIN is confirmed.
 */
function SetPins({onBack, onDone}: {onBack: () => void; onDone: (normal: string, duress: string) => void}) {
  const [stage, setStage] = useState<PinStage>('normal1');
  const [normal, setNormal] = useState('');
  const [second, setSecond] = useState('');
  const [error, setError] = useState('');
  const copy: Record<PinStage, [string, string]> = {
    normal1: ['Set your normal PIN', 'Enter a 4-digit PIN. You’ll use this for every ordinary check-in.'],
    normal2: ['Confirm your normal PIN', 'Enter it again to confirm.'],
    duress1: ['Set your duress PIN', 'Your duress PIN works exactly like your normal PIN on screen. Behind the scenes it quietly alerts your guardians.'],
    duress2: ['Confirm your duress PIN', 'Enter it again to confirm.'],
  };
  const complete = (entered: string) => {
    setError('');
    if (stage === 'normal1') {
      setNormal(entered);
      setStage('normal2');
    } else if (stage === 'normal2') {
      if (entered === normal) return setStage('duress1');
      setNormal('');
      setError('Those two PINs didn’t match. Start again.');
      setStage('normal1');
    } else if (stage === 'duress1') {
      if (entered === normal) return setError('Your duress PIN must be different from your normal PIN.');
      setSecond(entered);
      setStage('duress2');
    } else if (entered === second) {
      const n = normal;
      setNormal('');
      setSecond('');
      onDone(n, entered);
    } else {
      setSecond('');
      setError('Those two PINs didn’t match. Start again.');
      setStage('duress1');
    }
  };
  return (
    <View style={styles.screen}>
      <TopAppBar title="" onBack={onBack} />
      <StepMark n={7} />
      <Text style={type.display} accessibilityRole="header">
        Set your PINs
      </Text>
      <Text style={type.title}>{copy[stage][0]}</Text>
      <Text style={type.body}>{copy[stage][1]}</Text>
      {/* Reserved height, so a message never moves the keypad. */}
      <Text style={styles.note} accessibilityLiveRegion="polite">
        {error}
      </Text>
      <PinKeypad key={stage} onComplete={complete} />
    </View>
  );
}

type Phase = 'idle' | 'working' | 'made' | 'failed';

/**
 * Kept, VIGIL only: the member's key and the genesis entry of their record,
 * registered with the server. Placed where his flow finishes the PINs.
 */
function CreateRecord({
  name,
  pin,
  duress,
  account,
  surname,
  password,
  recovery,
  onDone,
}: {
  name: string;
  pin: string;
  duress: string;
  account: Account | null;
  surname: string;
  password?: PasswordHash;
  recovery?: RecoveryChannel;
  onDone: () => void;
}) {
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
      // Saved with the profile, before anything else can interrupt: kept on this phone only.
      await device.setAccount(account ?? undefined, surname, {password: account?.kind === 'email' ? password : undefined, recovery});
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
      <StepMark n={7} />
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
  rowHeader: {flexDirection: 'row', alignItems: 'center', gap: 10},
  noteRow: {flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, paddingHorizontal: 4},
  note: {...type.body, color: colors.textTitle, textAlign: 'center', minHeight: 48},
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
