package za.co.vuka.app.detect

import android.content.Context
import org.tensorflow.lite.Interpreter
import java.io.ByteArrayInputStream
import java.io.Closeable
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.security.MessageDigest
import java.util.zip.ZipInputStream

/**
 * YAMNet on LiteRT, loaded only after its bytes match the model register
 * (docs/MODEL-LICENCES.md M1). Ported from the React Native app's
 * com.teamsonar.vuka.detect.YamnetClassifier (feat/lethabo-vigil-events).
 *
 * Shapes are read from the interpreter, never assumed (spec V3), and the target
 * classes are resolved BY LABEL from the label list embedded in the verified
 * model itself, so a wrong index can never slip in.
 *
 * Install the model with `python scripts/fetch_yamnet_app.py` (it is gitignored).
 */
class YamnetClassifier(context: Context) : Closeable {
    companion object {
        const val MODEL_ASSET = "models/yamnet.tflite"
        const val MODEL_SHA256 = "10c95ea3eb9a7bb4cb8bddf6feb023250381008177ac162ce169694d05c317de"
        const val SAMPLES = 15600
        const val CLASSES = 521
    }

    val labels: List<String>
    /** Indices of [DetectionEngine.TARGETS], same order. */
    val targetIndices: IntArray
    /** The gun-like classes' excluded neighbours (ADR-0039(3)), by label. */
    val neighbourIndices: IntArray
    private val interpreter: Interpreter
    private val output = Array(1) { FloatArray(CLASSES) }

    init {
        val bytes = try {
            context.assets.open(MODEL_ASSET).use { it.readBytes() }
        } catch (e: java.io.IOException) {
            throw IllegalStateException("the sound model isn't installed in this build")
        }
        val sha = MessageDigest.getInstance("SHA-256").digest(bytes).joinToString("") { "%02x".format(it) }
        require(sha == MODEL_SHA256) { "the sound model doesn't match its registered fingerprint" }

        labels = embeddedLabels(bytes)
        require(labels.size == CLASSES) { "expected $CLASSES labels, got ${labels.size}" }

        val buffer = ByteBuffer.allocateDirect(bytes.size).order(ByteOrder.nativeOrder())
        buffer.put(bytes).rewind()
        interpreter = Interpreter(buffer, Interpreter.Options().setNumThreads(2))

        val inShape = interpreter.getInputTensor(0).shape()
        require(inShape.fold(1) { a, b -> a * b } == SAMPLES) { "unexpected input shape ${inShape.contentToString()}" }
        val outShape = interpreter.getOutputTensor(0).shape()
        require(outShape.last() == CLASSES) { "unexpected output shape ${outShape.contentToString()}" }

        fun resolve(names: List<String>) = IntArray(names.size) { i ->
            val at = labels.indexOf(names[i])
            require(at >= 0 && labels.lastIndexOf(names[i]) == at) { "label ${names[i]} missing or repeated" }
            at
        }
        targetIndices = resolve(DetectionEngine.TARGETS.map { it.label })
        neighbourIndices = resolve(listOf("Explosion", "Artillery fire", "Cap gun", "Fireworks", "Firecracker"))
    }

    /** Scores for one 15 600-sample window at 16 kHz, one per class, 0..1. */
    @Synchronized
    fun classify(samples: FloatArray): FloatArray {
        require(samples.size == SAMPLES)
        interpreter.run(samples, output)
        return output[0].copyOf()
    }

    override fun close() = interpreter.close()

    /** The model carries its label list as a zip appended to the flatbuffer; read it from there. */
    private fun embeddedLabels(model: ByteArray): List<String> {
        val signature = byteArrayOf(0x50, 0x4b, 0x03, 0x04) // local file header "PK\3\4"
        var at = -1
        for (i in 0..model.size - 4) {
            if (model[i] == signature[0] && model[i + 1] == signature[1] && model[i + 2] == signature[2] && model[i + 3] == signature[3]) {
                at = i
                break
            }
        }
        require(at >= 0) { "no label list in the model" }
        ZipInputStream(ByteArrayInputStream(model, at, model.size - at)).use { zip ->
            while (true) {
                val entry = zip.nextEntry ?: break
                if (entry.name == "yamnet_label_list.txt") {
                    return zip.readBytes().decodeToString().lines().filter { it.isNotEmpty() }
                }
            }
        }
        throw IllegalArgumentException("no label list in the model")
    }
}

/** One classified window, integers only. `targetBp` follows [DetectionEngine.TARGETS] order. */
class WindowResult(
    val seq: Int,
    val endMs: Long,
    val targetBp: IntArray,
    val gunNeighbourBp: Int,
    /** The model's top class over all 521, for the live "Hearing" line (never audio). */
    val topIndex: Int = 0,
    val topBp: Int = 0,
    /** Loudness of the window, 0..100 (RMS against full scale, in dB above -60). */
    var level: Int = 0,
)

fun summarise(c: YamnetClassifier, scores: FloatArray, seq: Int, endMs: Long): WindowResult {
    var neighbour = 0
    for (i in c.neighbourIndices) neighbour = maxOf(neighbour, toBp(scores[i]))
    var top = 0
    for (i in 1 until scores.size) if (scores[i] > scores[top]) top = i
    return WindowResult(seq, endMs, IntArray(c.targetIndices.size) { toBp(scores[c.targetIndices[it]]) }, neighbour, top, toBp(scores[top]))
}

/** Score 0..1 to integer basis points 0..10000, rounding half up. */
fun toBp(score: Float): Int = kotlin.math.floor(score.toDouble() * 10000.0 + 0.5).toInt().coerceIn(0, 10000)
