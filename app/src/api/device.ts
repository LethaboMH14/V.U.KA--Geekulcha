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
import {checkRecord, type Export, type RecordCheck} from './verifyRecord';
import {buildPinEvidence} from '../brain/cem/tracker';
import {RULESET_DIGEST} from '../brain/cem/ruleset';

export const MODEL_SHA256 = '10c95ea3eb9a7bb4cb8bddf6feb023250381008177ac162ce169694d05c317de';
/**
 * The laptop server, as a test build reaches it: the emulator's host alias, or
 * localhost on a USB-connected phone after `adb reverse tcp:8000 tcp:8000`.
 * Release builds allow https only, so the member sets a real address in Settings.
 */
const fingerprint = String(((Platform.constants ?? {}) as {Fingerprint?: string}).Fingerprint ?? '');
export const DEFAULT_SERVER = /generic|emulator|sdk_gphone/i.test(fingerprint) ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
/**
 * Where installed apps learn the current server: a small file on the public
 * GitHub release. The demo server runs behind a tunnel whose address can
 * change; the release file is updated, and every app follows it.
 */
export const DISCOVERY_URL = 'https://github.com/LethaboMH14/V.U.KA--Geekulcha/releases/download/vigil-demo/server.json';
/** Where the app itself is downloaded from (the guardian invite links here). */
export const DOWNLOAD_URL = 'https://github.com/LethaboMH14/V.U.KA--Geekulcha/releases/tag/vigil-demo';
/** Spec §7 allows 20 or 60. The member gets the longer window. */
export const CHECKIN_WINDOW_S = 60;

type Item = {seq: number; json: string};
export type Backend = {
  simulated: boolean;
  signer: Signer;
  enqueue(json: string): Promise<number>;
  pending(): Promise<Item[]>;
  markReceived(seq: number, receiptJson: string): Promise<boolean>;
  /** Moves a queued event out of the send queue, kept on the phone (never deleted). */
  park?(seq: number): Promise<boolean>;
  received(): Promise<Item[]>;
  setProfile(json: string): Promise<boolean>;
  getProfile(): Promise<string | null>;
  pinsSet(): Promise<boolean>;
  setPins(normal: string, duress: string): Promise<boolean>;
  verify(pin: string): Promise<'normal' | 'duress' | 'wrong'>;
  post(url: string, entry: EventSubmission): Promise<Receipt>;
  request<T>(url: string, method: string, path: string, body: string, keyId?: string): Promise<T>;
  /** The current server from DISCOVERY_URL, or null. */
  discover(): Promise<string | null>;
};

export type Profile = {
  v: 1;
  /** A member (listens, signs their own record) or a guardian (receives alerts). */
  role?: 'member' | 'guardian';
  firstName: string;
  subjectId: string;
  actorId: string;
  serverUrl: string;
  /** Set when the member typed a server in Settings: discovery then leaves it alone. */
  serverPinned?: boolean;
  /** The server this member's chain is registered on (a new one means registering again). */
  registeredOn?: string;
  /** Receipts from this queue number on belong to the current server's chain. */
  chainFromSeq?: number;
  /** Members: the guardian invites they created (id and time), newest last. */
  invites?: {guardianId: string; at: string}[];
  /**
   * Who this phone guards and its guardian key id (G5). A member can be
   * someone else's guardian too: this slot is separate from their own record
   * (memberSubjectId is the guarded member's record, never this phone's).
   */
  guardian?: {guardianId: string; keyId: string; memberName: string; memberSubjectId?: string};
  /**
   * CEM-1: how long this member's accepted check-in entries took (ms), newest
   * last, at most 20. Stays on this phone; only "slower than usual" (a
   * boolean) ever leaves it. Kept for both PINs alike.
   */
  pinTimes?: number[];
};

const PIN_BASELINE = 20;
const PIN_BASELINE_MIN = 8;
/** A MAD below this (ms) is treated as this, so a very steady member is not "slow" at every jitter. */
const PIN_MAD_FLOOR_MS = 50;

const median = (xs: number[]) => {
  const a = [...xs].sort((x, y) => x - y);
  const m = a.length >> 1;
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
};

