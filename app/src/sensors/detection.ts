/**
 * The bridge between the native pipelines and the detection engine.
 *
 * Native sends integer windows and motion frames; this file runs them through
 * the pure engine (app/src/brain/detect) and reports a decision. It holds no
 * audio: none crosses the bridge.
 */
import {NativeEventEmitter, NativeModules, PermissionsAndroid, Platform} from 'react-native';
import {
  RULESET_V1,
  TARGETS,
  activityBefore,
  buildSignalDetected,
  checkContextLabels,
  checkLabels,
  initialState,
  liuSnatch,
  step,
  type AudioWindow,
  type Decision,
  type EngineState,
  type MotionFrame,
  type SignalDetectedV1,
} from '../brain/detect';
import {buildEvidence, candidateOf, createTracker, type EvidenceAssessedV2, type Observation} from '../brain/cem/tracker';
import {createGrader, type GradeAction} from '../brain/cem/grader';
import {PROMPT_RULE, RULESET_DIGEST} from '../brain/cem/ruleset';

type Native = {
  testFeed?: boolean;
  classifyTestClip(name: string): Promise<AudioWindow[]>;
  /** Resolves only once the microphone is recording, with the model's facts. */
  arm(): Promise<{sha256: string; labels: string[]}>;
  disarm(): Promise<boolean>;
  showCheckin(): void;
  clearCheckin(): void;
  canFullScreen?(): Promise<boolean>;
  openFullScreenSettings?(): void;
  consumeHelp?(): Promise<boolean>;
};

const native: Native | undefined = NativeModules.VigilDetection;

/** Only the engine's fields, so nothing else from native reaches a decision. */
const toWindow = (w: AudioWindow, context: boolean): AudioWindow => ({
  seq: w.seq,
  endMs: w.endMs,
  targetBp: w.targetBp,
  topIndex: w.topIndex,
  topBp: w.topBp,
  gunNeighbourBp: w.gunNeighbourBp,
  ...(context && w.contextBp ? {contextBp: w.contextBp} : {}),
});

export type ArmResult =
  | {ok: true}
  | {ok: false; reason: 'unsupported' | 'microphone' | 'notifications' | 'model' | 'capture'; detail?: string};

/** Spec V1: arming refuses without microphone AND notification permission, and says why. */
async function permissions(): Promise<ArmResult> {
  if (Platform.OS !== 'android') return {ok: false, reason: 'unsupported'};
  const mic = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
  if (mic !== PermissionsAndroid.RESULTS.GRANTED) return {ok: false, reason: 'microphone'};
  if (Platform.Version >= 33) {
    const notes = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    if (notes !== PermissionsAndroid.RESULTS.GRANTED) return {ok: false, reason: 'notifications'};
  }
  return {ok: true};
}

export type Detector = {
  /** Tell the engine a check-in is showing (true) or closed (false). */
  setCheckinOpen(open: boolean): void;
  /** CEM-1: PIN behaviour at a check-in, once its evidence is signed and queued. */
  observePin(p: {retry: boolean; slow: boolean}): void;
  /** Hold-for-help: take the prompt slot; false if a check-in is already pending or open. */
  reserveForHelp(): boolean;
  /** V9: the activity bucket for heartbeats. Never location. */
  speedBucket(): 'stationary' | 'walking' | 'other' | 'unknown';
  /**
   * Test builds only: run a clip from the app's files folder through this
   * phone's model and this journey's engine, so it records and prompts
   * exactly as the microphone would. Real inference on a file.
   */
  feedClip(name: string): Promise<{windows: number; decisions: Decision[]}>;
  stop(): Promise<void>;
};

