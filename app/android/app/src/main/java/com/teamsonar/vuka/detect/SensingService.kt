package com.teamsonar.vuka.detect

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import com.teamsonar.vuka.R

/**
 * The armed journey's foreground service (spec V2): microphone type, a
 * persistent neutral notification, audio and motion pipelines. It is started
 * only by an explicit user action with the app in the foreground (V1), which is
 * what Android 14 requires for a microphone foreground service.
 */
class SensingService : Service() {
    companion object {
        private const val CHANNEL = "journey"
        private const val NOTIFICATION_ID = 7001

        fun start(context: Context) {
            context.startForegroundService(Intent(context, SensingService::class.java))
        }

        fun stop(context: Context) {
            context.stopService(Intent(context, SensingService::class.java))
        }
    }

    private var audio: AudioPipeline? = null
    private var wake: android.os.PowerManager.WakeLock? = null
    private var motion: MotionPipeline? = null
    private var classifier: YamnetClassifier? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val nm = getSystemService(NotificationManager::class.java)
        nm.createNotificationChannel(NotificationChannel(CHANNEL, "VUKA", NotificationManager.IMPORTANCE_LOW))
        val notification: Notification = NotificationCompat.Builder(this, CHANNEL)
            .setContentTitle("VUKA active")
            .setSmallIcon(R.drawable.ic_launcher_monochrome)
            .setOngoing(true)
            .setSilent(true)
            .build()
        // Location joins the microphone only when the member allowed it (Android
        // 14 refuses a location service type without the permission).
        val located = checkSelfPermission(android.Manifest.permission.ACCESS_FINE_LOCATION) == android.content.pm.PackageManager.PERMISSION_GRANTED ||
            checkSelfPermission(android.Manifest.permission.ACCESS_COARSE_LOCATION) == android.content.pm.PackageManager.PERMISSION_GRANTED
        val type = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE or (if (located) ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION else 0)
        } else 0
        ServiceCompat.startForeground(this, NOTIFICATION_ID, notification, type)

        if (audio == null) {
            // Keep the CPU running for inference with the screen off (battery cost: M4, unmeasured).
            wake = getSystemService(android.os.PowerManager::class.java)
                .newWakeLock(android.os.PowerManager.PARTIAL_WAKE_LOCK, "vigil:journey").apply { setReferenceCounted(false); acquire() }
            val c = try {
                YamnetClassifier(this)
            } catch (e: Exception) {
                fail("model: ${e.message}")
                return START_NOT_STICKY
            }
            classifier = c
            audio = AudioPipeline(
                this, c, DetectionBus::window, DetectionBus::error,
                onStarted = { DetectionBus.ready(c.labels, YamnetClassifier.MODEL_SHA256) },
                onFailed = { fail(it) },
            ).also { it.start() }
            motion = MotionPipeline(this, DetectionBus::motion).also {
                if (!it.start()) DetectionBus.error("motion: no accelerometer")
            }
        }
        return START_NOT_STICKY // no silent restart after the app is killed (V10: no boot receiver either)
    }

    /** Startup or capture failed: say so, and don't keep a notification and wake lock for nothing. */
    private fun fail(message: String) {
        DetectionBus.failed(message)
        stopSelf()
    }

    override fun onDestroy() {
        audio?.stop() // blocks until capture and inference have finished
        motion?.stop()
        wake?.let { if (it.isHeld) it.release() }
        wake = null
        classifier?.close()
        CheckinNotice.clear(this)
        audio = null
        motion = null
        classifier = null
        super.onDestroy()
    }
}

/**
 * Hands pipeline output to whichever module instance is listening. If none is
 * attached yet (the JS runtime starting or restarting), the most recent output
 * waits here, bounded and integers only, and is replayed on attach, so a
 * detection is not lost to a race. No audio is ever held here.
 */
object DetectionBus {
    private const val MAX_WINDOWS = 64
    private const val MAX_FRAMES = 300
    private val pendingWindows = ArrayDeque<WindowResult>()
    private val pendingFrames = ArrayDeque<MotionFrame>()

    @Volatile var listener: Listener? = null
        set(value) {
            field = value
            if (value != null) flush(value)
        }

    @Synchronized private fun flush(l: Listener) {
        while (pendingFrames.isNotEmpty()) l.onMotion(pendingFrames.removeFirst())
        while (pendingWindows.isNotEmpty()) l.onWindow(pendingWindows.removeFirst())
    }

    @Synchronized fun clear() { pendingWindows.clear(); pendingFrames.clear() }

    interface Listener {
        fun onWindow(w: WindowResult)
        fun onMotion(f: MotionFrame)
        fun onError(message: String)
        fun onReady(labels: List<String>, sha256: String)
        fun onFailed(message: String)
    }

    fun ready(labels: List<String>, sha256: String) = listener?.onReady(labels, sha256)
    fun failed(message: String) = listener?.onFailed(message)

    @Synchronized fun window(w: WindowResult) {
        val l = listener
        if (l != null) l.onWindow(w) else { pendingWindows.addLast(w); if (pendingWindows.size > MAX_WINDOWS) pendingWindows.removeFirst() }
    }

    @Synchronized fun motion(f: MotionFrame) {
        val l = listener
        if (l != null) l.onMotion(f) else { pendingFrames.addLast(f); if (pendingFrames.size > MAX_FRAMES) pendingFrames.removeFirst() }
    }

    fun error(message: String) = listener?.onError(message)
}
