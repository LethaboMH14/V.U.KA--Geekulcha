/**
 * The phone's side of ANCHOR: its Keystore signer, its sealed profile, its two
 * PINs, its event queue and its journey (spec V5–V9, §3, §4b, §8, §9).
 *
 * Every event is signed on the phone, checked against its payload schema,
 * sealed into the queue, then sent in order. It leaves the queue only on a
 * server receipt, and the receipt is kept as the member's own copy of their
 * record.
 *
 * Journeys follow the slice-3 server (PR #89): `POST /v1/journeys` issues the
 * journey id; every journey event targets that journey; heartbeats go every
 * 30 s while it runs (V9) and are not chain entries.
 *
 * Duress parity (V5, V6): screens call `checkin.enter(pin)` or `endJourney()`
 * and get back only "done" or "try again". Which PIN it was is known here,
 * inside the signed payload, and nowhere else on the phone: not on screen,
 * not in the local record, not in the request size ("normal_pin"/"duress_pin"
 * and "normal"/"duress" are the same length). Both PINs take the same code
 * path: the same events, signed and queued the same way, and the screen moves
 * on as soon as they are queued, never waiting for the network.
 *
 * Off a phone (browser preview, tests) a SIMULATED backend stands in: PINs are
 * held in memory, nothing is signed and nothing is sent.
 */
import {NativeModules, Platform} from 'react-native';
import {canonicalJson} from '../../../shared/canonical.js';
import {buildEvent, postEvent, rfc3339, signedRequest, uuid, type EventPayload, type EventSubmission, type Receipt, type Signer} from './events';
import {checkPayload} from './payloads';

export const MODEL_SHA256 = '10c95ea3eb9a7bb4cb8bddf6feb023250381008177ac162ce169694d05c317de';
/**
 * The laptop server, as a test build reaches it: the emulator's host alias, or
 * localhost on a USB-connected phone after `adb reverse tcp:8000 tcp:8000`.
 * Release builds allow https only, so the member sets a real address in Settings.
 */
const fingerprint = String(((Platform.constants ?? {}) as {Fingerprint?: string}).Fingerprint ?? '');
export const DEFAULT_SERVER = /generic|emulator|sdk_gphone/i.test(fingerprint) ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
/** Spec §7 allows 20 or 60. The member gets the longer window. */
export const CHECKIN_WINDOW_S = 60;

type Item = {seq: number; json: string};
export type Backend = {
  simulated: boolean;
  signer: Signer;
  enqueue(json: string): Promise<number>;
  pending(): Promise<Item[]>;
  markReceived(seq: number, receiptJson: string): Promise<boolean>;
  received(): Promise<Item[]>;
  setProfile(json: string): Promise<boolean>;
  getProfile(): Promise<string | null>;
  pinsSet(): Promise<boolean>;
  setPins(normal: string, duress: string): Promise<boolean>;
  verify(pin: string): Promise<'normal' | 'duress' | 'wrong'>;
  post(url: string, entry: EventSubmission): Promise<Receipt>;
  request<T>(url: string, method: string, path: string, body: string): Promise<T>;
};

export type Profile = {
  v: 1;
  firstName: string;
  subjectId: string;
  actorId: string;
  serverUrl: string;
};

/** What the phone keeps about each received event. Never the PIN mode. */
export type RecordEntry = {
  seq: number;
  kind: string;
  ts: string;
  event_id: string;
  event_hash: string;
  chain_index: number;
  received_at: string;
};

export type Delivery = {
  queued: number;
  received: number;
  sending: boolean;
  lastError?: string;
  lastSentAt?: string;
  /** The last heartbeat the server accepted (V9). */
  lastContactAt?: string;
};

/** Why a journey didn't start. */
export class JourneyStartError extends Error {
  constructor(readonly reason: 'offline' | 'refused', message: string) {
    super(message);
  }
}

type Target = {targetType: 'journey' | 'subject'; targetId: string};

