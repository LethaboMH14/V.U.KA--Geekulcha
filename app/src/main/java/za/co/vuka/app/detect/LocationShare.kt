package za.co.vuka.app.detect

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.util.Log
import androidx.core.content.ContextCompat
import za.co.vuka.app.api.ServerSync

/**
 * The location window (ADR-0048, PROPOSED), ported from the React Native
 * app: once a Journey check opens, a fix is sent about every 30 s for
 * 30 minutes. The server keeps a fix only while a guardian alert is open for
 * this member (every other fix is dropped at once, and it answers 202 either
 * way), so a check-in answered with the normal PIN shares nothing.
 *
 * Needs the location permission (optional at sign-up). With the app closed it
 * works while the journey's foreground service includes the location type.
 */
object LocationShare {
    private const val TAG = "LocationShare"
    const val WINDOW_MS = 30 * 60_000L
    private const val EVERY_MS = 30_000L

    private val main = Handler(Looper.getMainLooper())
    private var manager: LocationManager? = null
    private var until = 0L
    private var lastSentAt = 0L

    private val listener = LocationListener { fix -> onFix(fix) }
    private val stopper = Runnable { stop() }

    fun granted(context: Context) =
        ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED

    /** Opens (or extends) the window. Safe to call for every check-in. */
    fun open(context: Context) {
        val app = context.applicationContext
        if (!granted(app)) return
        main.post {
            until = SystemClock.elapsedRealtime() + WINDOW_MS
            main.removeCallbacks(stopper)
            main.postDelayed(stopper, WINDOW_MS)
            if (manager != null) return@post
            val lm = app.getSystemService(LocationManager::class.java)
            try {
                for (provider in listOf(LocationManager.GPS_PROVIDER, LocationManager.NETWORK_PROVIDER)) {
                    if (lm.isProviderEnabled(provider)) {
                        lm.requestLocationUpdates(provider, EVERY_MS, 0f, listener, Looper.getMainLooper())
                        lm.getLastKnownLocation(provider)?.let(::onFix)
                    }
                }
                manager = lm
            } catch (e: SecurityException) {
                Log.w(TAG, "location not allowed: ${e.message}")
            }
        }
    }

    fun stop() {
        main.post {
            main.removeCallbacks(stopper)
            try {
                manager?.removeUpdates(listener)
            } catch (_: SecurityException) {
            }
            manager = null
        }
    }

    private fun onFix(fix: Location) {
        val now = SystemClock.elapsedRealtime()
        if (now > until || now - lastSentAt < EVERY_MS - 5_000) return
        lastSentAt = now
        val ageMs = ((SystemClock.elapsedRealtimeNanos() - fix.elapsedRealtimeNanos) / 1_000_000).coerceIn(0, 3_600_000)
        ServerSync.sendLocation(
            latE7 = Math.round(fix.latitude * 1e7),
            lonE7 = Math.round(fix.longitude * 1e7),
            accM = fix.accuracy.toLong().coerceIn(0, 100_000),
            fixAgeMs = ageMs,
        )
    }
}
