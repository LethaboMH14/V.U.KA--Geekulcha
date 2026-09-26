package za.co.vuka.app.ui.home

import android.content.res.ColorStateList
import android.content.Intent
import android.os.Bundle
import android.util.TypedValue
import android.view.View
import android.widget.ImageView
import android.widget.TextView
import androidx.core.net.toUri
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import za.co.vuka.app.R
import za.co.vuka.app.auth.PinGateSheet
import za.co.vuka.app.panic.Panic
import za.co.vuka.app.ui.onboarding.OnboardingViewModel
import com.google.android.material.button.MaterialButton
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.launch
import java.util.Calendar

/**
 * VIGIL member home (VigilHome.tsx). One layout for both states: the hero
 * card's button reads Activate, and once tapped it turns into Deactivate
 * (PIN-gated) while everything else on Home stays put.
 *
 * Active is SIMULATED and says so on screen. No listener, server or
 * alert path exists in this build. Journey check and Checked in are not built,
 * because nothing could trigger them without detection and stored PINs (P3.V3).
 */
class HomeFragment : Fragment(R.layout.fragment_home) {

    private val onboardingViewModel: OnboardingViewModel by activityViewModels()
    private val journey: JourneyViewModel by activityViewModels()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        view.findViewById<TextView>(R.id.tvGreeting).text = greeting(Calendar.getInstance().get(Calendar.HOUR_OF_DAY))
        view.findViewById<TextView>(R.id.tvName).text =
            onboardingViewModel.firstName.value.ifBlank { "Welcome" }

        // Deactivating needs a PIN (ADR-0041). A duress end looks identical here
        // and raises the full alarm server-side (DuressSignals).
        PinGateSheet.listen(this, "journey_end") { journey.end() }
        view.findViewById<View>(R.id.btnStart).setOnClickListener {
            if (journey.active.value) PinGateSheet.open(this, "journey_end") else journey.start()
        }

        bindGuardianRole(view)

        // One tap: record the alert, then straight to the dialer with 10111 filled in.
        // Android won't let an app place an emergency call itself, so the member presses call there.
        view.findViewById<View>(R.id.btnEmergency).setOnClickListener {
            Panic.raise(requireContext(), Panic.Source.HOME_BUTTON)
            startActivity(Intent(Intent.ACTION_DIAL, "tel:10111".toUri()))
        }

        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                journey.active.combine(onboardingViewModel.pendingInvites) { active, pending ->
                    active to pending
                }.collect { (active, pending) -> render(view, active, pending) }
            }
        }
    }

    private fun render(view: View, active: Boolean, pending: Int) {
        view.findViewById<TextView>(R.id.tvVigilLabel).text = if (active) "VIGIL · SIMULATED" else "VIGIL"
        view.findViewById<TextView>(R.id.tvVigilState).text = if (active) "Active" else "Ready"
        view.findViewById<View>(R.id.listeningLine).visibility = if (active) View.VISIBLE else View.GONE
        view.findViewById<TextView>(R.id.tvVigilBody).text = if (active) {
            "Not listening. This build doesn't include the listener yet."
        } else {
            "VIGIL isn't listening yet. Activate it and it will listen on this phone until you deactivate it."
        }

        // Same button, same place: ink pill to activate, outlined pill to deactivate.
        view.findViewById<MaterialButton>(R.id.btnStart).apply {
            text = if (active) "Deactivate" else "Activate"
            setBackgroundResource(if (active) R.drawable.bg_button_secondary else R.drawable.bg_button_primary)
            val textColor = requireContext().getColor(if (active) R.color.vuka_action else R.color.vuka_text_inverse)
            setTextColor(textColor)
            iconTint = ColorStateList.valueOf(textColor)
            setIconResource(if (active) R.drawable.ic_x else R.drawable.ic_arrow_right)
        }

        // Only simulated invites exist, so nobody has accepted.
        view.findViewById<TextView>(R.id.tvGuardianCounts).text = "0 accepted · $pending pending"
    }

    // Only shown to people who chose to be a guardian (by accepting an invite).
    private fun bindGuardianRole(view: View) {
        view.findViewById<View>(R.id.guardianRoleCard).visibility =
            if (onboardingViewModel.guardianEnrolled) View.VISIBLE else View.GONE
        if (!onboardingViewModel.guardianEnrolled) return
        view.findViewById<View>(R.id.rowGuardianRole).apply {
            findViewById<ImageView>(R.id.ivIcon).setImageResource(R.drawable.ic_shield_chevron)
            findViewById<TextView>(R.id.tvLabel).text = "You're a guardian"
            findViewById<TextView>(R.id.tvSublabel).apply {
                text = "Open guardian standby"
                visibility = View.VISIBLE
            }
            findViewById<View>(R.id.ivChevron).visibility = View.VISIBLE
            val ripple = TypedValue()
            context.theme.resolveAttribute(android.R.attr.selectableItemBackground, ripple, true)
            setBackgroundResource(ripple.resourceId)
            setOnClickListener { findNavController().navigate(R.id.action_home_to_standby) }
        }
    }

    private fun greeting(hour: Int) = when (hour) {
        in 5..11 -> "Good morning"
        in 12..17 -> "Good afternoon"
        else -> "Good evening"
    }
}
