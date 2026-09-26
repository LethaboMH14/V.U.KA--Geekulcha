package za.co.vuka.app.panic

import android.content.Context
import android.content.Intent
import za.co.vuka.app.api.ServerSync
import za.co.vuka.app.detect.CheckinActivity
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
        AlertPath.sendPanic(context, source)
    }

    fun screenIntent(context: Context): Intent =
        Intent(context, PanicActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
}

/**
 * Where a panic alert leaves the phone: a manual `signal_detected` to the
 * ANCHOR server (ADR-0049, PROPOSED), on the open journey or on one opened
 * for it. Unanswered, the server raises the alarm to guardians (~90 s).
 */
object AlertPath {
    @Suppress("UNUSED_PARAMETER")
    fun sendPanic(context: Context, source: Panic.Source) {
        val app = context.applicationContext
        // The same Journey check a sound gets; a normal notification, so the dialer stays on top.
        ServerSync.onHelpQueued = { journeyId, signalEventId -> CheckinActivity.notify(app, journeyId, signalEventId, fullScreen = false) }
        ServerSync.help(context)
        ServerSync.startJourney(context) // reuses an open journey; opens one if none
    }
}
