package za.co.vuka.app.ui.onboarding

import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.core.view.children
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.navigation.fragment.findNavController
import za.co.vuka.app.R
import za.co.vuka.app.auth.AccountStore
import za.co.vuka.app.auth.DuressSignals
import za.co.vuka.app.auth.InterimPinStore
import za.co.vuka.app.auth.PinResult

/**
 * Returning member: the verified number already has an account on this
 * phone, so they sign back in with their PIN instead of registering again.
 *
 * Signing in restores protection rather than weakening it, so a duress PIN
 * signs in too, looking identical, and raises the alarm. A wrong PIN shows
 * the same "Try again" every time (T47). Moving an account to a different
 * phone is the spec's recovery flow (§9), which needs the server and the
 * recovery code. Both are cut from this build.
 */
class WelcomeBackFragment : Fragment(R.layout.fragment_welcome_back) {

    private val onboardingViewModel: OnboardingViewModel by activityViewModels()
    private var entry = ""
    private lateinit var dots: List<View>

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val pins = InterimPinStore(requireContext())

        val first = AccountStore(requireContext()).profile()?.firstName.orEmpty()
        view.findViewById<TextView>(R.id.tvName).text = if (first.isBlank()) "Welcome back" else "Welcome back, $first"

        dots = view.findViewById<ViewGroup>(R.id.pinDots).children.toList()
        view.findViewById<View>(R.id.btnBack).setOnClickListener { findNavController().navigateUp() }
        view.findViewById<View>(R.id.linkDifferentNumber).setOnClickListener { findNavController().navigateUp() }
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
                        view.postDelayed({ if (entry == pin) submit(pins.verify(pin)) }, 150)
                    }
                }
            }
        renderDots()
    }

    private fun submit(result: PinResult) {
        entry = ""
        if (result == PinResult.WRONG) {
            view?.findViewById<TextView>(R.id.tvPrompt)?.text = "Try again."
            renderDots()
            return
        }
        if (result == PinResult.DURESS) DuressSignals.raise("sign_in")
        onboardingViewModel.signInExisting()
        findNavController().navigate(R.id.action_welcomeBack_to_home)
    }

    private fun renderDots() {
        dots.forEachIndexed { i, dot ->
            dot.setBackgroundResource(if (i < entry.length) R.drawable.bg_pin_dot_filled else R.drawable.bg_pin_dot_empty)
        }
        view?.findViewById<View>(R.id.pinDots)?.contentDescription =
            "PIN, ${entry.length} of $PIN_LENGTH digits entered"
    }

    private companion object {
        const val PIN_LENGTH = 4
    }
}
