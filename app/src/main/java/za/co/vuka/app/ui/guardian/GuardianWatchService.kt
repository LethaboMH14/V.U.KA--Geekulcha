package za.co.vuka.app.ui.guardian

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import za.co.vuka.app.MainActivity
import za.co.vuka.app.R
import za.co.vuka.app.api.ServerSync

/**
 * Guardian standby with the app closed (PROPOSED). There is no push token
 * yet (FCM needs the project's Firebase config), so a linked guardian's phone
 * keeps a quiet foreground service that fetches /v1/guardians/me/alerts every
 * 15 s, and [GuardianAlerts] raises the full-screen alert notification.
 *
 * Limits, stated: it holds a partial wake lock (battery cost not measured),
 * and Android's Doze can still delay polls on a phone left still with the
 * screen off. FCM high-priority push is the real fix.
 */
class GuardianWatchService : Service() {
    companion object {
        private const val TAG = "GuardianWatch"
        private const val CHANNEL = "guardian_standby"
        private const val NOTIFICATION_ID = 4102

        @Volatile var running = false
            private set

        fun start(context: Context) {
            ServerSync.init(context.applicationContext)
            if (!ServerSync.isGuardian) return
            try {
                ContextCompat.startForegroundService(context, Intent(context, GuardianWatchService::class.java))
            } catch (e: Exception) {
                Log.w(TAG, "standby not started: ${e.message}") // e.g. started from the background on Android 12+
            }
        }

        fun stop(context: Context) {
            context.stopService(Intent(context, GuardianWatchService::class.java))
        }
    }

    private var wake: PowerManager.WakeLock? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        ServerSync.init(applicationContext)
        if (!ServerSync.isGuardian) {
            stopSelf()
            return START_NOT_STICKY
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            getSystemService(NotificationManager::class.java).createNotificationChannel(
                NotificationChannel(CHANNEL, "Guardian standby", NotificationManager.IMPORTANCE_MIN)
            )
        }
        val open = PendingIntent.getActivity(
            this, 1,
            Intent(this, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )
        val notification = NotificationCompat.Builder(this, CHANNEL)
            .setContentTitle("Guardian standby")
            .setContentText("You'll be alerted here, even with VUKA closed.")
            .setSmallIcon(R.drawable.ic_shield_chevron)
            .setContentIntent(open)
            .setOngoing(true)
            .setSilent(true)
            .build()
        try {
            if (Build.VERSION.SDK_INT >= 34) {
                startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
            } else {
                startForeground(NOTIFICATION_ID, notification)
            }
        } catch (e: Exception) {
            Log.w(TAG, "not in the foreground: ${e.message}")
            stopSelf()
            return START_NOT_STICKY
        }
        if (wake == null) {
            wake = getSystemService(PowerManager::class.java)
                .newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "vuka:guardian-standby")
                .apply { setReferenceCounted(false); acquire() }
        }
        running = true
        GuardianAlerts.startPolling(applicationContext)
        return START_STICKY
    }

    override fun onDestroy() {
        running = false
        GuardianAlerts.stopPolling()
        wake?.let { if (it.isHeld) it.release() }
        wake = null
        super.onDestroy()
    }
}

/** Brings guardian standby back after the phone restarts. */
class GuardianBootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) GuardianWatchService.start(context)
    }
}
