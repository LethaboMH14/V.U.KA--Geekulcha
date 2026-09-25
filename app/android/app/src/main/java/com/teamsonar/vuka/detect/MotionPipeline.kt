package com.teamsonar.vuka.detect

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.SystemClock
import kotlin.math.max
import kotlin.math.roundToInt
import kotlin.math.sqrt

/** One 200 ms accelerometer feature frame, integers only (motion.ts MotionFrame). */
data class MotionFrame(val endMs: Long, val peakMg: Int, val stdMg: Int, val crossings: Int)

/**
 * Accelerometer at ~50 Hz (the predecessor sampled at ~5 Hz, far too slow for
 * a 20–50 ms impact), condensed into 200 ms feature frames. The rules that read
 * these frames live in the JS engine, so they are the same on every phone and
 * testable against fixtures.
 */
class MotionPipeline(context: Context, private val onFrame: (MotionFrame) -> Unit) : SensorEventListener {
    companion object {
        const val FRAME_MS = 200L
        const val G = 9.80665
        const val HP_ALPHA = 0.9
        const val DEADBAND_MG = 30.0
    }

    private val sensors = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
    private val accel = sensors.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
    private val mags = ArrayList<Double>(16)
    private var frameStart = 0L
    private var lowPass = 1000.0
    private var lastSign = 0
    private var crossings = 0

    fun start(): Boolean {
        if (accel == null) return false
        frameStart = SystemClock.elapsedRealtime()
        return sensors.registerListener(this, accel, SensorManager.SENSOR_DELAY_GAME)
    }

    fun stop() {
        sensors.unregisterListener(this)
        mags.clear()
    }

    override fun onSensorChanged(e: SensorEvent) {
        val (x, y, z) = Triple(e.values[0].toDouble(), e.values[1].toDouble(), e.values[2].toDouble())
        val mg = sqrt(x * x + y * y + z * z) / G * 1000.0
        mags.add(mg)
        // High-pass by subtracting a slow low-pass; count sign changes outside a deadband.
        lowPass = HP_ALPHA * lowPass + (1 - HP_ALPHA) * mg
        val hp = mg - lowPass
        val sign = if (hp > DEADBAND_MG) 1 else if (hp < -DEADBAND_MG) -1 else 0
        if (sign != 0) {
            if (lastSign != 0 && sign != lastSign) crossings++
            lastSign = sign
        }

        val now = SystemClock.elapsedRealtime()
        if (now - frameStart >= FRAME_MS && mags.isNotEmpty()) {
            val mean = mags.average()
            var v = 0.0
            var peak = 0.0
            for (m in mags) { v += (m - mean) * (m - mean); peak = max(peak, m) }
            val std = sqrt(v / mags.size)
            onFrame(MotionFrame(now, peak.roundToInt().coerceIn(0, 16000), std.roundToInt().coerceAtLeast(0), crossings))
            mags.clear()
            crossings = 0
            frameStart = now
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) = Unit
}
