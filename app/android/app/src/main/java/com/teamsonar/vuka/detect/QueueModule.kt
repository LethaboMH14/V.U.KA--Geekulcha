package com.teamsonar.vuka.detect

import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

/**
 * The event queue (spec V8): one ordered, encrypted, local queue. Each signed
 * event is written as its own file in app-private storage, encrypted with an
 * AES-256-GCM key held in Android Keystore, and named by a zero-padded
 * sequence number so order survives restarts. An event leaves the queue only
 * when the server's receipt says it was received; the receipt is kept so the
 * app can show delivery truthfully (queued, then received).
 *
 * Nothing here is sent anywhere; the JS runner does the sending.
 */
class QueueModule(ctx: ReactApplicationContext) : ReactContextBaseJavaModule(ctx) {
    companion object {
        private const val ALIAS = "vigil_queue_v1"
        private const val TAG_BITS = 128
    }

    override fun getName() = "VigilQueue"

    private val dir: File get() = File(reactApplicationContext.noBackupFilesDir, "queue").apply { mkdirs() }
    private val receipts: File get() = File(reactApplicationContext.noBackupFilesDir, "receipts").apply { mkdirs() }

    private fun key(): SecretKey {
        val ks = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        (ks.getKey(ALIAS, null) as? SecretKey)?.let { return it }
        val gen = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
        gen.init(
            KeyGenParameterSpec.Builder(ALIAS, KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setKeySize(256)
                .build(),
        )
        return gen.generateKey()
    }

    private fun seal(plain: String): ByteArray {
        val c = Cipher.getInstance("AES/GCM/NoPadding").apply { init(Cipher.ENCRYPT_MODE, key()) }
        val iv = c.iv
        return byteArrayOf(iv.size.toByte()) + iv + c.doFinal(plain.toByteArray(Charsets.UTF_8))
    }

    private fun open(blob: ByteArray): String {
        val ivLen = blob[0].toInt()
        val iv = blob.copyOfRange(1, 1 + ivLen)
        val c = Cipher.getInstance("AES/GCM/NoPadding").apply { init(Cipher.DECRYPT_MODE, key(), GCMParameterSpec(TAG_BITS, iv)) }
        return String(c.doFinal(blob, 1 + ivLen, blob.size - 1 - ivLen), Charsets.UTF_8)
    }

    private fun files() = (dir.listFiles() ?: emptyArray()).filter { it.name.endsWith(".evt") }.sortedBy { it.name }

    /** Adds a signed event (JSON text) at the back of the queue; returns its sequence. */
    @ReactMethod
    fun enqueue(json: String, promise: Promise) {
        try {
            synchronized(this) {
                // Numbers never restart: they continue past both queued events and
                // kept receipts, so a receipt is never overwritten when the queue empties.
                val lastQueued = files().lastOrNull()?.name?.removeSuffix(".evt")?.toLongOrNull() ?: 0L
                val lastReceived = (receipts.listFiles() ?: emptyArray())
                    .mapNotNull { it.name.removeSuffix(".rcpt").toLongOrNull() }
                    .maxOrNull() ?: 0L
                val next = maxOf(lastQueued, lastReceived) + 1
                val name = "%016d".format(next)
                val tmp = File(dir, "$name.tmp")
                tmp.writeBytes(seal(json))
                if (!tmp.renameTo(File(dir, "$name.evt"))) throw IllegalStateException("could not commit event")
                promise.resolve(next.toDouble())
            }
        } catch (e: Exception) {
            promise.reject("enqueue", e.message)
        }
    }

    /** The queued events in order, decrypted: [{seq, json}]. */
    @ReactMethod
    fun pending(promise: Promise) {
        try {
            val out = Arguments.createArray()
            for (f in files()) {
                out.pushMap(Arguments.createMap().apply {
                    putDouble("seq", f.name.removeSuffix(".evt").toLong().toDouble())
                    putString("json", open(f.readBytes()))
                })
            }
            promise.resolve(out)
        } catch (e: Exception) {
            promise.reject("pending", e.message)
        }
    }

    /** Records the server receipt for `seq` and removes the event from the queue. */
    @ReactMethod
    fun markReceived(seq: Double, receiptJson: String, promise: Promise) {
        try {
            val name = "%016d".format(seq.toLong())
            File(receipts, "$name.rcpt").writeBytes(seal(receiptJson))
            File(dir, "$name.evt").delete()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("receipt", e.message)
        }
    }

    /** Every stored receipt, oldest first: [{seq, json}]. This is the member's own copy of their record. */
    @ReactMethod
    fun received(promise: Promise) {
        try {
            val out = Arguments.createArray()
            for (f in (receipts.listFiles() ?: emptyArray()).filter { it.name.endsWith(".rcpt") }.sortedBy { it.name }) {
                out.pushMap(Arguments.createMap().apply {
                    putDouble("seq", f.name.removeSuffix(".rcpt").toLong().toDouble())
                    putString("json", open(f.readBytes()))
                })
            }
            promise.resolve(out)
        } catch (e: Exception) {
            promise.reject("received", e.message)
        }
    }

    private val profileFile: File get() = File(reactApplicationContext.noBackupFilesDir, "profile.bin")

    /** The member's local profile (JSON), sealed like the queue. Never backed up. */
    @ReactMethod
    fun setProfile(json: String, promise: Promise) {
        try {
            val tmp = File(profileFile.parentFile, "profile.tmp")
            tmp.writeBytes(seal(json))
            if (!tmp.renameTo(profileFile)) throw IllegalStateException("could not store profile")
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("profile", e.message)
        }
    }

    @ReactMethod
    fun getProfile(promise: Promise) {
        try {
            promise.resolve(if (profileFile.exists()) open(profileFile.readBytes()) else null)
        } catch (e: Exception) {
            promise.reject("profile", e.message)
        }
    }

    /** Counts for a truthful delivery display: how many queued, how many received. */
    @ReactMethod
    fun counts(promise: Promise) {
        val received = (receipts.listFiles() ?: emptyArray()).count { it.name.endsWith(".rcpt") }
        promise.resolve(Arguments.createMap().apply {
            putInt("queued", files().size)
            putInt("received", received)
        })
    }
}
