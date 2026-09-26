package za.co.vuka.app.ui.record

import android.content.Context
import androidx.core.content.edit
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import java.security.MessageDigest

/**
 * One entry in the member's record: what happened, when, and its link in the
 * hash chain. [detail] names what changed (e.g. "Name, Email"), never the
 * personal data itself.
 */
data class RecordEntry(
    val seq: Int,
    val kind: Kind,
    val timeMillis: Long,
    val detail: String,
    val prevHash: String,
    val hash: String,
) {
    enum class Kind { JOURNEY_STARTED, JOURNEY_ENDED, PANIC, PROFILE_UPDATED, TERMS_ACCEPTED, PASSWORD_RESET, SOUND_DETECTED }
}

/** Result of re-checking every link in the chain. */
sealed interface ChainCheck {
    data object Intact : ChainCheck
    /** [seq] is the first entry whose content or link no longer matches. */
    data class Broken(val seq: Int) : ChainCheck
}

/**
 * The member's record, saved on this phone. It is one process-wide store, so
 * the panic screen (its own activity, reachable from the lock screen) and the
 * Record tab see the same entries.
 *
 * HASH-CHAINED ON THIS PHONE: each entry's SHA-256 covers its sequence, kind,
 * time, detail and the previous entry's hash, so editing, removing or
 * reordering an earlier entry breaks every link after it and [verify] finds
 * it. This is tamper-evident, not tamper-proof: someone with full access to
 * the phone could rebuild the whole chain. Anchoring the head to Hedera fixes
 * that, and it is ANCHOR's job (anchor/README.md), which isn't connected yet.
 * This is not ANCHOR's canonical format (spec §5); the server chain is the
 * one that gets anchored.
 */
object RecordStore {

    private const val PREFS = "vuka_record"
    private const val KEY_ENTRIES = "entries"
    const val GENESIS = "0000000000000000000000000000000000000000000000000000000000000000"

    private val _entries = MutableStateFlow<List<RecordEntry>>(emptyList())
    val entries: StateFlow<List<RecordEntry>> = _entries

    @Volatile private var loaded = false

    fun load(context: Context) {
        if (loaded) return
        synchronized(this) {
            if (loaded) return
            val lines = prefs(context).getString(KEY_ENTRIES, "").orEmpty()
                .lineSequence().filter { it.isNotBlank() }.toList()
            val legacy = lines.isNotEmpty() && lines.all { it.split('|').size == 2 }
            _entries.value = if (legacy) chainLegacy(lines) else lines.mapNotNull(::parse)
            if (legacy) save(context)
            loaded = true
        }
    }

    fun add(context: Context, kind: RecordEntry.Kind, detail: String = "") {
        load(context)
        synchronized(this) {
            val current = _entries.value
            val prev = current.lastOrNull()
            _entries.value = current + link(
                seq = (prev?.seq ?: 0) + 1,
                kind = kind,
                timeMillis = System.currentTimeMillis(),
                detail = detail.replace('|', '/').replace('\n', ' '),
                prevHash = prev?.hash ?: GENESIS,
            )
            save(context)
        }
    }

    /** Recomputes every hash and link from the start. */
    fun verify(entries: List<RecordEntry> = _entries.value): ChainCheck {
        var expectedPrev = GENESIS
        entries.forEachIndexed { i, e ->
            val ok = e.seq == i + 1 &&
                e.prevHash == expectedPrev &&
                e.hash == hashOf(e.seq, e.kind, e.timeMillis, e.detail, e.prevHash)
            if (!ok) return ChainCheck.Broken(e.seq)
            expectedPrev = e.hash
        }
        return ChainCheck.Intact
    }

    fun clear(context: Context) {
        synchronized(this) {
            _entries.value = emptyList()
            prefs(context).edit { clear() }
            loaded = true
        }
    }

    private fun link(seq: Int, kind: RecordEntry.Kind, timeMillis: Long, detail: String, prevHash: String) =
        RecordEntry(seq, kind, timeMillis, detail, prevHash, hashOf(seq, kind, timeMillis, detail, prevHash))

    private fun hashOf(seq: Int, kind: RecordEntry.Kind, timeMillis: Long, detail: String, prevHash: String): String {
        val bytes = "v1|$seq|${kind.name}|$timeMillis|$detail|$prevHash".toByteArray(Charsets.UTF_8)
        return MessageDigest.getInstance("SHA-256").digest(bytes).joinToString("") { "%02x".format(it) }
    }

    // Stored as seq|kind|time|detail|prevHash|hash, one entry per line.
    private fun parse(line: String): RecordEntry? {
        val p = line.split('|')
        if (p.size != 6) return null
        val kind = RecordEntry.Kind.entries.firstOrNull { it.name == p[1] } ?: return null
        return RecordEntry(p[0].toIntOrNull() ?: return null, kind, p[2].toLongOrNull() ?: return null, p[3], p[4], p[5])
    }

    // Builds that saved only kind|time get chained once, in their saved order.
    private fun chainLegacy(lines: List<String>): List<RecordEntry> {
        val out = mutableListOf<RecordEntry>()
        lines.forEach { line ->
            val (k, t) = line.split('|')
            val kind = RecordEntry.Kind.entries.firstOrNull { it.name == k } ?: return@forEach
            val time = t.toLongOrNull() ?: return@forEach
            out += link(out.size + 1, kind, time, "", out.lastOrNull()?.hash ?: GENESIS)
        }
        return out
    }

    private fun save(context: Context) = prefs(context).edit {
        putString(
            KEY_ENTRIES,
            _entries.value.joinToString("\n") { "${it.seq}|${it.kind.name}|${it.timeMillis}|${it.detail}|${it.prevHash}|${it.hash}" }
        )
    }

    private fun prefs(context: Context) =
        context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
}