export async function startDetection(opts: {
  journeyId: string;
  appVersion: string;
  /** The member's subject id: the graded rule applies only to simulation subjects (sim_). */
  subjectId: string;
  /**
   * A detection the phone commits to (a check-in, or a V4-level record as
   * V4 always sent): sign and queue `signal_detected`. Resolves with its
   * event id once it is in the queue.
   */
  onSignal: (payload: SignalDetectedV1) => Promise<string | undefined>;
  /** CEM-1 evidence (`evidence_observed`): sign and queue it. */
  onEvidence: (payload: EvidenceAssessedV2) => Promise<string | undefined>;
  /**
   * Open the journey check (only after a record, never over an open
   * check-in). Called only once the detection is queued, with its event id,
   * so the check-in can never overtake the signal that caused it.
   */
  onPrompt: (decision: Decision, signalEventId: string) => void;
  onError?: (message: string) => void;
  /**
   * Each window: the target sound closest to its own threshold, for the live
   * meter. A model score in basis points, not a probability.
   */
  onLevel?: (level: Level) => void;
}): Promise<{result: ArmResult; detector?: Detector}> {
  if (!native) return {result: {ok: false, reason: 'unsupported'}};
  const perm = await permissions();
  if (!perm.ok) return {result: perm};

  let state: EngineState = initialState();
  // CEM-1 (ADR-0047, PROPOSED): the reasons behind each record, and the graded
  // prompt rule. V4 is unchanged; lifts apply only to simulation subjects.
  const tracker = createTracker(RULESET_V1);
  const grader = createGrader({tracker, rule: PROMPT_RULE, subjectIsSim: opts.subjectId.startsWith('sim_')});
  let context = false;
  // Engine time (from the audio sample count) and the phone clock at that
  // window, so PIN observations land on the engine's clock.
  let lastWallMs = Date.now();
  // Nothing is judged until arming has finished and the model has been checked.
  let armed = false;
  let sha256 = '';
  const emitter = new NativeEventEmitter(NativeModules.VigilDetection);
  // Decisions are handled strictly in order: a record is queued before the
  // next decision, and before the check-in it may open.
  let chain: Promise<void> = Promise.resolve();
  let lastEndMs = 0;
  let lastSeq = 0;
  /** Carry out the grader's actions, strictly in order on the chain. */
  const act = (a: GradeAction) => {
    const d = a.decision;
    if (!d.candidate) return;
    const cand = d.candidate;
    const evidence = (decision: 'record' | 'prompt', signalEventId: string | null) =>
      buildEvidence({
        journeyId: opts.journeyId,
        rulesetDigest: RULESET_DIGEST,
        decision,
        assessment: a.assessment,
        candidate: candidateOf(cand, d.level),
        context: context ? 'on' : 'off',
        observations: a.observations,
        signalEventId,
      });
    const signal = () =>
      opts.onSignal(
        buildSignalDetected({journeyId: opts.journeyId, candidate: cand, corroboration: d.corroboration, modelSha256: sha256, appVersion: opts.appVersion}),
      );
    let prompted = false;
    chain = chain
      .then(async () => {
        // T0, or a V4 record covered by a pending/open check-in: evidence
        // alone, never a signal_detected, so no server deadline of its own.
        if (a.type === 'record' || (a.type === 'v4_record' && a.covered)) {
          await opts.onEvidence(evidence('record', null));
          return;
        }
        if (a.type === 'v4_record') {
          // As V4 always did: the signal is recorded; no check-in.
          await signal();
          await opts.onEvidence(evidence('record', null)).catch(e => opts.onError?.(String(e)));
          return;
        }
        // A prompt. Once listening has stopped, nothing may start a server
        // deadline for a check-in that will never show: record only.
        if (!armed) {
          await opts.onEvidence(evidence('record', null));
          return;
        }
        const eventId = await signal();
        // The check-in opens as soon as its signal is queued; the evidence
        // follows and never gates it.
        if (eventId && armed) {
          native.showCheckin();
          opts.onPrompt(d, eventId);
          prompted = true;
        }
        if (eventId) await opts.onEvidence(evidence('prompt', eventId)).catch(e => opts.onError?.(String(e)));
      })
      .catch(e => opts.onError?.(String(e)))
      .finally(() => {
        // A prompt that could not be carried out must not hold the slot, or
        // every later V4 detection would be recorded without a check-in.
        if (a.type === 'prompt' && !prompted) grader.checkinClosed();
      });
  };
  // Pending record-level candidates settle after 2 s even if windows stop coming.
  const settleTimer = setInterval(() => {
    if (!armed) return;
    grader.tick(lastEndMs + Math.max(0, Date.now() - lastWallMs)).forEach(act);
  }, 1000);
  const judge = (raw: AudioWindow) => {
    const w = toWindow(raw, context);
    if (opts.onLevel) opts.onLevel(levelOf(w));
    lastEndMs = Math.max(lastEndMs, w.endMs);
    lastSeq = Math.max(lastSeq, w.seq);
    lastWallMs = Date.now();
    const out = step(state, {type: 'audio', window: w}, RULESET_V1);
    state = out.state;
    const d = out.decision;
    if (d) {
      tracker.observe(d, w);
      const observations: Observation[] = d.record && liuSnatch(state.motion, w.endMs, RULESET_V1) ? ['snatch_liu'] : [];
      grader.window(d, w.endMs, observations).forEach(act);
    }
    return d;
  };
  // Arm right after the permission prompt, while the app is still in the
  // foreground (Android 14's rule for a microphone service); the model check
  // happens inside, and arming resolves only once capture is running.
  const subs = [
    emitter.addListener('vigil.window', (w: AudioWindow) => {
      if (!armed) return;
      judge(w);
    }),
    emitter.addListener('vigil.motion', (f: MotionFrame) => {
      if (!armed) return;
      state = step(state, {type: 'motion', frame: f}, RULESET_V1).state;
    }),
    emitter.addListener('vigil.error', (m: string) => opts.onError?.(m)),
  ];

  const stopListening = () => {
    clearInterval(settleTimer);
    subs.forEach(s => s.remove());
  };
  try {
    const info = await native.arm();
    // Fail closed if the model on this phone disagrees with the engine's class table.
    const problems = checkLabels(info.labels);
    if (problems.length) {
      stopListening();
      await native.disarm();
      return {result: {ok: false, reason: 'model', detail: problems.join('; ')}};
    }
    sha256 = info.sha256;
    // Context sounds are optional: a mismatch turns them off (and the record
    // says so), never V4 detection.
    const contextProblems = checkContextLabels(info.labels);
    context = contextProblems.length === 0;
    if (!context) opts.onError?.(`context sounds unavailable: ${contextProblems[0]}`);
    armed = true;
  } catch (e) {
    stopListening();
    return {result: {ok: false, reason: 'capture', detail: String(e)}};
  }
  return {
    result: {ok: true},
    detector: {
      setCheckinOpen(open) {
        state = step(state, {type: 'checkin', open}, RULESET_V1).state;
        if (!open) {
          grader.checkinClosed();
          native.clearCheckin();
        }
      },
      reserveForHelp() {
        const ok = grader.reserve();
        if (ok) state = step(state, {type: 'checkin', open: true}, RULESET_V1).state;
        return ok;
      },
      observePin(p) {
        tracker.observePin(p, lastEndMs + Math.max(0, Date.now() - lastWallMs));
      },
      speedBucket() {
        return state.motion.length ? activityBefore(state.motion, state.motion.length, RULESET_V1) : 'unknown';
      },
      async feedClip(name) {
        if (!native.testFeed) throw new Error('test feed not in this build');
        const windows = await native.classifyTestClip(name);
        // Clip times and sequence numbers start at 0: shift both past the
        // journey's latest window, so no live window is mistaken for a clip one.
        const base = lastEndMs + 1000;
        const seqBase = lastSeq + 10;
        const decisions: Decision[] = [];
        for (const w of windows) {
          const d = judge({...w, seq: seqBase + w.seq, endMs: base + w.endMs});
          if (d) decisions.push(d);
        }
        await chain;
        return {windows: windows.length, decisions};
      },
      async stop() {
        armed = false;
        stopListening();
        // Anything still waiting settles as record-only: nothing prompts after a pause.
        grader.stop().forEach(act);
        await chain;
        native.clearCheckin();
        await native.disarm();
      },
    },
  };
}

