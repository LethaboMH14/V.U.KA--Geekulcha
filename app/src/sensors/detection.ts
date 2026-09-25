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
  activityBefore,
  buildSignalDetected,
  checkLabels,
  initialState,
  step,
  type AudioWindow,
  type Decision,
  type EngineState,
  type MotionFrame,
  type SignalDetectedV1,
} from '../brain/detect';

type Native = {
  testFeed?: boolean;
  classifyTestClip(name: string): Promise<AudioWindow[]>;
  /** Resolves only once the microphone is recording, with the model's facts. */
  arm(): Promise<{sha256: string; labels: string[]}>;
  disarm(): Promise<boolean>;
  showCheckin(): void;
  clearCheckin(): void;
};

const native: Native | undefined = NativeModules.VigilDetection;

/** Only the engine's fields, so nothing else from native reaches a decision. */
const toWindow = (w: AudioWindow): AudioWindow => ({
  seq: w.seq,
  endMs: w.endMs,
  targetBp: w.targetBp,
  topIndex: w.topIndex,
  topBp: w.topBp,
  gunNeighbourBp: w.gunNeighbourBp,
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
  /**
   * A confirmed detection: sign and queue the event. Evidence, always.
   * Resolves with the event's id once it is in the queue.
   */
  onRecord: (decision: Decision, payload: SignalDetectedV1) => Promise<string | undefined>;
  /**
   * Open the journey check (only after a record, never over an open
   * check-in). Called only once the detection is queued, with its event id,
   * so the check-in can never overtake the signal that caused it.
   */
  onPrompt: (decision: Decision, signalEventId: string) => void;
  onError?: (message: string) => void;
}): Promise<{result: ArmResult; detector?: Detector}> {
  if (!native) return {result: {ok: false, reason: 'unsupported'}};
  const perm = await permissions();
  if (!perm.ok) return {result: perm};

  let state: EngineState = initialState();
  // Nothing is judged until arming has finished and the model has been checked.
  let armed = false;
  let sha256 = '';
  const emitter = new NativeEventEmitter(NativeModules.VigilDetection);
  // Decisions are handled strictly in order: a record is queued before the
  // next decision, and before the check-in it may open.
  let chain: Promise<void> = Promise.resolve();
  let lastEndMs = 0;
  let lastSeq = 0;
  const judge = (w: AudioWindow) => {
    lastEndMs = Math.max(lastEndMs, w.endMs);
    lastSeq = Math.max(lastSeq, w.seq);
    const out = step(state, {type: 'audio', window: toWindow(w)}, RULESET_V1);
    state = out.state;
    const d = out.decision;
    if (d?.record && d.candidate) {
      const payload = buildSignalDetected({
        journeyId: opts.journeyId,
        candidate: d.candidate,
        corroboration: d.corroboration,
        modelSha256: sha256,
        appVersion: opts.appVersion,
      });
      chain = chain.then(async () => {
        const eventId = await opts.onRecord(d, payload);
        // Once the journey has ended, a late detection is evidence but never a prompt.
        if (d.prompt && eventId && armed) {
          native.showCheckin();
          opts.onPrompt(d, eventId);
        }
      }).catch(e => opts.onError?.(String(e)));
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

  const stopListening = () => subs.forEach(s => s.remove());
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
        if (!open) native.clearCheckin();
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
        await chain;
        native.clearCheckin();
        await native.disarm();
      },
    },
  };
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
    const out = step(state, {type: 'audio', window: toWindow(w)}, RULESET_V1);
    state = out.state;
    if (out.decision) decisions.push(out.decision);
  }
  return {windows: windows.length, decisions};
}
