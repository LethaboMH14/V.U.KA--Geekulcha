package za.co.vuka.app.api

import android.content.Context
import android.os.Build
import android.util.Log
import androidx.core.content.edit
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import za.co.vuka.app.detect.YamnetClassifier
import java.util.concurrent.Executors

/**
 * The phone's link to the ANCHOR server. A port of the React Native app's
 * app/src/api/device.ts, for the flows this app has:
 *
 *  - register: the genesis `registration` event carrying this phone's public
 *    key (§3). Subject and actor ids start with sim_ (VUKA_SIM_ONLY).
 *  - startJourney: POST /v1/journeys (server-issued id), then `journey_armed`.
 *  - heartbeat: every 30 s while active (V9); activity only, never location.
 *  - signal / help: `signal_detected` (sense sound, or manual for Emergency).
 *  - endJourney: `pin_authorised` for end_journey (§4b.1), then `journey_ended`.
 *
 * Every event is signed and put in a durable outbox first; it is evidence
 * from that moment and is sent oldest first, retried until the server takes
 * it. A 4xx refusal is set aside with its reason so it can't block the rest.
 * All network work runs on one background thread.
 */
object ServerSync {
    private const val TAG = "VukaServer"
    const val SERVER_URL = "https://vuka-anchor-server.azurewebsites.net"
    /** The server requires a semantic version. */
    const val APP_VERSION = "1.0.0"
    /** Spec section 7 allows 20 or 60; the member gets the longer window (as in the RN app). */
    const val CHECKIN_WINDOW_S = 60

    private const val PREFS = "vuka_server"
    private const val K_SUBJECT = "subject_id"
    private const val K_ACTOR = "actor_id"
    private const val K_JOURNEY = "journey_id"
    private const val K_OUTBOX = "outbox"
    private const val K_REFUSED = "refused"
    private const val K_SENT = "sent"
    private const val K_PENDING_HELP = "pending_help"

    data class Status(
        val registered: Boolean = false,
        val waiting: Int = 0,
        val sent: Int = 0,
        val refused: Int = 0,
        val sending: Boolean = false,
        val lastError: String? = null,
        val lastSentAt: String? = null,
        val journeyId: String? = null,
    )

    private val _status = MutableStateFlow(Status())
    val status: StateFlow<Status> = _status

    private val worker = Executors.newSingleThreadExecutor()
    private lateinit var app: Context
    private val signer by lazy { DeviceSigner(app) }
    private val prefs by lazy { app.getSharedPreferences(PREFS, Context.MODE_PRIVATE) }

    fun init(context: Context) {
        if (::app.isInitialized) return
        app = context.applicationContext
        publish()
        worker.execute { flushNow() }
    }

    val journeyId: String? get() = prefs.getString(K_JOURNEY, null)

    fun journeyIdOrNull(context: Context): String? {
        init(context)
        return journeyId
    }

    // ── Flows ──

    /** Creates the server identity and queues the genesis registration (once per key). */
    fun register(context: Context) {
        init(context)
        worker.execute {
            if (prefs.getString(K_SUBJECT, null) == null) {
                val short = signer.identity().keyId.removePrefix("dev_").take(8)
                prefs.edit(commit = true) { putString(K_SUBJECT, "sim_subj_$short").putString(K_ACTOR, "sim_member_$short") }
                // §18 registration: never IMEI, serial, Android ID or phone number.
                enqueue(
                    subjectTarget(), "registration",
                    mapOf(
                        "kind" to "registration", "pv" to 1, "app_version" to APP_VERSION,
                        "model_sha256" to YamnetClassifier.MODEL_SHA256,
                        "android_api" to Build.VERSION.SDK_INT, "device_model" to "android",
                    ),
                    genesis = true,
                )
            }
            flushNow()
        }
    }

    /** Opens a journey on the server (it issues the id) and queues `journey_armed`. */
    fun startJourney(context: Context) {
        init(context)
        worker.execute {
            if (prefs.getString(K_SUBJECT, null) == null) return@execute
            flushNow() // the registration must be received first
            journeyId?.let { open ->
                // One journey at a time (e.g. Emergency opened it): reuse it.
                if (prefs.getBoolean(K_PENDING_HELP, false)) {
                    prefs.edit(commit = true) { putBoolean(K_PENDING_HELP, false) }
                    enqueueHelp(open)
                }
                flushNow()
                return@execute
            }
            try {
                val id = EventClient.request(SERVER_URL, signer, "POST", "/v1/journeys")["journey_id"] as? String
                    ?: throw IllegalStateException("no journey_id in the reply")
                prefs.edit(commit = true) { putString(K_JOURNEY, id) }
                enqueue(journeyTarget(id), "device_event", mapOf("kind" to "journey_armed", "pv" to 1, "journey_id" to id, "app_version" to APP_VERSION))
                if (prefs.getBoolean(K_PENDING_HELP, false)) {
                    prefs.edit(commit = true) { putBoolean(K_PENDING_HELP, false) }
                    enqueueHelp(id)
                }
            } catch (e: Exception) {
                fail("journey not started: ${e.message}")
            }
            flushNow()
        }
    }