export type Level = {label: string | null; score: number; threshold: number};

/** The target closest to its threshold in one window; quiet below 3 points. */
export function levelOf(w: AudioWindow): Level {
  let best = -1;
  let ratio = -1;
  TARGETS.forEach((t, i) => {
    const thr = RULESET_V1.thresholdBp[t.label];
    const r = thr > 0 ? w.targetBp[i] / thr : 0;
    if (r > ratio) {
      ratio = r;
      best = i;
    }
  });
  if (best < 0) return {label: null, score: 0, threshold: 0};
  const score = w.targetBp[best];
  const threshold = RULESET_V1.thresholdBp[TARGETS[best].label];
  return {label: score >= 300 ? TARGETS[best].label : null, score, threshold};
}

/**
 * Whether a check-in can open over other apps and the lock screen. On
 * Android 14+ the member may need to allow it once; without it a check-in is
 * only a notification that slides away. True where there is nothing to ask.
 */
export async function canFullScreen(): Promise<boolean> {
  if (!native?.canFullScreen) return true;
  return native.canFullScreen().catch(() => true);
}

export function openFullScreenSettings(): void {
  native?.openFullScreenSettings?.();
}

/** True once if VIGIL was opened from its Quick Settings tile (hold-for-help). */
export async function consumeHelpRequest(): Promise<boolean> {
  if (!native?.consumeHelp) return false;
  return native.consumeHelp().catch(() => false);
}

/** True only in builds made with -PvigilTestFeed=true. */
export const testFeedAvailable = (): boolean => Boolean(native?.testFeed);

/**
 * Test builds only: classify a clip already placed in the app's files folder
 * with the phone's own model, then run the windows through a fresh engine.
 * Returns every decision with its reasons.
 */
export async function runTestClip(name: string): Promise<{windows: number; decisions: Decision[]}> {
  if (!native?.testFeed) throw new Error('test feed not in this build');
  const windows = await native.classifyTestClip(name);
  let state = initialState();
  const decisions: Decision[] = [];
  for (const w of windows) {
    const out = step(state, {type: 'audio', window: toWindow(w, true)}, RULESET_V1);
    state = out.state;
    if (out.decision) decisions.push(out.decision);
  }
  return {windows: windows.length, decisions};
}
