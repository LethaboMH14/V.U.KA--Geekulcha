package za.co.vuka.app.ui.record

import android.os.Bundle
import android.text.format.DateUtils
import android.util.TypedValue
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
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
 * Lists this phone's records from [RecordStore], newest first: each
 * Activate → Deactivate session, and events on their own (profile changes,
 * Emergency alerts while not active). Tapping one opens [RecordDetailFragment],
 * a view-only page of the events inside it. The on-phone hash chain is
 * re-checked whenever the record changes. ANCHOR (Merkle batches, Hedera)
 * isn't connected, so nothing is anchored and no receipt is shown.
 */
class RecordFragment : Fragment(R.layout.fragment_record) {

    private val journey: JourneyViewModel by activityViewModels()
    private var proofOpen = false

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        proofOpen = savedInstanceState?.getBoolean(KEY_PROOF_OPEN) ?: false

        proofRow(view, R.id.rowRoot, "Chain head")
        proofRow(view, R.id.rowSequence, "Sequence")
        proofRow(view, R.id.rowRecorded, "Last entry")

        view.findViewById<View>(R.id.proofHeader).setOnClickListener {
            proofOpen = !proofOpen
            renderProof(view)
        }
        renderProof(view)

        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                journey.entries.collect {
                    renderTimeline(view, it)
                    renderChain(view, it)
                }
            }
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        outState.putBoolean(KEY_PROOF_OPEN, proofOpen)
    }

    private fun renderTimeline(view: View, entries: List<RecordEntry>) {
        view.findViewById<View>(R.id.tvEmpty).visibility = if (entries.isEmpty()) View.VISIBLE else View.GONE
        val list = view.findViewById<ViewGroup>(R.id.timeline)
        list.visibility = if (entries.isEmpty()) View.GONE else View.VISIBLE
        list.removeAllViews()

        val check = RecordStore.verify(entries)
        RecordGroup.from(entries).forEach { group ->
            val row = layoutInflater.inflate(R.layout.item_settings_row, list, false)
            row.findViewById<ImageView>(R.id.ivIcon).setImageResource(group.icon)
            row.findViewById<TextView>(R.id.tvLabel).text = group.title
            row.findViewById<TextView>(R.id.tvSublabel).apply {
                text = summary(group, check)
                visibility = View.VISIBLE
            }
            row.findViewById<TextView>(R.id.tvTrailing).apply {
                text = formatTime(group.entries.first().timeMillis)
                visibility = View.VISIBLE
            }
            row.findViewById<View>(R.id.ivChevron).visibility = View.VISIBLE
            val ripple = TypedValue()
            requireContext().theme.resolveAttribute(android.R.attr.selectableItemBackground, ripple, true)
            row.setBackgroundResource(ripple.resourceId)
            row.setOnClickListener {
                findNavController().navigate(R.id.action_record_to_detail, RecordDetailFragment.args(group.id))
            }
            list.addView(row)
        }
    }

    private fun summary(group: RecordGroup, check: ChainCheck): String {
        val what = when {
            group.isOpen -> "Still active"
            group.isSession -> "Until ${formatTime(group.entries.last().timeMillis)}"
            group.entries.first().detail.isNotEmpty() -> group.entries.first().detail
            else -> null
        }
        val count = "${group.entries.size} event${if (group.entries.size == 1) "" else "s"}"
        val chain = when (group.status(check)) {
            RecordGroup.Status.INTACT -> "chain intact"
            RecordGroup.Status.BROKEN_HERE -> "chain broken"
            RecordGroup.Status.BROKEN_EARLIER -> "can't confirm"
        }
        return listOfNotNull(what, count, chain).joinToString(" · ")
    }

    private fun renderChain(view: View, entries: List<RecordEntry>) {
        view.findViewById<View>(R.id.chainStatus).visibility = if (entries.isEmpty()) View.GONE else View.VISIBLE
        val check = RecordStore.verify(entries)
        val (title, body) = when (check) {
            ChainCheck.Intact -> "Chain intact · ${entries.size} entr${if (entries.size == 1) "y" else "ies"}" to
                "Every entry still matches its fingerprint and links to the one before it."
            is ChainCheck.Broken -> "Chain broken at #${check.seq}" to
                "Entry #${check.seq} or the link before it was changed after it was recorded."
        }
        view.findViewById<TextView>(R.id.tvChainTitle).text = title
        view.findViewById<TextView>(R.id.tvChainBody).text = body
        view.findViewById<ImageView>(R.id.ivChain)
            .setImageResource(if (check == ChainCheck.Intact) R.drawable.ic_lock else R.drawable.ic_warning_circle)
        view.findViewById<View>(R.id.chainStatus).setBackgroundResource(
            if (check == ChainCheck.Intact) R.drawable.bg_input_field else R.drawable.bg_input_field_error
        )

        val head = entries.lastOrNull()
        proofValue(view, R.id.rowRoot, head?.let { "${it.hash.take(16)}…" } ?: "—")
        proofValue(view, R.id.rowSequence, head?.seq?.toString() ?: "—")
        proofValue(view, R.id.rowRecorded, head?.let { formatTime(it.timeMillis) } ?: "—")
    }

    private fun proofValue(view: View, id: Int, value: String) {
        view.findViewById<View>(id).findViewById<TextView>(R.id.tvValue).text = value
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