    /** V9: contact clock input, every 30 s while active. A missed one is only missed. */
    fun heartbeat() {
        if (!::app.isInitialized) return
        worker.execute {
            val id = journeyId ?: return@execute
            try {
                val body = Canonical.json(mapOf("speed_bucket" to "unknown", "ts" to EventClient.rfc3339()))
                EventClient.request(SERVER_URL, signer, "POST", "/v1/journeys/$id/heartbeat", body)
                _status.value = _status.value.copy(lastSentAt = EventClient.rfc3339())
            } catch (e: Exception) {
                Log.w(TAG, "heartbeat missed: ${e.message}")
            }
        }
    }

    /** A confirmed sound detection (V4). [onQueued] gets (journey id, signal event id) once it is signed. */
    fun signal(label: String, classIndex: Int, scoreBp: Int, thresholdBp: Int, onQueued: (String, String) -> Unit = { _, _ -> }) {
        if (!::app.isInitialized) return
        worker.execute {
            val id = journeyId ?: return@execute
            val eventId = enqueue(
                journeyTarget(id), "device_event",
                mapOf(
                    "kind" to "signal_detected", "pv" to 1, "journey_id" to id, "sense" to "sound",
                    "class_label" to label, "class_index" to classIndex, "score_bp" to scoreBp, "threshold_bp" to thresholdBp,
                    "window_ms" to 975, "model_sha256" to YamnetClassifier.MODEL_SHA256, "app_version" to APP_VERSION,
                    "corroboration" to emptyList<Any?>(),
                ),
            )
            eventId?.let { onQueued(id, it) }
            flushNow()
        }
    }

    /** Section 4b: the check-in is on screen. Recorded only once it is actually shown (V4). */
    fun checkinOpened(journeyId: String, checkinId: String, signalEventId: String) {
        if (!::app.isInitialized) return
        worker.execute {
            enqueue(
                journeyTarget(journeyId), "device_event",
                mapOf("kind" to "checkin_opened", "pv" to 1, "checkin_id" to checkinId, "journey_id" to journeyId,
                    "signal_event_id" to signalEventId, "window_s" to CHECKIN_WINDOW_S),
            )
            flushNow()
        }
    }

    /** Section 4b: the member answered with a PIN. Normal and duress look identical on screen. */
    fun checkinResult(journeyId: String, checkinId: String, duress: Boolean, attempt: Int) {
        if (!::app.isInitialized) return
        worker.execute {
            enqueue(
                journeyTarget(journeyId), "device_event",
                mapOf("kind" to "checkin_result", "pv" to 1, "checkin_id" to checkinId,
                    "result" to if (duress) "duress_pin" else "normal_pin", "attempt" to attempt),
            )
            flushNow()
        }
    }

    /**
     * V6: a duress PIN at another prompt is an alarm. Sends `pin_authorised`
     * {mode: duress} for the server actions that exist (add_guardian, delete).
     */
    fun duressAt(context: Context, serverAction: String) {
        init(context)
        worker.execute {
            val subject = prefs.getString(K_SUBJECT, null) ?: return@execute
            enqueue(subjectTarget(), "device_event", pinAuthorised(serverAction, subject, duress = true))
            flushNow()
        }
    }

    fun newCheckinId(): String = EventClient.uuid(signer)

    /**
     * Emergency (ADR-0049, PROPOSED): the same `signal_detected`, sense manual.
     * With no journey open yet it is sent as soon as one is.
     */
    fun help(context: Context) {
        init(context)
        worker.execute {
            val id = journeyId
            if (id == null) prefs.edit(commit = true) { putBoolean(K_PENDING_HELP, true) } else enqueueHelp(id)
            flushNow()
        }
    }

    /** Called with (journey id, signal event id) whenever a manual help signal is signed. */
    @Volatile var onHelpQueued: ((String, String) -> Unit)? = null

    /**
     * Ends the journey (G35, §4b.1): a `pin_authorised` whose inner signature
     * covers {action, target_id, mode, nonce}, then `journey_ended`, both
     * queued before either is sent so they go in one pass. A duress PIN sends
     * mode "duress": on screen it looks the same, server-side it's an alarm.
     */
    fun endJourney(duress: Boolean) {
        if (!::app.isInitialized) return
        worker.execute {
            val id = journeyId ?: return@execute
            enqueue(subjectTarget(), "device_event", pinAuthorised("end_journey", id, duress))
            enqueue(journeyTarget(id), "device_event", mapOf("kind" to "journey_ended", "pv" to 1, "journey_id" to id))
            prefs.edit(commit = true) { remove(K_JOURNEY) }
            flushNow()
        }
    }