export function createDevice(b: Backend) {
  let profile: Profile | null = null;
  let delivery: Delivery = {queued: 0, received: 0, sending: false};
  const listeners = new Set<(d: Delivery) => void>();
  const publish = (patch: Partial<Delivery>) => {
    delivery = {...delivery, ...patch};
    listeners.forEach(l => l(delivery));
  };

  async function refreshCounts() {
    const [p, r] = await Promise.all([b.pending(), b.received()]);
    publish({queued: p.length, received: r.length});
  }

  const subject = (): Target => ({targetType: 'subject', targetId: profile!.subjectId});
  const journey = (id: string): Target => ({targetType: 'journey', targetId: id});

  /**
   * Checks, signs and seals one event into the queue. It is evidence from
   * this moment. Resolves with the event's id once it is queued.
   */
  async function record(payload: EventPayload, target: Target, opts: {action?: string; genesis?: boolean; send?: boolean} = {}): Promise<string> {
    if (!profile) throw new Error('no profile');
    checkPayload(payload);
    const entry = await buildEvent({
      signer: b.signer,
      subjectId: profile.subjectId,
      actorId: profile.actorId,
      action: opts.action ?? 'device_event',
      targetType: target.targetType,
      targetId: target.targetId,
      payload,
      ts: rfc3339(new Date()),
      genesis: opts.genesis,
    });
    await b.enqueue(JSON.stringify(entry));
    publish({queued: delivery.queued + 1});
    if (opts.send !== false) void flush();
    return entry.details.event_id;
  }

  /** §4b.1: the inner signature covers exactly {action, target_id, mode, nonce}. */
  async function pinAuthorised(action: 'end_journey' | 'export', targetId: string, mode: 'normal' | 'duress'): Promise<EventPayload> {
    const {keyId} = await b.signer.identity();
    const statement = {action, target_id: targetId, mode, nonce: await b.signer.randomBytes(16)};
    const sig = await b.signer.signDer(canonicalJson(statement));
    return {kind: 'pin_authorised', pv: 1, ...statement, sig, signer_key_id: keyId};
  }

  let flushing: Promise<void> | null = null;
  let again = false;
  /**
   * Sends queued events oldest first, and keeps going until nothing new was
   * queued meanwhile. A network or server failure stops the pass (it retries
   * on the next event or the next timer). A refusal (4xx) leaves that event
   * queued with its reason shown, and the pass moves on, because the server
   * enforces unique counters, not their order.
   */
  function flush(): Promise<void> {
    if (b.simulated || !profile) return Promise.resolve();
    if (flushing) {
      again = true;
      return flushing;
    }
    const p = profile;
    flushing = (async () => {
      publish({sending: true});
      let lastError: string | undefined;
      try {
        let refused = new Set<number>();
        do {
          again = false;
          for (const it of await b.pending()) {
            if (refused.has(it.seq)) continue;
            const entry = JSON.parse(it.json) as EventSubmission;
            try {
              const receipt = await b.post(p.serverUrl, entry);
              const kept: Omit<RecordEntry, 'seq'> = {
                kind: String(entry.payload.kind),
                ts: entry.ts,
                event_id: entry.details.event_id,
                event_hash: receipt.event_hash,
                chain_index: receipt.chain_index,
                received_at: receipt.received_at,
              };
              await b.markReceived(it.seq, JSON.stringify(kept));
              publish({lastSentAt: receipt.received_at});
            } catch (e) {
              lastError = String(e instanceof Error ? e.message : e);
              if (!/^4\d\d /.test(lastError)) {
                again = false;
                break;
              }
              refused.add(it.seq);
            }
          }
        } while (again);
        refused = new Set();
      } finally {
        await refreshCounts().catch(() => undefined);
        // A reason stays on show while anything is still waiting.
        publish({sending: false, lastError: delivery.queued ? lastError : undefined});
        flushing = null;
      }
    })();
    return flushing;
  }

  return {
    simulated: b.simulated,

    async load(): Promise<{profile: Profile | null; pinsSet: boolean}> {
      const s = await b.getProfile();
      profile = s ? (JSON.parse(s) as Profile) : null;
      const pinsSet = await b.pinsSet();
      if (profile) await refreshCounts();
      return {profile, pinsSet};
    },

    get profile() {
      return profile;
    },

    setPins: (normal: string, duress: string) => b.setPins(normal, duress),

    /**
     * Creates the profile and queues the genesis registration (§3). The chain
     * identities derive from this phone's key, so they are stable per phone.
     */
    async register(firstName: string, appVersion: string): Promise<Profile> {
      const {keyId} = await b.signer.identity();
      const short = keyId.replace(/^dev_/, '').slice(0, 8);
      // sim_ prefixes: the server accepts only simulation subjects (VUKA_SIM_ONLY).
      profile = {v: 1, firstName, subjectId: `sim_subj_${short}`, actorId: `sim_member_${short}`, serverUrl: DEFAULT_SERVER};
      await b.setProfile(JSON.stringify(profile));
      // §18 registration: never IMEI, serial, Android ID or phone number.
      await record(
        {kind: 'registration', pv: 1, app_version: appVersion, model_sha256: MODEL_SHA256, android_api: 34, device_model: 'android'},
        subject(),
        {action: 'registration', genesis: true},
      );
      return profile;
    },

    async setServer(url: string) {
      if (!profile) return;
      profile = {...profile, serverUrl: url.trim().replace(/\/$/, '')};
      await b.setProfile(JSON.stringify(profile));
      void flush();
    },

    /**
     * Starts a journey on the server, which issues its id, then queues
     * `journey_armed`. A journey can't start without the server: its
     * check-ins could never reach a guardian, so the member is told instead.
     * The genesis registration must be received first, so it is sent now.
     */
    async startJourney(appVersion: string): Promise<string> {
      if (!profile) throw new JourneyStartError('refused', 'no profile');
      if (b.simulated) return `sim_jny_${Date.now()}`;
      await flush();
      let id: string;
      try {
        ({journey_id: id} = await b.request<{journey_id: string}>(profile.serverUrl, 'POST', '/v1/journeys', ''));
      } catch (e) {
        const m = String(e instanceof Error ? e.message : e);
        throw new JourneyStartError(/^\d{3} /.test(m) ? 'refused' : 'offline', m);
      }
      await record({kind: 'journey_armed', pv: 1, journey_id: id, app_version: appVersion}, journey(id));
      return id;
    },

    /** V9: every 30 s while armed. Activity only, never location; not evidence. */
    async heartbeat(journeyId: string, speedBucket: string): Promise<void> {
      if (b.simulated || !profile) return;
      const body = canonicalJson({speed_bucket: speedBucket, ts: rfc3339(new Date())});
      try {
        await b.request(profile.serverUrl, 'POST', `/v1/journeys/${encodeURIComponent(journeyId)}/heartbeat`, body);
        publish({lastContactAt: new Date().toISOString()});
      } catch {
        // A missed heartbeat is only missed; the next one follows in 30 s.
      }
    },

    /** A confirmed detection. Resolves with its event id once queued. */
    signal: (journeyId: string, payload: EventPayload) => record(payload, journey(journeyId)),

    /**
     * One check-in (§4b, §8, T47). Call `shown()` once the check is on
     * screen: that is when `checkin_opened` is recorded. `enter(pin)` gives
     * "checked" or "retry": wrong PINs 1–3 each get the same "Try again";
     * from then on every entry shows "Checked in" (the outcome is already
     * no_answer server-side), so the check-in is never a PIN oracle.
     */
    async openCheckin(journeyId: string, signalEventId: string) {
      const checkinId = await uuid(b.signer);
      let opened: Promise<string> | null = null;
      const shown = (): Promise<string> =>
        (opened ??= record(
          {kind: 'checkin_opened', pv: 1, checkin_id: checkinId, journey_id: journeyId, signal_event_id: signalEventId, window_s: CHECKIN_WINDOW_S},
          journey(journeyId),
        ));
      let entries = 0;
      return {
        checkinId,
        shown,
        async enter(pin: string): Promise<'checked' | 'retry'> {
          entries += 1;
          const attempt = entries;
          const mode = await b.verify(pin);
          if (mode === 'wrong') return attempt > 3 ? 'checked' : 'retry';
          await shown();
          await record(
            {kind: 'checkin_result', pv: 1, checkin_id: checkinId, result: mode === 'duress' ? 'duress_pin' : 'normal_pin', attempt},
            journey(journeyId),
          );
          return 'checked';
        },
      };
    },

    /**
     * Ending a journey needs a PIN (G35, §4b.1): a `pin_authorised` for
     * `end_journey` whose inner signature covers {action, target_id, mode,
     * nonce}, then `journey_ended`. Both are queued before either is sent,
     * so they go in one pass, inside the authorisation's 120 s.
     */
    async endJourney(journeyId: string, pin: string): Promise<'ended' | 'retry'> {
      const mode = await b.verify(pin);
      if (mode === 'wrong') return 'retry';
      await record(await pinAuthorised('end_journey', journeyId, mode), subject(), {send: false});
      await record({kind: 'journey_ended', pv: 1, journey_id: journeyId}, journey(journeyId));
      return 'ended';
    },

    /**
     * Opening My record needs the PIN (§9 export authority). Both PINs open
     * the same view; a duress PIN here is a duress signal like anywhere else (V6).
     */
    async authoriseExport(pin: string): Promise<'ok' | 'retry'> {
      const mode = await b.verify(pin);
      if (mode === 'wrong') return 'retry';
      await record(await pinAuthorised('export', profile!.subjectId, mode), subject());
      return 'ok';
    },

    flush,

    delivery: () => delivery,
    onDelivery(l: (d: Delivery) => void) {
      listeners.add(l);
      return () => listeners.delete(l);
    },

    /** The member's own copy of their record: every receipt, oldest first. */
    async myRecord(): Promise<RecordEntry[]> {
      const items = await b.received();
      return items.map(it => {
        const r = JSON.parse(it.json) as Omit<RecordEntry, 'seq'>;
        return {seq: it.seq, ...r};
      });
    },
  };
}

