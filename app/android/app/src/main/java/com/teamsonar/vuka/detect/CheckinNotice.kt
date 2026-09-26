package com.teamsonar.vuka.detect

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.teamsonar.vuka.MainActivity
import com.teamsonar.vuka.R

/**
 * The journey check when the app isn't on screen (spec V4): a full-screen
 * intent where Android allows it (canUseFullScreenIntent), otherwise a
 * high-priority notification. The title is neutral ("Check-in") and the
 * notification is the same whatever caused it.
 */
object CheckinNotice {
    private const val CHANNEL = "checkin"
    private const val ID = 7002
    const val EXTRA = "vigil_checkin"

    fun show(context: Context) {
        val nm = context.getSystemService(NotificationManager::class.java)
        nm.createNotificationChannel(NotificationChannel(CHANNEL, "Check-in", NotificationManager.IMPORTANCE_HIGH))
        val open = Intent(context, MainActivity::class.java)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
            .putExtra(EXTRA, true)
        val pi = PendingIntent.getActivity(context, ID, open, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
        val canFullScreen = Build.VERSION.SDK_INT < 34 || nm.canUseFullScreenIntent()
        val b = NotificationCompat.Builder(context, CHANNEL)
            .setContentTitle("Check-in")
            .setSmallIcon(R.drawable.ic_launcher_monochrome)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setContentIntent(pi)
            .setOngoing(true)
        if (canFullScreen) b.setFullScreenIntent(pi, true)
        nm.notify(ID, b.build())
    }

    fun clear(context: Context) {
        context.getSystemService(NotificationManager::class.java).cancel(ID)
    }
}
