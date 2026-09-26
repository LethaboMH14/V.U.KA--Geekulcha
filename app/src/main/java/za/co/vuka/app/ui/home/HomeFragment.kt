package za.co.vuka.app.ui.home

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.provider.Settings
import android.os.Bundle
import android.util.TypedValue
import android.view.View
import android.widget.ImageView
import android.widget.TextView
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.core.net.toUri
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import za.co.vuka.app.R
import za.co.vuka.app.auth.PinGateSheet
import za.co.vuka.app.auth.PinResult
import za.co.vuka.app.detect.Listening
import com.google.android.material.dialog.MaterialAlertDialogBuilder
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
 * Activate asks for the microphone and notifications first (spec V1), then
 * starts listening on the phone with YAMNet ([SensingService]). The card
 * says what's really happening: starting, listening, or why it couldn't.
 * Detection is uncalibrated, and no guardian alert or PIN check-in exists
 * yet, so the card says that too.
 */
class HomeFragment : Fragment(R.layout.fragment_home) {

    private val onboardingViewModel: OnboardingViewModel by activityViewModels()
    private val journey: JourneyViewModel by activityViewModels()

    // Spec V1: activating refuses without the microphone and notifications, and says why.
    private val askPermissions = registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { result ->
        if (result.values.all { it }) journey.start() else explainPermissions()
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        view.findViewById<TextView>(R.id.tvGreeting).text = greeting(Calendar.getInstance().get(Calendar.HOUR_OF_DAY))
        view.findViewById<TextView>(R.id.tvName).text =
            onboardingViewModel.firstName.value.ifBlank { "Welcome" }

        // Deactivating needs a PIN (ADR-0041). A duress end looks identical here
        // and raises the full alarm server-side (DuressSignals).
        PinGateSheet.listen(this, "journey_end") { mode -> journey.end(duress = mode == PinResult.DURESS) }
        view.findViewById<View>(R.id.btnStart).setOnClickListener {
            if (journey.active.value) PinGateSheet.open(this, "journey_end") else activate()
        }

        bindGuardianRole(view)

        // One tap: record the alert, then straight to the dialer with 10111 filled in.
        // Android won't let an app place an emergency call itself, so the member presses call there.
        view.findViewById<View>(R.id.btnEmergency).setOnClickListener {
            Panic.raise(requireContext(), Panic.Source.HOME_BUTTON)
            // Emergency needs an open journey on the server; turn VIGIL on if it's off.
            if (!journey.active.value) journey.start()
            startActivity(Intent(Intent.ACTION_DIAL, "tel:10111".toUri()))
        }

        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                combine(journey.active, Listening.state, onboardingViewModel.pendingInvites) { active, listening, pending ->
                    Triple(active, listening, pending)
                }.collect { (active, listening, pending) -> render(view, active, listening, pending) }
            }
        }
    }

    private fun activate() {
        val needed = buildList {
            add(Manifest.permission.RECORD_AUDIO)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) add(Manifest.permission.POST_NOTIFICATIONS)
        }.filter { ContextCompat.checkSelfPermission(requireContext(), it) != PackageManager.PERMISSION_GRANTED }
        if (needed.isEmpty()) journey.start() else askPermissions.launch(needed.toTypedArray())
    }

    private fun explainPermissions() {
        MaterialAlertDialogBuilder(requireContext())
            .setTitle("VIGIL can't listen yet")
            .setMessage(
                "VIGIL needs the microphone to listen for distress sounds, and notifications to show a Journey check. " +
                    "Allow both in your phone's settings for VUKA, then tap Activate again."
            )
            .setPositiveButton("Open settings") { _, _ ->
                startActivity(
                    Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, "package:${requireContext().packageName}".toUri())
                )
            }
            .setNegativeButton("Not now", null)
            .show()
    }

    private fun render(view: View, active: Boolean, listening: Listening.State, pending: Int) {
        val on = active && listening == Listening.State.On
        view.findViewById<TextView>(R.id.tvVigilLabel).text = if (on) "VIGIL · LISTENING" else "VIGIL"
        view.findViewById<TextView>(R.id.tvVigilState).text = if (active) "Active" else "Ready"
        // The wave only moves when the microphone really is recording.
        view.findViewById<View>(R.id.listeningLine).visibility = if (on) View.VISIBLE else View.GONE
        view.findViewById<TextView>(R.id.tvVigilBody).text = when {
            !active -> "VIGIL isn't listening yet. Activate it and it will listen on this phone until you deactivate it."
            listening is Listening.State.Failed -> "Not listening: ${listening.reason}. Deactivate, then try again."
            listening == Listening.State.On ->
                "Listening on this phone. Detection isn't calibrated yet. A detected sound opens a Journey check; if it isn't answered, VUKA's server alerts your guardians."
            listening == Listening.State.Starting -> "Starting to listen…"
            else -> "Your journey is open, but this phone isn't listening (VUKA was closed). Deactivate, then Activate to listen again."
        }

        // Same button, same place: ink pill to activate, outlined pill to deactivate.
        view.findViewById<MaterialButton>(R.id.btnStart).apply {
            text = if (active) "Deactivate" else "Activate"
            setBackgroundResource(if (active) R.drawable.bg_button_secondary else R.drawable.bg_button_primary)
            val textColor = requireContext().getColor(if (active) R.color.vuka_action else R.color.vuka_text_inverse)
            setTextColor(textColor)
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
