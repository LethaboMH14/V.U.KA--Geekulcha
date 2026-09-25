package za.co.vuka.app.ui.settings

import android.graphics.Typeface
import android.os.Bundle
import android.util.TypedValue
import android.view.View
import android.widget.LinearLayout
import android.widget.TextView
import androidx.annotation.RawRes
import androidx.core.os.bundleOf
import androidx.core.view.ViewCompat
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import za.co.vuka.app.R

/**
 * Reads one of the bundled documents in res/raw. The text is taken word for
 * word from docs/PRIVACY-POLICY.md (PROPOSED), with only the internal source
 * references removed, so update the raw files whenever that policy changes.
 *
 * Format: "## " is a section heading, "### " a sub-heading, and anything else
 * is a paragraph. Blank lines separate blocks.
 */
class DocumentFragment : Fragment(R.layout.fragment_document) {

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val args = requireArguments()

        view.findViewById<TextView>(R.id.tvTitle).text = args.getString(ARG_TITLE)
        view.findViewById<View>(R.id.btnBack).setOnClickListener { findNavController().navigateUp() }

        val body = view.findViewById<LinearLayout>(R.id.body)
        val text = resources.openRawResource(args.getInt(ARG_RAW))
            .bufferedReader().use { it.readText() }

        var first = true
        text.lines().filter { it.isNotBlank() }.forEach { line ->
            body.addView(
                when {
                    line.startsWith("## ") -> block(line.removePrefix("## "), 15f, R.color.vuka_text_title, bold = true, top = if (first) 0 else 20)
                    line.startsWith("### ") -> block(line.removePrefix("### "), 14f, R.color.vuka_text_label, bold = true, top = 12)
                    else -> block(line, 14f, R.color.vuka_text_secondary, bold = false, top = 6)
                }
            )
            first = false
        }
    }

    private fun block(text: String, sp: Float, color: Int, bold: Boolean, top: Int) = TextView(requireContext()).apply {
        this.text = text
        setTextSize(TypedValue.COMPLEX_UNIT_SP, sp)
        setTextColor(requireContext().getColor(color))
        setLineSpacing(3 * resources.displayMetrics.density, 1f)
        if (bold) {
            setTypeface(typeface, Typeface.BOLD)
            if (sp >= 15f) ViewCompat.setAccessibilityHeading(this, true)
        }
        layoutParams = LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT
        ).apply { topMargin = (top * resources.displayMetrics.density).toInt() }
    }

    companion object {
        private const val ARG_TITLE = "title"
        private const val ARG_RAW = "raw"

        fun args(title: String, @RawRes raw: Int) = bundleOf(ARG_TITLE to title, ARG_RAW to raw)
    }
}
