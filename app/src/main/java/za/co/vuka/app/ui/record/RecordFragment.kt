package za.co.vuka.app.ui.record

import android.os.Bundle
import android.text.format.DateUtils
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import za.co.vuka.app.R
import za.co.vuka.app.ui.settings.vukaColor
import za.co.vuka.app.ui.home.JourneyViewModel
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * ANCHOR · My record (MyRecord.tsx): the member's own timeline, with proof
 * details collapsed below.
 *
 * The timeline shows this phone's real journey taps and panic alerts from
 * [RecordStore], saved on the phone.
 * ANCHOR (hash chain, Merkle batches, Hedera) is still being built, so no
 * entry is anchored and the proof block shows no hash, sequence or receipt.
 */
class RecordFragment : Fragment(R.layout.fragment_record) {

    private val journey: JourneyViewModel by activityViewModels()
    private var proofOpen = false

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        proofOpen = savedInstanceState?.getBoolean(KEY_PROOF_OPEN) ?: false

        proofRow(view, R.id.rowRoot, "Root hash")
        proofRow(view, R.id.rowSequence, "Sequence")
        proofRow(view, R.id.rowRecorded, "Recorded")

        view.findViewById<View>(R.id.proofHeader).setOnClickListener {
            proofOpen = !proofOpen
            renderProof(view)
        }
        renderProof(view)

        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                journey.entries.collect { renderTimeline(view, it) }
            }
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        outState.putBoolean(KEY_PROOF_OPEN, proofOpen)
    }

    private fun renderTimeline(view: View, entries: List<RecordEntry>) {
        view.findViewById<View>(R.id.tvEmpty).visibility = if (entries.isEmpty()) View.VISIBLE else View.GONE
        val timeline = view.findViewById<ViewGroup>(R.id.timeline)
        timeline.visibility = if (entries.isEmpty()) View.GONE else View.VISIBLE
        timeline.removeAllViews()

        // Newest first, like a record you scroll back through.
        val ordered = entries.asReversed()
        ordered.forEachIndexed { i, entry ->
            val isLast = i == ordered.lastIndex
            val row = layoutInflater.inflate(R.layout.item_timeline, timeline, false)
            val (icon, tint, label) = when (entry.kind) {
                RecordEntry.Kind.JOURNEY_STARTED ->
                    Triple(R.drawable.ic_arrow_right, R.color.vuka_action, "Activated · simulated")
                RecordEntry.Kind.JOURNEY_ENDED ->
                    Triple(R.drawable.ic_circle, R.color.vuka_text_secondary, "Deactivated")
                RecordEntry.Kind.PANIC ->
                    Triple(R.drawable.ic_warning_circle, R.color.vuka_text_title, "Alert raised · not sent")
            }
            row.findViewById<ImageView>(R.id.ivIcon).apply {
                setImageResource(icon)
                setColorFilter(requireContext().vukaColor(tint))
            }
            row.findViewById<TextView>(R.id.tvLabel).text = label
            row.findViewById<TextView>(R.id.tvTime).text = formatTime(entry.timeMillis)
            row.findViewById<TextView>(R.id.tvDetail).apply {
                text = if (entry.kind == RecordEntry.Kind.PANIC) {
                    "on this phone only · no one was contacted"
                } else {
                    "on this phone only · not anchored"
                }
                visibility = View.VISIBLE
            }
            row.findViewById<View>(R.id.connector).visibility = if (isLast) View.GONE else View.VISIBLE
            if (isLast) row.findViewById<View>(R.id.content).setPadding(0, 0, 0, 0)
            timeline.addView(row)
        }
    }

    private fun renderProof(view: View) {
        view.findViewById<View>(R.id.proofBody).visibility = if (proofOpen) View.VISIBLE else View.GONE
        view.findViewById<View>(R.id.ivProofCaret).rotation = if (proofOpen) 90f else 0f
        view.findViewById<View>(R.id.proofHeader).contentDescription =
            if (proofOpen) "Proof details, expanded" else "Proof details, collapsed"
    }

    private fun proofRow(view: View, id: Int, label: String) {
        view.findViewById<View>(id).findViewById<TextView>(R.id.tvLabel).text = label
    }

    private fun formatTime(millis: Long): String {
        val pattern = if (DateUtils.isToday(millis)) "HH:mm" else "d MMM · HH:mm"
        return SimpleDateFormat(pattern, Locale.getDefault()).format(Date(millis))
    }

    companion object {
        private const val KEY_PROOF_OPEN = "record_proof_open"
    }
}
