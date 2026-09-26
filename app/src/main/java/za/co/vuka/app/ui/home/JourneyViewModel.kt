package za.co.vuka.app.ui.home

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import za.co.vuka.app.detect.Listening
import za.co.vuka.app.detect.SensingService
import za.co.vuka.app.ui.record.RecordEntry
import za.co.vuka.app.ui.record.RecordStore
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

/**
 * Journey state shared by Home, Record and Settings (activity-scoped, so it
 * survives switching tabs and theme changes).
 *
 * Activating starts [SensingService], which listens with YAMNet until
 * Deactivate stops it; each tap is recorded in [RecordStore]. The state
 * follows the service, so reopening the app while it still listens shows
 * Active. After the process dies nothing listens and nothing is active.
 * The caller checks microphone and notification permission first (spec V1).
 */
class JourneyViewModel(application: Application) : AndroidViewModel(application) {

    private val _active = MutableStateFlow(Listening.state.value != Listening.State.Off)
    val active: StateFlow<Boolean> = _active

    val entries: StateFlow<List<RecordEntry>> = RecordStore.entries

    init {
        RecordStore.load(application)
    }

    fun start() {
        if (set(true, RecordEntry.Kind.JOURNEY_STARTED)) SensingService.start(getApplication())
    }

    /** Stop without writing to the record (the record is being wiped). */
    fun reset() {
        _active.value = false
        SensingService.stop(getApplication())
    }

    fun end() {
        if (set(false, RecordEntry.Kind.JOURNEY_ENDED)) SensingService.stop(getApplication())
    }

    private fun set(active: Boolean, kind: RecordEntry.Kind): Boolean {
        if (_active.value == active) return false
        _active.value = active
        RecordStore.add(getApplication(), kind)
        return true
    }
}
