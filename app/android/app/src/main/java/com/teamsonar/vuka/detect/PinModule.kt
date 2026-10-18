package com.teamsonar.vuka.detect

import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import org.bouncycastle.crypto.generators.Argon2BytesGenerator
import org.bouncycastle.crypto.params.Argon2Parameters
import org.json.JSONObject
import java.io.File
import java.security.KeyStore
import java.security.MessageDigest
import java.security.SecureRandom
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

/**
 * The member's two PINs (spec V5, V6; ADR-0036/0041): a normal PIN and a
 * duress PIN, verified on the phone. Each is stored only as Argon2id(pin, salt)
 * (OWASP parameters: 19 MiB, 2 passes, 1 lane), and the record is sealed with
 * an AES-GCM key in Android Keystore.
 *
 * Verification always derives BOTH hashes and compares both in constant time,
 * so the time taken never depends on which PIN was entered. The screen never
 * learns the result: only the event builder does, to sign the right statement.
 */
class PinModule(ctx: ReactApplicationContext) : ReactContextBaseJavaModule(ctx) {
    companion object {
        private const val ALIAS = "vigil_pins_v1"
        private const val MEMORY_KIB = 19 * 1024
        private const val ITERATIONS = 2
        private const val LANES = 1
    }

    override fun getName() = "VigilPin"

    private val file: File get() = File(reactApplicationContext.noBackupFilesDir, "pins.bin")

    private fun key(): SecretKey {
        val ks = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        (ks.getKey(ALIAS, null) as? SecretKey)?.let { return it }
        return KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore").apply {
            init(
                KeyGenParameterSpec.Builder(ALIAS, KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
                    .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                    .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                    .setKeySize(256)
                    .build(),
            )
        }.generateKey()
    }

    private fun argon2(pin: String, salt: ByteArray): ByteArray {
        val params = Argon2Parameters.Builder(Argon2Parameters.ARGON2_id)
            .withSalt(salt).withMemoryAsKB(MEMORY_KIB).withIterations(ITERATIONS).withParallelism(LANES).build()
        val out = ByteArray(32)
        Argon2BytesGenerator().apply { init(params) }.generateBytes(pin.toByteArray(Charsets.UTF_8), out)
        return out
    }

    private fun hex(b: ByteArray) = b.joinToString("") { "%02x".format(it) }
    private fun unhex(s: String) = ByteArray(s.length / 2) { s.substring(it * 2, it * 2 + 2).toInt(16).toByte() }

    private fun validPin(p: String) = p.length in 4..8 && p.all { it.isDigit() }

    @ReactMethod
    fun isSet(promise: Promise) = promise.resolve(file.exists())

    /** Stores both PINs. They must be 4–8 digits and must differ. */
    @ReactMethod
    fun setPins(normal: String, duress: String, promise: Promise) {
        try {
            require(validPin(normal) && validPin(duress)) { "PINs must be 4 to 8 digits" }
            require(normal != duress) { "the two PINs must be different" }
            val rnd = SecureRandom()
            val sn = ByteArray(16).also { rnd.nextBytes(it) }
            val sd = ByteArray(16).also { rnd.nextBytes(it) }
            val rec = JSONObject()
                .put("v", 1).put("sn", hex(sn)).put("hn", hex(argon2(normal, sn)))
                .put("sd", hex(sd)).put("hd", hex(argon2(duress, sd)))
            val c = Cipher.getInstance("AES/GCM/NoPadding").apply { init(Cipher.ENCRYPT_MODE, key()) }
            val sealed = byteArrayOf(c.iv.size.toByte()) + c.iv + c.doFinal(rec.toString().toByteArray(Charsets.UTF_8))
            val tmp = File(file.parentFile, "pins.tmp")
            tmp.writeBytes(sealed)
            if (!tmp.renameTo(file)) throw IllegalStateException("could not store PINs")
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("pins", e.message)
        }
    }

    /** "normal", "duress" or "wrong". Always derives both hashes (no timing tell). */
    @ReactMethod
    fun verify(pin: String, promise: Promise) {
        try {
            val blob = file.readBytes()
            val ivLen = blob[0].toInt()
            val c = Cipher.getInstance("AES/GCM/NoPadding").apply {
                init(Cipher.DECRYPT_MODE, key(), GCMParameterSpec(128, blob.copyOfRange(1, 1 + ivLen)))
            }
            val rec = JSONObject(String(c.doFinal(blob, 1 + ivLen, blob.size - 1 - ivLen), Charsets.UTF_8))
            val n = MessageDigest.isEqual(argon2(pin, unhex(rec.getString("sn"))), unhex(rec.getString("hn")))
            val d = MessageDigest.isEqual(argon2(pin, unhex(rec.getString("sd"))), unhex(rec.getString("hd")))
            promise.resolve(if (n) "normal" else if (d) "duress" else "wrong")
        } catch (e: Exception) {
            promise.reject("verify", e.message)
        }
    }
}
