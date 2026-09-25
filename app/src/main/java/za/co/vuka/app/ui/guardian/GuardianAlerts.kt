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
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

/**
 * The guardian alert this phone is handling, shared by the alert screen, the
 * app-wide banner and the notification.
 *
 * SIMULATED: real alerts arrive by FCM from the server (spec G3), which isn't
 * connected. [simulateIncoming] stands in for that delivery so the flow can be
 * tried: notification → alert screen, and a banner on every screen until the
 * guardian stands down. In-memory only, so a restart clears it.
 */
object GuardianAlerts {

    enum class Ack { NEW, CALLED, HANDLING, STOOD_DOWN }

    private val _active = MutableStateFlow(false)
    val active: StateFlow<Boolean> = _active

    private val _ack = MutableStateFlow(Ack.NEW)
    val ack: StateFlow<Ack> = _ack

    /** True while an alert is open and this guardian hasn't stood down. The banner shows then. */
    fun needsAttention(active: Boolean, ack: Ack) = active && ack != Ack.STOOD_DOWN

    fun simulateIncoming(context: Context) {
        _ack.value = Ack.NEW
        _active.value = true
        postNotification(context)
    }

    fun setAck(ack: Ack) {
        _ack.value = ack
    }

    /** Stepping down as a guardian, or deleting the profile, drops any alert. */
    fun clear(context: Context) {
        _active.value = false
        _ack.value = Ack.NEW
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
            .setContentTitle("Simulated alert · Example member")
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
