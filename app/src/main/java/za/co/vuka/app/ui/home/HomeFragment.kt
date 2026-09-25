package za.co.vuka.app.ui.home

import android.os.Bundle
import android.util.TypedValue
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.fragment.app.activityViewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import za.co.vuka.app.R
import za.co.vuka.app.auth.PinGateSheet
import za.co.vuka.app.panic.HoldToAlertButton
import za.co.vuka.app.panic.Panic
import za.co.vuka.app.ui.onboarding.OnboardingViewModel
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.launch
import java.util.Calendar

/**
 * VIGIL member home (VigilHome.tsx): the Ready and Journey active states.
 *
 * Journey active is SIMULATED and says so on screen. No listener, server or
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

        view.findViewById<View>(R.id.btnStart).setOnClickListener { journey.start() }
        // Ending a journey needs a PIN (ADR-0041). A duress end looks identical here
        // and raises the full alarm server-side (DuressSignals).
        PinGateSheet.listen(this, "journey_end") { journey.end() }
        view.findViewById<View>(R.id.btnEnd).setOnClickListener { PinGateSheet.open(this, "journey_end") }

        bindGuardianRole(view)

        listOf(R.id.btnHoldForHelpReady, R.id.btnHoldForHelpActive).forEach { id ->
            view.findViewById<HoldToAlertButton>(id).onTriggered = {
                Panic.raise(requireContext(), Panic.Source.HOME_HOLD)
                startActivity(Panic.screenIntent(requireContext()))
            }
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
        view.findViewById<View>(R.id.stateReady).visibility = if (active) View.GONE else View.VISIBLE
        view.findViewById<View>(R.id.stateActive).visibility = if (active) View.VISIBLE else View.GONE

        // Only simulated invites exist, so nobody has accepted.
        view.findViewById<TextView>(R.id.tvGuardianCounts).text = "0 accepted · $pending pending"

        view.findViewById<View>(R.id.tvNoGuardians).visibility = if (pending == 0) View.VISIBLE else View.GONE
        val list = view.findViewById<ViewGroup>(R.id.activeGuardianList)
        list.visibility = if (pending == 0) View.GONE else View.VISIBLE
        list.removeAllViews()
        repeat(pending) { i -> list.addView(guardianRow("Invite ${i + 1}", topMargin = i > 0)) }
    }

    // A row from JourneyActive's guardian list: name left, status word right.
    private fun guardianRow(name: String, topMargin: Boolean): View {
        val ctx = requireContext()
        return LinearLayout(ctx).apply {
            orientation = LinearLayout.HORIZONTAL
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { if (topMargin) this.topMargin = (10 * resources.displayMetrics.density).toInt() }

            addView(TextView(ctx).apply {
                text = name
                textSize = 14f
                setTextColor(ctx.getColor(R.color.vuka_text_label))
                layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
            })
            addView(TextView(ctx).apply {
                text = "Pending"
                textSize = 13f
                setTextColor(ctx.getColor(R.color.vuka_text_dim))
            })
        }
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
