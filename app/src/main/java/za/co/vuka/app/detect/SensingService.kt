package za.co.vuka.app.detect

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import za.co.vuka.app.MainActivity
import za.co.vuka.app.R
import za.co.vuka.app.ui.record.RecordEntry
import za.co.vuka.app.ui.record.RecordStore

/** Whether VIGIL is actually listening, for Home to show truthfully. */
object Listening {
    sealed interface State {
        data object Off : State
        data object Starting : State
        data object On : State
        data class Failed(val reason: String) : State
    }

    private val _state = MutableStateFlow<State>(State.Off)
    val state: StateFlow<State> = _state

    internal fun set(s: State) {
        _state.value = s
    }
}

/**
 * The active journey's foreground service (spec V2): microphone type, a
 * persistent neutral notification, and the audio pipeline. Ported from the
 * React Native app's SensingService, without motion or location.
 *
 * Started only from Activate, with the app in the foreground (V1), which is
 * what Android 14 requires for a microphone foreground service. A detection
 * is written to the on-phone record as "Sound detected" (the class label,
 * never audio) and, outside the cooldown, raises a neutral "Journey check"
 * notification. The PIN check-in and guardian alerts aren't built yet.
 */
class SensingService : Service() {
    companion object {
        private const val TAG = "VigilSensing"
        private const val CHANNEL_ACTIVE = "journey"
        private const val CHANNEL_CHECK = "journey_check"
        private const val NOTIFICATION_ACTIVE = 7001
        private const val NOTIFICATION_CHECK = 7002

        fun start(context: Context) {
            Listening.set(Listening.State.Starting)
            ContextCompat.startForegroundService(context, Intent(context, SensingService::class.java))
        }

        fun stop(context: Context) {
            context.stopService(Intent(context, SensingService::class.java))
            Listening.set(Listening.State.Off)
        }
    }

    private var audio: AudioPipeline? = null
    private var classifier: YamnetClassifier? = null
    private var wake: PowerManager.WakeLock? = null
    private val engine = DetectionEngine()

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        createChannels()
        val notification = NotificationCompat.Builder(this, CHANNEL_ACTIVE)
            .setContentTitle("VUKA journey active")
            .setSmallIcon(R.drawable.ic_shield_chevron)
            .setContentIntent(openApp())
            .setOngoing(true)
            .setSilent(true)
            .build()
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                startForeground(NOTIFICATION_ACTIVE, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE)
            } else {
                startForeground(NOTIFICATION_ACTIVE, notification)
            }
        } catch (e: Exception) {
            // e.g. the microphone permission was revoked, or the app wasn't in the foreground.
            fail("Android didn't allow listening right now")
            return START_NOT_STICKY
        }

        if (audio == null) {
            val c = try {
                YamnetClassifier(this)
            } catch (e: Exception) {
                fail(e.message ?: "the sound model couldn't load")
                return START_NOT_STICKY
            }
            classifier = c
            // Keep the CPU running for inference with the screen off (battery cost unmeasured).
            wake = getSystemService(PowerManager::class.java)
                .newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "vigil:journey")
                .apply { setReferenceCounted(false); acquire() }
            audio = AudioPipeline(
                this, c,
                onWindow = ::onWindow,
                onError = { Log.w(TAG, it) },
                onStarted = { Listening.set(Listening.State.On) },
                onFailed = { fail("the microphone couldn't start") },
            ).also { it.start() }
        }
        return START_NOT_STICKY // no silent restart after the app is killed (V10)
    }

    private fun onWindow(w: WindowResult) {
        val decision = engine.step(w) ?: return
        RecordStore.add(this, RecordEntry.Kind.SOUND_DETECTED, decision.label)
        if (decision.prompt) postJourneyCheck()
    }

    // V4: a neutral title. The PIN check-in itself isn't built, so this opens the app.
    private fun postJourneyCheck() {
        val n = NotificationCompat.Builder(this, CHANNEL_CHECK)
            .setContentTitle("Journey check")
            .setContentText("Tap to open VUKA.")
            .setSmallIcon(R.drawable.ic_shield_chevron)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setContentIntent(openApp())
            .setAutoCancel(true)
            .build()
        try {
            NotificationManagerCompat.from(this).notify(NOTIFICATION_CHECK, n)
        } catch (e: SecurityException) {
            Log.w(TAG, "notifications not allowed")
        }
    }

    private fun openApp(): PendingIntent = PendingIntent.getActivity(
        this, 0,
        Intent(this, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP),
        PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
    )

    private fun createChannels() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val nm = getSystemService(NotificationManager::class.java)
        nm.createNotificationChannel(NotificationChannel(CHANNEL_ACTIVE, "Journey active", NotificationManager.IMPORTANCE_LOW))
        nm.createNotificationChannel(NotificationChannel(CHANNEL_CHECK, "Journey check", NotificationManager.IMPORTANCE_HIGH))
    }

    /** Startup or capture failed: say so, and don't keep a notification and wake lock for nothing. */
    private fun fail(reason: String) {
        Log.w(TAG, "not listening: $reason")
        Listening.set(Listening.State.Failed(reason))
        stopSelf()
    }

    override fun onDestroy() {
        audio?.stop() // blocks until capture and inference have finished
        wake?.let { if (it.isHeld) it.release() }
        classifier?.close()
        audio = null
        wake = null
        classifier = null
        if (Listening.state.value !is Listening.State.Failed) Listening.set(Listening.State.Off)
        super.onDestroy()
    }
}
