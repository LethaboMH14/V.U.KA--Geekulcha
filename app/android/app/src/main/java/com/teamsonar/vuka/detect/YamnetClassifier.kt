package com.teamsonar.vuka.detect

import android.content.Context
import org.tensorflow.lite.Interpreter
import java.io.Closeable
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.security.MessageDigest

/**
 * YAMNet on LiteRT (ADR D3), loaded only after its bytes match the model
 * register (docs/MODEL-LICENCES.md M1). Shapes are read from the interpreter,
 * never assumed (spec V3: "asserted from get_input_details()"), and the nine
 * target classes are resolved by label from the model's own label list.
 */
class YamnetClassifier(context: Context) : Closeable {
    companion object {
        const val MODEL_SHA256 = "10c95ea3eb9a7bb4cb8bddf6feb023250381008177ac162ce169694d05c317de"
        const val SAMPLES = 15600
        const val CLASSES = 521

        /** Same labels and order as app/src/brain/detect/classes.ts TARGETS (index ascending). */
        val TARGET_LABELS = listOf(
            "Shout", "Yell", "Screaming",
            "Gunshot, gunfire", "Machine gun", "Fusillade",
            "Glass", "Shatter", "Breaking",
        )
    }

    val labels: List<String>
    val targetIndices: IntArray
    /** The gun-like classes' excluded neighbours (ADR-0039(3)), by label. */
    val neighbourIndices: IntArray
    private val interpreter: Interpreter
    private val output = Array(1) { FloatArray(CLASSES) }

    init {
        val bytes = context.assets.open("models/yamnet.tflite").use { it.readBytes() }
        val sha = MessageDigest.getInstance("SHA-256").digest(bytes).joinToString("") { "%02x".format(it) }
        require(sha == MODEL_SHA256) { "YAMNet hash mismatch: $sha" }

        val buffer = ByteBuffer.allocateDirect(bytes.size).order(ByteOrder.nativeOrder())
        buffer.put(bytes).rewind()
        interpreter = Interpreter(buffer, Interpreter.Options().setNumThreads(2))

        val inShape = interpreter.getInputTensor(0).shape()
        require(inShape.fold(1) { a, b -> a * b } == SAMPLES) { "unexpected input shape ${inShape.contentToString()}" }
        val outShape = interpreter.getOutputTensor(0).shape()
        require(outShape.last() == CLASSES) { "unexpected output shape ${outShape.contentToString()}" }

        labels = context.assets.open("models/yamnet_labels.txt").bufferedReader().readLines().filter { it.isNotEmpty() }
        require(labels.size == CLASSES) { "expected $CLASSES labels, got ${labels.size}" }
        fun resolve(names: List<String>) = IntArray(names.size) { i ->
            val at = labels.indexOf(names[i])
            require(at >= 0 && labels.lastIndexOf(names[i]) == at) { "label ${names[i]} missing or repeated" }
            at
        }
        targetIndices = resolve(TARGET_LABELS)
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
}

/** One window's integer summary for the engine. */
fun summarise(c: YamnetClassifier, scores: FloatArray, seq: Int, endMs: Long): WindowResult {
    var top = 0
    for (i in 1 until scores.size) if (scores[i] > scores[top]) top = i
    var neighbour = 0
    for (i in c.neighbourIndices) neighbour = maxOf(neighbour, toBp(scores[i]))
    return WindowResult(seq, endMs, IntArray(c.targetIndices.size) { toBp(scores[c.targetIndices[it]]) }, top, toBp(scores[top]), neighbour)
}

/** Score 0..1 to integer basis points 0..10000, rounding half up (no float leaves native). */
fun toBp(score: Float): Int = kotlin.math.floor(score.toDouble() * 10000.0 + 0.5).toInt().coerceIn(0, 10000)
