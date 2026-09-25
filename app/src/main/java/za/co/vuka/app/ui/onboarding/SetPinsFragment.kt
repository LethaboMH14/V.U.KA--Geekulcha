package za.co.vuka.app.ui.onboarding

import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.activity.OnBackPressedCallback
import androidx.core.view.children
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.ViewModel
import androidx.navigation.fragment.findNavController
import za.co.vuka.app.R
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
 * Onboarding step 7 — set the normal PIN, set the duress PIN, then the
 * recovery-code step. Recovery is cut in this build, so no code is shown.
 *
 * On Continue the PINs go to [InterimPinStore] as salted hashes and are
 * cleared from memory. The spec's Keystore-backed store is P3.V3.
 */
class SetPinsFragment : Fragment(R.layout.fragment_set_pins) {

    enum class Stage { NORMAL1, NORMAL2, DURESS1, DURESS2, RECOVERY }

    private val vm: SetPinsViewModel by viewModels()
    private lateinit var dots: List<View>

    // On the recovery stage, back returns to "Confirm your duress PIN" as in the prototype.
    private val backToDuress = object : OnBackPressedCallback(false) {
        override fun handleOnBackPressed() = goTo(Stage.DURESS2)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        requireActivity().onBackPressedDispatcher.addCallback(viewLifecycleOwner, backToDuress)

        dots = view.findViewById<ViewGroup>(R.id.pinDots).children.toList()

        view.findViewById<ViewGroup>(R.id.keypad).children
            .filterIsInstance<TextView>()
            .forEach { key -> key.setOnClickListener { onDigit(key.text.toString()) } }

        view.findViewById<View>(R.id.keyDelete).setOnClickListener {
            vm.entry = vm.entry.dropLast(1)
            renderDots()
        }

        view.findViewById<View>(R.id.btnBack).setOnClickListener {
            if (vm.stage == Stage.RECOVERY) goTo(Stage.DURESS2) else findNavController().navigateUp()
        }

        view.findViewById<View>(R.id.btnContinue).setOnClickListener {
            // TODO(P3.V3): InterimPinStore stands in for the Keystore-backed Argon2id store.
            InterimPinStore(requireContext()).setPins(vm.normalPin, vm.duressPin)
            vm.clearPins()
            findNavController().navigate(R.id.action_setPins_to_inviteGuardians)
        }

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
                vm.stage = Stage.RECOVERY
            }
            Stage.RECOVERY -> Unit
        }
        render()
    }

    private fun goTo(stage: Stage) {
        vm.stage = stage
        vm.entry = ""
        vm.error = null
        render()
    }

    private fun render() {
        val view = view ?: return
        val recovery = vm.stage == Stage.RECOVERY
        backToDuress.isEnabled = recovery

        view.findViewById<TextView>(R.id.tvStepTitle).text = if (recovery) "Recovery code" else "Set your PINs"
        view.findViewById<View>(R.id.pinStage).visibility = if (recovery) View.GONE else View.VISIBLE
        view.findViewById<View>(R.id.recoveryStage).visibility = if (recovery) View.VISIBLE else View.GONE

        val (title, body) = when (vm.stage) {
            Stage.NORMAL1 -> "Set your normal PIN" to
                "Enter a 4-digit PIN. You'll use this for every ordinary Journey check."
            Stage.NORMAL2 -> "Confirm your normal PIN" to "Enter it again to confirm."
            Stage.DURESS1 -> "Set your duress PIN" to
                "Your duress PIN works exactly like your normal PIN on screen. Behind the scenes it quietly alerts your guardians."
            Stage.DURESS2 -> "Confirm your duress PIN" to "Enter it again to confirm."
            Stage.RECOVERY -> "" to ""
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
