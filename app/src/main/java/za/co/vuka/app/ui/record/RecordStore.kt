package za.co.vuka.app.ui.record

import android.content.Context
import androidx.core.content.edit
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

/** One entry in the member's record: what happened, and when. */
data class RecordEntry(val kind: Kind, val timeMillis: Long) {
    enum class Kind { JOURNEY_STARTED, JOURNEY_ENDED, PANIC }
}

/**
 * The member's record, saved on this phone. It is one process-wide store, so
 * the panic screen (its own activity, reachable from the lock screen) and the
 * Record tab see the same entries.
 *
 * LOCAL ONLY: not hash-chained, not signed, not anchored. That's ANCHOR's
 * job (anchor/README.md), which isn't connected yet.
 */
object RecordStore {

    private const val PREFS = "vuka_record"
    private const val KEY_ENTRIES = "entries"

    private val _entries = MutableStateFlow<List<RecordEntry>>(emptyList())
    val entries: StateFlow<List<RecordEntry>> = _entries

    @Volatile private var loaded = false

    fun load(context: Context) {
        if (loaded) return
        synchronized(this) {
            if (loaded) return
            _entries.value = prefs(context).getString(KEY_ENTRIES, "").orEmpty()
                .lineSequence()
                .mapNotNull { line ->
                    val (kind, time) = line.split('|').takeIf { it.size == 2 } ?: return@mapNotNull null
                    val k = RecordEntry.Kind.entries.firstOrNull { it.name == kind } ?: return@mapNotNull null
                    time.toLongOrNull()?.let { RecordEntry(k, it) }
                }
                .toList()
            loaded = true
        }
    }

    fun add(context: Context, kind: RecordEntry.Kind) {
        load(context)
        synchronized(this) {
            _entries.value = _entries.value + RecordEntry(kind, System.currentTimeMillis())
            prefs(context).edit {
                putString(KEY_ENTRIES, _entries.value.joinToString("\n") { "${it.kind.name}|${it.timeMillis}" })
            }
        }
    }

    fun clear(context: Context) {
        synchronized(this) {
            _entries.value = emptyList()
            prefs(context).edit { clear() }
            loaded = true
        }
    }

    private fun prefs(context: Context) =
        context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
}
