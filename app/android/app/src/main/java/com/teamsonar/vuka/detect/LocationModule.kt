package com.teamsonar.vuka.detect

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationManager
import android.os.Build
import android.os.CancellationSignal
import android.os.Handler
import android.os.Looper
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.jstasks.HeadlessJsTaskConfig
import java.util.concurrent.Executors
import kotlin.math.roundToInt
import kotlin.math.roundToLong

/**
 * Where the phone is, for the 30 minutes after a check-in (ADR-0048,
 * PROPOSED). Android's own LocationManager, no Play Services: the freshest
 * last-known fix from GPS or network, or a new one within a few seconds.
 * Integers only leave native (spec §5): degrees × 10^7, metres, milliseconds.
 */
class LocationModule(private val ctx: ReactApplicationContext) : ReactContextBaseJavaModule(ctx) {
    override fun getName() = "VigilLocation"

    private fun granted() =
        ctx.checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
            ctx.checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED

    private fun toMap(l: Location): WritableMap {
        val ageMs = ((android.os.SystemClock.elapsedRealtimeNanos() - l.elapsedRealtimeNanos) / 1_000_000L).coerceIn(0L, 3_600_000L)
        return Arguments.createMap().apply {
            putInt("lat_e7", (l.latitude * 1e7).roundToLong().toInt())
            putInt("lon_e7", (l.longitude * 1e7).roundToLong().toInt())
            putInt("acc_m", if (l.hasAccuracy()) l.accuracy.roundToInt().coerceIn(0, 100_000) else 100_000)
            putInt("fix_age_ms", ageMs.toInt())
        }
    }

    /** A fix no older than maxAgeMs, or null (no permission, location off, or none in time). */
    @ReactMethod
    fun current(maxAgeMs: Double, promise: Promise) {
        if (!granted()) {
            promise.resolve(null)
            return
        }
        try {
            val lm = ctx.getSystemService(LocationManager::class.java)
            val providers = listOf(LocationManager.GPS_PROVIDER, LocationManager.NETWORK_PROVIDER).filter { lm.isProviderEnabled(it) }
            val last = providers.mapNotNull { @Suppress("MissingPermission") lm.getLastKnownLocation(it) }
                .maxByOrNull { it.elapsedRealtimeNanos }
            val fresh = last != null &&
                (android.os.SystemClock.elapsedRealtimeNanos() - last.elapsedRealtimeNanos) / 1_000_000L <= maxAgeMs.toLong()
            if (fresh || providers.isEmpty() || Build.VERSION.SDK_INT < 30) {
                promise.resolve(last?.let { toMap(it) })
                return
            }
            // Ask for a new fix, but never wait long: the last one is better than none.
            val provider = if (LocationManager.GPS_PROVIDER in providers) LocationManager.GPS_PROVIDER else providers.first()
            val cancel = CancellationSignal()
            var done = false
            val finish = { l: Location? ->
                if (!done) {
                    done = true
                    promise.resolve((l ?: last)?.let { toMap(it) })
                }
            }
            Handler(Looper.getMainLooper()).postDelayed({ cancel.cancel(); finish(null) }, 8_000)
            @Suppress("MissingPermission")
            lm.getCurrentLocation(provider, cancel, Executors.newSingleThreadExecutor()) { l -> finish(l) }
        } catch (e: Exception) {
            promise.resolve(null)
        }
    }

    /**
     * A guardian's alert (the guardian's own phone, not the member's): a
     * high-priority notification that opens straight onto the alert, full
     * screen where Android allows it.
     */
    @ReactMethod
    fun showAlert(title: String, text: String) = GuardianNotice.show(ctx, title, text)

    @ReactMethod
    fun clearAlert() = GuardianNotice.clear(ctx)

    /**
     * Keeps JavaScript timers running while the app is in the background, for
     * `seconds` (a headless task). Used for the 30-minute location window and
     * for a guardian's standby, so neither stops when the screen locks.
     */
    @ReactMethod
    fun keepAwake(task: String, seconds: Double, standby: Boolean) {
        val i = Intent(ctx, KeepAliveTaskService::class.java)
            .putExtra("task", task).putExtra("seconds", seconds).putExtra("standby", standby)
        try {
            // A member's listening service already keeps the app in the
            // foreground; a guardian's standby needs its own (with a notice).
            if (standby) ctx.startForegroundService(i) else ctx.startService(i)
        } catch (_: Exception) {
            // Not allowed from here: timers then run while the app is open.
        }
    }
}

/** A headless JS task that keeps the runtime's timers alive for a while. */
class KeepAliveTaskService : HeadlessJsTaskService() {
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.getBooleanExtra("standby", false) == true) {
            val nm = getSystemService(android.app.NotificationManager::class.java)
            nm.createNotificationChannel(android.app.NotificationChannel("standby", "Guardian standby", android.app.NotificationManager.IMPORTANCE_LOW))
            val n = androidx.core.app.NotificationCompat.Builder(this, "standby")
                .setContentTitle("VUKA guardian")
                .setContentText("Standing by for alerts")
                .setSmallIcon(com.teamsonar.vuka.R.drawable.ic_launcher_monochrome)
                .setOngoing(true)
                .build()
            val type = if (Build.VERSION.SDK_INT >= 29) android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC else 0
            androidx.core.app.ServiceCompat.startForeground(this, 7003, n, type)
        }
        return super.onStartCommand(intent, flags, startId)
    }

    override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig? {
        val task = intent?.getStringExtra("task") ?: return null
        val seconds = intent.getDoubleExtra("seconds", 0.0).coerceIn(1.0, 7_200.0)
        val extras = Arguments.createMap().apply { putDouble("seconds", seconds) }
        return HeadlessJsTaskConfig(task, extras, ((seconds + 30) * 1000).toLong(), true)
    }
}

/** The guardian's alert notice (Mutarisi's design, wired to real alerts). */
object GuardianNotice {
    private const val CHANNEL = "alerts"
    private const val ID = 7004

    fun show(context: Context, title: String, text: String) {
        val nm = context.getSystemService(android.app.NotificationManager::class.java)
        nm.createNotificationChannel(android.app.NotificationChannel(CHANNEL, "Guardian alerts", android.app.NotificationManager.IMPORTANCE_HIGH))
        val open = Intent(context, com.teamsonar.vuka.MainActivity::class.java)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
            .putExtra(CheckinNotice.EXTRA, true)
        val pi = android.app.PendingIntent.getActivity(context, ID, open,
            android.app.PendingIntent.FLAG_IMMUTABLE or android.app.PendingIntent.FLAG_UPDATE_CURRENT)
        val b = androidx.core.app.NotificationCompat.Builder(context, CHANNEL)
            .setContentTitle(title)
            .setContentText(text)
            .setStyle(androidx.core.app.NotificationCompat.BigTextStyle().bigText(text))
            .setSmallIcon(com.teamsonar.vuka.R.drawable.ic_launcher_monochrome)
            .setPriority(androidx.core.app.NotificationCompat.PRIORITY_MAX)
            .setCategory(androidx.core.app.NotificationCompat.CATEGORY_ALARM)
            .setContentIntent(pi)
            .setAutoCancel(true)
        if (Build.VERSION.SDK_INT < 34 || nm.canUseFullScreenIntent()) b.setFullScreenIntent(pi, true)
        nm.notify(ID, b.build())
    }

    fun clear(context: Context) {
        context.getSystemService(android.app.NotificationManager::class.java).cancel(ID)
    }
}
