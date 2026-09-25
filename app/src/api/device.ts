/**
 * The phone's side of ANCHOR: its Keystore signer, its sealed profile, its two
 * PINs and its event queue (spec V5–V8, §3, §9).
 *
 * Every event is signed on the phone, sealed into the queue, then sent in
 * order; it leaves the queue only on a server receipt, and the receipt is
 * kept as the member's own copy of their record.
 *
 * Duress parity (V5, V6): screens call `checkin.enter(pin)` or
 * `endJourney(pin)` and get back only "done" or "try again". Which PIN it was
 * is known here, inside the signed payload, and nowhere else on the phone:
 * not on screen, not in the local record, not in the request size
 * ("normal_pin"/"duress_pin" and "normal"/"duress" are the same length).
 *
 * Journey events target the subject and carry `journey_id` in the payload:
 * the server on PR #51 has no `POST /v1/journeys` yet, so a journey-targeted
 * entry would have no owner to check against. When that route lands, only
 * `JOURNEY_TARGET` changes.
 *
 * Off a phone (browser preview, tests) a SIMULATED backend stands in: PINs are
 * held in memory, nothing is signed and nothing is sent.
 */
import {NativeModules, Platform} from 'react-native';
import {buildEvent, postEvent, rfc3339, type EventPayload, type EventSubmission, type Receipt, type Signer} from './events';

export const MODEL_SHA256 = '10c95ea3eb9a7bb4cb8bddf6feb023250381008177ac162ce169694d05c317de';
/**
 * The laptop server, as a test build reaches it: the emulator's host alias, or
 * localhost on a USB-connected phone after `adb reverse tcp:8000 tcp:8000`.
 * Release builds allow https only, so the member sets a real address in Settings.
 */
const fingerprint = String((Platform.constants as {Fingerprint?: string}).Fingerprint ?? '');
export const DEFAULT_SERVER = /generic|emulator|sdk_gphone/i.test(fingerprint) ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
const JOURNEY_TARGET = 'subject' as const;

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

export type Delivery = {queued: number; received: number; sending: boolean; lastError?: string; lastSentAt?: string};

// `kind` values whose specifics must never reach the local record or the UI.
const PRIVATE_KINDS = new Set(['checkin_result', 'pin_authorised']);

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

  async function randomId(prefix: string): Promise<string> {
    const raw = await b.signer.randomBytes(8);
    return prefix + raw.replace(/[^A-Za-z0-9]/g, '').toLowerCase().slice(0, 10);
  }

  /** Signs and seals one event into the queue. It is evidence from this moment. */
  async function record(payload: EventPayload, opts: {action?: string; genesis?: boolean} = {}): Promise<number> {
    if (!profile) throw new Error('no profile');
    const entry = await buildEvent({
      signer: b.signer,
      subjectId: profile.subjectId,
      actorId: profile.actorId,
      action: opts.action ?? 'device_event',
      targetType: JOURNEY_TARGET,
      targetId: profile.subjectId,
      payload,
      ts: rfc3339(new Date()),
      genesis: opts.genesis,
    });
    const seq = await b.enqueue(JSON.stringify(entry));
    publish({queued: delivery.queued + 1});
    void flush();
    return seq;
  }

  let flushing: Promise<void> | null = null;
  /**
   * Sends queued events oldest first. A network or server failure stops the
   * pass (it retries on the next event or the next timer). A refusal (4xx)
   * leaves that event queued with its reason shown, and the pass moves on,
   * because the server enforces unique counters, not their order.
   */
  function flush(): Promise<void> {
    if (b.simulated || !profile) return Promise.resolve();
    if (flushing) return flushing;
    const p = profile;
    flushing = (async () => {
      publish({sending: true});
      let lastError: string | undefined;
      try {
        for (const it of await b.pending()) {
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
            // 4xx: refused, keep it and carry on. Anything else: stop.
            if (!/^4\d\d /.test(lastError)) break;
          }
        }
      } finally {
        await refreshCounts().catch(() => undefined);
        publish({sending: false, lastError});
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

    newJourneyId: () => randomId('sim_jny_'),

    journeyArmed: (journeyId: string, appVersion: string) =>
      record({kind: 'journey_armed', pv: 1, journey_id: journeyId, app_version: appVersion}),

    signal: (payload: EventPayload) => record(payload),

    /** One check-in: `checkin_opened` now, then PIN entries (§8, T47). */
    async openCheckin(journeyId: string) {
      const checkinId = await randomId('sim_chk_');
      await record({kind: 'checkin_opened', pv: 1, journey_id: journeyId, checkin_id: checkinId});
      let wrong = 0;
      return {
        /**
         * "checked" or "retry". Wrong PINs 1–3 each get the same "Try again";
         * from then on every entry shows "Checked in" (the outcome is already
         * no_answer server-side), so the check-in is never a PIN oracle.
         */
        async enter(pin: string): Promise<'checked' | 'retry'> {
          const mode = await b.verify(pin);
          if (mode === 'wrong') {
            wrong += 1;
            return wrong > 3 ? 'checked' : 'retry';
          }
          await record({
            kind: 'checkin_result',
            pv: 1,
            journey_id: journeyId,
            checkin_id: checkinId,
            result: mode === 'duress' ? 'duress_pin' : 'normal_pin',
          });
          return 'checked';
        },
      };
    },

    /** Ending a journey needs a PIN (G35): `pin_authorised`, then `journey_ended`. */
    async endJourney(journeyId: string, pin: string): Promise<'ended' | 'retry'> {
      const mode = await b.verify(pin);
      if (mode === 'wrong') return 'retry';
      await record({
        kind: 'pin_authorised',
        pv: 1,
        action: 'end_journey',
        target_id: journeyId,
        mode: mode === 'duress' ? 'duress' : 'normal',
        nonce: await b.signer.randomBytes(16),
      });
      await record({kind: 'journey_ended', pv: 1, journey_id: journeyId});
      return 'ended';
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

    isPrivateKind: (kind: string) => PRIVATE_KINDS.has(kind),
  };
}

export type Device = ReturnType<typeof createDevice>;

// ---- backends ---------------------------------------------------------------

type NativeSigner = Signer;
type NativeQueue = Pick<Backend, 'enqueue' | 'pending' | 'markReceived' | 'received' | 'setProfile' | 'getProfile'>;
type NativePin = {isSet(): Promise<boolean>; setPins(n: string, d: string): Promise<boolean>; verify(p: string): Promise<'normal' | 'duress' | 'wrong'>};

function nativeBackend(): Backend | null {
  const signer: NativeSigner | undefined = NativeModules.VigilSigner;
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
  };
}

/** SIMULATED: the browser preview. PINs in memory, nothing signed, nothing sent. */
export function simBackend(): Backend {
  let n = 0;
  let q: Item[] = [];
  let prof: string | null = null;
  let pins: {normal: string; duress: string} | null = null;
  const rand = (k: number) => {
    let s = '';
    for (let i = 0; i < k; i++) s += String.fromCharCode(65 + Math.floor(Math.random() * 26));
    return s;
  };
  return {
    simulated: true,
    signer: {
      identity: async () => ({publicKey: 'sim', keyId: 'dev_simulated00'}),
      sign: async () => 'sim',
      signDer: async () => 'sim',
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
  };
}

export const device: Device = createDevice(nativeBackend() ?? simBackend());
