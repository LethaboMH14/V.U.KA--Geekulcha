package za.co.vuka.app.ui.guardian

import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.annotation.ColorRes
import androidx.annotation.DrawableRes
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import za.co.vuka.app.R
import za.co.vuka.app.ui.settings.vukaColor

/**
 * Guardian — Acknowledged (Acknowledged.tsx): the incident timeline after a
 * guardian responds.
 *
 * SIMULATED EXAMPLE, reached from the alert preview's "See the timeline"
 * link. No alert exists, so the steps carry no timestamps and nothing uses
 * the green reserved for real verification. "Call them" stays locked, as designed.
 */
class AcknowledgedFragment : Fragment(R.layout.fragment_guardian_acknowledged) {

    private data class Step(
        @DrawableRes val icon: Int,
        @ColorRes val tint: Int,
        val label: String,
        val detail: String? = null,
    )

    private val exampleSteps = listOf(
        Step(R.drawable.ic_arrow_right, R.color.vuka_action, "Alert received"),
        Step(R.drawable.ic_ear, R.color.vuka_text_secondary, "You opened the alert"),
        Step(R.drawable.ic_check_circle, R.color.vuka_text_secondary, "I called 10111", "self-reported"),
        Step(R.drawable.ic_circle, R.color.vuka_text_secondary, "Waiting on stand-down or closure"),
    )

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val timeline = view.findViewById<ViewGroup>(R.id.timeline)
        exampleSteps.forEachIndexed { i, step ->
            val isLast = i == exampleSteps.lastIndex
            val row = layoutInflater.inflate(R.layout.item_timeline, timeline, false)
            row.findViewById<ImageView>(R.id.ivIcon).apply {
                setImageResource(step.icon)
                setColorFilter(requireContext().vukaColor(step.tint))
            }
            row.findViewById<TextView>(R.id.tvLabel).text = step.label
            row.findViewById<TextView>(R.id.tvTime).text = "—"
            row.findViewById<TextView>(R.id.tvDetail).apply {
                text = step.detail
                visibility = if (step.detail != null) View.VISIBLE else View.GONE
            }
            row.findViewById<View>(R.id.connector).visibility = if (isLast) View.GONE else View.VISIBLE
            if (isLast) row.findViewById<View>(R.id.content).setPadding(0, 0, 0, 0)
            timeline.addView(row)
        }

        view.findViewById<View>(R.id.btnBackToStandby).setOnClickListener {
            findNavController().popBackStack(R.id.guardianStandbyFragment, false)
        }
    }
}
