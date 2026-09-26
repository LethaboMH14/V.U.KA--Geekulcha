package za.co.vuka.app.ui.guardian

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import za.co.vuka.app.MainActivity
import za.co.vuka.app.R
import za.co.vuka.app.api.ServerSync
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

/**
 * The guardian alert this phone is handling, shared by the alert screen, the
 * app-wide banner and the notification.
 *
 * Real alerts come from the ANCHOR server: while the app is open, a guardian
 * linked through [ServerSync.acceptInvite] fetches GET /v1/guardians/me/alerts
 * every 15 s (no push token yet, so nothing arrives while the app is closed).
 * A new open alert raises the notification and the banner; Call 10111 and
 * Stand down are sent back as signed guardian_ack events (G5).
 * [simulateIncoming] remains for a phone that isn't linked, and says so.
 */
object GuardianAlerts {

    enum class Ack { NEW, HANDLING, STOOD_DOWN }

    private val _active = MutableStateFlow(false)
    val active: StateFlow<Boolean> = _active

    private val _ack = MutableStateFlow(Ack.NEW)
    val ack: StateFlow<Ack> = _ack

    /** True once this guardian pressed Call 10111; stand-down can happen without it. */
    var called = false
        private set

    /** True while an alert is open and this guardian hasn't stood down. The banner shows then. */
    fun needsAttention(active: Boolean, ack: Ack) = active && ack != Ack.STOOD_DOWN

    /** The server's alert being shown (incident_id, trigger, why, location…), or null when simulated. */
    private val _alert = MutableStateFlow<Map<String, Any?>?>(null)
    val alert: StateFlow<Map<String, Any?>?> = _alert

    fun simulateIncoming(context: Context) {
        _alert.value = null
        _ack.value = Ack.NEW
        called = false
        _active.value = true
        postNotification(context)
    }

    fun setAck(ack: Ack) {
        if (ack == Ack.HANDLING) called = true
        _ack.value = ack
        // Signed acknowledgement for a real alert (G5).
        (_alert.value?.get("incident_id") as? String)?.let { incident ->
            when (ack) {
                Ack.HANDLING -> ServerSync.acknowledge(incident, "called_10111")
                Ack.STOOD_DOWN -> ServerSync.acknowledge(incident, "stand_down")
                Ack.NEW -> Unit
            }
        }
    }

    private val poller = android.os.Handler(android.os.Looper.getMainLooper())
    private var polling: Runnable? = null
    private val seen = mutableSetOf<String>()

    /** Fetch alerts every 15 s while the app is in the foreground (MainActivity onStart). */
    fun startPolling(context: Context) {
        val app = context.applicationContext
        ServerSync.init(app)
        if (!ServerSync.isGuardian || polling != null) return
        val tick = object : Runnable {
            override fun run() {
                ServerSync.guardianAlerts { result -> result.onSuccess { onAlerts(app, it) } }
                poller.postDelayed(this, 15_000)
            }
        }
        polling = tick
        poller.post(tick)
    }

    fun stopPolling() {
        polling?.let(poller::removeCallbacks)
        polling = null
    }

    private fun onAlerts(context: Context, alerts: List<Map<String, Any?>>) {
        val open = alerts.filter { it["closed_at"] == null }.maxByOrNull { it["opened_at"] as? String ?: "" }
        val id = open?.get("incident_id") as? String
        if (open != null && id != null && id !in seen) {
            seen += id
            _alert.value = open
            _ack.value = Ack.NEW
            called = false
            _active.value = true
            postNotification(context)
        } else if (open != null && id == _alert.value?.get("incident_id")) {
            _alert.value = open // location or reasons may have moved on
        } else if (open == null && _alert.value != null) {
            // The incident closed on the server (stand-down, member ended it, or 6 h).
            _active.value = false
        }
    }

    /** Stepping down as a guardian, or deleting the profile, drops any alert. */
    fun clear(context: Context) {
        stopPolling()
        _alert.value = null
        ServerSync.leaveGuardian()
        _active.value = false
        _ack.value = Ack.NEW
        called = false
        NotificationManagerCompat.from(context).cancel(NOTIFICATION_ID)
    }

    // G3: a visible, high-priority notification that opens the alert directly.
    private fun postNotification(context: Context) {
        val granted = Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU ||
            ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) ==
            PackageManager.PERMISSION_GRANTED
        if (!granted) return // the in-app banner still shows

        val manager = context.getSystemService(NotificationManager::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            manager.createNotificationChannel(
                NotificationChannel(CHANNEL_ID, "Guardian alerts", NotificationManager.IMPORTANCE_HIGH).apply {
                    description = "When someone you protect needs help"
                }
            )
        }
        val open = PendingIntent.getActivity(
            context, 0,
            Intent(context, MainActivity::class.java)
                .putExtra(MainActivity.EXTRA_OPEN_ALERT, true)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )
        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_shield_warning)
            .setContentTitle(if (_alert.value != null) "VUKA alert · someone you protect" else "Simulated alert · Example member")
            .setContentText("Don't call or text them. Call 10111.")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setContentIntent(open)
            .setAutoCancel(true)
            .build()
        @Suppress("MissingPermission") // checked above
        NotificationManagerCompat.from(context).notify(NOTIFICATION_ID, notification)
    }

    private const val CHANNEL_ID = "guardian_alerts"
    private const val NOTIFICATION_ID = 4101
}
