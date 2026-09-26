package com.teamsonar.vuka.detect

import android.content.Context
import android.os.Build
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.security.keystore.StrongBoxUnavailableException
import android.util.Base64
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.math.BigInteger
import java.security.KeyPairGenerator
import java.security.KeyStore
import java.security.MessageDigest
import java.security.PrivateKey
import java.security.SecureRandom
import java.security.Signature
import java.security.spec.ECGenParameterSpec

/**
 * The device key (spec V7): P-256 in Android Keystore, StrongBox when the phone
 * has it, never exportable. Salts and nonces come from native SecureRandom,
 * never from JavaScript. JavaScript canonicalises (shared/canonical.js); this
 * module hashes and signs those exact bytes and returns signatures as raw
 * r||s, the form the server verifies (§5 rule 7).
 */
class SignerModule(ctx: ReactApplicationContext) : ReactContextBaseJavaModule(ctx) {
    companion object {
        private const val ALIAS = "vigil_device_v1"
        private const val PREFS = "vigil_signer"
    }

    override fun getName() = "VigilSigner"

    private val keyStore: KeyStore get() = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
    private val prefs get() = reactApplicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    // Synchronized so two native calls on a fresh install can never generate
    // the key twice after identity() has already reported the first one.
    @Synchronized
    private fun ensureKey(): Boolean {
        if (keyStore.containsAlias(ALIAS)) return prefs.getBoolean("strongbox", false)
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
        prefs.edit().putBoolean("strongbox", strong).putLong("counter", 0).apply()
        return strong
    }

    /** The public key (SPKI DER, base64), a key id derived from it, and whether StrongBox holds it. */
    @ReactMethod
    fun identity(promise: Promise) {
        try {
            val strong = ensureKey()
            val spki = keyStore.getCertificate(ALIAS).publicKey.encoded
            val id = MessageDigest.getInstance("SHA-256").digest(spki).take(8).joinToString("") { "%02x".format(it) }
            promise.resolve(Arguments.createMap().apply {
                putString("publicKey", Base64.encodeToString(spki, Base64.NO_WRAP))
                putString("keyId", "dev_$id")
                putBoolean("strongBox", strong)
            })
        } catch (e: Exception) {
            promise.reject("identity", e.message)
        }
    }

    /** Signs the UTF-8 bytes of `text` (a canonical request statement); returns raw r||s, base64. */
    @ReactMethod
    fun sign(text: String, promise: Promise) {
        try {
            ensureKey()
            val key = keyStore.getKey(ALIAS, null) as PrivateKey
            val der = Signature.getInstance("SHA256withECDSA").run { initSign(key); update(text.toByteArray(Charsets.UTF_8)); sign() }
            promise.resolve(Base64.encodeToString(derToRaw(der), Base64.NO_WRAP))
        } catch (e: Exception) {
            promise.reject("sign", e.message)
        }
    }

    /** Signs the UTF-8 bytes of `text`; returns DER, base64 (the event statement, details.sig). */
    @ReactMethod
    fun signDer(text: String, promise: Promise) {
        try {
            ensureKey()
            val key = keyStore.getKey(ALIAS, null) as PrivateKey
            val der = Signature.getInstance("SHA256withECDSA").run { initSign(key); update(text.toByteArray(Charsets.UTF_8)); sign() }
            promise.resolve(Base64.encodeToString(der, Base64.NO_WRAP))
        } catch (e: Exception) {
            promise.reject("sign", e.message)
        }
    }

    /** `n` bytes from SecureRandom, base64 (16 for a salt, 16 for a nonce). */
    @ReactMethod
    fun randomBytes(n: Int, promise: Promise) {
        if (n !in 1..64) { promise.reject("random", "n out of range"); return }
        promise.resolve(Base64.encodeToString(ByteArray(n).also { SecureRandom().nextBytes(it) }, Base64.NO_WRAP))
    }

    /** hex(SHA-256(salt || UTF-8(text))): the payload commitment (§4). */
    @ReactMethod
    fun commitment(saltB64: String, text: String, promise: Promise) {
        try {
            val md = MessageDigest.getInstance("SHA-256")
            md.update(Base64.decode(saltB64, Base64.NO_WRAP))
            md.update(text.toByteArray(Charsets.UTF_8))
            promise.resolve(md.digest().joinToString("") { "%02x".format(it) })
        } catch (e: Exception) {
            promise.reject("commitment", e.message)
        }
    }

    /** hex(SHA-256(UTF-8(text))): for the request body hash. */
    @ReactMethod
    fun sha256Hex(text: String, promise: Promise) {
        promise.resolve(MessageDigest.getInstance("SHA-256").digest(text.toByteArray(Charsets.UTF_8)).joinToString("") { "%02x".format(it) })
    }

    /**
     * The next event counter for this key: persisted and strictly increasing
     * (§7). It starts again from 1 only when a new key is generated, which is
     * safe because the key id changes too, and the server's counters are
     * unique per key id.
     */
    @ReactMethod
    fun nextCounter(promise: Promise) {
        synchronized(this) {
            val next = prefs.getLong("counter", 0) + 1
            prefs.edit().putLong("counter", next).commit()
            promise.resolve(next.toDouble())
        }
    }

    /** DER ECDSA signature to fixed 64-byte r||s. */
    private fun derToRaw(der: ByteArray): ByteArray {
        var i = 2
        if (der[1].toInt() and 0x80 != 0) i += der[1].toInt() and 0x7f
        fun readInt(): ByteArray {
            require(der[i].toInt() == 0x02); val len = der[i + 1].toInt(); val v = der.copyOfRange(i + 2, i + 2 + len); i += 2 + len; return v
        }
        val r = BigInteger(1, readInt()); val s = BigInteger(1, readInt())
        fun pad(b: BigInteger) = b.toByteArray().let { if (it.size > 32) it.copyOfRange(it.size - 32, it.size) else ByteArray(32 - it.size) + it }
        return pad(r) + pad(s)
    }
}