export type Device = ReturnType<typeof createDevice>;

// ---- backends ---------------------------------------------------------------

type NativeQueue = Pick<Backend, 'enqueue' | 'pending' | 'markReceived' | 'received' | 'setProfile' | 'getProfile'>;
type NativePin = {isSet(): Promise<boolean>; setPins(n: string, d: string): Promise<boolean>; verify(p: string): Promise<'normal' | 'duress' | 'wrong'>};

function nativeBackend(): Backend | null {
  const signer: Signer | undefined = NativeModules.VigilSigner;
  const queue: NativeQueue | undefined = NativeModules.VigilQueue;
  const pins: NativePin | undefined = NativeModules.VigilPin;
  if (!signer || !queue || !pins) return null;
  return {
    simulated: false,
    signer,
    enqueue: j => queue.enqueue(j),
    pending: () => queue.pending(),
    markReceived: (s, r) => queue.markReceived(s, r),
    received: () => queue.received(),
    setProfile: j => queue.setProfile(j),
    getProfile: () => queue.getProfile(),
    pinsSet: () => pins.isSet(),
    setPins: (n, d) => pins.setPins(n, d),
    verify: p => pins.verify(p),
    post: (url, entry) => postEvent(url, signer, entry),
    request: (url, method, path, body) => signedRequest(url, signer, method, path, body),
  };
}

