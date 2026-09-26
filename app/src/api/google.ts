/**
 * Real Google sign-in through Firebase Authentication (Android only).
 *
 * Used only when this build is connected to Firebase: app/android/app/
 * google-services.json was present at build time, so the google-services
 * Gradle plugin initialised the default Firebase app and wrote the project's
 * web OAuth client (the oauth_client with client_type 3) as the string
 * resource `default_web_client_id`. Without that file `googleAvailable()` is
 * false and the screens keep today's SIMULATED Google route, labelled so.
 *
 * What leaves the phone on this route: Google receives the sign-in, and
 * Firebase Authentication (the team's Firebase project) keeps a user with the
 * Google email, name and uid. VIGIL's own server never receives any of it,
 * and it never enters the record. Identity in VIGIL stays the key on this phone.
 *
 * webClientId: @react-native-google-signin/google-signin 11.0.1 on Android
 * asks Google for an ID token only when configure() is given `webClientId`
 * (android/.../Utils.java: `requestIdToken(webClientId)` inside
 * `if (webClientId != null && !webClientId.isEmpty())`), and Firebase needs
 * that ID token. RNFB's app options don't carry it on Android (`clientId` is
 * "iOS only" in @react-native-firebase/app lib/index.d.ts), so a tiny native
 * getter (VigilGoogleConfig, detect/GoogleConfigModule.kt) reads
 * `default_web_client_id` by name, and is empty when the resource is absent.
 */
import {NativeModules} from 'react-native';
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import {GoogleSignin, statusCodes, type User} from '@react-native-google-signin/google-signin';

/** The Google account Firebase Authentication confirmed. */
export type GoogleAccount = {email: string; name?: string; givenName?: string; familyName?: string; uid: string};

export type GoogleFailure = 'not_configured' | 'cancelled' | 'in_progress' | 'no_play_services' | 'failed';
export type GoogleResult = {ok: true; account: GoogleAccount} | {ok: false; reason: GoogleFailure; message: string};

const MESSAGES: Record<GoogleFailure, string> = {
  not_configured: "Google sign-in isn't set up in this build.",
  cancelled: 'Google sign-in was cancelled. Nothing was saved.',
  in_progress: 'Google sign-in is already open. Finish it there, or try again.',
  no_play_services: 'Google sign-in needs Google Play services, which are missing or out of date on this phone. Update them, or choose another way.',
  failed: "Google sign-in didn't work. Check your connection and try again, or choose another way.",
};

const fail = (reason: GoogleFailure): GoogleResult => ({ok: false, reason, message: MESSAGES[reason]});

/** The project's web OAuth client id, from the native resource; undefined when the build has none. */
function webClientId(): string | undefined {
  const id = NativeModules.VigilGoogleConfig?.webClientId;
  return typeof id === 'string' && id.trim() ? id : undefined;
}

/** True when this build is connected to Firebase and has the web client id Google sign-in needs. */
export function googleAvailable(): boolean {
  try {
    return firebase.apps.length > 0 && webClientId() !== undefined;
  } catch {
    return false;
  }
}

/** v11 resolves the User itself; later versions wrap it as {type, data}. Either is read. */
function readUser(r: unknown): User | 'cancelled' | null {
  if (!r || typeof r !== 'object') return null;
  const o = r as {type?: string; data?: unknown};
  if (o.type === 'cancelled') return 'cancelled';
  const u = (o.data && typeof o.data === 'object' ? o.data : r) as Partial<User>;
  return u.user && typeof u.user === 'object' ? (u as User) : null;
}

/**
 * Google's account chooser, then Firebase Authentication with its ID token.
 * Never throws: every failure is a result with a message a screen can show.
 */
export async function googleSignIn(): Promise<GoogleResult> {
  const clientId = webClientId();
  if (!googleAvailable() || !clientId) return fail('not_configured');
  try {
    GoogleSignin.configure({webClientId: clientId});
    await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
    const got = readUser(await GoogleSignin.signIn());
    if (got === 'cancelled') return fail('cancelled');
    if (!got?.idToken) return fail('failed');
    const cred = await auth().signInWithCredential(auth.GoogleAuthProvider.credential(got.idToken));
    const email = cred.user.email ?? got.user.email;
    if (!email) return fail('failed');
    return {
      ok: true,
      account: {
        email,
        name: cred.user.displayName ?? got.user.name ?? undefined,
        givenName: got.user.givenName ?? undefined,
        familyName: got.user.familyName ?? undefined,
        uid: cred.user.uid,
      },
    };
  } catch (e) {
    const code = (e as {code?: unknown})?.code;
    if (code === statusCodes.SIGN_IN_CANCELLED) return fail('cancelled');
    if (code === statusCodes.IN_PROGRESS) return fail('in_progress');
    if (code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) return fail('no_play_services');
    return fail('failed');
  } finally {
    // The chooser shows again next time, rather than silently reusing this account.
    await Promise.resolve()
      .then(() => GoogleSignin.signOut())
      .catch(() => undefined);
  }
}

/**
 * The one account the SIMULATED chooser lists when this build has no
 * Firebase, as in Mutarisi's GoogleAccountChooserDialog. It is an example
 * address (example.co.za), not a real person's account, and nothing is sent
 * to Google. `uid` is empty: no identity provider confirmed it.
 */
export const SIMULATED_GOOGLE_ACCOUNT: GoogleAccount = Object.freeze({
  email: 'thandi.dlamini@example.co.za',
  name: 'Thandi Dlamini',
  givenName: 'Thandi',
  familyName: 'Dlamini',
  uid: '',
});

/** Splits a Google profile into first name and surname for the name step. */
export function googleName(a: GoogleAccount): {first: string; last: string} {
  const parts = (a.name ?? '').trim().split(/\s+/).filter(Boolean);
  return {first: (a.givenName ?? parts[0] ?? '').trim(), last: (a.familyName ?? parts.slice(1).join(' ')).trim()};
}
