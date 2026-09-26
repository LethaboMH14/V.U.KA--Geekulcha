/**
 * The sign-up screens rendered and walked, in the SIMULATED build jest runs
 * (no Firebase): Google through his chooser, the number skipped, the code by
 * email, the name filled in from Google, both PINs, up to "Start your
 * record"; and Back from the name returning to the number. Also "Already
 * have an account? Sign in" → Sign in, and Back to Create your account.
 */
import 'react-native';
import React from 'react';
import renderer, {act, type ReactTestInstance} from 'react-test-renderer';
import {Onboarding} from '../onboarding';

jest.useFakeTimers();

const texts = (n: ReactTestInstance): string[] =>
  n.children.flatMap(c => (typeof c === 'string' ? [c] : texts(c)));
const shown = (t: renderer.ReactTestRenderer) => texts(t.root).join(' | ');

/** Presses the innermost pressable showing `label` (or labelled with it); a disabled one ignores it, as on a phone. */
async function press(t: renderer.ReactTestRenderer, label: string) {
  const hits = t.root.findAll(n => typeof n.props.onPress === 'function' && (n.props.accessibilityLabel === label || texts(n).join('') === label));
  if (!hits.length) throw new Error(`no "${label}" in: ${shown(t)}`);
  const hit = hits[hits.length - 1];
  if (hit.props.disabled) return;
  await act(async () => {
    hit.props.onPress();
  });
}

async function type(t: renderer.ReactTestRenderer, label: string, value: string) {
  const field = t.root.find(n => n.props.accessibilityLabel?.startsWith?.(label) && typeof n.props.onChangeText === 'function');
  await act(async () => {
    field.props.onChangeText(value);
  });
}

async function pin(t: renderer.ReactTestRenderer, digits: string) {
  for (const d of digits) await press(t, d);
}

function mount() {
  let t: renderer.ReactTestRenderer | undefined;
  act(() => {
    t = renderer.create(<Onboarding onDone={jest.fn()} onGuardian={jest.fn()} onSignedIn={jest.fn()} />);
  });
  return t!;
}

test('Google (SIMULATED chooser) → skip the number → code by email → name → permissions → PINs → record', async () => {
  const t = mount();
  expect(shown(t)).toContain('Get started');
  expect(shown(t)).toContain("I'm a guardian");
  await press(t, 'Get started');
  expect(shown(t)).toContain('Create your account');
  expect(shown(t)).toContain('STEP 2 OF 8');
  await press(t, 'I agree to the Terms and the Privacy notice');
  await press(t, 'Continue with Google');
  expect(shown(t)).toContain('SIMULATED CHOOSER');
  await press(t, 'Thandi Dlamini, thandi.dlamini@example.co.za');
  expect(shown(t)).toContain('Phone number');
  expect(shown(t)).toContain('Google · thandi.dlamini@example.co.za · simulated');
  await press(t, 'Skip for now');
  expect(shown(t)).toContain('Enter the 6-digit code we sent to thandi.dlamini@example.co.za.');
  await type(t, 'Code', '123456');
  expect(shown(t)).toContain('Your name');
  expect(shown(t)).toContain("We've filled this in from your Google account.");
  // Back from the name returns to the number: the used code is done with.
  await press(t, 'Navigate up');
  expect(shown(t)).toContain('Phone number');
  await press(t, 'Skip for now');
  await type(t, 'Code', '654321');
  await press(t, 'Continue');
  expect(shown(t)).toContain('Permissions');
  await press(t, 'Continue');
  expect(shown(t)).toContain('Set your normal PIN');
  await pin(t, '1234');
  expect(shown(t)).toContain('Confirm your normal PIN');
  await pin(t, '1234');
  expect(shown(t)).toContain('Set your duress PIN');
  await pin(t, '1234');
  expect(shown(t)).toContain('Your duress PIN must be different from your normal PIN.');
  await pin(t, '5678');
  await pin(t, '5679');
  expect(shown(t)).toContain('Those two PINs didn’t match. Start again.');
  expect(shown(t)).toContain('Set your duress PIN');
  await pin(t, '5678');
  await pin(t, '5678');
  expect(shown(t)).toContain('Start your record');
  act(() => t.unmount());
});

test('the options stay off until the terms are ticked; email sign-up checks his rules', async () => {
  const t = mount();
  await press(t, 'Get started');
  await press(t, 'Sign up with email');
  expect(shown(t)).not.toContain('Confirm password');
  await press(t, 'I agree to the Terms and the Privacy notice');
  await press(t, 'Sign up with email');
  expect(shown(t)).toContain('Confirm password');
  await type(t, 'Email', 'thandi@example.co.za');
  await type(t, 'Password', 'short');
  await press(t, 'Continue');
  expect(shown(t)).toContain('Use at least 8 characters for your password.');
  await type(t, 'Password', 'long enough');
  await type(t, 'Confirm password', 'long enougH');
  await press(t, 'Continue');
  expect(shown(t)).toContain("Those two passwords don't match.");
  act(() => t.unmount());
});

test('"Already have an account? Sign in" → Sign in; Back returns to Create your account', async () => {
  const t = mount();
  await press(t, 'Get started');
  await press(t, 'Already have an account? Sign in');
  expect(shown(t)).toContain('Sign in with Google');
  expect(shown(t)).toContain('Sign in with your phone number');
  expect(shown(t)).toContain('or with email');
  expect(shown(t)).toContain('New to VUKA? Create an account');
  await press(t, 'Sign in');
  expect(shown(t)).toContain("That email and password don't match an account on this phone.");
  await press(t, 'Sign in with your phone number');
  expect(shown(t)).toContain("We'll text a code to check it's really you.");
  expect(shown(t)).not.toContain('Skip for now');
  await press(t, 'Navigate up');
  expect(shown(t)).toContain('Sign in with Google');
  await press(t, 'Navigate up');
  expect(shown(t)).toContain('Create your account');
  act(() => t.unmount());
});
