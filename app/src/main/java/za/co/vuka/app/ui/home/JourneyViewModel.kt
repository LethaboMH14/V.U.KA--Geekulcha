package za.co.vuka.app.ui.home

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import za.co.vuka.app.ui.record.RecordEntry
import za.co.vuka.app.ui.record.RecordStore
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

/**
 * Journey state shared by Home, Record and Settings (activity-scoped, so it
 * survives switching tabs and theme changes).
 *
 * SIMULATED journeys: nothing listens. The record entries are real, since
 * each is the moment the member tapped Start or End, and they are saved in
 * [RecordStore]. Whether a journey is running is not saved: after a restart
 * there is none.
 */
class JourneyViewModel(application: Application) : AndroidViewModel(application) {

    private val _active = MutableStateFlow(false)
    val active: StateFlow<Boolean> = _active

    val entries: StateFlow<List<RecordEntry>> = RecordStore.entries

    init {
        RecordStore.load(application)
    }

    fun start() = set(true, RecordEntry.Kind.JOURNEY_STARTED)

    /** Forget a running journey without writing to the record (the record is being wiped). */
    fun reset() {
        _active.value = false
    }

    fun end() = set(false, RecordEntry.Kind.JOURNEY_ENDED)

    private fun set(active: Boolean, kind: RecordEntry.Kind) {
        if (_active.value == active) return
        _active.value = active
        RecordStore.add(getApplication(), kind)
    }
}
