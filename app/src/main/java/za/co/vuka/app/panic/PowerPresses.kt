package za.co.vuka.app.panic

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.SystemClock
import androidx.core.content.ContextCompat

/**
 * Four quick power-button presses ask for help (PROPOSED). Android gives apps
 * no power-button event, but every press turns the screen on or off, so the
 * active journey's service counts those. Four, not five: Android's own
 * Emergency SOS uses five presses, and the two shouldn't fire together.
 * Pure counting logic, so it is unit-tested without a phone.
 */
class PressCounter(
    private val needed: Int = PRESSES,
    private val windowMs: Long = WINDOW_MS,
    private val cooldownMs: Long = COOLDOWN_MS,
) {
    private val times = ArrayDeque<Long>()
    private var lastFiredMs: Long? = null

    /** One screen on/off change at [nowMs]; true when this press completes the pattern. */
    fun press(nowMs: Long): Boolean {
        lastFiredMs?.let { if (nowMs - it < cooldownMs) return false }
        times.addLast(nowMs)
        while (times.isNotEmpty() && nowMs - times.first() > windowMs) times.removeFirst()
        if (times.size < needed) return false
        times.clear()
        lastFiredMs = nowMs
        return true
    }

    companion object {
        const val PRESSES = 4
        const val WINDOW_MS = 3_000L
        const val COOLDOWN_MS = 30_000L
    }
}

/** Listens for screen on/off while registered and raises [Panic] on the pattern. */
class PowerPressReceiver(private val onPattern: () -> Unit) : BroadcastReceiver() {
    private val counter = PressCounter()

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_SCREEN_ON || intent.action == Intent.ACTION_SCREEN_OFF) {
            if (counter.press(SystemClock.elapsedRealtime())) onPattern()
        }
    }

    fun register(context: Context) {
        val filter = IntentFilter().apply {
            addAction(Intent.ACTION_SCREEN_ON)
            addAction(Intent.ACTION_SCREEN_OFF)
        }
        ContextCompat.registerReceiver(context, this, filter, ContextCompat.RECEIVER_NOT_EXPORTED)
    }

    fun unregister(context: Context) {
        try {
            context.unregisterReceiver(this)
        } catch (_: IllegalArgumentException) {
            // not registered
        }
    }
}
