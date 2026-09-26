/**
 * The sign-up and sign-in step order, as one pure function pair, following
 * Mutarisi's nav_graph.xml on feature/ui (5aa5d24) edge by edge:
 *
 *   welcome → account ("Create your account", terms first)
 *     account → Google chooser → phone (optional) → code → name
 *     account → email (email + password) → phone (optional) → code → name
 *     account → phone (required) → code → name
 *     phone (Google / email) → "Skip for now" → code by email → name
 *   name → permissions → pins → record → invite → Home
 *   account → "Already have an account? Sign in" → signIn
 *     signIn → Google or email + password → welcomeBack (PIN) → Home
 *     signIn → phone → code → welcomeBack, or "No account found"
 *
 * Differences kept on purpose (see onboarding.tsx): `record` ("Start your
 * record", registering the key and genesis entry with the server) sits where
 * his flow finishes the PINs, and neither it nor `invite` goes back (the
 * record already exists). A phone whose member signed out (`hasAccount`)
 * never signs up over its key: every sign-up route leads to `haveAccount`.
 */
export type Step =
  | 'welcome'
  | 'account'
  | 'email'
  | 'phone'
  | 'code'
  | 'name'
  | 'permissions'
  | 'pins'
  | 'record'
  | 'invite'
  | 'signIn'
  | 'welcomeBack'
  | 'haveAccount';

export type Route = 'google' | 'email' | 'phone';

export type FlowState = {
  /** How they chose to sign up; null before a choice. */
  route: Route | null;
  /** On the "Sign in" phone route (his `signingIn`): the number is required and the code goes by text. */
  signingIn: boolean;
  /** This phone holds a signed-out member's account (key, PINs, record). */
  hasAccount: boolean;
  /** Terms and Privacy notice ticked on "Create your account". */
  agreed: boolean;
};

export type Action =
  | 'getStarted'
  | 'signIn'
  | 'create'
  | 'google'
  | 'email'
  | 'phone'
  | 'continue'
  | 'sendCode'
  | 'skip'
  | 'verified'
  | 'found'
  | 'tryAnother'
  | 'finish';

/** Where an action leads; 'home' leaves onboarding; null means the action does nothing on that step. */
export function next(step: Step, action: Action, s: FlowState): Step | 'home' | null {
  const create: Step = s.hasAccount ? 'haveAccount' : 'account';
  switch (step) {
    case 'welcome':
      return action === 'getStarted' ? create : action === 'signIn' ? 'signIn' : action === 'create' ? create : null;
    case 'account':
      if (action === 'signIn') return 'signIn';
      if (s.hasAccount && (action === 'google' || action === 'email' || action === 'phone')) return 'haveAccount';
      return action === 'google' || action === 'phone' ? 'phone' : action === 'email' ? 'email' : null;
    case 'email':
      return action === 'continue' ? 'phone' : null;
    case 'phone':
      if (action === 'sendCode') return 'code';
      return action === 'skip' && phoneOptional(s) ? 'code' : null;
    case 'code':
      if (!s.signingIn) return action === 'verified' ? 'name' : null;
      // Sign-in: the number matched this phone's account, or "No account found".
      if (action === 'found') return 'welcomeBack';
      if (action === 'tryAnother') return 'phone';
      // "Create an account": carry on signing up with the checked number, once the terms are agreed.
      return action === 'create' ? (s.hasAccount ? 'haveAccount' : s.agreed ? 'name' : 'account') : null;
    case 'name':
      return action === 'continue' ? 'permissions' : null;
    case 'permissions':
      return action === 'continue' ? 'pins' : null;
    case 'pins':
      return action === 'continue' ? 'record' : null;
    case 'record':
      return action === 'continue' ? 'invite' : null;
    case 'invite':
      return action === 'finish' ? 'home' : null;
    case 'signIn':
      return action === 'phone' ? 'phone' : action === 'found' ? 'welcomeBack' : action === 'create' ? create : null;
    case 'welcomeBack':
      return action === 'found' ? 'home' : null;
    case 'haveAccount':
      return action === 'signIn' ? 'signIn' : null;
  }
}

/**
 * Where Back leads (the on-screen arrow and Android Back alike). null: no
 * step to go back to: Welcome leaves the app; the record and invite steps
 * stay put, because the record is already made.
 */
export function back(step: Step, s: FlowState): Step | null {
  switch (step) {
    case 'welcome':
    case 'record':
    case 'invite':
      return null;
    case 'account':
    case 'haveAccount':
      return 'welcome';
    case 'email':
      return 'account';
    case 'phone':
      return s.signingIn ? 'signIn' : s.route === 'email' ? 'email' : 'account';
    case 'code':
      return 'phone';
    // His verify-code screen pops itself: a used code is done with, so Back returns to the number.
    case 'name':
      return 'phone';
    case 'permissions':
      return 'name';
    case 'pins':
      return 'permissions';
    case 'signIn':
      return s.hasAccount ? 'welcome' : 'account';
    case 'welcomeBack':
      return s.signingIn ? 'phone' : 'signIn';
  }
}

/** The number is optional after Google or email sign-up ("Skip for now"); required on the phone route and at sign-in. */
export const phoneOptional = (s: FlowState): boolean => (s.route === 'google' || s.route === 'email') && !s.signingIn;

/** The code screen offers "Text message / Email" at sign-up; sign-in checks the number, so it stays on text. */
export const chooseCodeChannel = (s: FlowState): boolean => !s.signingIn;

/** His "STEP n OF 8" marks. Email sign-up is still step 2; the record step shares 7 with the PINs. */
export const STEP_NUMBER: Partial<Record<Step, number>> = {account: 2, email: 2, phone: 3, code: 4, name: 5, permissions: 6, pins: 7, record: 7, invite: 8};
