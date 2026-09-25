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

    @ReactMethod
    fun arm(promise: Promise) {
        DetectionBus.listener = this
        SensingService.start(ctx)
        promise.resolve(true)
    }

    @ReactMethod
    fun disarm(promise: Promise) {
        SensingService.stop(ctx)
        DetectionBus.clear()
        promise.resolve(true)
    }

    /** The model's own facts, for the JS label check (classes.ts checkLabels). */
    @ReactMethod
    fun modelInfo(promise: Promise) {
        try {
            YamnetClassifier(ctx).use { c ->
                promise.resolve(Arguments.createMap().apply {
                    putString("sha256", YamnetClassifier.MODEL_SHA256)
                    putArray("labels", Arguments.fromList(c.labels))
                })
            }
        } catch (e: Exception) {
            promise.reject("model", e.message)
        }
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
            val pcm = readWav16kMono(file)
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
    override fun createNativeModules(ctx: ReactApplicationContext): List<NativeModule> = listOf(DetectionModule(ctx))
    override fun createViewManagers(ctx: ReactApplicationContext): List<ViewManager<*, *>> = emptyList()
}
