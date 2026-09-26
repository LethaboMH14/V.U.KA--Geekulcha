package za.co.vuka.app.ui.onboarding

import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.core.view.children
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.ViewModel
import androidx.navigation.fragment.findNavController
import za.co.vuka.app.R
import za.co.vuka.app.api.ServerSync
import za.co.vuka.app.auth.InterimPinStore

/**
 * PINs live only in this screen's ViewModel. That keeps them through a
 * rotation, but they are never written to a Bundle, which Android can
 * persist to disk.
 */
class SetPinsViewModel : ViewModel() {
    var stage = SetPinsFragment.Stage.NORMAL1
    var entry = ""
    var normalPin = ""
    var duressPin = ""
    var error: String? = null

    fun clearPins() {
        entry = ""
        normalPin = ""
        duressPin = ""
    }

    override fun onCleared() = clearPins()
}

/**
 * Onboarding step 7 — set the normal PIN, then the duress PIN. Once the
 * duress PIN is confirmed, the PINs go to [InterimPinStore] as salted hashes,
 * are cleared from memory, and onboarding moves on.
 *
 * No recovery-code step: the recovery endpoint is cut, and the spec says a
 * cut endpoint means no code is shown at all (§9, §14). Add the step back,
 * showing the real one-time code, when the endpoint exists. The spec's Keystore-backed store is P3.V3.
 */
class SetPinsFragment : Fragment(R.layout.fragment_set_pins) {

    enum class Stage { NORMAL1, NORMAL2, DURESS1, DURESS2 }

    private val vm: SetPinsViewModel by viewModels()
    private lateinit var dots: List<View>

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        dots = view.findViewById<ViewGroup>(R.id.pinDots).children.toList()

        view.findViewById<ViewGroup>(R.id.keypad).children
            .filterIsInstance<TextView>()
            .forEach { key -> key.setOnClickListener { onDigit(key.text.toString()) } }

        view.findViewById<View>(R.id.keyDelete).setOnClickListener {
            vm.entry = vm.entry.dropLast(1)
            renderDots()
        }

        view.findViewById<View>(R.id.btnBack).setOnClickListener { findNavController().navigateUp() }

        render()
    }

    private fun onDigit(digit: String) {
        if (vm.entry.length >= PIN_LENGTH) return
        vm.entry += digit
        renderDots()
        if (vm.entry.length == PIN_LENGTH) {
            val pin = vm.entry
            // Let the fourth dot show before the keypad resets.
            view?.postDelayed({ if (vm.entry == pin) onComplete(pin) }, 150)
        }
    }

    private fun onComplete(pin: String) {
        vm.entry = ""
        vm.error = null
        when (vm.stage) {
            Stage.NORMAL1 -> {
                vm.normalPin = pin
                vm.stage = Stage.NORMAL2
            }
            Stage.NORMAL2 -> if (pin != vm.normalPin) {
                vm.error = "Those two PINs didn't match. Start again."
                vm.normalPin = ""
                vm.stage = Stage.NORMAL1
            } else {
                vm.stage = Stage.DURESS1
            }
            Stage.DURESS1 -> if (pin == vm.normalPin) {
                vm.error = "Your duress PIN must be different from your normal PIN."
            } else {
                vm.duressPin = pin
                vm.stage = Stage.DURESS2
            }
            Stage.DURESS2 -> if (pin != vm.duressPin) {
                vm.error = "Those two PINs didn't match. Start again."
                vm.duressPin = ""
                vm.stage = Stage.DURESS1
            } else {
                // TODO(P3.V3): InterimPinStore stands in for the Keystore-backed Argon2id store.
                InterimPinStore(requireContext()).setPins(vm.normalPin, vm.duressPin)
                // The server identity is needed from here (inviting a guardian is next).
                ServerSync.register(requireContext())
                vm.clearPins()
                findNavController().navigate(R.id.action_setPins_to_inviteGuardians)
                return
            }
        }
        render()
    }

    private fun render() {
        val view = view ?: return
        view.findViewById<TextView>(R.id.tvStepTitle).text = "Set your PINs"

        val (title, body) = when (vm.stage) {
            Stage.NORMAL1 -> "Set your normal PIN" to
                "Enter a 4-digit PIN. You'll use this for every ordinary Journey check."
            Stage.NORMAL2 -> "Confirm your normal PIN" to "Enter it again to confirm."
            Stage.DURESS1 -> "Set your duress PIN" to
                "Your duress PIN works exactly like your normal PIN on screen. Behind the scenes it quietly alerts your guardians."
            Stage.DURESS2 -> "Confirm your duress PIN" to "Enter it again to confirm."
        }
        view.findViewById<TextView>(R.id.tvStageTitle).text = title
        view.findViewById<TextView>(R.id.tvStageBody).text = body

        view.findViewById<View>(R.id.errorContainer).visibility =
            if (vm.error != null) View.VISIBLE else View.GONE
        view.findViewById<TextView>(R.id.tvError).text = vm.error

        renderDots()
    }

    private fun renderDots() {
        dots.forEachIndexed { i, dot ->
            dot.setBackgroundResource(
                if (i < vm.entry.length) R.drawable.bg_pin_dot_filled else R.drawable.bg_pin_dot_empty
            )
        }
        view?.findViewById<View>(R.id.pinDots)?.contentDescription =
            "PIN, ${vm.entry.length} of $PIN_LENGTH digits entered"
    }

    companion object {
        private const val PIN_LENGTH = 4
    }
}
