package za.co.vuka.app.api

import android.content.Context
import android.os.Build
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.security.keystore.StrongBoxUnavailableException
import android.util.Base64
import androidx.core.content.edit
import java.math.BigInteger
import java.security.KeyPairGenerator
import java.security.KeyStore
import java.security.MessageDigest
import java.security.PrivateKey
import java.security.SecureRandom
import java.security.Signature
import java.security.spec.ECGenParameterSpec

/**
 * The device key (spec V7): P-256 in Android Keystore, StrongBox when the
 * phone has it, never exportable. Ported from the React Native app's
 * SignerModule. Salts and nonces come from SecureRandom. Event statements are
 * signed as DER (details.sig); request statements as raw r||s (§5 rule 7).
 */
class DeviceSigner(context: Context) {
    companion object {
        private const val ALIAS = "vuka_device_v1"
        private const val PREFS = "vuka_signer"
        private val lock = Any()
    }

    data class Identity(val publicKeyB64: String, val keyId: String)

    private val prefs = context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    private val keyStore: KeyStore get() = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
    private val random = SecureRandom()

    private fun ensureKey() = synchronized(lock) {
        if (keyStore.containsAlias(ALIAS)) return@synchronized
        fun generate(strongBox: Boolean) {
            val spec = KeyGenParameterSpec.Builder(ALIAS, KeyProperties.PURPOSE_SIGN)
                .setAlgorithmParameterSpec(ECGenParameterSpec("secp256r1"))
                .setDigests(KeyProperties.DIGEST_SHA256)
                .apply { if (Build.VERSION.SDK_INT >= 28) setIsStrongBoxBacked(strongBox) }
                .build()
            KeyPairGenerator.getInstance(KeyProperties.KEY_ALGORITHM_EC, "AndroidKeyStore").apply { initialize(spec) }.generateKeyPair()
        }
        val strong = try {
            generate(true); true
        } catch (e: StrongBoxUnavailableException) {
            generate(false); false
        } catch (e: Exception) {
            if (Build.VERSION.SDK_INT >= 28) { generate(false); false } else throw e
        }
        // A new key starts a new counter sequence; its key id is new too.
        prefs.edit(commit = true) { putBoolean("strongbox", strong).putLong("counter", 0) }
    }

    /** SPKI DER public key (base64) and a key id derived from it. */
    fun identity(): Identity {
        ensureKey()
        val spki = keyStore.getCertificate(ALIAS).publicKey.encoded
        val id = MessageDigest.getInstance("SHA-256").digest(spki).take(8).joinToString("") { "%02x".format(it) }
        return Identity(Base64.encodeToString(spki, Base64.NO_WRAP), "dev_$id")
    }

    /** Raw r||s, base64: the X-Vuka-Signature request header. */
    fun sign(text: String): String = Base64.encodeToString(derToRaw(signDerBytes(text)), Base64.NO_WRAP)

    /** DER, base64: details.sig on an event, and pin_authorised's inner signature. */
    fun signDer(text: String): String = Base64.encodeToString(signDerBytes(text), Base64.NO_WRAP)

    fun randomB64(n: Int): String = Base64.encodeToString(ByteArray(n).also { random.nextBytes(it) }, Base64.NO_WRAP)

    fun randomBytes(n: Int): ByteArray = ByteArray(n).also { random.nextBytes(it) }

    /** Strictly increasing per key (§7), persisted before it is used. */
    fun nextCounter(): Long = synchronized(lock) {
        ensureKey()
        val next = prefs.getLong("counter", 0) + 1
        prefs.edit(commit = true) { putLong("counter", next) }
        next
    }

    /** Removes the key (profile deleted): the next identity is a new key and a new key id. */
    fun reset() = synchronized(lock) {
        if (keyStore.containsAlias(ALIAS)) keyStore.deleteEntry(ALIAS)
        prefs.edit(commit = true) { clear() }
    }

    private fun signDerBytes(text: String): ByteArray {
        ensureKey()
        val key = keyStore.getKey(ALIAS, null) as PrivateKey
        return Signature.getInstance("SHA256withECDSA").run {
            initSign(key)
            update(text.toByteArray(Charsets.UTF_8))
            sign()
        }
    }

    /** DER ECDSA signature to fixed 64-byte r||s. */
    private fun derToRaw(der: ByteArray): ByteArray {
        var i = 2
        if (der[1].toInt() and 0x80 != 0) i += der[1].toInt() and 0x7f
        fun readInt(): ByteArray {
            require(der[i].toInt() == 0x02)
            val len = der[i + 1].toInt()
            val v = der.copyOfRange(i + 2, i + 2 + len)
            i += 2 + len
            return v
        }
        val r = BigInteger(1, readInt())
        val s = BigInteger(1, readInt())
        fun pad(b: BigInteger) = b.toByteArray().let { if (it.size > 32) it.copyOfRange(it.size - 32, it.size) else ByteArray(32 - it.size) + it }
        return pad(r) + pad(s)
    }
}
