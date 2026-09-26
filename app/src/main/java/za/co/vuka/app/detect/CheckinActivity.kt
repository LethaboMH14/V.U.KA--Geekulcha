package za.co.vuka.app.detect

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.children
import za.co.vuka.app.R
import za.co.vuka.app.api.ServerSync
import za.co.vuka.app.auth.InterimPinStore
import za.co.vuka.app.auth.PinResult
import za.co.vuka.app.ui.settings.ThemePrefs

/**
 * The Journey check (spec V4, §4b, T47). A port of the React Native app's
 * openCheckin:
 *
 *  - `checkin_opened` is recorded only once this screen is actually showing;
 *  - a normal or duress PIN records `checkin_result` and shows the same
 *    "Checked in" (V5); the server treats duress as an alarm;
 *  - wrong PINs 1–3 each show the same "Try again"; from then on every entry
 *    shows "Checked in" (server-side it is already no_answer), so this screen
 *    is never a PIN oracle;
 *  - no answer: the server raises the alarm after the window (~90 s).
 *
 * Shown over the lock screen, so it shows nothing private.
 */
class CheckinActivity : AppCompatActivity() {
    companion object {
        private const val EXTRA_JOURNEY = "journey_id"
        private const val EXTRA_SIGNAL = "signal_event_id"
        private const val KEY_CHECKIN = "checkin_id"
        private const val KEY_OPENED = "opened"
        private const val KEY_ATTEMPTS = "attempts"
        private const val PIN_LENGTH = 4

        private const val CHANNEL = "journey_check"
        private const val NOTIFICATION_ID = 7002

        /**
         * Raises the Journey check for one signal: a full-screen intent where
         * Android allows it, otherwise a high-priority notification (V4).
         */
        fun notify(context: Context, journeyId: String, signalEventId: String, fullScreen: Boolean) {
            val nm = context.getSystemService(NotificationManager::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                nm.createNotificationChannel(NotificationChannel(CHANNEL, "Journey check", NotificationManager.IMPORTANCE_HIGH))
            }
            val open = PendingIntent.getActivity(
                context, signalEventId.hashCode(),
                Intent(context, CheckinActivity::class.java)
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
                    .putExtra(EXTRA_JOURNEY, journeyId)
                    .putExtra(EXTRA_SIGNAL, signalEventId),
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
            )
            val allowedFullScreen = fullScreen && (Build.VERSION.SDK_INT < 34 || nm.canUseFullScreenIntent())
            val n = NotificationCompat.Builder(context, CHANNEL)
                .setContentTitle("Journey check") // neutral (V4)
                .setContentText("Tap to check in.")
                .setSmallIcon(R.drawable.ic_shield_chevron)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setContentIntent(open)
                .setAutoCancel(true)
                .apply { if (allowedFullScreen) setFullScreenIntent(open, true) }
                .build()
            try {
                NotificationManagerCompat.from(context).notify(NOTIFICATION_ID, n)
            } catch (_: SecurityException) {
                // Notifications refused: Activate asks for them, so this is rare.
            }
        }
    }

    private var entry = ""
    private var attempts = 0
    private var opened = false
    private var done = false
    private lateinit var checkinId: String
    private lateinit var journeyId: String
    private lateinit var signalEventId: String
    private lateinit var dots: List<View>

    override fun onCreate(savedInstanceState: Bundle?) {
        ThemePrefs.applySaved(this)
        super.onCreate(savedInstanceState)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
        } else {
            @Suppress("DEPRECATION")
            window.addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON)
        }
        setContentView(R.layout.activity_checkin)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.checkinRoot)) { v, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(bars.left, bars.top, bars.right, bars.bottom)
            insets
        }

        journeyId = intent.getStringExtra(EXTRA_JOURNEY) ?: return finish()
        signalEventId = intent.getStringExtra(EXTRA_SIGNAL) ?: return finish()
        ServerSync.init(this)
        checkinId = savedInstanceState?.getString(KEY_CHECKIN) ?: ServerSync.newCheckinId()
        opened = savedInstanceState?.getBoolean(KEY_OPENED) ?: false
        attempts = savedInstanceState?.getInt(KEY_ATTEMPTS) ?: 0

        // Not answering is an answer: no way to dismiss the check from here.
        findViewById<View>(R.id.btnClose).visibility = View.GONE
        findViewById<TextView>(R.id.tvPrompt).text = "Journey check. Enter your PIN to check in."

        dots = findViewById<ViewGroup>(R.id.pinDots).children.toList()
        findViewById<View>(R.id.keyDelete).setOnClickListener {
            entry = entry.dropLast(1)
            renderDots()
        }
        val pins = InterimPinStore(this)
        findViewById<ViewGroup>(R.id.keypad).children.filterIsInstance<TextView>().forEach { key ->
            key.setOnClickListener {
                if (done || entry.length >= PIN_LENGTH) return@setOnClickListener
                entry += key.text
                renderDots()
                if (entry.length == PIN_LENGTH) {
                    val pin = entry
                    window.decorView.postDelayed({ if (entry == pin) submit(pins.verify(pin)) }, 150)
                }
            }
        }
        renderDots()
    }

    override fun onResume() {
        super.onResume()
        // V4: `checkin_opened` only once the check is confirmed on screen.
        if (!opened) {
            opened = true
            ServerSync.checkinOpened(journeyId, checkinId, signalEventId)
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        outState.putString(KEY_CHECKIN, checkinId)
        outState.putBoolean(KEY_OPENED, opened)
        outState.putInt(KEY_ATTEMPTS, attempts)
    }

    private fun submit(result: PinResult) {
        entry = ""
        attempts += 1
        when {
            result == PinResult.WRONG && attempts <= 3 -> {
                findViewById<TextView>(R.id.tvPrompt).text = "Try again."
                renderDots()
            }
            result == PinResult.WRONG -> finishChecked() // already no_answer server-side
            else -> {
                ServerSync.checkinResult(journeyId, checkinId, duress = result == PinResult.DURESS, attempt = attempts)
                finishChecked()
            }
        }
    }

    private fun finishChecked() {
        done = true
        findViewById<TextView>(R.id.tvPrompt).text = "Checked in."
        dots.forEach { it.setBackgroundResource(R.drawable.bg_pin_dot_filled) }
        NotificationManagerCompat.from(this).cancel(NOTIFICATION_ID)
        window.decorView.postDelayed({ finish() }, 900)
    }

    private fun renderDots() {
        dots.forEachIndexed { i, dot ->
            dot.setBackgroundResource(if (i < entry.length) R.drawable.bg_pin_dot_filled else R.drawable.bg_pin_dot_empty)
        }
    }
}
