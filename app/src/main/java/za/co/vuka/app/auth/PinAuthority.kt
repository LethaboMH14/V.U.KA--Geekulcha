package za.co.vuka.app.auth

import android.content.Context
import androidx.core.content.edit
import java.security.MessageDigest
import java.security.SecureRandom
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.PBEKeySpec

/** What a PIN entry proved. Callers must make NORMAL and DURESS look identical on screen. */
enum class PinResult { NORMAL, DURESS, WRONG }

/**
 * The one place screens ask "is this the member's PIN?". Spec (PIN-AUTHORITY-RULES §2):
 * verified on the device against an Argon2id hash in Keystore-wrapped storage.
 * That store is checklist P3.V3 (Vukosi). Swap [InterimPinStore] for it
 * without touching any screen.
 */
interface PinAuthority {
    fun hasPins(): Boolean
    fun setPins(normal: String, duress: String)
    fun verify(pin: String): PinResult
}

/**
 * INTERIM, until P3.V3 lands. Salted PBKDF2 hashes in app-private storage.
 *
 * Weaker than the spec: no Argon2id and no Keystore wrapping. A 4-digit PIN
 * can be brute-forced offline by anyone who can read the app's files (a
 * rooted phone or a backup), so treat this as a placeholder that makes the
 * gates real, not as the secure store.
 */
class InterimPinStore(context: Context) : PinAuthority {

    private val prefs = context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    override fun hasPins() = prefs.contains(KEY_NORMAL) && prefs.contains(KEY_DURESS)

    override fun setPins(normal: String, duress: String) {
        val salt = ByteArray(16).also { SecureRandom().nextBytes(it) }
        prefs.edit {
            putString(KEY_SALT, salt.toHex())
            putString(KEY_NORMAL, hash(normal, salt).toHex())
            putString(KEY_DURESS, hash(duress, salt).toHex())
        }
    }

    override fun verify(pin: String): PinResult {
        val salt = prefs.getString(KEY_SALT, null)?.fromHex() ?: return PinResult.WRONG
        val attempt = hash(pin, salt)
        // Compare against both every time so NORMAL and DURESS take the same time.
        val normal = MessageDigest.isEqual(attempt, prefs.getString(KEY_NORMAL, "")!!.fromHex())
        val duress = MessageDigest.isEqual(attempt, prefs.getString(KEY_DURESS, "")!!.fromHex())
        return when {
            normal -> PinResult.NORMAL
            duress -> PinResult.DURESS
            else -> PinResult.WRONG
        }
    }

    fun clear() = prefs.edit { clear() }

    private fun hash(pin: String, salt: ByteArray): ByteArray {
        // PBKDF2WithHmacSHA1 is the variant available on every supported API (minSdk 24).
        val spec = PBEKeySpec(pin.toCharArray(), salt, ITERATIONS, 256)
        return try {
            SecretKeyFactory.getInstance("PBKDF2WithHmacSHA1").generateSecret(spec).encoded
        } finally {
            spec.clearPassword()
        }
    }

    private fun ByteArray.toHex() = joinToString("") { "%02x".format(it) }

    private fun String.fromHex() = chunked(2).map { it.toInt(16).toByte() }.toByteArray()

    private companion object {
        const val PREFS = "vuka_pin_interim"
        const val KEY_SALT = "salt"
        const val KEY_NORMAL = "normal"
        const val KEY_DURESS = "duress"
        const val ITERATIONS = 50_000
    }
}

/**
 * Where a duress PIN would raise the alarm (guardian alert and bank signal,
 * spec §8/§9, T16). There is no server connection yet, so this sends nothing.
 * It deliberately doesn't log either, because a log line would reveal the
 * duress to anyone reading the phone's logs.
 */
object DuressSignals {
    @Suppress("UNUSED_PARAMETER")
    fun raise(action: String) {
        // TODO: send a pin_authorised {mode: duress} for this action once the alert path exists.
    }
}
