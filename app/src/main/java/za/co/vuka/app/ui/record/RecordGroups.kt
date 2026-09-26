package za.co.vuka.app.ui.record

import androidx.annotation.DrawableRes
import za.co.vuka.app.R

/**
 * One record on the Record tab: an Activate → Deactivate session with what
 * happened during it, or a single event on its own (a profile change, or a
 * Emergency alert while VIGIL wasn't active). Built from the chain, so
 * grouping never changes what's stored.
 */
data class RecordGroup(val entries: List<RecordEntry>) {

    val id: Int get() = entries.first().seq
    val isSession: Boolean get() = entries.first().kind == RecordEntry.Kind.JOURNEY_STARTED
    val isOpen: Boolean get() = isSession && entries.last().kind != RecordEntry.Kind.JOURNEY_ENDED

    val title: String
        get() = if (isSession) "Active session" else label(entries.first())

    @get:DrawableRes
    val icon: Int
        get() = if (isSession) R.drawable.ic_waveform else icon(entries.first())

    /** How this record stands in the chain check of the whole record. */
    fun status(check: ChainCheck): Status = when {
        check is ChainCheck.Broken && check.seq in entries.first().seq..entries.last().seq -> Status.BROKEN_HERE
        check is ChainCheck.Broken && check.seq < entries.first().seq -> Status.BROKEN_EARLIER
        else -> Status.INTACT
    }

    enum class Status { INTACT, BROKEN_HERE, BROKEN_EARLIER }

    companion object {
        /** Newest record first. An entry never appears in two records. */
        fun from(entries: List<RecordEntry>): List<RecordGroup> {
            val groups = mutableListOf<RecordGroup>()
            var open: MutableList<RecordEntry>? = null
            entries.forEach { e ->
                when {
                    e.kind == RecordEntry.Kind.JOURNEY_STARTED -> {
                        open?.let { groups += RecordGroup(it) }
                        open = mutableListOf(e)
                    }
                    open != null -> {
                        open!! += e
                        if (e.kind == RecordEntry.Kind.JOURNEY_ENDED) {
                            groups += RecordGroup(open!!)
                            open = null
                        }
                    }
                    else -> groups += RecordGroup(listOf(e))
                }
            }
            open?.let { groups += RecordGroup(it) }
            return groups.asReversed()
        }

        fun label(e: RecordEntry) = when (e.kind) {
            RecordEntry.Kind.JOURNEY_STARTED -> "Activated · simulated"
            RecordEntry.Kind.JOURNEY_ENDED -> "Deactivated"
            RecordEntry.Kind.PANIC -> "Emergency alert · not sent"
            RecordEntry.Kind.PROFILE_UPDATED -> "Profile updated"
            RecordEntry.Kind.TERMS_ACCEPTED -> "Terms accepted"
            RecordEntry.Kind.PASSWORD_RESET -> "Password reset"
        }

        @DrawableRes
        fun icon(e: RecordEntry) = when (e.kind) {
            RecordEntry.Kind.JOURNEY_STARTED -> R.drawable.ic_arrow_right
            RecordEntry.Kind.JOURNEY_ENDED -> R.drawable.ic_circle
            RecordEntry.Kind.PANIC -> R.drawable.ic_warning_circle
            RecordEntry.Kind.PROFILE_UPDATED -> R.drawable.ic_user
            RecordEntry.Kind.TERMS_ACCEPTED -> R.drawable.ic_file_text
            RecordEntry.Kind.PASSWORD_RESET -> R.drawable.ic_key
        }
    }
}
