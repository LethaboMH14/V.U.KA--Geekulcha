package za.co.vuka.app.panic

import android.content.Context
import android.content.Intent
import za.co.vuka.app.ui.record.RecordEntry
import za.co.vuka.app.ui.record.RecordStore

/**
 * Manual panic: the member asks for help directly, from Home's one-tap
 * Emergency button (which then opens the dialer with 10111) or the Quick
 * Settings tile (which shows [PanicActivity]). ADR-0008 lists "manual panic" as a feature,
 * but VUKA-2-SPEC.md defines no event for it yet, so nothing can be sent.
 */
object Panic {

    enum class Source { HOME_BUTTON, QS_TILE }

    /** Record the alert and hand it to the alert path. Callers then show [screenIntent]. */
    fun raise(context: Context, source: Source) {
        RecordStore.add(context, RecordEntry.Kind.PANIC)
        AlertPath.sendPanic(source)
    }

    fun screenIntent(context: Context): Intent =
        Intent(context, PanicActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
}

/**
 * Where a panic alert would leave the phone (guardian alert, then the bank
 * signal, like a duress signal). No alert path or spec event exists yet, so
 * this sends nothing. The panic screen says so and offers 10111 instead.
 */
object AlertPath {
    @Suppress("UNUSED_PARAMETER")
    fun sendPanic(source: Panic.Source) {
        // TODO: needs a panic event in VUKA-2-SPEC.md (team decision) and the alert path.
    }
}
