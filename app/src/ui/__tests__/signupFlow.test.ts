/**
 * The sign-up and sign-in order against Mutarisi's nav_graph.xml
 * (feature/ui, 5aa5d24): every route forward, and Back from every step.
 */
import {back, chooseCodeChannel, next, phoneOptional, STEP_NUMBER, type Action, type FlowState, type Step} from '../signupFlow';

const fresh: FlowState = {route: null, signingIn: false, hasAccount: false, agreed: true};

/** Follows actions from Welcome and returns every step visited. */
function walk(s: FlowState, actions: Action[], from: Step = 'welcome'): (Step | 'home')[] {
  const seen: (Step | 'home')[] = [from];
  let at: Step | 'home' = from;
  for (const a of actions) {
    if (at === 'home') throw new Error('walked past home');
    const to = next(at, a, s);
    if (to === null) throw new Error(`${a} does nothing on ${at}`);
    seen.push(to);
    at = to;
  }
  return seen;
}

const tail: Action[] = ['continue', 'continue', 'continue', 'continue', 'finish'];
const tailSteps = ['name', 'permissions', 'pins', 'record', 'invite', 'home'];

test('Google: account → chooser → phone (optional) → code → name → … → Home', () => {
  const s = {...fresh, route: 'google' as const};
  expect(walk(s, ['getStarted', 'google', 'sendCode', 'verified', ...tail])).toEqual(['welcome', 'account', 'phone', 'code', ...tailSteps]);
  expect(phoneOptional(s)).toBe(true);
  expect(chooseCodeChannel(s)).toBe(true);
});

test('Google with the number skipped still verifies a code (by email), as his build', () => {
  const s = {...fresh, route: 'google' as const};
  expect(walk(s, ['getStarted', 'google', 'skip', 'verified', ...tail])).toEqual(['welcome', 'account', 'phone', 'code', ...tailSteps]);
});

test('email: account → email → phone (optional) → code → name → … → Home', () => {
  const s = {...fresh, route: 'email' as const};
  expect(walk(s, ['getStarted', 'email', 'continue', 'sendCode', 'verified', ...tail])).toEqual(['welcome', 'account', 'email', 'phone', 'code', ...tailSteps]);
  expect(walk(s, ['getStarted', 'email', 'continue', 'skip', 'verified'])).toEqual(['welcome', 'account', 'email', 'phone', 'code', 'name']);
});

test('phone: the number is required and cannot be skipped', () => {
  const s = {...fresh, route: 'phone' as const};
  expect(walk(s, ['getStarted', 'phone', 'sendCode', 'verified', ...tail])).toEqual(['welcome', 'account', 'phone', 'code', ...tailSteps]);
  expect(phoneOptional(s)).toBe(false);
  expect(next('phone', 'skip', s)).toBeNull();
});

test('Back from every sign-up step follows his graph', () => {
  const google = {...fresh, route: 'google' as const};
  const email = {...fresh, route: 'email' as const};
  const phone = {...fresh, route: 'phone' as const};
  expect(back('welcome', fresh)).toBeNull();
  expect(back('account', fresh)).toBe('welcome');
  expect(back('email', email)).toBe('account');
  expect(back('phone', email)).toBe('email');
  expect(back('phone', google)).toBe('account');
  expect(back('phone', phone)).toBe('account');
  expect(back('code', phone)).toBe('phone');
  // The code is used up: Back from the name returns to the number (his popUpTo verifyCode).
  expect(back('name', google)).toBe('phone');
  expect(back('permissions', phone)).toBe('name');
  expect(back('pins', phone)).toBe('permissions');
  // Kept: the record is registered, so neither it nor the invite step goes back.
  expect(back('record', phone)).toBeNull();
  expect(back('invite', phone)).toBeNull();
});

test('sign-in with Google or email and password → Welcome back → Home', () => {
  expect(walk(fresh, ['getStarted', 'signIn', 'found', 'found'])).toEqual(['welcome', 'account', 'signIn', 'welcomeBack', 'home']);
  expect(back('signIn', fresh)).toBe('account');
  expect(back('welcomeBack', fresh)).toBe('signIn');
  // "New to VUKA? Create an account" goes back to Create your account.
  expect(next('signIn', 'create', fresh)).toBe('account');
});

test('sign-in by phone: number (required) → code by text → Welcome back', () => {
  const s = {...fresh, route: 'phone' as const, signingIn: true};
  expect(walk(s, ['phone', 'sendCode', 'found', 'found'], 'signIn')).toEqual(['signIn', 'phone', 'code', 'welcomeBack', 'home']);
  expect(phoneOptional({...s, route: 'email'})).toBe(false);
  expect(chooseCodeChannel(s)).toBe(false);
  expect(back('phone', s)).toBe('signIn');
  // Welcome back pops the used code: Back (or "Use a different number") returns to the number.
  expect(back('welcomeBack', s)).toBe('phone');
});

test('sign-in by phone, no account: "Try another number" or "Create an account"', () => {
  const s = {...fresh, route: 'phone' as const, signingIn: true};
  expect(next('code', 'tryAnother', s)).toBe('phone');
  expect(next('code', 'create', s)).toBe('name');
  // Terms not yet ticked: they are asked for before any details are kept.
  expect(next('code', 'create', {...s, agreed: false})).toBe('account');
  expect(next('code', 'verified', s)).toBeNull();
});

test('a signed-out phone never signs up over its account', () => {
  const s = {...fresh, hasAccount: true};
  expect(next('welcome', 'signIn', s)).toBe('signIn');
  expect(next('welcome', 'create', s)).toBe('haveAccount');
  expect(next('welcome', 'getStarted', s)).toBe('haveAccount');
  for (const a of ['google', 'email', 'phone'] as const) expect(next('account', a, s)).toBe('haveAccount');
  expect(next('signIn', 'create', s)).toBe('haveAccount');
  expect(next('code', 'create', {...s, route: 'phone', signingIn: true})).toBe('haveAccount');
  expect(back('signIn', s)).toBe('welcome');
  expect(next('haveAccount', 'signIn', s)).toBe('signIn');
  expect(back('haveAccount', s)).toBe('welcome');
});

test('his STEP n OF 8 marks', () => {
  expect(STEP_NUMBER).toEqual({account: 2, email: 2, phone: 3, code: 4, name: 5, permissions: 6, pins: 7, record: 7, invite: 8});
});