/** CEM-1 pin_slow: slower than the member's own median + 3 MAD, after at least 8 entries. */
export function pinSlow(times: readonly number[], entryMs: number | undefined): boolean {
  if (entryMs === undefined || times.length < PIN_BASELINE_MIN) return false;
  const m = median([...times]);
  const mad = Math.max(median(times.map(t => Math.abs(t - m))), PIN_MAD_FLOOR_MS);
  return entryMs > m + 3 * mad;
}

/** A clock that only moves forward (a phone-clock change never stretches the countdown). */
export const monoNow = (): number => {
  const perf = (globalThis as {performance?: {now?: () => number}}).performance;
  return typeof perf?.now === 'function' ? perf.now() : Date.now();
};

/**
 * The check-in countdown, never longer than the server really allows. Any
 * phone time at which an event had been created precedes the server's receipt
 * of it, so queuedAt + window is a lower bound on the server's deadline:
 * checkin_opened + 70 s, and the signal's fallback + 90 s; 5 s more margin for
 * the scheduler tick. null until the server has acknowledged checkin_opened.
 */
export function checkinRemainingMs(now: number, t: {signalQueuedAt?: number; openedQueuedAt?: number; openedReceived: boolean}): number | null {
  if (!t.openedReceived || t.openedQueuedAt === undefined) return null;
  const bounds = [t.openedQueuedAt + 70_000];
  if (t.signalQueuedAt !== undefined) bounds.push(t.signalQueuedAt + 90_000);
  return Math.max(0, Math.min(...bounds) - now - 5_000);
}

