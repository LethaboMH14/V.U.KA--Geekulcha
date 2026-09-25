package com.teamsonar.vuka.detect

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.uimanager.ViewManager
import com.teamsonar.vuka.BuildConfig
import java.io.File
import java.io.RandomAccessFile
import java.nio.ByteBuffer
import java.nio.ByteOrder

/**
 * The JS face of detection: arm and disarm the service, read the model's facts,
 * and receive integer windows and motion frames. Decisions are made in JS
 * (app/src/brain/detect), never here.
 */
class DetectionModule(private val ctx: ReactApplicationContext) : ReactContextBaseJavaModule(ctx), DetectionBus.Listener {
    override fun getName() = "VigilDetection"

    override fun getConstants(): MutableMap<String, Any> = mutableMapOf("testFeed" to BuildConfig.VIGIL_TEST_FEED)

    private fun emit(name: String, body: Any?) {
        ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java).emit(name, body)
    }

    override fun onWindow(w: WindowResult) = emit("vigil.window", Arguments.createMap().apply {
        putInt("seq", w.seq)
        putDouble("endMs", w.endMs.toDouble()) // an integer carried as a JS number
        putArray("targetBp", Arguments.fromArray(w.targetBp))
        putInt("topIndex", w.topIndex)
        putInt("topBp", w.topBp)
        putInt("gunNeighbourBp", w.gunNeighbourBp)
    })

    override fun onMotion(f: MotionFrame) = emit("vigil.motion", Arguments.createMap().apply {
        putDouble("endMs", f.endMs.toDouble())
        putInt("peakMg", f.peakMg)
        putInt("stdMg", f.stdMg)
        putInt("crossings", f.crossings)
    })

    override fun onError(message: String) = emit("vigil.error", message)

    @Volatile private var pendingArm: Promise? = null

    override fun onReady(labels: List<String>, sha256: String) {
        pendingArm?.resolve(Arguments.createMap().apply {
            putString("sha256", sha256)
            putArray("labels", Arguments.fromList(labels))
        })
        pendingArm = null
    }

    override fun onFailed(message: String) {
        val p = pendingArm
        pendingArm = null
        if (p != null) p.reject("capture", message) else emit("vigil.error", message)
    }

    /**
     * Arms only when capture is really running: the promise resolves with the
     * model's facts once the microphone is recording, and rejects if the service
     * can't start (including Android 14's rule that a microphone service must be
     * started from the foreground) or the model or microphone fails.
     */
    @ReactMethod
    fun arm(promise: Promise) {
        DetectionBus.listener = this
        pendingArm = promise
        try {
            SensingService.start(ctx)
        } catch (e: Exception) {
            pendingArm = null
            promise.reject("start", e.message ?: e.javaClass.simpleName)
            return
        }
        android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
            val p = pendingArm
            if (p != null) {
                pendingArm = null
                SensingService.stop(ctx)
                p.reject("timeout", "capture did not start")
            }
        }, 10_000)
    }

    /** Shows the journey check outside the app (V4); cleared when the check-in closes. */
    @ReactMethod
    fun showCheckin() = CheckinNotice.show(ctx)

    @ReactMethod
    fun clearCheckin() = CheckinNotice.clear(ctx)

    /** The JS runtime is going away: stop sending to it, so output waits for the next one. */
    override fun invalidate() {
        if (DetectionBus.listener === this) DetectionBus.listener = null
        super.invalidate()
    }

    @ReactMethod
    fun disarm(promise: Promise) {
        SensingService.stop(ctx)
        DetectionBus.clear()
        promise.resolve(true)
    }

    /**
     * Test feed (builds made with -PvigilTestFeed=true only): classify a 16 kHz
     * mono 16-bit WAV from the app's own external files folder, window by window,
     * exactly as the live pipeline would, and return the integer windows. Never
     * in a normal build; reads only a file a tester placed there.
     */
    @ReactMethod
    fun classifyTestClip(name: String, promise: Promise) {
        if (!BuildConfig.VIGIL_TEST_FEED) { promise.reject("disabled", "test feed not in this build"); return }
        try {
            val dir = ctx.getExternalFilesDir(null) ?: throw IllegalStateException("no files dir")
            val file = File(dir, name).canonicalFile
            require(file.parentFile == dir.canonicalFile) { "file must be in the app's files folder" }
            // A tester's clip is read once and deleted: nothing stays on the phone (D7).
            val pcm = try { readWav16kMono(file) } finally { file.delete() }
            val out = Arguments.createArray()
            YamnetClassifier(ctx).use { c ->
                var seq = 0
                var start = 0
                while (start + YamnetClassifier.SAMPLES <= pcm.size) {
                    seq++
                    // Time from the sample count (an integer ms), never a 487.5 ms hop.
                    val w = summarise(c, c.classify(pcm.copyOfRange(start, start + YamnetClassifier.SAMPLES)), seq, ((start + YamnetClassifier.SAMPLES) / 16).toLong())
                    out.pushMap(Arguments.createMap().apply {
                        putInt("seq", w.seq)
                        putDouble("endMs", w.endMs.toDouble())
                        putArray("targetBp", Arguments.fromArray(w.targetBp))
                        putInt("topIndex", w.topIndex)
                        putInt("topBp", w.topBp)
                        putInt("gunNeighbourBp", w.gunNeighbourBp)
                    })
                    start += AudioPipeline.HOP
                }
            }
            promise.resolve(out)
        } catch (e: Exception) {
            promise.reject("clip", e.message)
        }
    }

    private fun readWav16kMono(f: File): FloatArray {
        RandomAccessFile(f, "r").use { raf ->
            val bytes = ByteArray(raf.length().toInt()).also { raf.readFully(it) }
            val b = ByteBuffer.wrap(bytes).order(ByteOrder.LITTLE_ENDIAN)
            require(String(bytes, 0, 4) == "RIFF" && String(bytes, 8, 4) == "WAVE") { "not a WAV file" }
            var p = 12
            var channels = 0; var rate = 0; var bits = 0
            while (p + 8 <= bytes.size) {
                val id = String(bytes, p, 4); val size = b.getInt(p + 4)
                if (id == "fmt ") { channels = b.getShort(p + 10).toInt(); rate = b.getInt(p + 12); bits = b.getShort(p + 22).toInt() }
                if (id == "data") {
                    require(channels == 1 && rate == 16000 && bits == 16) { "need 16 kHz mono 16-bit, got $rate Hz, $channels ch, $bits bit" }
                    val n = size / 2
                    return FloatArray(n) { b.getShort(p + 8 + it * 2) / 32768f }
                }
                p += 8 + size + (size and 1)
            }
            throw IllegalArgumentException("no data chunk")
        }
    }

    @ReactMethod fun addListener(eventName: String) = Unit
    @ReactMethod fun removeListeners(count: Int) = Unit
}

class DetectionPackage : ReactPackage {
    override fun createNativeModules(ctx: ReactApplicationContext): List<NativeModule> = listOf(DetectionModule(ctx), SignerModule(ctx), QueueModule(ctx), PinModule(ctx))
    override fun createViewManagers(ctx: ReactApplicationContext): List<ViewManager<*, *>> = emptyList()
}