/** SIMULATED: the browser preview. PINs in memory, nothing signed, nothing sent. */
export function simBackend(): Backend {
  let n = 0;
  let q: Item[] = [];
  let prof: string | null = null;
  let pins: {normal: string; duress: string} | null = null;
  const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const rand = (k: number) => {
    // Base64 of k random bytes, the shape the native signer returns.
    let bits = '';
    for (let i = 0; i < k; i++) bits += Math.floor(Math.random() * 256).toString(2).padStart(8, '0');
    let out = '';
    for (let i = 0; i < bits.length; i += 6) out += B64[parseInt(bits.slice(i, i + 6).padEnd(6, '0'), 2)];
    return out + '='.repeat((3 - (k % 3)) % 3);
  };
  return {
    simulated: true,
    signer: {
      identity: async () => ({publicKey: 'sim', keyId: 'dev_simulated00'}),
      sign: async () => 'c2lt',
      signDer: async () => 'c2lt',
      randomBytes: async k => rand(k),
      commitment: async () => '0'.repeat(64),
      sha256Hex: async () => '0'.repeat(64),
      nextCounter: async () => ++n,
    },
    enqueue: async j => {
      q.push({seq: q.length + 1, json: j});
      return q.length;
    },
    pending: async () => q,
    markReceived: async s => {
      q = q.filter(i => i.seq !== s);
      return true;
    },
    received: async () => [],
    setProfile: async j => {
      prof = j;
      return true;
    },
    getProfile: async () => prof,
    pinsSet: async () => pins !== null,
    setPins: async (normal, duress) => {
      if (!/^\d{4,8}$/.test(normal) || !/^\d{4,8}$/.test(duress)) throw new Error('PINs must be 4 to 8 digits');
      if (normal === duress) throw new Error('the two PINs must be different');
      pins = {normal, duress};
      return true;
    },
    verify: async p => (pins && p === pins.normal ? 'normal' : pins && p === pins.duress ? 'duress' : 'wrong'),
    post: async () => {
      throw new Error('simulated: nothing is sent');
    },
    request: async () => {
      throw new Error('simulated: nothing is sent');
    },
  };
}

export const device: Device = createDevice(nativeBackend() ?? simBackend());