/** One alert delivered to this guardian (GET /v1/guardians/me/alerts). */
export type GuardianAlert = {
  incident_id: string;
  trigger: 'duress_signal' | 'no_answer' | 'contact_lost' | 'unknown';
  delivered_at: string;
  opened_at: string;
  closed_at: string | null;
  close_reason: string | null;
  /**
   * PROPOSED (ADR-0047): for an alert that began with a detection, the
   * phone's evidence band and up to three reason names. Words, never a number.
   */
  why?: {band: string; reasons: string[]} | null;
  /**
   * PROPOSED (ADR-0048): where the member's phone was, kept only while this
   * alert's incident is open: the last fix and a short trail (oldest first).
   */
  location?: {
    last: {lat_e7: number; lon_e7: number; acc_m: number; at: string};
    trail: {lat_e7: number; lon_e7: number; at: string}[];
  } | null;
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

/** One entry of the member's held export, as My record shows it. */
export type RecordRow = {index: number; kind: string; ts: string; hash: string; fromThisPhone: boolean};

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
  /**
   * When each detection and check-in was created on this phone (monotonic),
   * and whether the server has it: only for the countdown, so only those two
   * kinds, and only the most recent few.
   */
  const receipts = new Map<string, {queuedAt: number; received: boolean; waiters: (() => void)[]}>();
  const TRACKED = new Set(['signal_detected', 'checkin_opened']);
  const noteReceived = (eventId: string) => {
    const r = receipts.get(eventId);
    if (!r || r.received) return;
    r.received = true;
    r.waiters.splice(0).forEach(f => f());
  };

  async function record(payload: EventPayload, target: Target, opts: {action?: string; genesis?: boolean; send?: boolean} = {}): Promise<string> {
    if (!profile) throw new Error('no profile');
    checkPayload(payload);
    const queuedAt = monoNow();
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
    if (TRACKED.has(String(payload.kind))) {
      receipts.set(entry.details.event_id, {queuedAt, received: false, waiters: []});
      while (receipts.size > 16) receipts.delete(receipts.keys().next().value as string);
      // The preview has no server: treat events as received, so screens behave.
      if (b.simulated) noteReceived(entry.details.event_id);
    }
    publish({queued: delivery.queued + 1});
    if (opts.send !== false) void flush();
    return entry.details.event_id;
  }

  /** §4b.1: the inner signature covers exactly {action, target_id, mode, nonce}. */
  async function pinAuthorised(action: 'end_journey' | 'export' | 'add_guardian', targetId: string, mode: 'normal' | 'duress'): Promise<EventPayload> {
    const {keyId} = await b.signer.identity();
    const statement = {action, target_id: targetId, mode, nonce: await b.signer.randomBytes(16)};
    const sig = await b.signer.signDer(canonicalJson(statement));
    return {kind: 'pin_authorised', pv: 1, ...statement, sig, signer_key_id: keyId};
  }

  let flushing: Promise<void> | null = null;
  let again = false;
  /**
   * The demo server's address can move (a restarted tunnel). When it stops
   * answering, look it up again (at most once a minute), never over a server
   * the member pinned.
   */
  let lastRediscover = 0;
  async function rediscover() {
    if (!profile || profile.serverPinned || Date.now() - lastRediscover < 60_000) return;
    lastRediscover = Date.now();
    const found = await b.discover().catch(() => null);
    if (found && profile && found !== profile.serverUrl) {
      profile = {...profile, serverUrl: found};
      await b.setProfile(JSON.stringify(profile)).catch(() => undefined);
      await followServer().catch(() => undefined);
      again = true;
    }
  }

  /**
   * The demo moved to a different server (a new tunnel address is the same
   * server; Azure is a different one). A member registers again there: the
   * same key and subject, a new genesis. Events queued for the old server's
   * chain can never be accepted by the new one, so they are parked on the
   * phone (kept, not sent), and the phone's own record view starts from the
   * new registration. A guardian must be invited again by their member.
   */
  let registeredOnFor: string | null = null;
  async function followServer(appVersion = 'unknown') {
    if (!profile || profile.role === 'guardian') return;
    if (!profile.registeredOn) {
      // Registered before this was tracked: on the server it uses now.
      profile = {...profile, registeredOn: profile.serverUrl};
      await b.setProfile(JSON.stringify(profile));
      return;
    }
    if (profile.registeredOn === profile.serverUrl || registeredOnFor === profile.serverUrl) return;
    registeredOnFor = profile.serverUrl;
    if (!(await sameServer(profile.registeredOn, profile.serverUrl))) {
      for (const it of await b.pending()) await b.park?.(it.seq);
      const last = Math.max(0, ...(await b.received()).map(r => r.seq));
      profile = {...profile, chainFromSeq: last + 1};
      await b.setProfile(JSON.stringify(profile));
      await record(
        {kind: 'registration', pv: 1, app_version: appVersion, model_sha256: MODEL_SHA256, android_api: 34, device_model: 'android'},
        subject(),
        {action: 'registration', genesis: true, send: false},
      );
    }
    profile = {...profile, registeredOn: profile.serverUrl};
    await b.setProfile(JSON.stringify(profile));
    await refreshCounts().catch(() => undefined);
  }

  /**
   * Whether two addresses reach the same server: a restarted quick tunnel
   * gets a new trycloudflare address for the same laptop and database, so
   * tunnel-to-tunnel is the same server. Anything else (Azure, a typed
   * address) is treated as a different server with its own database.
   */
  async function sameServer(oldUrl: string, newUrl: string): Promise<boolean> {
    const tunnel = (u: string) => /\.trycloudflare\.com$/.test(u.replace(/\/$/, ''));
    return tunnel(oldUrl) && tunnel(newUrl);
  }
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
              const receipt = await b.post((profile ?? p).serverUrl, entry);
              const kept: Omit<RecordEntry, 'seq'> = {
                kind: String(entry.payload.kind),
                ts: entry.ts,
                event_id: entry.details.event_id,
                event_hash: receipt.event_hash,
                chain_index: receipt.chain_index,
                received_at: receipt.received_at,
              };
              await b.markReceived(it.seq, JSON.stringify(kept));
              noteReceived(entry.details.event_id);
              publish({lastSentAt: receipt.received_at});
            } catch (e) {
              lastError = String(e instanceof Error ? e.message : e);
              if (!/^4\d\d /.test(lastError)) {
                again = false;
                // Unreachable: the address may have moved. Retry at once if it did.
                await rediscover();
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
      if (profile) {
        await refreshCounts();
        // Follow the demo server if its address moved (never over a pinned one).
        if (!profile.serverPinned) {
          const found = await b.discover().catch(() => null);
          if (found && found !== profile.serverUrl) {
            profile = {...profile, serverUrl: found};
            await b.setProfile(JSON.stringify(profile));
          }
        }
        await followServer().catch(() => undefined);
      }
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
      const found = await b.discover().catch(() => null);
      const serverUrl = found ?? DEFAULT_SERVER;
      profile = {v: 1, role: 'member', firstName, subjectId: `sim_subj_${short}`, actorId: `sim_member_${short}`, serverUrl, registeredOn: serverUrl};
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
      profile = {...profile, serverUrl: url.trim().replace(/\/$/, ''), serverPinned: true};
      await b.setProfile(JSON.stringify(profile));
      await followServer().catch(() => undefined);
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
        const offline = !/^\d{3} /.test(m);
        // Unreachable: the demo server may have moved; the next retry uses the new address.
        if (offline) await rediscover();
        throw new JourneyStartError(offline ? 'offline' : 'refused', m);
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

    /**
     * One location fix for the 30 minutes after a check-in (ADR-0048). The
     * server keeps it only while guardians are alerted and answers the same
     * either way; a failure is only a missed fix.
     */
    async sendLocation(journeyId: string, fix: {lat_e7: number; lon_e7: number; acc_m: number; fix_age_ms: number}): Promise<void> {
      if (b.simulated || !profile) return;
      const body = canonicalJson({...fix, ts: rfc3339(new Date())});
      await b.request(profile.serverUrl, 'POST', `/v1/journeys/${encodeURIComponent(journeyId)}/location`, body);
    },

    /** A confirmed detection. Resolves with its event id once queued. */
    signal: (journeyId: string, payload: EventPayload) => record(payload, journey(journeyId)),

    /**
     * Hold-for-help (ADR-0049, PROPOSED): the member asks themselves. The
     * same signal_detected a sound would give, with sense "manual", so the
     * same check-in, the same duress PIN and the same no-answer escalation
     * follow. Resolves with its event id once queued.
     */
    help: (journeyId: string, appVersion: string) =>
      record({kind: 'signal_detected', pv: 1, journey_id: journeyId, sense: 'manual', app_version: appVersion}, journey(journeyId)),

    /** CEM-1 evidence (evidence_observed). Resolves with its event id once queued. */
    evidence: (journeyId: string, payload: EventPayload) => record(payload, journey(journeyId)),

    /** When the event was created here, and whether the server has acknowledged it. */
    receipt(eventId: string): {queuedAt: number; received: boolean} | null {
      const r = receipts.get(eventId);
      return r ? {queuedAt: r.queuedAt, received: r.received} : null;
    },
    /** Resolves once the server has acknowledged the event (never rejects). */
    whenReceived(eventId: string): Promise<void> {
      const r = receipts.get(eventId);
      if (!r) return new Promise(() => undefined);
      if (r.received) return Promise.resolve();
      return new Promise(res => r.waiters.push(res));
    },

    /**
     * One check-in (§4b, §8, T47). Call `shown()` once the check is on
     * screen: that is when `checkin_opened` is recorded. `enter(pin)` gives
     * "checked" or "retry": wrong PINs 1–3 each get the same "Try again";
     * from then on every entry shows "Checked in" (the outcome is already
     * no_answer server-side), so the check-in is never a PIN oracle.
     */
    async openCheckin(journeyId: string, signalEventId: string, opts: {onPinObserved?: (p: {retry: boolean; slow: boolean}) => void} = {}) {
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
        /**
         * entryMs: how long this entry took, first key to last. The answer is
         * durable before anything optional happens, the PIN evidence goes in
         * the same flush for both PINs, and nothing here waits on the network,
         * so the screen's timing never depends on which PIN it was.
         */
        async enter(pin: string, entryMs?: number): Promise<'checked' | 'retry'> {
          entries += 1;
          const attempt = entries;
          const mode = await b.verify(pin);
          if (mode === 'wrong') return attempt > 3 ? 'checked' : 'retry';
          await shown();
          await record(
            {kind: 'checkin_result', pv: 1, checkin_id: checkinId, result: mode === 'duress' ? 'duress_pin' : 'normal_pin', attempt},
            journey(journeyId),
            {send: false},
          );
          try {
            const times = profile?.pinTimes ?? [];
            const obs = {retry: attempt > 1, slow: pinSlow(times, entryMs)};
            await record(buildPinEvidence({journeyId, rulesetDigest: RULESET_DIGEST, checkinId, ...obs}), journey(journeyId), {send: false});
            // Only now, signed and queued, may it count toward a later lift.
            opts.onPinObserved?.(obs);
            if (profile && entryMs !== undefined && Number.isSafeInteger(entryMs) && entryMs > 0) {
              profile = {...profile, pinTimes: [...times, entryMs].slice(-PIN_BASELINE)};
              await b.setProfile(JSON.stringify(profile));
            }
          } catch {
            // Optional evidence: its failure never blocks or changes the answer.
          } finally {
            void flush();
          }
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

    /**
     * Members: invite a guardian (§9, #96). The PIN authorises `add_guardian`;
     * the server then issues a one-time code (10 minutes, 5 tries). A duress
     * PIN gets an identical-looking code for a decoy guardian who never
     * receives alerts, and real guardians are told.
     */
    async inviteGuardian(pin: string): Promise<{code: string; guardianId: string} | 'retry'> {
      if (!profile) throw new Error('no profile');
      const mode = await b.verify(pin);
      if (mode === 'wrong') return 'retry';
      await record(await pinAuthorised('add_guardian', profile.subjectId, mode), subject());
      await flush();
      const r = await b.request<{guardian_id: string; invite_code: string}>(profile.serverUrl, 'POST', '/v1/guardians/invites', '');
      profile = {...profile, invites: [...(profile.invites ?? []), {guardianId: r.guardian_id, at: new Date().toISOString()}]};
      await b.setProfile(JSON.stringify(profile));
      return {code: r.invite_code, guardianId: r.guardian_id};
    },

    /**
     * Guardians: accept a member's invite with this phone's own key (#96).
     * The consent (POPIA s18) is given on screen before this is called. No
     * push token yet: alerts are fetched while the app is open.
     */
    async becomeGuardian(code: string, memberName: string): Promise<Profile> {
      const {publicKey} = await b.signer.identity();
      // gdn_ + the first 8 bytes of SHA-256 over the SPKI key (server/guardians.py).
      const keyId = 'gdn_' + (await b.signer.commitment(publicKey, '')).slice(0, 16);
      const serverUrl = (await b.discover().catch(() => null)) ?? DEFAULT_SERVER;
      const body = JSON.stringify({
        invite_code: code.trim(),
        guardian_key: publicKey,
        fcm_token: 'sim_poll_while_open',
        popia_s18_acknowledged: true,
      });
      const guardianServer = profile && profile.role !== 'guardian' ? profile.serverUrl : serverUrl;
      const r = await b.request<{guardian_id: string}>(guardianServer, 'POST', '/v1/guardians/accept', body, keyId);
      const guardian = {guardianId: r.guardian_id, keyId, memberName: memberName.trim() || 'your member'};
      if (profile && profile.role !== 'guardian') {
        // A member who also guards someone: their own record is untouched.
        profile = {...profile, guardian};
      } else {
        profile = {v: 1, role: 'guardian', firstName: '', subjectId: '', actorId: `guardian_${r.guardian_id}`, serverUrl, guardian};
      }
      await b.setProfile(JSON.stringify(profile));
      return profile;
    },

    /** Guardians: the alerts delivered to this guardian, newest first. */
    async guardianAlerts(): Promise<GuardianAlert[]> {
      if (!profile?.guardian) return [];
      const r = await b.request<{subject_id: string; alerts: GuardianAlert[]}>(
        profile.serverUrl,
        'GET',
        '/v1/guardians/me/alerts',
        '',
        profile.guardian.keyId,
      );
      publish({lastContactAt: new Date().toISOString()});
      if (r.subject_id && r.subject_id !== profile.guardian.memberSubjectId) {
        profile = {...profile, guardian: {...profile.guardian, memberSubjectId: r.subject_id}};
        await b.setProfile(JSON.stringify(profile));
      }
      return r.alerts;
    },

    /** Guardians: a signed acknowledgement (G5): called_10111, handling or stand_down. */
    async acknowledge(incidentId: string, action: 'called_10111' | 'handling' | 'stand_down'): Promise<void> {
      // The guarded member's record (older guardian-only profiles kept it in subjectId).
      const memberSubject = profile?.guardian?.memberSubjectId ?? (profile?.role === 'guardian' ? profile.subjectId : '');
      if (!profile?.guardian || !memberSubject) throw new Error('not a guardian yet');
      checkPayload({kind: 'guardian_ack', pv: 1, incident_id: incidentId, action});
      const entry = await buildEvent({
        signer: b.signer,
        subjectId: memberSubject,
        actorId: `guardian_${profile.guardian.guardianId}`,
        action: 'guardian_event',
        targetType: 'subject',
        targetId: memberSubject,
        payload: {kind: 'guardian_ack', pv: 1, incident_id: incidentId, action},
        ts: rfc3339(new Date()),
        as: {role: 'guardian', keyId: profile.guardian.keyId},
      });
      await b.post(profile.serverUrl, entry);
    },

    flush,

    delivery: () => delivery,
    onDelivery(l: (d: Delivery) => void) {
      listeners.add(l);
      return () => listeners.delete(l);
    },

    /**
     * After an export authorisation: fetch the member's export (§9, T30 hold
     * applied by the server) and check it on this phone against the receipts
     * this phone kept. Needs the authorisation to have reached the server.
     */
    async checkMyRecord(): Promise<{check: RecordCheck; rows: RecordRow[]}> {
      if (!profile) throw new Error('no profile');
      await flush();
      const exp = await b.request<Export>(profile.serverUrl, 'GET', `/v1/subjects/${encodeURIComponent(profile.subjectId)}/export`, '');
      const from = profile.chainFromSeq ?? 0;
      const mine = (await b.received()).filter(it => it.seq >= from).map(it => JSON.parse(it.json) as RecordEntry);
      const check = await checkRecord(exp, b.signer, mine);
      // The view is the server's held export only (T30): entries after the
      // pre-incident head are not shown, whichever PIN opened it. Rows carry
      // the kind, never a payload's specifics (so never the PIN mode).
      const kinds = new Map((exp.payloads ?? []).map(p => [p.event_id, String((p.payload as {kind?: unknown})?.kind ?? '')]));
      const ours = new Set(mine.map(r => r.event_hash));
      const rows: RecordRow[] = (exp.entries ?? []).map((e, index) => ({
        index,
        kind: kinds.get(String(e.details?.event_id)) || (e.details?.event_id && !kinds.has(String(e.details.event_id)) ? 'removed' : 'unknown'),
        ts: String(e.ts ?? ''),
        hash: e.event_hash,
        fromThisPhone: ours.has(e.event_hash),
      }));
      return {check, rows};
    },

    /** The member's own copy of their record: every receipt, oldest first. */
    async myRecord(): Promise<RecordEntry[]> {
      const from = profile?.chainFromSeq ?? 0;
      const items = (await b.received()).filter(it => it.seq >= from);
      return items.map(it => {
        const r = JSON.parse(it.json) as Omit<RecordEntry, 'seq'>;
        return {seq: it.seq, ...r};
      });
    },
  };
}

export type Device = ReturnType<typeof createDevice>;

// ---- backends ---------------------------------------------------------------

type NativeQueue = Pick<Backend, 'enqueue' | 'pending' | 'markReceived' | 'received' | 'setProfile' | 'getProfile'> & {park(seq: number): Promise<boolean>};
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
    park: s => queue.park(s),
    received: () => queue.received(),
    setProfile: j => queue.setProfile(j),
    getProfile: () => queue.getProfile(),
    pinsSet: () => pins.isSet(),
    setPins: (n, d) => pins.setPins(n, d),
    verify: p => pins.verify(p),
    post: (url, entry) => postEvent(url, signer, entry),
    request: (url, method, path, body, keyId) => signedRequest(url, signer, method, path, body, undefined, keyId),
    discover: async () => {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 8000);
      try {
        const res = await fetch(DISCOVERY_URL, {signal: ctl.signal, cache: 'no-store'} as RequestInit);
        if (!res.ok) return null;
        const j = (await res.json()) as {server?: unknown};
        return typeof j.server === 'string' && /^https:\/\/[^\s/]+$/.test(j.server) ? j.server : null;
      } catch {
        return null;
      } finally {
        clearTimeout(t);
      }
    },
  };
}

/** SIMULATED: the browser preview. PINs in memory, nothing signed, nothing sent. */
export function simBackend(): Backend {
  let n = 0;
  let lastSeq = 0;
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
      // Numbers never restart, as in the native queue.
      const seq = ++lastSeq;
      q.push({seq, json: j});
      return seq;
    },
    pending: async () => q,
    markReceived: async s => {
      q = q.filter(i => i.seq !== s);
      return true;
    },
    park: async s => {
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
    discover: async () => null,
  };
}

export const device: Device = createDevice(nativeBackend() ?? simBackend());
