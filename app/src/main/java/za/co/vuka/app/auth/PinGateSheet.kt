package za.co.vuka.app.auth

import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.core.os.bundleOf
import androidx.core.view.children
import androidx.fragment.app.Fragment
import za.co.vuka.app.R
import com.google.android.material.bottomsheet.BottomSheetDialogFragment

/**
 * PIN gate for actions that weaken protection (PIN-AUTHORITY-RULES §2–3).
 *
 * The sheet looks and behaves the same for a normal and a duress PIN. It
 * reports the mode to the caller, and the caller must also make the outcome
 * look identical. A wrong PIN shows the same "Try again" every time, with no
 * visible lockout (T47).
 *
 * Usage: in onViewCreated, `PinGateSheet.listen(this, "journey_end") { mode -> ... }`;
 * then `PinGateSheet.open(this, "journey_end")` on tap.
 */
class PinGateSheet : BottomSheetDialogFragment(R.layout.dialog_pin_gate) {

    private var entry = ""
    private lateinit var dots: List<View>

    override fun getTheme() = R.style.ThemeOverlay_Vuka_BottomSheet

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val pins = InterimPinStore(requireContext())
        val action = requireArguments().getString(ARG_ACTION).orEmpty()

        dots = view.findViewById<ViewGroup>(R.id.pinDots).children.toList()
        view.findViewById<View>(R.id.btnClose).setOnClickListener { dismiss() }
        view.findViewById<View>(R.id.keyDelete).setOnClickListener {
            entry = entry.dropLast(1)
            renderDots()
        }

        view.findViewById<ViewGroup>(R.id.keypad).children
            .filterIsInstance<TextView>()
            .forEach { key ->
                key.setOnClickListener {
                    if (entry.length >= PIN_LENGTH) return@setOnClickListener
                    entry += key.text
                    renderDots()
                    if (entry.length == PIN_LENGTH) {
                        val pin = entry
                        view.postDelayed({ if (entry == pin) submit(pins, action, pin) }, 150)
                    }
                }
            }
        renderDots()
    }

    private fun submit(pins: PinAuthority, action: String, pin: String) {
        entry = ""
        when (val result = pins.verify(pin)) {
            PinResult.WRONG -> {
                view?.findViewById<TextView>(R.id.tvPrompt)?.text = "Try again."
                renderDots()
            }
            else -> {
                if (result == PinResult.DURESS) DuressSignals.raise(requireContext(), action)
                parentFragmentManager.setFragmentResult(resultKey(action), bundleOf(KEY_MODE to result.name))
                dismiss()
            }
        }
    }

    private fun renderDots() {
        dots.forEachIndexed { i, dot ->
            dot.setBackgroundResource(if (i < entry.length) R.drawable.bg_pin_dot_filled else R.drawable.bg_pin_dot_empty)
        }
        view?.findViewById<View>(R.id.pinDots)?.contentDescription =
            "PIN, ${entry.length} of $PIN_LENGTH digits entered"
    }

    companion object {
        private const val ARG_ACTION = "action"
        private const val KEY_MODE = "mode"
        private const val PIN_LENGTH = 4

        private fun resultKey(action: String) = "pin_gate:$action"

        /** Listen for [action]'s result. Call once from the host's onViewCreated. */
        fun listen(host: Fragment, action: String, onAuthorised: (PinResult) -> Unit) {
            host.childFragmentManager.setFragmentResultListener(resultKey(action), host.viewLifecycleOwner) { _, b ->
                onAuthorised(PinResult.valueOf(b.getString(KEY_MODE) ?: PinResult.NORMAL.name))
            }
        }

        fun open(host: Fragment, action: String) {
            PinGateSheet().apply { arguments = bundleOf(ARG_ACTION to action) }
                .show(host.childFragmentManager, "pin_gate:$action")
        }
    }
}
