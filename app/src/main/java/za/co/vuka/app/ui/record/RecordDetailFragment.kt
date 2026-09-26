package za.co.vuka.app.ui.record

import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.core.os.bundleOf
import androidx.fragment.app.Fragment
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import za.co.vuka.app.R
import za.co.vuka.app.ui.settings.vukaColor
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * One record's events, oldest first, VIEW ONLY: there are no controls that
 * change anything. Each event shows its place in the chain (sequence, its
 * own fingerprint and the one it links to), and the record says whether the
 * chain still checks out. On-phone chain only; nothing is anchored to Hedera.
 */
class RecordDetailFragment : Fragment(R.layout.fragment_record_detail) {

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        view.findViewById<View>(R.id.btnBack).setOnClickListener { findNavController().navigateUp() }
        val id = requireArguments().getInt(ARG_ID)

        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                RecordStore.entries.collect { entries ->
                    // The record is wiped (profile deleted): nothing left to show.
                    val group = RecordGroup.from(entries).firstOrNull { it.id == id }
                    if (group == null) findNavController().navigateUp() else render(view, group, RecordStore.verify(entries))
                }
            }
        }
    }

    private fun render(view: View, group: RecordGroup, check: ChainCheck) {
        view.findViewById<TextView>(R.id.tvTitle).text = group.title
        view.findViewById<TextView>(R.id.tvDate).text = "MY RECORD · " +
            SimpleDateFormat("d MMM yyyy", Locale.getDefault()).format(Date(group.entries.first().timeMillis)).uppercase()

        val status = group.status(check)
        val (title, body) = when (status) {
            RecordGroup.Status.INTACT ->
                "Chain intact" to "Every event here still matches its fingerprint and links to the one before it."
            RecordGroup.Status.BROKEN_HERE ->
                "Chain broken at #${(check as ChainCheck.Broken).seq}" to
                    "That event, or its link, was changed after it was recorded."
            RecordGroup.Status.BROKEN_EARLIER ->
                "Can't be confirmed" to
                    "The chain breaks earlier, at #${(check as ChainCheck.Broken).seq}, so nothing after it can be confirmed."
        }
        view.findViewById<TextView>(R.id.tvChainTitle).text = title
        view.findViewById<TextView>(R.id.tvChainBody).text = body
        view.findViewById<ImageView>(R.id.ivChain)
            .setImageResource(if (status == RecordGroup.Status.INTACT) R.drawable.ic_lock else R.drawable.ic_warning_circle)
        view.findViewById<View>(R.id.chainStatus).setBackgroundResource(
            if (status == RecordGroup.Status.INTACT) R.drawable.bg_input_field else R.drawable.bg_input_field_error
        )

        val list = view.findViewById<ViewGroup>(R.id.events)
        list.removeAllViews()
        group.entries.forEachIndexed { i, e ->
            val isLast = i == group.entries.lastIndex
            val row = layoutInflater.inflate(R.layout.item_timeline, list, false)
            row.findViewById<ImageView>(R.id.ivIcon).apply {
                setImageResource(RecordGroup.icon(e))
                setColorFilter(requireContext().vukaColor(R.color.vuka_text_secondary))
            }
            row.findViewById<TextView>(R.id.tvLabel).text = RecordGroup.label(e)
            row.findViewById<TextView>(R.id.tvTime).text =
                SimpleDateFormat(if (sameDay(group.entries.first().timeMillis, e.timeMillis)) "HH:mm:ss" else "d MMM · HH:mm:ss", Locale.getDefault()).format(Date(e.timeMillis))
            row.findViewById<TextView>(R.id.tvDetail).apply {
                val links = if (e.prevHash == RecordStore.GENESIS) "start of chain" else "${e.prevHash.take(16)}…"
                text = buildString {
                    if (e.kind == RecordEntry.Kind.PANIC) append("No one was contacted\n")
                    if (e.detail.isNotEmpty()) append("Changed: ${e.detail}\n")
                    append("#${e.seq}\n")
                    append("Fingerprint ${e.hash}\n")
                    append("Links to    $links")
                }
                setTextIsSelectable(true) // copy a fingerprint to compare; still read-only
                visibility = View.VISIBLE
            }
            row.findViewById<View>(R.id.connector).visibility = if (isLast) View.GONE else View.VISIBLE
            if (isLast) row.findViewById<View>(R.id.content).setPadding(0, 0, 0, 0)
            list.addView(row)
        }
    }

    private fun sameDay(a: Long, b: Long): Boolean {
        val f = SimpleDateFormat("yyyyMMdd", Locale.US)
        return f.format(Date(a)) == f.format(Date(b))
    }

    companion object {
        private const val ARG_ID = "record_id"
        fun args(recordId: Int) = bundleOf(ARG_ID to recordId)
    }
}
