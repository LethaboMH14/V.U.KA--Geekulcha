package com.teamsonar.vuka.detect

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Notification
import android.content.Context
import android.os.Build

/**
 * The channel VIGIL's server pushes guardian alerts on (FCM,
 * server/src/notify/fcm.py: android.notification.channel_id). Created at
 * start-up so a push that arrives while the app is closed is shown at high
 * importance rather than on FCM's fallback channel. The local "alerts"
 * channel (GuardianNotice) stays for alerts found by polling.
 */
object GuardianPushChannel {
    const val ID = "vuka_guardian_alerts"

    fun ensure(context: Context) {
        if (Build.VERSION.SDK_INT < 26) return
        val nm = context.getSystemService(NotificationManager::class.java) ?: return
        val channel = NotificationChannel(ID, "Guardian alerts (pushed)", NotificationManager.IMPORTANCE_HIGH).apply {
            description = "When someone you guard may need help, even when VUKA is closed."
            // Matches the server's visibility: PRIVATE hides the text on a locked screen.
            lockscreenVisibility = Notification.VISIBILITY_PRIVATE
            enableVibration(true)
        }
        // Creating an existing channel again only updates its name and description.
        nm.createNotificationChannel(channel)
    }
}
