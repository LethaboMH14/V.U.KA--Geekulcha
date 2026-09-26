package za.co.vuka.app.detect

import android.annotation.SuppressLint
import android.content.Context
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioRecord
import android.media.MediaRecorder
import android.media.audiofx.AcousticEchoCanceler
import android.media.audiofx.AutomaticGainControl
import android.media.audiofx.NoiseSuppressor
import android.os.SystemClock
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean
import kotlin.math.max

/**
 * Microphone to YAMNet windows. Ported unchanged in behaviour from the React
 * Native app (com.teamsonar.vuka.detect.AudioPipeline). Raw audio never leaves memory (D7): a 3 s ring
 * buffer, zeroed on stop, and nothing is written anywhere.
 *
 * Capture takes BEACON's lesson: automatic gain, noise suppression and echo
 * cancellation all fight a transient detector, so they are off (the UNPROCESSED
 * source where the phone supports it, else VOICE_RECOGNITION, plus disabling
 * any attached effects).
 *
 * Windows: 15 600 samples every 7 800 (50 % overlap), at a fixed cadence, with
 * no gate in front of the model. A gate would save battery but can skip a
 * quiet, distant or slowly rising scream, and a skipped window is a miss; any
 * gate returns only after its extra misses are measured. With 50 % overlap an
 * event of up to half a window always lies wholly inside one window, decay
 * included. The window number counts hops of captured audio, so a window the
 * model was too busy for leaves a gap the engine treats as a miss.
 */
class AudioPipeline(
    private val context: Context,
    private val classifier: YamnetClassifier,
    private val onWindow: (WindowResult) -> Unit,
    private val onError: (String) -> Unit,
    /** Called once, from the capture thread, when the microphone is actually recording. */
    private val onStarted: () -> Unit,
    /** Called once if capture can't start or stops on a read error. */
    private val onFailed: (String) -> Unit,
) {
    companion object {
        const val RATE = 16000
        /** 12.5 ms: divides both the hop (39 frames) and the window (78), so windows land on exact sample positions. */
        const val FRAME = 200
        const val WINDOW = YamnetClassifier.SAMPLES
        const val HOP = WINDOW / 2
        const val RING = RATE * 3
    }

    private val running = AtomicBoolean(false)
    private val inferring = AtomicBoolean(false)
    private val capture = Executors.newSingleThreadExecutor()
    private val inference = Executors.newSingleThreadExecutor()
    private val ring = FloatArray(RING)
    private var write = 0
    private var filled = 0

    fun start() {
        if (!running.compareAndSet(false, true)) return
        capture.execute { loop() }
    }

    /**
     * Stops capture and waits for it: recording stops, any in-flight inference
     * finishes, buffers are zeroed, and both threads end. Only then may the
     * caller close the classifier.
     */
    fun stop() {
        running.set(false)
        capture.shutdown()
        capture.awaitTermination(3, TimeUnit.SECONDS)
        inference.shutdown()
        inference.awaitTermination(3, TimeUnit.SECONDS)
        ring.fill(0f)
    }

    private fun source(): Int {
        val am = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
        val unprocessed = am.getProperty(AudioManager.PROPERTY_SUPPORT_AUDIO_SOURCE_UNPROCESSED) == "true"
        return if (unprocessed) MediaRecorder.AudioSource.UNPROCESSED else MediaRecorder.AudioSource.VOICE_RECOGNITION
    }

    @SuppressLint("MissingPermission") // the service only starts after RECORD_AUDIO is granted
    private fun loop() {
        val min = AudioRecord.getMinBufferSize(RATE, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_FLOAT)
        val rec = try {
            AudioRecord(source(), RATE, AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_FLOAT, max(min, FRAME * 16))
        } catch (e: Exception) {
            running.set(false)
            onFailed("audio_init: ${e.message}")
            return
        }
        if (rec.state != AudioRecord.STATE_INITIALIZED) {
            rec.release()
            running.set(false)
            onFailed("audio_init: recorder not initialised")
            return
        }
        listOfNotNull(
            if (AutomaticGainControl.isAvailable()) AutomaticGainControl.create(rec.audioSessionId) else null,
            if (NoiseSuppressor.isAvailable()) NoiseSuppressor.create(rec.audioSessionId) else null,
            if (AcousticEchoCanceler.isAvailable()) AcousticEchoCanceler.create(rec.audioSessionId) else null,
        ).forEach { it.enabled = false }

        val frame = FloatArray(FRAME)
        // Windows end at exact sample positions: 15 600, 23 400, 31 200, … and
        // window n is the n-th of them, so seq always means the same audio.
        var captured = 0L
        var nextEnd = WINDOW.toLong()
        rec.startRecording()
        if (rec.recordingState != AudioRecord.RECORDSTATE_RECORDING) {
            rec.release()
            running.set(false)
            onFailed("audio_start: the microphone did not start")
            return
        }
        onStarted()
        try {
            while (running.get()) {
                var got = 0
                while (got < FRAME && running.get()) {
                    val n = rec.read(frame, got, FRAME - got, AudioRecord.READ_BLOCKING)
                    if (n < 0) { running.set(false); onFailed("audio_read: $n"); return }
                    got += n
                }
                if (got < FRAME) break
                push(frame)
                captured += FRAME
                if (captured == nextEnd) {
                    val seq = ((nextEnd - WINDOW) / HOP + 1).toInt()
                    nextEnd += HOP
                    if (inferring.compareAndSet(false, true)) {
                        val samples = latest(WINDOW)
                        val s = seq
                        val end = SystemClock.elapsedRealtime()
                        inference.execute {
                            try {
                                var sum = 0.0
                                for (x in samples) sum += x * x
                                val db = 20 * kotlin.math.log10(kotlin.math.sqrt(sum / samples.size) + 1e-9)
                                val level = ((db + 60) * 100 / 60).toInt().coerceIn(0, 100)
                                onWindow(summarise(classifier, classifier.classify(samples), s, end).also { it.level = level })
                            } catch (e: Exception) {
                                onError("inference: ${e.message}")
                            } finally {
                                samples.fill(0f)
                                inferring.set(false)
                            }
                        }
                    }
                }
            }
        } finally {
            rec.stop()
            rec.release()
            ring.fill(0f)
            filled = 0
            frame.fill(0f)
        }
    }

    private fun push(block: FloatArray) {
        for (x in block) {
            ring[write] = x
            write = (write + 1) % RING
            if (filled < RING) filled++
        }
    }

    private fun latest(n: Int): FloatArray {
        val out = FloatArray(n)
        for (i in 0 until n) out[n - 1 - i] = ring[(write - 1 - i + RING * 2) % RING]
        return out
    }
}
