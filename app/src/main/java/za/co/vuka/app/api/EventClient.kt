package za.co.vuka.app.api

import android.util.Base64
import java.net.HttpURLConnection
import java.net.URL
import java.security.MessageDigest
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

/**
 * Builds format-v2 events and signed requests exactly as the ANCHOR server
 * verifies them (spec §4, §5, §7). A port of the React Native app's
 * app/src/api/events.ts:
 *
 *  - commitment = hex(SHA-256(salt(16 bytes) || canonical(payload)))
 *  - details.sig = DER signature over canonical({domain: "vuka.event.v2",
 *    subject_id, actor_id, target_type, target_id, action, source_ts,
 *    signer_key_id, counter, event_id, commitment})
 *  - request headers sign canonical({method, path, ts, body_sha256, nonce}),
 *    raw r||s.
 */
object EventClient {

    class ServerError(val status: Int, val code: String, message: String) : Exception("$status $code: $message")

    /** RFC 3339 with seconds and an offset (the server rejects anything else). */
    fun rfc3339(d: Date = Date()): String =
        SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply { timeZone = TimeZone.getTimeZone("UTC") }.format(d)

    /** A lowercase v4 UUID from SecureRandom bytes. */
    fun uuid(signer: DeviceSigner): String {
        val b = signer.randomBytes(16)
        b[6] = ((b[6].toInt() and 0x0f) or 0x40).toByte()
        b[8] = ((b[8].toInt() and 0x3f) or 0x80).toByte()
        val h = b.joinToString("") { "%02x".format(it) }
        return "${h.substring(0, 8)}-${h.substring(8, 12)}-${h.substring(12, 16)}-${h.substring(16, 20)}-${h.substring(20)}"
    }

    fun sha256Hex(bytes: ByteArray): String = MessageDigest.getInstance("SHA-256").digest(bytes).joinToString("") { "%02x".format(it) }

    /** One signed event, as the map that is sent (canonicalised) to POST /v1/events. */
    fun buildEvent(
        signer: DeviceSigner,
        subjectId: String,
        actorId: String,
        action: String,
        targetType: String,
        targetId: String,
        payload: Map<String, Any?>,
        genesis: Boolean = false,
        ts: String = rfc3339(),
    ): Map<String, Any?> {
        val id = signer.identity()
        val saltB64 = signer.randomB64(16)
        val commitment = sha256Hex(Base64.decode(saltB64, Base64.NO_WRAP) + Canonical.bytes(payload))
        val counter = signer.nextCounter()
        val eventId = uuid(signer)
        val statement = mapOf(
            "domain" to "vuka.event.v2",
            "subject_id" to subjectId,
            "actor_id" to actorId,
            "target_type" to targetType,
            "target_id" to targetId,
            "action" to action,
            "source_ts" to ts,
            "signer_key_id" to id.keyId,
            "counter" to counter,
            "event_id" to eventId,
            "commitment" to commitment,
        )
        val details = linkedMapOf<String, Any?>(
            "v" to 2,
            "signer" to "device",
            "signer_key_id" to id.keyId,
            "counter" to counter,
            "event_id" to eventId,
            "commitment" to commitment,
            "sig" to signer.signDer(Canonical.json(statement)),
        )
        if (genesis) details["signer_pubkey"] = id.publicKeyB64
        return mapOf(
            "action" to action,
            "actor_id" to actorId,
            "target_type" to targetType,
            "target_id" to targetId,
            "details" to details,
            "ts" to ts,
            "payload" to payload,
            "salt" to saltB64,
        )
    }

    /** Headers for a signed request (§7). `body` must be the exact bytes sent. */
    fun signedHeaders(signer: DeviceSigner, method: String, path: String, body: String): Map<String, String> {
        val ts = rfc3339()
        val nonce = signer.randomB64(16)
        val statement = mapOf(
            "method" to method.uppercase(Locale.US),
            "path" to path,
            "ts" to ts,
            "body_sha256" to sha256Hex(body.toByteArray(Charsets.UTF_8)),
            "nonce" to nonce,
        )
        return mapOf(
            "Content-Type" to "application/json",
            "X-Vuka-Key-Id" to signer.identity().keyId,
            "X-Vuka-Ts" to ts,
            "X-Vuka-Nonce" to nonce,
            "X-Vuka-Signature" to signer.sign(Canonical.json(statement)),
        )
    }

    /**
     * Any signed request. Returns the parsed JSON body. Throws [ServerError] on
     * a refusal, or an IOException when the server can't be reached. Call off
     * the main thread.
     */
    fun request(baseUrl: String, signer: DeviceSigner, method: String, path: String, body: String = ""): Map<String, Any?> {
        val headers = signedHeaders(signer, method, path, body)
        val conn = (URL(baseUrl.trimEnd('/') + path).openConnection() as HttpURLConnection).apply {
            requestMethod = method
            connectTimeout = 15_000
            readTimeout = 20_000
            headers.forEach { (k, v) -> setRequestProperty(k, v) }
            if (body.isNotEmpty()) {
                doOutput = true
                outputStream.use { it.write(body.toByteArray(Charsets.UTF_8)) }
            }
        }
        try {
            val status = conn.responseCode
            val text = (if (status in 200..299) conn.inputStream else conn.errorStream)?.bufferedReader()?.use { it.readText() }.orEmpty()
            @Suppress("UNCHECKED_CAST")
            val json = (if (text.isBlank()) emptyMap<String, Any?>() else runCatching { Canonical.parse(text) }.getOrNull()) as? Map<String, Any?>
                ?: emptyMap()
            if (status !in 200..299) {
                throw ServerError(status, json["code"] as? String ?: "error", json["message"] as? String ?: "")
            }
            return json
        } finally {
            conn.disconnect()
        }
    }
}