    /** Profile deleted from this phone: forget the server identity and the key. */
    fun reset(context: Context) {
        init(context)
        worker.execute {
            prefs.edit(commit = true) { clear() }
            signer.reset()
            publish()
        }
    }

    fun retry() {
        if (::app.isInitialized) worker.execute { flushNow() }
    }

    // ── Outbox ──

    private fun subjectTarget() = "subject" to prefs.getString(K_SUBJECT, null)!!
    private fun journeyTarget(id: String) = "journey" to id

    private fun enqueueHelp(id: String) {
        val eventId = enqueue(
            journeyTarget(id), "device_event",
            mapOf("kind" to "signal_detected", "pv" to 1, "journey_id" to id, "sense" to "manual", "app_version" to APP_VERSION),
        )
        eventId?.let { onHelpQueued?.invoke(id, it) }
    }

    /** Section 4b.1: the inner signature covers exactly {action, target_id, mode, nonce}. */
    private fun pinAuthorised(action: String, targetId: String, duress: Boolean): Map<String, Any?> {
        val statement = mapOf("action" to action, "target_id" to targetId, "mode" to if (duress) "duress" else "normal", "nonce" to signer.randomB64(16))
        return statement + mapOf("kind" to "pin_authorised", "pv" to 1, "sig" to signer.signDer(Canonical.json(statement)), "signer_key_id" to signer.identity().keyId)
    }

    /** Signs one event and stores it durably. It is evidence from this moment. Returns its event id. */
    private fun enqueue(target: Pair<String, String>, action: String, payload: Map<String, Any?>, genesis: Boolean = false): String? {
        val subject = prefs.getString(K_SUBJECT, null) ?: return null
        val actor = prefs.getString(K_ACTOR, null) ?: return null
        val event = EventClient.buildEvent(signer, subject, actor, action, target.first, target.second, payload, genesis)
        writeList(K_OUTBOX, readList(K_OUTBOX) + Canonical.json(event))
        publish()
        @Suppress("UNCHECKED_CAST")
        return (event["details"] as Map<String, Any?>)["event_id"] as String
    }

    /** Sends queued events oldest first. Stops at a network failure; sets a refusal aside. */
    private fun flushNow() {
        var outbox = readList(K_OUTBOX)
        if (outbox.isEmpty()) return publish()
        publish(sending = true)
        var lastError: String? = null
        while (outbox.isNotEmpty()) {
            val body = outbox.first()
            try {
                EventClient.request(SERVER_URL, signer, "POST", "/v1/events", body)
                prefs.edit(commit = true) { putInt(K_SENT, prefs.getInt(K_SENT, 0) + 1) }
                _status.value = _status.value.copy(lastSentAt = EventClient.rfc3339())
            } catch (e: EventClient.ServerError) {
                if (e.status >= 500) { lastError = e.message; break }
                // Refused: keep it (it's still evidence) but don't let it block the rest.
                Log.w(TAG, "refused: ${e.message}")
                lastError = e.message
                writeList(K_REFUSED, readList(K_REFUSED) + body)
            } catch (e: Exception) {
                lastError = "can't reach the server"
                Log.w(TAG, "offline: ${e.message}")
                break
            }
            outbox = outbox.drop(1)
            writeList(K_OUTBOX, outbox)
        }
        publish(sending = false, error = if (outbox.isEmpty() && lastError == "can't reach the server") null else lastError)
    }

    private fun fail(message: String) {
        Log.w(TAG, message)
        publish(error = message)
    }

    private fun publish(sending: Boolean = false, error: String? = _status.value.lastError) {
        if (!::app.isInitialized) return
        _status.value = _status.value.copy(
            registered = prefs.getString(K_SUBJECT, null) != null,
            waiting = readList(K_OUTBOX).size,
            sent = prefs.getInt(K_SENT, 0),
            refused = readList(K_REFUSED).size,
            sending = sending,
            lastError = error,
            journeyId = journeyId,
        )
    }

    @Suppress("UNCHECKED_CAST")
    private fun readList(key: String): List<String> =
        prefs.getString(key, null)?.let { runCatching { Canonical.parse(it) as List<String> }.getOrNull() } ?: emptyList()

    private fun writeList(key: String, list: List<String>) = prefs.edit(commit = true) { putString(key, Canonical.json(list)) }
}
