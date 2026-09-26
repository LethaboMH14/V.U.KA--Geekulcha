package za.co.vuka.app.auth

import android.content.Context
import androidx.core.content.edit
import java.security.MessageDigest
import java.security.SecureRandom
import java.util.Locale
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.PBEKeySpec

/**
 * INTERIM email + password for the "Sign up with email" route, until an
 * account server exists. Only a salted PBKDF2 hash is kept, in app-private
 * storage excluded from backups. The password is never stored.
 *
 * Not in VUKA-2-SPEC.md (§2 registers a name and a +27 number, with Google
 * optional). The privacy notice doesn't list email/password yet, so it
 * needs updating before this ships.
 */
class InterimPasswordStore(context: Context) {

    private val prefs = context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun set(email: String, password: String) {
        val salt = ByteArray(16).also { SecureRandom().nextBytes(it) }
        prefs.edit {
            putString(KEY_EMAIL, normalise(email))
            putString(KEY_SALT, salt.toHex())
            putString(KEY_HASH, hash(password, salt).toHex())
        }
    }

    /** True only for the saved email with its password. Constant-time compare. */
    fun verify(email: String, password: String): Boolean {
        val saved = prefs.getString(KEY_EMAIL, null) ?: return false
        val salt = prefs.getString(KEY_SALT, null)?.fromHex() ?: return false
        val expected = prefs.getString(KEY_HASH, null)?.fromHex() ?: return false
        val matches = MessageDigest.isEqual(hash(password, salt), expected)
        return matches && saved == normalise(email)
    }

    /** True when an email + password was set at sign-up (the only thing a reset can change). */
    fun hasPassword(): Boolean = prefs.getString(KEY_HASH, null) != null

    /** True when [email] is the address the password belongs to. */
    fun isAccountEmail(email: String): Boolean = prefs.getString(KEY_EMAIL, null) == normalise(email)

    /** The member changed their email in Settings: the password stays, sign-in uses the new address. */
    fun changeEmail(email: String) {
        if (prefs.getString(KEY_EMAIL, null) == null) return
        prefs.edit { putString(KEY_EMAIL, normalise(email)) }
    }

    fun clear() = prefs.edit { clear() }

    private fun normalise(email: String) = email.trim().lowercase(Locale.ROOT)

    private fun hash(password: String, salt: ByteArray): ByteArray {
        val spec = PBEKeySpec(password.toCharArray(), salt, ITERATIONS, 256)
        return try {
            SecretKeyFactory.getInstance("PBKDF2WithHmacSHA1").generateSecret(spec).encoded
        } finally {
            spec.clearPassword()
        }
    }

    private fun ByteArray.toHex() = joinToString("") { "%02x".format(it) }

    private fun String.fromHex() = chunked(2).map { it.toInt(16).toByte() }.toByteArray()

    private companion object {
        const val PREFS = "vuka_password_interim"
        const val KEY_EMAIL = "email"
        const val KEY_SALT = "salt"
        const val KEY_HASH = "hash"
        const val ITERATIONS = 50_000
    }
}
